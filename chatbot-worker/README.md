# Portfolio chatbot — free Workers AI setup

The portfolio chat widget is already wired to the public Worker URL in `chatbot.js`. The Worker now uses Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct`) rather than the paid OpenAI API. No API key is needed in the website or Worker code.

## Deploy the free AI backend

1. Sign in to the Cloudflare account that owns `sarah-portfolio-chatbot`.
2. Ensure Workers AI is available/enabled for the account. Cloudflare may apply its current included usage limits; if the free allocation is exhausted, requests will temporarily fail until it resets.
3. From this folder, install/use Wrangler if needed, then authenticate and deploy:

   ```sh
   npx wrangler login
   npx wrangler deploy
   ```

4. Wrangler reads `wrangler.toml`, which defines the `AI` binding. Do not add an OpenAI key or any secret to this project.
5. Test the endpoint with a POST request to `https://sarah-portfolio-chatbot.sarahammadai.workers.dev/chat` using JSON like:

   ```json
   {"messages":[{"role":"user","content":"What projects has Sarah built?"}]}
   ```

   A successful response should contain a `reply` string.

## Security notes

- The frontend contains only the public Worker URL, never credentials.
- The Worker restricts browser origins, validates message shape/length, limits request rates, and does not expose provider errors.
- The in-memory rate limit is best-effort per Worker isolate; use Cloudflare platform-level controls if stronger abuse protection is needed.
