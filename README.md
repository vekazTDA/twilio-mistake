# SMS Verification for Webflow Form (Twilio Verify)

Backend + embed snippet to add phone-number verification to a Webflow form,
using Twilio Verify.

## 1. Deploy the backend (Vercel — free tier is enough)

1. Create a new folder locally, copy in `api/send-code.js`, `api/check-code.js`,
   and `package.json` from this project.
2. Install the Vercel CLI if you don't have it: `npm i -g vercel`
3. From that folder, run `vercel` and follow the prompts (or connect the
   folder as a GitHub repo and import it in the Vercel dashboard instead).
4. In the Vercel project → Settings → Environment Variables, add:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_VERIFY_SERVICE_SID`
   (Use the values from your Twilio Console — never put these in the
   Webflow-facing code.)
5. Deploy. You'll get a URL like `https://your-project.vercel.app`.
6. Test it directly:
   ```
   curl -X POST https://your-project.vercel.app/api/send-code \
     -H "Content-Type: application/json" \
     -d '{"phone":"+38761234567"}'
   ```
   (Trial Twilio accounts can only send to numbers verified in the
   Twilio Console under Verified Caller IDs.)

## 2. Set up the Webflow form elements

In the Webflow Designer, on the page with your form:

| Element | ID | Notes |
|---|---|---|
| Phone input | `phone-input` | Plain text field |
| "Send code" button | `send-code-btn` | Type = Button, **not** Submit |
| Wrapper div around the code field | `code-wrapper` | Set display: none in Designer |
| Code input | `code-input` | Inside the wrapper above |
| "Verify" button | `verify-code-btn` | Type = Button, **not** Submit |
| Real submit button | `real-submit-btn` | Type = Submit, set **disabled** by default |
| Status text | `verify-status` | Any text element, shows messages |

## 3. Add the embed code

Paste the contents of `webflow-embed.html` into either:
- An **Embed** element placed right after the form, or
- Page Settings → Custom Code → "Before `</body>` tag" (applies to that page only)

Change this line at the top to your deployed URL:
```js
const BACKEND_URL = "https://YOUR-PROJECT.vercel.app";
```

## 4. Publish and test

Publish the Webflow site, open it, and walk through: enter phone → Send code →
receive SMS → enter code → Verify → Submit button unlocks → submit form normally.

## Notes / next steps

- **CORS**: the functions currently allow all origins (`*`). Once your Webflow
  domain is final, restrict `Access-Control-Allow-Origin` to that domain.
- **Trial limits**: upgrade your Twilio account before going live — trial
  accounts can only text pre-verified numbers.
- **Security**: a determined user could bypass the JS and submit the Webflow
  form directly. For anything sensitive, have your backend be the system of
  record (e.g., write the "verified" submission to your own database via the
  check-code function) rather than relying solely on the disabled submit button.
