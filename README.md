# POCTIFY AI Help Desk

This project provides a simple Node.js server with a frontend chat UI that connects to the OpenAI Assistants API. When deploying to Netlify or other static hosts, set the publish directory to `public`.

```
[build]
  publish = "public"
```

The `assets` folder is included for a future logo.

## Setup

Use Node.js 18 or newer for native `fetch` support. If you run an older Node version the server loads `node-fetch` as a polyfill automatically. Install dependencies then start the server:

```bash
npm install
npm start
```

## Configuration

Set the following environment variables on your hosting platform or in a `.env` file:

```
OPENAI_API_KEY=<your OpenAI API key>
OPENAI_ASSISTANT_ID=<your assistant ID>
```
