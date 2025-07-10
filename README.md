# POCTIFY AI Help Desk

This project provides a simple Node.js server with a frontend chat UI that connects to the OpenAI Assistants API. When deploying to Netlify, serverless functions handle the API calls.

```
[build]
  publish = "public"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/chat"
  to = "/.netlify/functions/chat"
  status = 200
  force = true

[[redirects]]
  from = "/api/feedback"
  to = "/.netlify/functions/feedback"
  status = 200
  force = true
```

The `assets` folder is included for a future logo.

## Setup

Use Node.js 18 or newer for native `fetch` support. If you run an older Node version the server loads `node-fetch` as a polyfill automatically. Install dependencies then start the server:

```bash
npm install
npm start
```

## Configuration

Set the following environment variables on your hosting platform or in a `.env` file. On Netlify, add them under **Site settings → Build & deploy → Environment**:

```
OPENAI_API_KEY=<your OpenAI API key>
OPENAI_ASSISTANT_ID=<your assistant ID>
```
