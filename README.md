# The Last Vote

> เกมเบราว์เซอร์แนวจิตวิทยาที่เล่าเรื่องด้วยบทสนทนา เกี่ยวกับความไว้วางใจ การโน้มน้าว และการตัดสินใจที่เปลี่ยนแปลงไม่ได้

A dialogue-driven psychological browser game about trust, persuasion, and irreversible decisions.

---

## The Game

You are the final voter in a fictional town. Five candidates seek your trust. They speak calmly, confidently, and persuasively. Some lie, some tell the truth, none reveal everything.

You may ask only **three questions** before your vote becomes final.

Success is not measured by winning. Success is measured by **how much you doubt your own certainty**.

---

## Core Feeling

- Uncertain
- Slightly anxious
- Clever at first → doubtful later
- Regretful after choosing

> "I trusted the wrong person — and I don't know why."

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript |
| Framework | React 18 |
| Build Tool | Vite |
| State | Context + useReducer |
| AI | Anthropic Claude (optional) |
| Deployment | Vercel |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd thelastvote

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to play.

### Play without Backend (Default)

The game works **immediately** with pre-written Thai responses (FALLBACK mode). No API keys required.

### Enable Real AI Responses (Optional)

1. Get an API key from [https://console.anthropic.com/](https://console.anthropic.com/)
2. Create `.env.local` file:
   ```env
   ANTHROPIC_API_KEY=sk-ant-...
   VITE_API_MODE=api
   ```
3. Run both frontend and backend:
   ```bash
   npm run dev:all
   ```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend only |
| `npm run dev:server` | Start backend server only |
| `npm run dev:all` | Start both frontend and backend |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

---

## Game Flow

1. **Meet** five candidates with distinct personalities
2. **Ask** up to three questions
3. **Watch** candidates respond
4. **Vote** for your chosen candidate
5. **Discover** hidden truths and consequences
6. **Replay** to see how differently words can deceive

---

## Project Status

**Production Ready** ✅

- ✅ Complete game loop (intro → vote → consequences)
- ✅ Five Thai-speaking candidates with distinct personalities
- ✅ Three-tier API system (FALLBACK/MOCK/API modes)
- ✅ Consequence system with staged reveals
- ✅ Full Thai localization

---

## Development

### Project Structure

```
thelastvote/
├── src/
│   ├── components/
│   │   ├── screens/        # Game phases (6 screens)
│   │   └── ui/             # Reusable UI components
│   ├── context/            # Game state manager
│   ├── data/               # Candidates, consequences
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # API client
│   ├── prompts/            # AI prompt builders
│   └── types/              # TypeScript definitions
├── api/                    # Vercel serverless functions
├── server.js               # Local dev server
└── memory-bank/            # Design documentation
```

### Design Philosophy

This is a **vibe-first** project:

- Emotion over mechanics
- Tension over optimization
- Meaning over scale

If a feature does not increase tension, doubt, or replay value — remove it.

### Memory Bank

The `memory-bank/` folder contains the project's long-term memory:

- `game-design-document.md` — Single source of truth for design vision
- `tech-stack.md` — Technology choices and rationale
- `implementation-plan.md` — Build phases and step-by-step actions
- `architecture.md` — System structure and component responsibilities
- `progress.md` — Development log, decisions, blocked issues

**Always read memory-bank before planning or coding.**

---

## Deployment

### Vercel (Recommended)

1. Push code to Git repository
2. Connect repository to Vercel
3. Set environment variable in Vercel dashboard:
   - `ANTHROPIC_API_KEY` = your API key (for real AI)
4. Deploy — Vercel automatically builds and deploys

The game will work without an API key using FALLBACK mode.

---

## License

[Your License Here]

---

## Credits

Created with love for dialogue-driven storytelling and psychological tension.

Built with React, TypeScript, and Anthropic Claude.
