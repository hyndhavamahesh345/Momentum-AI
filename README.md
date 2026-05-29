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

### 🔐 Lightweight Authentication
Secure, multi-tenant LocalStorage-based authentication allowing users to maintain isolated execution environments.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | [React Router v7](https://reactrouter.com/) (Client-side) |
| **Backend API** | Node.js + [Express](https://expressjs.com/) |
| **UI** | [Chakra UI](https://chakra-ui.com/) + [Tailwind CSS](https://tailwindcss.com/) + [lucide-react](https://lucide.dev/) |
| **Animations** | [Motion (Framer Motion)](https://motion.dev/) |
| **Database** | [NeonDB](https://neon.tech/) (Serverless Postgres) |
| **AI** | [OpenAI API](https://platform.openai.com/) (`gpt-4o-mini` with structured JSON outputs) |
| **Charts** | [Recharts](https://recharts.org/) |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/) + [TanStack Query](https://tanstack.com/query) |
| **Build Tool** | [Vite](https://vitejs.dev/) |

---

## 📁 Project Structure

```
Momentum-AI/
├── backend/                               # Node.js Express API Server
│   ├── config/                            # Database connection (NeonDB)
│   ├── routes/                            # API Routes (Goals, Tasks, Insights)
│   ├── server.js                          # Express Entry Point
│   └── .env                               # Backend Environment Variables
└── frontend/                              # React SPA (Vite)
    ├── src/
    │   ├── app/                           # Page Routes (Dashboard, Landing)
    │   ├── components/                    # UI Components
    │   ├── hooks/                         # Custom React hooks
    │   └── store/                         # Zustand Global State
    ├── vite.config.ts                     # Vite Config (with Backend Proxy)
    └── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** v18+
- A [NeonDB](https://neon.tech/) account (free tier works)
- An [OpenAI](https://platform.openai.com/) API key

### 1. Clone the repo

```bash
git clone https://github.com/hyndhavamahesh345/Momentum-AI.git
cd Momentum-AI
```

### 2. Set up the Backend (API Server)

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
# NeonDB / Postgres — get from https://console.neon.tech → your project → Connection string
DATABASE_URL=your_neondb_connection_string

# OpenAI — get from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key
```

Start the backend server (runs on port 5000):

```bash
npm run dev
# or
node server.js
```

### 3. Set up the Frontend (React App)

Open a new terminal window:

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

Open [http://localhost:4000](http://localhost:4000) in your browser. The Vite development server automatically proxies `/api/*` requests to the backend server.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/goals/generate` | Generate a full goal execution system via OpenAI |
| `GET` | `/api/goals?userId=...` | List all goals for a specific user |
| `GET/PUT`| `/api/goals/:id` | Get or update a specific goal |
| `DELETE`| `/api/goals/:id` | Delete a goal and all associated metadata |
| `POST` | `/api/goals/replan` | Trigger AI replanning for stuck tasks |
| `POST` | `/api/tasks/update` | Update task status and trigger real-time momentum score changes |
| `POST` | `/api/momentum/calculate` | Calculate real-time momentum score |
| `POST` | `/api/insights/generate` | Generate AI behavioral insights based on task completion |

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
