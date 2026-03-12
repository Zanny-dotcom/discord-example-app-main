# RoatPkz Discord Bot

Discord slash command bot for querying RoatPkz player stats, leaderboards, and game data. This bot is the Discord interface only — all AI and scraping logic runs on a separate Mac M4 server.

## Architecture

```
Discord ←→ ngrok ←→ [Windows PC: Node.js/Express bot]
                            ↓
                     [Mac M4: Ollama + FastAPI]
                     (qwen3:8b model, scraping, stats)
```

- **This machine (Windows PC):** Receives Discord interactions via ngrok, routes queries to the Mac API
- **Mac M4:** Runs Ollama (qwen3:8b) + FastAPI — handles all AI inference, web scraping, and stat parsing

## Prerequisites

- Node.js 18+
- Mac API server running at `MAC_API_URL` (default: `http://192.168.1.109:5050`)
- [ngrok](https://ngrok.com/) installed separately for development tunneling

## Setup

```bash
npm install
npm run register   # Register slash commands with Discord
ngrok http 3000    # Run in a separate terminal
# Set the ngrok HTTPS URL as your Interactions Endpoint in Discord Developer Portal
npm run dev        # Start the bot
```

## Slash Commands

| Command | Description | Options |
|---------|-------------|---------|
| `/roat` | Ask anything about RoatPkz | `question` (required) |
| `/player` | Look up a player's stats | `name` (required), `section` (optional) |
| `/leaderboard` | View a RoatPkz leaderboard | `category` (required, 24 choices) |
| `/roat-reset` | Clear your chat session | — |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `APP_ID` | Discord Application ID |
| `DISCORD_TOKEN` | Discord Bot Token |
| `PUBLIC_KEY` | Discord Public Key (for interaction verification) |
| `MAC_API_URL` | Mac API base URL (e.g., `http://192.168.1.109:5050`) |

## Mac API Contract

```
POST /chat    { user_id, message }  → { reply, query_type, detail? }
POST /reset   { user_id }           → { status }
GET  /health                        → { status, model, active_sessions }
```
