# Kushora Expense Tracker

Track income and expenses, see charts and reports, and ask an AI assistant about your money.
Runs on iOS, Android and the web from one codebase, using Expo Router.

## Features
- Dashboard, Transactions, Expenses, Income, Categories, Reports, Assistant, Settings
- Sign in or create an account, with the session kept between reloads
- Add, edit and delete transactions (delete asks for confirmation on the page)
- Search and category/type filters, custom categories, currency setting
- Data saved on the device (AsyncStorage: browser storage on web, no server)
- AI assistant: answers about your data and how to use the app

## Requirements
Node.js 20 or newer, plus the Expo tooling for the platform you want. Physical devices need
the Expo Go app, or a native build for the assistant (see below).

## Run it
```bash
npm install
npm start           # Metro dev server, then press w / a / i
```

| Command | What it does |
| --- | --- |
| `npm start` | Start Metro. Press `w` for web, `a` for Android, `i` for iOS |
| `npm run android` | Start Metro and open the Android emulator |
| `npm run ios` | Start Metro and open the iOS simulator |
| `npm run typecheck` | Type-check the project (`tsc --noEmit`) |
| `npm run export:server` | Production web build into `dist/` (server-rendered) |
| `npm run serve` | Serve a built `dist/` locally |

To open it on your phone over Wi-Fi, run `npm start -- --lan` and scan the QR code with Expo Go.

## Web builds
The web target uses Expo Router's server output, so the app is server-rendered and each route
is prerendered. `npm start` gives you a dev server; for a production build:

```bash
npm run export:server
npm run serve
```

Both dev and production web output need the animation-frame shim in
`scripts/web-ssr-globals.cjs`. `scripts/expo.cjs` preloads it through `NODE_OPTIONS` before
handing off to the Expo CLI, which is why every script above goes through that launcher instead
of calling `expo` directly. Removing the shim reintroduces
`ReferenceError: requestAnimationFrame is not defined` during server rendering, because
`expo-router` pulls in Reanimated and Worklets code that assumes a browser global.

## Turn on the real AI assistant (optional)
The assistant works offline out of the box, answering basic questions from your saved data.
The live version calls Anthropic from a server route, so the key never reaches the app bundle.

```bash
cp .env.example .env     # set ANTHROPIC_API_KEY (and optionally ANTHROPIC_MODEL)
npm start                # or npm run serve, the route reads .env at server start
```

The route is `app/chat+api.ts`. It returns `503` when no key is set and the app falls back to
its offline answers. `ANTHROPIC_API_KEY` is only read server-side; never commit `.env`.

## Structure
```
app/                  Routes (Expo Router)
  _layout.tsx         Root: gesture handler, splash gate, auth redirect
  sign-in.tsx         Sign in and create account
  chat+api.ts         Server-only Anthropic route
  (tabs)/             The eight main tabs
src/components/       UI, layout, dashboard, transactions, charts, assistant
src/context/          AuthContext, ExpenseContext
src/hooks/            useAsyncStorage, useExpenses
src/services/         authService, expenseService, aiService
src/data/, src/utils/ Sample data, categories, date and currency helpers
scripts/              expo.cjs launcher, web-ssr-globals.cjs shim
```

## Notes
- `src/data/sampleData.ts` seeds the first launch so the dashboard is not empty. It is replaced
  once you add your own transactions.
- `src/components/layout/Screen.tsx` renders full-width by design, so screens stretch to the
  viewport on a desktop browser.