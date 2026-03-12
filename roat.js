import 'dotenv/config';
import { DiscordRequest } from './utils.js';

const MAC_API_BASE = process.env.MAC_API_URL;
const APP_ID = process.env.APP_ID;

/**
 * Split text into chunks that fit within maxLen.
 * Priority: split at newline boundaries, then spaces, then hard cut.
 * @param {string} text
 * @param {number} maxLen
 * @returns {string[]}
 */
function splitMessage(text, maxLen = 2000) {
  const chunks = [];

  while (text.length > 0) {
    if (text.length <= maxLen) {
      chunks.push(text);
      break;
    }

    let splitIndex = -1;

    // 1) Try to split at the last newline within maxLen
    const newlineIndex = text.lastIndexOf('\n', maxLen);
    if (newlineIndex > 0) {
      splitIndex = newlineIndex;
    }

    // 2) Fall back to last space within maxLen
    if (splitIndex === -1) {
      const spaceIndex = text.lastIndexOf(' ', maxLen);
      if (spaceIndex > 0) {
        splitIndex = spaceIndex;
      }
    }

    // 3) Hard cut at maxLen
    if (splitIndex === -1) {
      splitIndex = maxLen;
    }

    chunks.push(text.slice(0, splitIndex));
    text = text.slice(splitIndex).replace(/^[\n ]/, ''); // trim leading delimiter
  }

  return chunks;
}

/**
 * Send a chat message to the Mac API server.
 * @param {string} userId - Discord user ID
 * @param {string} message - The question or query
 * @returns {Promise<{reply: string, query_type: string, detail?: string}>}
 */
export async function queryRoat(userId, message) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);
  const start = Date.now();

  try {
    const res = await fetch(`${MAC_API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, message }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Mac API /chat returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    console.log(`Mac API responded in ${Date.now() - start}ms (query_type: ${data.query_type})`);
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Reset a user's conversation session on the Mac server.
 * @param {string} userId - Discord user ID
 * @returns {Promise<{status: string}>}
 */
export async function resetRoatSession(userId) {
  const res = await fetch(`${MAC_API_BASE}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!res.ok) {
    throw new Error(`Mac API /reset returned ${res.status}: ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Edit the original deferred interaction response, splitting long content
 * into follow-up messages when necessary.
 * @param {string} interactionToken - Discord interaction token
 * @param {string} content - The response text
 */
export async function editDeferredResponse(interactionToken, content) {
  const chunks = splitMessage(content);

  // PATCH the original deferred reply with the first chunk
  await DiscordRequest(`webhooks/${APP_ID}/${interactionToken}/messages/@original`, {
    method: 'PATCH',
    body: { content: chunks[0] },
  });

  // Send any overflow chunks as follow-up messages
  for (let i = 1; i < chunks.length; i++) {
    await DiscordRequest(`webhooks/${APP_ID}/${interactionToken}`, {
      method: 'POST',
      body: { content: chunks[i] },
    });
  }
}

/**
 * Check if the Mac API is reachable.
 * @returns {Promise<{status: string, model: string, active_sessions: number}|null>}
 */
export async function checkMacHealth() {
  try {
    const res = await fetch(`${MAC_API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
