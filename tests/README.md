# Tests

End-to-end tests using [Playwright](https://playwright.dev/).

## Prerequisites

- Node.js 18+
- App running locally (`npm run dev`)
- Environment variables configured (see root `.env.local`)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create auth storage directory

Many tests require a logged-in session. Playwright saves this state to a JSON file so you don't have to log in for every test.

```bash
mkdir -p tests/e2e/.auth
```

### 3. Generate saved auth state

Run Playwright codegen to log in manually and save your session:

```bash
npx playwright codegen http://localhost:3000/login \
  --browser=chromium \
  --save-storage=tests/e2e/.auth/user.json
```

1. A browser window opens
2. Click "Sign in with Google" and complete login with your `@g.ucla.edu` account
3. Once redirected to `/home`, close the browser
4. Your session is saved to `tests/e2e/.auth/user.json`

## Running Tests

- `npm run test:e2e:ui` - Open interactive UI mode
- `npm run test:e2e:headed` - Run tests in visible browser
- `npm run test:e2e:debug` - Debug mode with inspector
- `npm run test:e2e:report` - View HTML test report


## Test Coverage

- **Auth** — Login flow, logout, session handling
- **Listings** — Browse, filter, search, create, edit
- **Profile** — Settings, visibility toggles, avatar upload

