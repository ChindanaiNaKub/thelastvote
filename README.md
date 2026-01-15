# The Last Vote

> เกมเบราว์เซอร์แนวจิตวิทยาที่เล่าเรื่องด้วยบทสนทนา เกี่ยวกับความไว้วางใจ การโน้มน้าว และการตัดสินใจที่เปลี่ยนแปลงไม่ได้

A dialogue-driven psychological browser game about trust, persuasion, and irreversible decisions.

---

## The Game

You are the final voter in a fictional town. Five candidates seek your trust. They speak calmly, confidently, and persuasively. Some lie, some tell the truth, none reveal everything.

You may ask only **three questions** before your vote becomes final.

### The Candidates

- **🦁 ป่า (Pah)** — Charismatic reformer with a vision for change. Best friend of ขนุน.
- **🧠 แบม (Bam)** — Pragmatic technocrat who believes in data and systems. Friendly rival of กัน.
- **🛡️ ขนุน (Khanun)** — Protective healer who cares about people's well-being. Best friend of ป่า.
- **😏 กัน (Kan)** — Cynical realist who sees through everyone's facades. Friendly rival of แบม.
- **🔥 ทาม (Tam)** — Radical outsider who challenges the status quo. A lone wolf with no allies.
- **ปราบ ( Prab )** - Extra ; p

### Dynamic Relationships

Candidates don't exist in isolation. They have **complex relationships** with each other:
- **Best friends** will defend each other fiercely
- **Friendly rivals** trade barbs but respect one another
- **Lone wolves** have no allies and higher base pressure
- **Secret relationships** reveal themselves during consequences

Watch how they interact, clash, and respond when their allies are eliminated.

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
3. **Eliminate** one candidate after each question round (3 eliminations total)
4. **Watch** candidates respond, clash, and reveal their true nature
5. **Vote** for your chosen candidate among the final two
6. **Discover** hidden truths, alternative paths, and consequences
7. **Uncover** the mastermind behind this experiment
8. **Replay** to see how differently words can deceive

### New Features

#### Enhanced Relationship System
- **Pair mechanics** — Best friends defend each other (+50 pressure when ally eliminated)
- **Rival dynamics** — Friendly rivals banter but respect each other
- **Pressure system** — Candidates crack differently based on who they've lost
- **Clash detection** — Candidates attack each other when pressure builds

#### Stat Tracking
The game tracks your playstyle and reveals insights:
- **Question patterns** — Who did you focus on? Who did you ignore?
- **Ruthlessness score** — Did you eliminate allies or enemies?
- **Decision speed** — How quickly did you make choices?
- **Meta-awareness** — Did you suspect this was all a game?

#### Mastermind Plot Twist
At the end, discover who created this experiment... and why.
Based on your playstyle, receive a personalized message that reflects your choices.

**Every playthrough reveals a different side of the story.**

---

## Project Status

**Production Ready** ✅

### Core Features
- ✅ Complete game loop (intro → questioning → elimination → voting → consequences → mastermind reveal)
- ✅ Five Thai-speaking candidates with distinct personalities and relationships
- ✅ Three-tier API system (FALLBACK/MOCK/API modes)
- ✅ Consequence system with staged reveals
- ✅ Full Thai localization

### Meta-Gaming Features (Phase 6)
- ✅ Enhanced relationship system (8 relationship types)
- ✅ Pair mechanics (best friends, friendly rivals, lone wolves)
- ✅ Dynamic pressure calculation based on eliminations
- ✅ Clash detection with context-aware dialogue
- ✅ Comprehensive stat tracking during gameplay
- ✅ Player behavior analysis and archetype detection

---

## Development

### Project Structure

```
thelastvote/
├── src/
│   ├── components/
│   │   ├── screens/        # Game phases (6 screens)
│   │   └── ui/             # Reusable UI components
│   ├── context/            # Game state manager with stat tracking
│   ├── data/               # Candidates, consequences
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # API client, tracking, pressure calculation
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

---

*Every choice matters. Every doubt is real.*
