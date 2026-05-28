# ⚡ Momentum AI

> **Stop planning. Start executing.**

Momentum AI is an **AI-powered Execution Operating System** that turns any goal into a complete, adaptive execution system — with milestones, prioritized tasks, real-time momentum scoring, and a live AI Chief of Staff that replans as you work.

---

## 🚀 What It Does

Type any goal. Get a full execution system in seconds.

| Step | What Happens |
|------|-------------|
| **01 — Enter your goal** | Type anything: a startup, a skill, a career move. The AI understands context, complexity, and urgency. |
| **02 — Get your execution system** | A full roadmap — milestones, tasks, priorities, time estimates — generated instantly. |
| **03 — Execute with AI guidance** | Mark tasks done. Your momentum score updates. The AI adapts the plan to your real-world execution. |

---

## ✨ Features

### 🧠 AI Planning Agent
Decomposes any goal into logical milestones and high-impact tasks — automatically. No more staring at a blank page.

### 🎯 Smart Prioritization
Ranks your work by impact, urgency, and dependencies. Always know what to do next.

### 📈 Momentum Scoring
A live score (0–100) that measures consistency, velocity, and prioritization quality — not just task count.

### 🔄 Adaptive Replanning
When you fall behind, the AI automatically reprioritizes your queue and gives you a recovery strategy.

### 📊 Execution Analytics
Trajectory charts, velocity graphs, and behavioral DNA — so you can see exactly how you execute.

### ✅ Accountability Agent
Detects inactivity and momentum drops proactively. Nudges you before you fall behind, not after.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [React Router v7](https://reactrouter.com/) (Full-stack) |
| **UI** | [Chakra UI](https://chakra-ui.com/) + [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Animations** | [Motion (Framer Motion)](https://motion.dev/) |
| **Database** | [NeonDB](https://neon.tech/) (Serverless Postgres) |
| **AI** | [OpenAI API](https://platform.openai.com/) |
| **Auth** | [Auth.js](https://authjs.dev/) via Hono |
| **Charts** | [Recharts](https://recharts.org/) |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/) + [TanStack Query](https://tanstack.com/query) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Runtime** | Node.js / [Bun](https://bun.sh/) |
| **Testing** | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |

---

## 📁 Project Structure

```
Momentum-AI/
├── anything/
│   └── apps/
│       └── web/
│           ├── src/
│           │   ├── app/
│           │   │   ├── api/               # Server-side API routes
│           │   │   │   ├── goals/         # Goal generation, replanning
│           │   │   │   ├── insights/      # AI insights generation
│           │   │   │   ├── momentum/      # Momentum score calculation
│           │   │   │   └── tasks/         # Task updates
│           │   │   ├── dashboard/         # Dashboard pages
│           │   │   └── page.jsx           # Landing page
│           │   ├── components/
│           │   │   ├── landing/           # Landing page components
│           │   │   └── dashboard/         # Dashboard components
│           │   ├── hooks/                 # Custom React hooks
│           │   ├── integrations/          # Third-party integrations
│           │   └── lib/                   # Utilities & DB helpers
│           ├── scripts/
│           │   └── setup-db.sql           # Database schema
│           ├── plugins/                   # Vite/build plugins
│           └── package.json
└── web/                                   # Additional web assets
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** v18+ or **Bun** v1.0+
- A [NeonDB](https://neon.tech/) account (free tier works)
- An [OpenAI](https://platform.openai.com/) API key

### 1. Clone the repo

```bash
git clone https://github.com/hyndhavamahesh345/Momentum-AI.git
cd Momentum-AI/anything/apps/web
```

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Set up environment variables

Create a `.env` file in `anything/apps/web/`:

```env
# NeonDB / Postgres — get from https://console.neon.tech → your project → Connection string
DATABASE_URL=your_neondb_connection_string

# OpenAI — get from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key
```

### 4. Set up the database

```bash
node scripts/setup-db.mjs
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running Tests

```bash
npm run test
# or
npx vitest
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/goals/generate` | Generate a full goal execution system |
| `GET` | `/api/goals` | List all goals |
| `GET/PUT` | `/api/goals/:id` | Get or update a specific goal |
| `POST` | `/api/goals/replan` | Trigger AI replanning |
| `POST` | `/api/tasks/update` | Update task status |
| `POST` | `/api/momentum/calculate` | Calculate momentum score |
| `POST` | `/api/insights/generate` | Generate AI behavioral insights |

---

## 📊 Example Goals to Try

- 🚀 _"Launch a SaaS startup in 30 days"_
- 💻 _"Crack Google SDE interview in 60 days"_
- 📹 _"Grow YouTube channel to 10k subscribers"_
- 🤖 _"Learn AI Engineering from scratch"_

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ⚡ by [hyndhavamahesh345](https://github.com/hyndhavamahesh345)**

*Stop planning. Start executing.*

</div>
