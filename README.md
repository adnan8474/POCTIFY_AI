# POCTIFY AI Help Desk

This project is a static webpage with a chat UI powered by OpenAI Assistants. All backend logic runs in Netlify Functions.

```
[build]
  publish = "public"
  functions = "netlify/functions"
```

The `assets` folder is included for a future logo.

## Setup

Use Node.js 18 or newer. Install dependencies and run the Netlify dev server for local testing:

```bash
npm install
npx netlify dev
```

## Configuration

Set the following environment variables on your hosting platform or in a `.env` file. On Netlify, add them under **Site settings → Build & deploy → Environment**:

```
OPENAI_API_KEY=<your OpenAI API key>
OPENAI_ASSISTANT_ID=<your assistant ID>
```
