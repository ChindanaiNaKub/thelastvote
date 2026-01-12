# Tech Stack — The Last Vote

> This file documents all technology choices for the project. Update when making new technical decisions.

---

## Status

**DECIDED** — Tech stack defined based on planning decisions.

**Date:** 2026-01-12

---

## Language

**TypeScript**

**Why:**
- Type safety catches bugs early
- Better IDE support and autocomplete
- Self-documenting code
- Industry standard for React projects
- Catches errors at compile time, not runtime

---

## Libraries / Frameworks

### Frontend Framework

**React 18+**

**Why:**
- Component-based architecture fits game screens naturally
- Large ecosystem and community
- Excellent state management options (Context, hooks)
- Proven for interactive applications
- Easy to find solutions to common problems

### Build Tool

**Choice:** Vite (recommended) or Next.js

**Vite** (Recommended for this project)
- Faster development server with HMR
- Simpler configuration
- Lighter weight
- Better for pure client-side apps

**Next.js** (Alternative)
- Integrated serverless functions
- Built-in routing
- Better SEO (not needed for this game, but nice to have)
- Larger file size for simple apps

**Recommendation:** Start with Vite for simplicity. Can migrate to Next.js later if serverless integration is needed.

### State Management

**React Context + useReducer**

**Why:**
- Built into React, no external dependencies
- Sufficient for this game's state complexity
- Easy to debug and reason about
- Can add Zustand later if needed

### Additional Libraries (To Be Added As Needed)

- **Axios or fetch** - For API calls to backend
- **@anthropic-ai/sdk** - Anthropic Claude API client

---

## Tools

### Code Quality

- **ESLint** - Linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

### Development

- **npm** or **yarn** - Package manager
- **Git** - Version control

### Deployment

- **Vercel** (primary) or **Netlify** (alternative)

---

## Platform Target

**Browser-based game** - Runs in modern web browsers

**Target Browsers:**
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Reasons for Choices

### React + TypeScript

**Decision rationale:**
- **Vibe-first approach** means we need quick iteration
- React's component model maps naturally to game screens
- TypeScript prevents runtime bugs that break immersion
- Large ecosystem means we don't reinvent the wheel
- Easy to find developers familiar with this stack

### Vite (over Next.js)

**Decision rationale:**
- **Simpler setup** = faster to start building
- **Faster HMR** = quicker development iteration
- **Smaller bundle** = better performance
- Serverless functions can be added later via Vercel/Netlify
- We can always migrate to Next.js if needed

### Context + useReducer (over Redux/Zustand)

**Decision rationale:**
- **No external dependencies** = simpler project
- Game state is straightforward (no complex async flows)
- Easy to understand for future developers
- Can migrate to Zustand if state becomes complex

### Vercel (for deployment)

**Decision rationale:**
- **Zero-config deployment** = push to git, it just works
- Built-in CI/CD
- Excellent serverless functions support
- Generous free tier (sufficient for MVP)
- Easy environment variable management

---

## Constraints & Considerations

### AI Integration

- Must support LLM API integration (Anthropic Claude or OpenAI GPT)
- API keys must be protected (serverless functions only)
- Rate limiting to control costs
- Conversation history must be passed to AI calls

### Performance

- Should load quickly (< 3 seconds initial load)
- AI responses should feel responsive (< 5 seconds)
- Minimal bundle size (< 500KB ideally)

### Accessibility

- Screen reader compatible (semantic HTML)
- Keyboard navigation
- High contrast mode support
- Font size scaling

### Browser Compatibility

- Modern browsers only (no IE11 support)
- Progressive enhancement OK
- Graceful degradation for API failures

---

## Alternatives Considered

### Frontend Framework

**Considered:** Vue, Svelte, Solid

**Chosen:** React

**Why:**
- Largest ecosystem
- Most familiar to developers
- Easier to find help/resources

### State Management

**Considered:** Redux, Zustand, Jotai, Recoil

**Chosen:** Context + useReducer

**Why:**
- Built into React
- No additional dependencies
- Sufficient for this game's complexity
- Can add Zustand later if needed

### Build Tool

**Considered:** Webpack, Parcel, Next.js

**Chosen:** Vite

**Why:**
- Fastest development experience
- Simplest configuration
- Good balance of features and simplicity

### LLM Provider

**Considered:** OpenAI only, Anthropic only, Open-source

**Chosen:** Anthropic (primary), OpenAI (backup)

**Why:**
- Claude has better dialogue quality
- Anthropic has strong safety features
- OpenAI as backup for reliability
- Can add open-source (WebLLM) later for privacy

---

## Development Environment

### Local Development

```bash
# Initialize project
npm create vite@latest thelastvote -- --template react-ts

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

**`.env.local`** (not committed to git)
```env
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_OPENAI_API_KEY=sk-...
```

**Note:** In production, API keys will be server-side only (not exposed to browser).

---

## Package.json Structure

```json
{
  "name": "thelastvote",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\""
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
```

---

## Cost Estimates

### Development Costs

- **All tools are free** (open source)
- No licensing costs

### Deployment Costs

- **Vercel Free Tier:** $0/month
  - Includes: Hosting, CI/CD, serverless functions
  - Limits: 100GB bandwidth, 10k serverless executions/month
  - Sufficient for MVP and early testing

- **Vercel Pro:** $20/month (if needed later)
  - Higher limits
  - Better analytics

### API Costs (LLM)

- **Anthropic Claude:**
  - Claude Sonnet: ~$3 per million input tokens, ~$15 per million output tokens
  - Estimate: ~10 API calls per game × ~500 tokens/response = ~5,000 tokens
  - Cost per game: ~$0.02-0.10 depending on usage
  - 100 games: ~$2-10
  - 1,000 games: ~$20-100

- **OpenAI GPT-4:**
  - Similar pricing structure
  - GPT-3.5-turbo is cheaper (budget option)

**Cost Management:**
- Implement rate limiting (max 10 calls per game)
- Use `max_tokens` to limit response length
- Monitor usage and set budget alerts

---

## Security Considerations

### API Key Protection

- **NEVER** commit API keys to git
- Use `.env.local` for local development (gitignored)
- Use Vercel environment variables for production
- Serverless functions hide API keys from browser

### Input Sanitization

- Sanitize all user input before sending to LLM
- Limit question length (max 500 characters)
- Strip HTML tags and special characters
- Validate input is not malicious prompts

### Rate Limiting

- Implement per-session rate limits
- Add delays between requests
- Monitor API costs
- Set monthly budget limits

---

## Tech Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Language | TypeScript | 5.0+ | Type safety |
| Framework | React | 18.2+ | UI components |
| Build Tool | Vite | 4.4+ | Development & build |
| State | Context + useReducer | Built-in | State management |
| LLM | Anthropic Claude | Latest | AI dialogue |
| API Client | @anthropic-ai/sdk | Latest | LLM API calls |
| Deployment | Vercel | - | Hosting & serverless |
| Linting | ESLint | 8.45+ | Code quality |
| Formatting | Prettier | 3.0+ | Code style |

---

*Tech stack decisions finalized: 2026-01-12*
