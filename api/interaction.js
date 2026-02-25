const { verifyKey } = require('discord-interactions');
const fetch = require('node-fetch');

const jsonResponse = (data) => ({ type: 4, data: data });

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];
  const rawBody = JSON.stringify(req.body);

  const isValidRequest = verifyKey(rawBody, signature, timestamp, process.env.DISCORD_PUBLIC_KEY);
  if (!isValidRequest) return res.status(401).send('Bad Request Signature');

  const interaction = req.body;

  if (interaction.type === 1) return res.json({ type: 1 });

  if (interaction.type === 2) {
    const { name, options } = interaction.data;
    const value = options && options.length > 0 ? options[0].value : null;

    try {
      if (name === 'qr') {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(value)}`;
        return res.json(jsonResponse({ content: `QR Code for: ${value}`, embeds: [{ image: { url: url } }] }));
      }

      if (name === 'barcode_gen') {
        const url = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(value)}&scale=3&includetext`;
        return res.json(jsonResponse({ content: `Barcode for: ${value}`, embeds: [{ image: { url: url } }] }));
      }

      if (name === 'urls') {
        const apiRes = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(value)}`);
        const shortUrl = await apiRes.text();
        return res.json(jsonResponse({ content: `Short URL: ${shortUrl}` }));
      }

      if (name === 'dictionary') {
        const apiRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${value}`);
        const data = await apiRes.json();
        if (data[0]?.meanings?.[0]?.definitions?.[0]?.definition) {
          return res.json(jsonResponse({ content: `**${value}**: ${data[0].meanings[0].definitions[0].definition}` }));
        }
        return res.json(jsonResponse({ content: "Word not found." }));
      }

      if (name === 'pass_gen') {
        const len = value || 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let pass = "";
        for (let i = 0; i < len; i++) pass += charset.charAt(Math.floor(Math.random() * charset.length));
        return res.json(jsonResponse({ content: `Password: \`\`\`${pass}\`\`\`` }));
      }

      if (name === 'ip_info') {
        const apiRes = await fetch(`http://ip-api.com/json/${value}`);
        const data = await apiRes.json();
        if (data.status === "fail") return res.json(jsonResponse({ content: "Invalid IP." }));
        return res.json(jsonResponse({ content: `**IP Info:**\nCountry: ${data.country}\nCity: ${data.city}\nISP: ${data.isp}` }));
      }

      // Updated: TTS will now send an actual MP3 file
      if (name === 'say') {
        const url = `http://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(value)}&tl=en`;
        const audioRes = await fetch(url);
        const audioBuffer = await audioRes.buffer();

        const boundary = '----DiscordBotBoundary123';
        let bodyStart = `--${boundary}\r\n`;
        bodyStart += `Content-Disposition: form-data; name="payload_json"\r\n\r\n`;
        bodyStart += JSON.stringify({ type: 4, data: { content: "Here is your audio:" } }) + `\r\n`;
        bodyStart += `--${boundary}\r\n`;
        bodyStart += `Content-Disposition: form-data; name="files[0]"; filename="audio.mp3"\r\n`;
        bodyStart += `Content-Type: audio/mpeg\r\n\r\n`;

        const bodyEnd = `\r\n--${boundary}--\r\n`;

        const payload = Buffer.concat([
          Buffer.from(bodyStart, 'utf-8'),
          audioBuffer,
          Buffer.from(bodyEnd, 'utf-8')
        ]);

        res.setHeader('Content-Type', `multipart/form-data; boundary=${boundary}`);
        return res.send(payload);
      }

      if (name === 'help') {
        return res.json(jsonResponse({ content: "**Available Commands:**\n`/qr <text>`\n`/barcode_gen <text>`\n`/urls <link>`\n`/dictionary <word>`\n`/pass_gen <length>`\n`/ip_info <ip>`\n`/say <text>`" }));
      }

      return res.json(jsonResponse({ content: "Unknown Command" }));
    } catch (e) {
      console.error(e);
      return res.json(jsonResponse({ content: "Internal Error: " + e.message }));
    }
  }

  return res.status(404).send('Unknown Interaction');
};
           
