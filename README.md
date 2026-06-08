# The Atelier — AI Art Judge

An emotion-first AI art analysis tool. Emotional Resonance carries **40%** of the final score.

---

## Deploy to Vercel (Free, ~5 minutes)

### Step 1 — Get your Anthropic API Key
1. Go to [platform.anthropic.com](https://platform.anthropic.com)
2. Sign up / log in → go to **API Keys**
3. Click **Create Key** and copy it

### Step 2 — Upload to GitHub
1. Create a free account at [github.com](https://github.com)
2. Click **New Repository** → name it `the-atelier` → Create
3. Upload all these project files to the repository

### Step 3 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign up (free)
2. Click **Add New Project** → Import your GitHub repo
3. Before clicking Deploy, go to **Environment Variables** and add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** (paste your API key here)
4. Click **Deploy**

That's it. Your site will be live at `https://your-project.vercel.app`

**Your API key is stored securely in Vercel — never exposed to users.**

---

## How It Works

```
User uploads art
      ↓
Browser → /api/judge (your Vercel server)
      ↓
Server adds secret API key → Anthropic Claude API
      ↓
Claude analyzes image → returns judgment
      ↓
Server sends result back → Browser displays scores
```

---

## Scoring Weights

| Dimension           | Weight | Notes                          |
|---------------------|--------|--------------------------------|
| Emotional Resonance | 40%    | Most important — does it move? |
| Soul & Narrative    | 25%    | Human truth and meaning        |
| Style & Voice       | 20%    | Originality and identity       |
| Technical Mastery   | 10%    | Skill and execution            |
| Craft & Execution   | 5%     | Medium mastery                 |

---

## Local Development

```bash
npm install
cp .env.example .env.local
# Edit .env.local and add your API key
npm run dev
# Open http://localhost:3000
```
