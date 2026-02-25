const fetch = require('node-fetch');
const commands = require('../bot/command_list');

module.exports = async (req, res) => {
  const token = process.env.DISCORD_TOKEN;
  const appId = process.env.DISCORD_APP_ID;

  if (!token || !appId) {
    return res.status(500).send("Error: Environment Variables (DISCORD_TOKEN, DISCORD_APP_ID) missing in Vercel.");
  }

  const url = `https://discord.com/api/v10/applications/${appId}/commands`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commands),
    });

    if (response.ok) {
      res.send("Success! All commands have been registered to your Discord Bot.");
    } else {
      const data = await response.json();
      res.send("Error: " + JSON.stringify(data));
    }
  } catch (e) {
    res.send("Exception: " + e.message);
  }
};
