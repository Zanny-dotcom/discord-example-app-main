import 'dotenv/config';

/**
 * Make an authenticated request to the Discord API.
 * @param {string} endpoint - API path after /api/v10/
 * @param {object} options - fetch options (method, body, etc.)
 */
export async function DiscordRequest(endpoint, options) {
  const url = 'https://discord.com/api/v10/' + endpoint;
  if (options.body) options.body = JSON.stringify(options.body);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json();
    console.error(`Discord API error ${res.status}:`, data);
    throw new Error(JSON.stringify(data));
  }
  return res;
}

/**
 * Register slash commands globally for the application.
 * Uses PUT to bulk-overwrite all commands.
 */
export async function InstallGlobalCommands(appId, commands) {
  const endpoint = `applications/${appId}/commands`;
  try {
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
    console.log(`Registered ${commands.length} commands.`);
  } catch (err) {
    console.error('Failed to register commands:', err);
  }
}
