# Kushora Expense Tracker (React + Vite)

Track income and expenses, see charts and reports, and ask an AI assistant about your money.
Works on desktop and phone (a scrollable bottom nav appears on small screens).

## Features
- Dashboard, Transactions, Expenses, Income, Categories, Reports, Assistant, Settings
- Add, edit and delete transactions (delete asks for confirmation on the page)
- Search and category/type filters, custom categories, currency setting
- Data saved in the browser (localStorage)
- AI assistant: answers about your data and how to use the app

## Run it
```bash
npm install
npm run dev          # app on http://localhost:5173
```
To open it on your phone (same Wi-Fi): `npm run dev -- --host`, then visit the Network address shown.

## Turn on the real AI assistant (optional)
The key must stay on a server, never in the app.
```bash
cp .env.example .env     # put your key in ANTHROPIC_API_KEY
npm run server           # second terminal, port 3001
```
Without the server, the assistant still answers basic questions offline from your saved data.

## Structure
`src/components` (UI, Layout, Dashboard, Expenses, Income, Categories, Charts, Transactions, Assistant), `src/pages`, `src/context`, `src/hooks`, `src/services`, `src/utils`, `src/data`, `server/`.
