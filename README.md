# FirstStep 🚀

**FirstStep** is an AI-powered CV Builder and Job Matcher designed specially for Georgian university students. It combines a highly polished, responsive Georgian-locale interface with powerful backend services to streamline candidate matching, CV preparation, and job applications.

---

## 🌟 Features

- **AI-Powered CV Builder**: Generate structured, professional CVs tailored for Georgian industry standards using Google Gemini LLM translation and generation.
- **Dynamic Job Matching**: Instant matching score algorithms powered by the `@google/genai` client, scanning active student interests and skills against job listings.
- **Firebase Firestore & Authentication**: Real-time server-side synchronization paired with offline-safe client-side persistent storage fallbacks.
- **Symmetric Identity Migration**: Dynamic synchronizer that handles standard and Google-authenticated sign-ins symmetrically, preventing local database mismatches.
- **Modern Responsive Design**: Built on modern Tailwind CSS, featuring rich transitions, modern typography, and a mobile-optimized structural layout.
- **Production-Ready PDF Exports**: Instant generation of clean printable CV files directly from the browser using standard vector PDF utilities.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: [React 19](https://react.dev/), [Vite 6](https://vite.dev/), [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend API**: [Express.js](https://expressjs.com/) with ESBuild CommonJS production compiler
- **LLM Engine**: [@google/genai SDK](https://github.com/google/generative-ai-js) (Official Google Gemini Client)
- **Database / Auth**: [Firebase v12 Firestore and Authentication SDKs](https://firebase.google.com/)
- **Hosting / Deploy**: Optimally designed for container services (e.g., Cloud Run) and serverless function platforms like **Vercel** via integrated server proxying.

---

## ⚙️ Environment Variables

Copy the example variables file to begin:
```bash
cp .env.example .env
```

Ensure the following variables are declared before launching the application:

| Variable | Scope | Purpose |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Server-side | Secret API credential for Gemini model operations. |
| `VITE_FIREBASE_API_KEY` | Client-side | Public API Key for Firebase Authentication & Firestore. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Client-side | Firebase authorization callback redirect domain. |
| `VITE_FIREBASE_PROJECT_ID` | Client-side | Target Firebase project identifier. |
| `VITE_GOOGLE_CLIENT_ID` | Client-side | Optional Google Client ID for OAuth login flows. |

---

## 📂 Project Structure

```
├── api/
│   └── index.ts                # Serverless entry point for Vercel
├── assets/                     # Graphic resources and illustrations
├── src/
│   ├── components/             # Reusable UI components (AuthModal, CVBuilder, JobMatcher, etc.)
│   ├── lib/
│   │   ├── db.ts               # Local and Firestore data accessor
│   │   └── firebase.ts         # Firebase initialization configuration
│   ├── App.tsx                 # Core layout, routers, and application state
│   ├── index.css               # Global styling entry point with Tailwind imports
│   └── main.tsx                # React browser bootstrap mounts
├── vercel.json                 # Vercel Serverless Routing configurations
├── server.ts                   # Full-Stack Express and static asset server
├── metadata.json               # Application environment permissions and metadata
├── package.json                # Bundler configurations and project dependencies
└── tsconfig.json               # TypeScript path mapping definitions
```

---

## ⚡ Local Development

Get the application up and running on your local machine:

### 1. Install Dependencies
```bash
npm install
```

### 2. Standalone Local Dev Server
Launch Vite integrated into the Express server:
```bash
npm run dev
```
The application will boot at `http://localhost:3000`.

### 3. Build & Run Production Bundle Locally
Compile both the frontend assets (Vite) and backend middleware (esbuild CJS compilation) and boot:
```bash
npm run build
npm start
```

---

## ☁️ Vercel Deployment

This project includes a fully customized, serverless-compelled backend wrapper to host full-stack Express routines seamlessly on **Vercel**:

1. **Routing Strategy**: Handled entirely through `/vercel.json`. It rewrites index files, static routes, and proxies `/api/*` and `/auth/*` API endpoints to the Express middleware wrapper at `/api/index.ts`.
2. **Server Configuration**: Inside `server.ts`, the Express app automatically detects if it is deployed on Google/Vercel serverless containers (`process.env.VERCEL`) and suppresses manual `.listen()` calls, delegating lifecycle listener handling directly to the serverless container handler.

To deploy, simply link your repository to your **Vercel Dashboard** or run:
```bash
npm install -g vercel
vercel
```

---

## 🔒 Security & Standards

This application is strictly optimized for production distribution:
- **API Protection**: No client-side exposure of the Gemini credentials. All AI calls travel securely through proxy routes `/api/generate-cv` and `/api/match-jobs`.
- **Firestore Security Rules**: Framed within robust, context-aware `firestore.rules` preventing unauthorized writes to documents owned by extraneous student accounts.
