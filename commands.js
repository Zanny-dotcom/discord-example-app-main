import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

// /roat — free-form question answered by the RoatPkz assistant
const ROAT_COMMAND = {
  name: 'roat',
  description: 'Ask anything about RoatPkz players, stats, or leaderboards',
  options: [
    {
      type: 3, // STRING
      name: 'question',
      description: 'Your question (e.g., "xdave kills" or "top kdr")',
      required: true,
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

// /player — structured player lookup with optional section filter
const PLAYER_COMMAND = {
  name: 'player',
  description: "Look up a player's stats",
  options: [
    {
      type: 3, // STRING
      name: 'name',
      description: 'Player name',
      required: true,
    },
    {
      type: 3, // STRING
      name: 'section',
      description: 'Stats section to show',
      required: false,
      choices: [
        { name: 'PvP Stats', value: 'pvp' },
        { name: 'Skills', value: 'skills' },
        { name: 'Collection Log', value: 'collection_log' },
        { name: 'LMS', value: 'lms' },
        { name: 'Boss / NPC Kills', value: 'npc' },
        { name: 'All Stats', value: 'all' },
      ],
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

// /leaderboard — view a specific RoatPkz leaderboard
const LEADERBOARD_COMMAND = {
  name: 'leaderboard',
  description: 'View a RoatPkz leaderboard',
  options: [
    {
      type: 3, // STRING
      name: 'category',
      description: 'Leaderboard category',
      required: true,
      choices: [
        { name: 'Top Kills', value: 'kills' },
        { name: 'Top Deaths', value: 'deaths' },
        { name: 'Top KDR', value: 'kdr' },
        { name: 'Top Elo', value: 'elo' },
        { name: 'Highest Killstreak', value: 'highestkillstreak' },
        { name: 'Current Killstreak', value: 'currentkillstreak' },
        { name: 'Total Level', value: 'total_level' },
        { name: 'Slayer', value: 'slayer' },
        { name: 'Collection Log', value: 'collection_log' },
        { name: 'LMS Rating', value: 'lms_rating' },
        { name: 'Zulrah Kills', value: 'zulrah_kills' },
        { name: 'Nex Kills', value: 'nex_kills' },
        { name: 'Chambers of Xeric', value: 'chambers_of_xeric_normal_kills' },
        { name: 'Theatre of Blood', value: 'theatre_of_blood_normal_kills' },
        { name: 'Jad Kills', value: 'jad_kills' },
        { name: 'Corp Beast Kills', value: 'corporeal_beast_kills' },
        { name: 'KBD Kills', value: 'king_black_dragon_kills' },
        { name: 'Demonic Gorillas', value: 'demonic_gorilla_kills' },
        { name: 'Rev Dragons', value: 'revenant_dragon_kills' },
        { name: 'Agility', value: 'agility' },
        { name: 'Mining', value: 'mining' },
        { name: 'Herblore', value: 'herblore' },
        { name: 'Farming', value: 'farming' },
        { name: 'LMS High Stakes', value: 'lms_high_stakes_wins' },
        { name: 'LMS Competitive', value: 'lms_competitive_wins' },
      ],
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

// /roat-reset — clear the user's chat session
const ROAT_RESET_COMMAND = {
  name: 'roat-reset',
  description: 'Clear your RoatPkz chat session',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const ALL_COMMANDS = [
  ROAT_COMMAND,
  PLAYER_COMMAND,
  LEADERBOARD_COMMAND,
  ROAT_RESET_COMMAND,
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
