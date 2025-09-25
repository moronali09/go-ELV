const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  config: {
    name: "live",
    version: "2.0",
    author: "moronali",
    countDown: 5,
    role: 0,
    shortDescription: "Pro live cricket scores (robust scraping)",
    longDescription: "Scrapes multiple sources/structures to return live cricket match info with retries and fallbacks.",
    category: "sports",
    guide: { en: "{pn} -> show best-effort live cricket score" }
  },

  onStart: async function ({ message, event }) {
    const threadID = event.threadID;
    const messageID = event.messageID;

    // helper: fetch with retries
    async function fetchWithRetry(url, opts = {}, retries = 3, backoff = 800) {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await axios.get(url, {
            timeout: 15000,
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9",
              ...((opts && opts.headers) || {})
            },
            ...opts
          });
          return res;
        } catch (err) {
          if (i === retries - 1) throw err;
          await new Promise(r => setTimeout(r, backoff * (i + 1)));
        }
      }
    }

    // safe text getter for multiple selector attempts
    function pickText($, selectors) {
      for (const sel of selectors) {
        const el = $(sel);
        if (el && el.length) {
          const txt = el.first().text().trim();
          if (txt) return txt;
        }
      }
      return null;
    }

    // try to parse JSON-LD structured data from page
    function parseJsonLd($) {
      const scripts = $('script[type="application/ld+json"]');
      for (let i = 0; i < scripts.length; i++) {
        try {
          const json = JSON.parse($(scripts[i]).contents().text());
          if (!json) continue;
          // If it's an array, flatten
          const arr = Array.isArray(json) ? json : [json];
          for (const j of arr) {
            if (j['@type'] && (j['@type'].toLowerCase().includes("sports") || j['@type'].toLowerCase().includes("event") || j['@type'].toLowerCase().includes("blogposting"))) {
              return j;
            }
          }
        } catch (e) {
          // ignore parse errors
        }
      }
      return null;
    }

    // main scraping attempt (ESPNcricinfo scoreboard page)
    try {
      // try primary source: ESPNcricinfo live scores page
      const url = "https://www.espncricinfo.com/live-cricket-score";
      const res = await fetchWithRetry(url, {}, 3, 900);
      const $ = cheerio.load(res.data);

      // Strategy A: modern ESPNcricinfo selectors (try multiple variants)
      // These selectors try to be generic — will return null if not present
      const matchBlock =
        $(".ds-px-4.ds-py-3").first() || // new site
        $('[data-testid="match-card"]').first() ||
        $(".match-score-block").first() ||
        $("article").has(".score-card").first();

      // Strategy B: JSON-LD
      const jsonLd = parseJsonLd($);

      // Prepare variables
      let title = null, venue = null, teamA = null, teamB = null, scoreA = null, scoreB = null, status = null;

      // Attempt parsing from JSON-LD first (if useful)
      if (jsonLd) {
        title = jsonLd.name || title;
        if (jsonLd.location && (jsonLd.location.name || jsonLd.location.address)) {
          venue = jsonLd.location.name || (jsonLd.location.address && jsonLd.location.address.streetAddress) || venue;
        }
        // JSON-LD often won't include live scores; keep as fallback
      }

      // Attempt to parse from matchBlock (if found)
      if (matchBlock && matchBlock.length) {
        // team names: try several possible selectors
        teamA = pickText($(matchBlock), [".ds-text-title-xs", ".team > .name", ".teamName", ".home-team .name", ".team--home .name", ".scorecard__team .name"]) || teamA;
        teamB = pickText($(matchBlock), [".ds-text-title-xs + .ds-text-title-xs", ".team > .opp", ".away-team .name", ".team--away .name"]) || teamB;

        // fallback: explicit team elements
        const teamEls = $(matchBlock).find(".ds-flex .ds-text-tight-s, .team, .scorecard__team");
        if ((!teamA || !teamB) && teamEls && teamEls.length >= 2) {
          const t0 = $(teamEls[0]).text().trim();
          const t1 = $(teamEls[1]).text().trim();
          if (t0) teamA = t0;
          if (t1) teamB = t1;
        }

        // scores: try many selectors for score strings
        scoreA = pickText($(matchBlock), [".ds-text-compact-m.ds-font-monospace", ".score .home .runs", ".team--home .score", ".score .score__home"]) || scoreA;
        // If a single mono text contains both scores, split heuristically
        if (!scoreB && scoreA && scoreA.includes("vs")) {
          const parts = scoreA.split("vs");
          scoreA = parts[0].trim();
          scoreB = (parts[1] || "").trim();
        } else {
          // try other selectors for second score
          scoreB = pickText($(matchBlock), [".ds-text-compact-m.ds-font-monospace + .ds-text-compact-m", ".team--away .score", ".score .away .runs"]) || scoreB;
        }

        // venue and title and status
        venue = pickText($(matchBlock), [".ds-text-tight-s.ds-font-regular.ds-text-typo-mid3", ".venue", ".match-venue"]) || venue;
        title = pickText($(matchBlock), [".ds-text-tight-m.ds-font-bold", ".match-title", ".series-name"]) || title;
        status = pickText($(matchBlock), [".ds-text-tight-s.ds-font-regular.ds-truncate", ".status", ".match-status"]) || status;
      }

      // Strategy C: parse multiple match list if no single block found
      if ((!teamA || !teamB) && !jsonLd) {
        // attempt to find match cards in a loop and pick the first valid one
        const cards = $('[data-testid="match-card"], .ds-px-4.ds-py-3, .match-card, .live-match-card');
        for (let i = 0; i < cards.length; i++) {
          const c = $(cards[i]);
          const ta = pickText(c, [".team .name", ".teamName", ".ds-text-title-xs"]);
          const tb = pickText(c, [".team--away .name", ".ds-text-title-xs + .ds-text-title-xs"]);
          const sc = pickText(c, [".score", ".score-summary", ".ds-text-compact-m.ds-font-monospace"]);
          if (ta && tb) {
            teamA = ta; teamB = tb;
            if (sc) {
              const scParts = sc.split(/\s{1,}|•|-/).filter(Boolean);
              if (scParts.length >= 2) {
                scoreA = scParts[0];
                scoreB = scParts[1];
              } else scoreA = sc;
            }
            venue = pickText(c, [".venue", ".ds-text-tight-s"]) || venue;
            status = pickText(c, [".status", ".ds-text-tight-s"]) || status;
            title = pickText(c, [".series-name", ".match-title"]) || title;
            break;
          }
        }
      }

      // Final cleanups & fallbacks
      // If JSON-LD contained helpful fields, fill missing ones
      if (jsonLd) {
        if (!title && jsonLd.name) title = jsonLd.name;
        if (!venue && jsonLd.location && jsonLd.location.name) venue = jsonLd.location.name;
      }

      // If still nothing found — respond gracefully
      if (!teamA && !teamB && !title) {
        return message.reply("🏏 | Could not find a live cricket match right now. Try again in a few minutes or check https://www.espncricinfo.com/live-cricket-score", threadID, messageID);
      }

      // Format nicely (guard missing pieces)
      const safe = txt => txt ? txt.replace(/\s+/g, " ").trim() : "—";
      const formatted =
` ${safe(title)} 

🏟️ ${safe(venue)}

👥 Teams
────────────
${safe(teamA)}  vs  ${safe(teamB)}

📊 Live Score
────────────
${safe(teamA)}: ${safe(scoreA)}
${safe(teamB)}: ${safe(scoreB)}
📌 Status: ${safe(status)}`;

      return message.reply(formatted, threadID, messageID);

    } catch (err) {
      // Provide a helpful debug-friendly but user-safe message
      console.error("live (pro) scrape error:", err?.message || err);
      // If it's an axios/network error, give hint
      const emsg = (err && err.response && err.response.status) ? `HTTP ${err.response.status}` : (err && err.code) ? err.code : (err && err.message) ? err.message : "Unknown";
      return message.reply(`❌ | Unable to fetch live cricket data right now (${emsg}). Try again shortly.`, threadID, messageID);
    }
  }
};
