# POCTIFY AI Help Desk

This project provides a simple Node.js server with a frontend chat UI that connects to the OpenAI Assistants API. When deploying to Netlify or other static hosts, set the publish directory to `public`.

```
[build]
  publish = "public"
```

The `assets` folder is included for a future logo.

## Configuration

Set the following environment variables on your hosting platform or in a `.env` file:

```
OPENAI_API_KEY=<your OpenAI API key>
OPENAI_ASSISTANT_ID=<your assistant ID>
```
