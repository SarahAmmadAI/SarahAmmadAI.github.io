# Sarah's AI Portfolio Assistant — setup guide

The portfolio widget is the browser interface. The AI request runs in a Cloudflare Worker, so the OpenAI API key is never included in the public GitHub Pages files.

## What is already in this repository

- \`chatbot.js\` — floating chat interface and browser-to-backend request
- \`chatbot.css\` — matching dark-purple, blush-pink, and lilac design
- \`chatbot-worker/worker.js\` — backend request validation and OpenAI Responses API call
- \`chatbot-worker/wrangler.toml\` — Cloudflare Worker configuration

## Before you begin

You need an OpenAI API key with API billing/access enabled, and a Cloudflare account. ChatGPT subscriptions and API billing are separate products. Review your API usage and set an appropriate budget/usage alert before sharing the public website.

Official references:
- OpenAI API key safety: https://help.openai.com/en/articles/5112595-best-practices-for-api
- OpenAI API quickstart: https://developers.openai.com/api/docs/quickstart
- Cloudflare Worker secrets: https://developers.cloudflare.com/workers/configuration/secrets/

## Step 1 — Deploy the secure backend

1. Install Node.js LTS from https://nodejs.org/ if it is not already installed.
2. Open a terminal in the repository folder.
3. Install Wrangler (Cloudflare's CLI) as a project development dependency:

   \`\`\`bash
   npm install --save-dev wrangler
   \`\`\`

4. Log in to Cloudflare:

   \`\`\`bash
   npx wrangler login
   \`\`\`

5. From the repository root, deploy the Worker using its configuration file:

   \`\`\`bash
   npx wrangler deploy --config chatbot-worker/wrangler.toml
   \`\`\`

   Wrangler will show a URL similar to \`https://sarah-portfolio-chatbot.YOUR-SUBDOMAIN.workers.dev\`. Copy that HTTPS URL. Do not add \`/chat\` to the URL yet.

6. Add the OpenAI key as a Worker secret. From the repository root, run:

   \`\`\`bash
   npx wrangler secret put OPENAI_API_KEY --config chatbot-worker/wrangler.toml
   \`\`\`

   Paste your key only into the terminal prompt. Never put it in \`chatbot.js\`, HTML, CSS, \`wrangler.toml\`, a screenshot, or a GitHub commit. If you prefer the Cloudflare dashboard, open **Workers & Pages → sarah-portfolio-chatbot → Settings → Variables and Secrets → Add → Secret**, use the name \`OPENAI_API_KEY\`, and paste the key as its value.

   If you add the secret after the first deploy, Cloudflare creates a new Worker version automatically.

## Step 2 — Connect the website to the Worker

1. Open \`chatbot.js\`.
2. Find this line near the top:

   \`\`\`js
   var CHATBOT_API_URL = "https://sarah-portfolio-chatbot.YOUR-SUBDOMAIN.workers.dev";
   \`\`\`

3. Replace the example URL with the exact HTTPS Worker URL Wrangler gave you. Keep the quotes and do not append \`/chat\`.
4. Commit and push the updated \`chatbot.js\` to the \`main\` branch of the GitHub repository.
5. Wait for GitHub Pages to publish, then refresh the portfolio.

The browser will send requests to \`YOUR-WORKER-URL/chat\` automatically.

## Step 3 — Test the chatbot

- Open https://sarahammadai.github.io/ and click the floating ✦ button.
- Try: “What projects has Sarah built?” and “How can I contact Sarah?”
- Test on a phone-sized screen as well as desktop.
- If the widget says the backend is not configured, check the URL in \`chatbot.js\`.
- If it reports a connection error, check the Worker deployment, the \`OPENAI_API_KEY\` secret, API billing/access, and Cloudflare Worker logs.

## Security and cost notes

- The API key is stored as a Cloudflare Worker secret, not in the public website.
- The Worker only allows the production portfolio origin and local Wrangler development origins, validates request shape and length, limits conversation size, and applies a best-effort per-isolate request throttle.
- Browser-origin checks are not authentication; non-browser clients can forge an Origin header. Before widely sharing the chatbot, configure a Cloudflare rate-limiting rule for the Worker route and monitor API usage. The in-memory throttle is only a small extra safeguard, not a production-wide quota.
- Use a separate API key for this project, keep its access limited where possible, monitor usage, and rotate it immediately if you suspect exposure.
- Do not put private information in the assistant's context. It is designed to answer questions using Sarah's public portfolio details.
- The AI API may incur usage charges. The website widget itself is free, but AI model requests are not guaranteed to be free.

## Troubleshooting

- **401 / service error:** check that the Worker secret is set correctly and belongs to an API account with access.
- **429 / busy:** wait and retry; check API usage limits and the Worker rate-limiting settings.
- **CORS error:** make sure the site is opened at \`https://sarahammadai.github.io\` and that the browser URL configured in \`chatbot.js\` matches your deployed Worker URL.
- **Widget says setup required:** replace \`YOUR-SUBDOMAIN\` in the Worker URL in \`chatbot.js\`.
