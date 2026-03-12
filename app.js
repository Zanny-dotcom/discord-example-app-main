import 'dotenv/config';
import express from 'express';
import {
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { queryRoat, resetRoatSession, editDeferredResponse, checkMacHealth } from './roat.js';
import { connectDB } from './utils/database.js';

const app = express();
const PORT = process.env.PORT || 3000;

const SECTION_MAP = {
  pvp: 'kills and deaths',
  skills: 'skill levels',
  collection_log: 'collection log',
  lms: 'LMS stats',
  npc: 'boss kills',
  all: 'all stats',
};

app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  const { type, data } = req.body;

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = data;
    const userId = req.body.member?.user?.id || req.body.user?.id;
    const { token } = req.body;

    // /roat — free-form question
    if (name === 'roat') {
      const question = options.find((o) => o.name === 'question').value;

      res.send({ type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE });

      try {
        const result = await queryRoat(userId, question);
        await editDeferredResponse(token, result.reply);
      } catch (err) {
        console.error('Roat query error:', err);
        const msg = err.name === 'AbortError'
          ? 'The AI is taking too long — try a simpler question or try again in a moment.'
          : err.cause?.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')
            ? "Can't reach the AI server. It might be offline."
            : 'Something went wrong. Try again.';
        await editDeferredResponse(token, msg);
      }
      return;
    }

    // /player — structured player lookup
    if (name === 'player') {
      const playerName = options.find((o) => o.name === 'name').value;
      const section = options.find((o) => o.name === 'section')?.value || 'all';

      res.send({ type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE });

      try {
        const question = `${SECTION_MAP[section]} for ${playerName}`;
        const result = await queryRoat(userId, question);
        await editDeferredResponse(token, result.reply);
      } catch (err) {
        console.error('Player lookup error:', err);
        const msg = err.name === 'AbortError'
          ? 'The AI is taking too long — try a simpler question or try again in a moment.'
          : err.cause?.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')
            ? "Can't reach the AI server. It might be offline."
            : 'Something went wrong. Try again.';
        await editDeferredResponse(token, msg);
      }
      return;
    }

    // /leaderboard — view a leaderboard by category
    if (name === 'leaderboard') {
      const category = options.find((o) => o.name === 'category').value;

      res.send({ type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE });

      try {
        const result = await queryRoat(userId, `top ${category} leaderboard`);
        await editDeferredResponse(token, result.reply);
      } catch (err) {
        console.error('Leaderboard error:', err);
        const msg = err.name === 'AbortError'
          ? 'The AI is taking too long — try a simpler question or try again in a moment.'
          : err.cause?.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')
            ? "Can't reach the AI server. It might be offline."
            : 'Something went wrong. Try again.';
        await editDeferredResponse(token, msg);
      }
      return;
    }

    // /roat-reset — clear session
    if (name === 'roat-reset') {
      try {
        await resetRoatSession(userId);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: 'Session cleared.' },
        });
      } catch (err) {
        console.error('Reset error:', err);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: 'Could not reset session. Try again.' },
        });
      }
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});
await connectDB();
app.listen(PORT, async () => {
  console.log(`Bot listening on port ${PORT}`);
  const health = await checkMacHealth();
  if (health) {
    console.log(`Mac API connected — model: ${health.model}, sessions: ${health.active_sessions}`);
  } else {
    console.warn('WARNING: Mac API is not reachable at', process.env.MAC_API_URL);
    console.warn('RoatPkz commands will fail until the Mac API is running.');
  }
});
