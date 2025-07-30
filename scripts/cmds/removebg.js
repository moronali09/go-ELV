const tf = require('@tensorflow/tfjs-node');
const bodyPix = require('@tensorflow-models/body-pix');
const sharp = require('sharp');
const fetch = require('node-fetch');

module.exports = {
  config: {
    name: "removebg",
    aliases: ["bg"],
    version: "1.0",
    author: "moronali",
    cooldowns: 30,
    role: 0,
    shortDescription: "🤖 AI-based background removal",
    longDescription: "Use TensorFlow.js BodyPix to remove background from person images",
    category: "tools",
    guide: "{pn} <image_url>"
  },

  onStart: async function({ message, args }) {
    if (!args[0]) return message.reply(`⚠️ Usage: ${this.config.guide.replace('{pn}', this.config.name)}`);

    const imageUrl = args[0];
    try {

      const res = await fetch(imageUrl);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const imgBuffer = await res.buffer();

      await tf.ready();
      const net = await bodyPix.load({architecture: 'MobileNetV1', outputStride: 16, multiplier: 0.75, quantBytes: 2});

      const imgTensor = tf.node.decodeImage(imgBuffer);

      const segmentation = await net.segmentPerson(imgTensor, {internalResolution: 'medium'});

      const maskTensor = bodyPix.toMask(segmentation);
      const maskBuffer = await tf.node.encodePng(maskTensor);

      const outputBuffer = await sharp(imgBuffer)
        .joinChannel(maskBuffer)
        .png()
        .toBuffer();

      return message.reply({
        body: `✅ background removed`,
        attachment: outputBuffer
      });

    } catch (err) {
      console.error(err);
      return message.reply(`❌ Error: ${err.message}`);
    }
  }
};
