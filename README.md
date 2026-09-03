# BAS SHOP

GitHub Pages + Supabase shop starter.

## 1) Supabase Auth
Turn **Confirm Email** OFF so users can sign in immediately after registration.

## 2) Database
Run `supabase/schema.sql` in Supabase SQL Editor.

## 3) Discord registration notifications
The browser calls the Edge Function `notify-registration` after a successful signup. The Discord webhook is kept as a Supabase Function secret, not in GitHub.

In Supabase Dashboard:
1. Open **Edge Functions**.
2. Create/deploy a function named `notify-registration`.
3. Paste the code from `supabase/functions/notify-registration/index.ts`.
4. Open Edge Function **Secrets** and create:
   - Key: `DISCORD_WEBHOOK_URL`
   - Value: your **new Discord webhook URL**
5. Deploy the function.

The function sends: username, member code, email, and Bangkok time. It never sends the user's password.

## 4) GitHub
Upload all files preserving the `js/` and `supabase/` folders. `js/config.js` already contains the Supabase project URL and publishable key.

## 5) Admin
Create the admin user in Supabase Auth, then set its profile role to `admin` using the SQL in the previous instructions.
