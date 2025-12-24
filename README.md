
# Growth Marketing Playbooks Monorepo

This repository contains:

- **Distribution to Dev.to**: Python automation for summarizing and cross-posting technical blogs to Dev.to, with AI-powered summarization, banner generation, and robust state/error tracking for daily publishing.
- **Outline Generator**: A Next.js/Node.js web app for generating AI-powered content outlines, with a modern UI and support for multiple content levels and export formats.

---

## 📦 Monorepo Structure

```
├── Distribution to Dev.to/      # Python scripts for Dev.to automation
│   ├── app.py                  # Main summarizer and publisher
│   ├── run_from_json.py        # Batch runner with state/error tracking
│   ├── urls.json               # List of blog URLs to process
│   ├── state/                  # Tracks processed, pending, and error URLs
│   ├── static/                 # Banner images
│   ├── templates/              # HTML templates
│   └── ...
├── Outline Generator/          # Next.js app for AI outline generation
│   ├── app/                    # Next.js app directory
│   ├── components/             # React components
│   ├── domain/, service/, ...  # Business logic and utilities
│   ├── public/                 # Static assets and icons
│   └── ...
├── README.md                   # This file
└── ...
```

---

## 🚀 Projects

### 1. Distribution to Dev.to

Automates the process of:
- Fetching published blog URLs
- Summarizing content to Dev.to-optimized markdown using OpenAI
- Generating banners (OpenAI, local, or OpenRouter)
- Posting to Dev.to with robust error handling and daily publishing limits
- Tracks state in `state/last_state.json` (processed, pending, error)

**Key scripts:**
- `app.py` — Summarizes and posts a single blog
- `run_from_json.py` — Batch runner: processes one blog per day, skips errors, updates state

**Usage:**
```bash
cd "Distribution to Dev.to"
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Fill in your API keys
python run_from_json.py  # Processes one blog per run (safe for daily automation)
```

See [Distribution to Dev.to/README.md](./Distribution%20to%20Dev.to/README.md) for full details and environment variables.

---

### 2. Outline Generator

Modern web app for generating content outlines using AI.

- Built with Next.js, Tailwind CSS, and TypeScript
- Supports multiple outline levels (Beginner, Intermediate, Advanced)
- Exports outlines to DOCX and PDF
- Modular React component structure

**Usage:**
```bash
cd "Outline Generator"
yarn install  # or npm install
cp .env.example .env  # Fill in your API keys
yarn dev  # or npm run dev
```

See [Outline Generator/README.md](./Outline%20Generator/README.md) for full setup and features.

---

## 🤖 Automation, State Tracking & GitHub Actions

- Only one blog is published per day (enforced in `run_from_json.py`)
- If a post fails (e.g., canonical URL error), it is logged and skipped; the next pending URL is tried on the next run
- State is tracked in `state/last_state.json` as JSON: `{ processed: [...], pending: [...], error: [...] }`

### GitHub Actions Workflow

This repo includes a GitHub Actions workflow to automate daily blog publishing from the `Distribution to Dev.to` system.

- The workflow runs on a schedule (e.g., every 24 hours)
- It sets up Python, installs dependencies, loads secrets (API keys), and runs `run_from_json.py`
- Only one blog is published per run; errors are logged and skipped automatically
- You can monitor workflow runs and logs in the GitHub Actions tab

**Example workflow file:** `.github/workflows/devto-publish.yml`

```yaml
name: Daily Dev.to Publisher
on:
	schedule:
		- cron: '0 2 * * *'  # Runs daily at 2am UTC
	workflow_dispatch:
jobs:
	publish:
		runs-on: ubuntu-latest
		defaults:
			run:
				working-directory: Distribution to Dev.to
		steps:
			- uses: actions/checkout@v3
			- name: Set up Python
				uses: actions/setup-python@v4
				with:
					python-version: '3.10'
			- name: Install dependencies
				run: |
					python -m venv .venv
					source .venv/bin/activate
					pip install -r requirements.txt
			- name: Copy env
				run: cp .env.example .env
			- name: Set secrets
				run: |
					echo "OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}" >> .env
					echo "DEVTO_API_KEY=${{ secrets.DEVTO_API_KEY }}" >> .env
					# Add other secrets as needed
			- name: Publish one blog
				run: |
					source .venv/bin/activate
					python run_from_json.py
```
