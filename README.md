# BAS SHOP - Final

## Files
- index.html: product page
- login.html: username + password login
- register.html: username + email + password + confirmation
- admin.html: admin product management
- js/config.js: Supabase project config
- js/auth.js: login/register + Discord function call
- supabase/schema.sql: database/RLS/RPC setup
- supabase/functions/quick-handler/index.ts: Discord webhook Edge Function

## Setup
1. Upload all web files to the GitHub repository, preserving folders.
2. In Supabase SQL Editor, run `supabase/schema.sql`.
3. In Authentication settings, turn off `Confirm email` and save.
4. In Edge Functions, open the existing `quick-handler`, replace `index.ts` with the included `supabase/functions/quick-handler/index.ts`, and Deploy updates.
5. In Edge Functions -> Secrets, create `DISCORD_WEBHOOK_URL` and paste a NEW Discord webhook URL as its value. Never put the webhook in GitHub.
6. Create the admin user in Supabase Authentication, then run:

UPDATE public.profiles
SET role = 'admin', username = 'admin'
WHERE email = 'ADMIN_EMAIL_HERE';

Admin login uses username `admin` and the password you set for that Auth user.

## Important
The Discord message intentionally does not contain the customer's password. It contains username, member ID, email and time.
