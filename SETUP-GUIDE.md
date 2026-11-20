# RIVER ESPORTS — Website + Admin CMS

This project is a responsive public BGMI esports website plus a separate admin dashboard. It is designed so tournament and organisation content can be managed from the dashboard instead of editing the frontend files.

## Included
- `index.html` — public-facing website
- `admin.html` — private sign-in and CMS dashboard
- `assets/` — styling and browser JavaScript
- `supabase-schema.sql` — database tables and row-level security policies

## 1. Create the Supabase backend
1. Create a Supabase project.
2. Open **SQL Editor → New query**.
3. Paste all contents of `supabase-schema.sql` and run it.
4. Open **Project Settings → API**. Copy the Project URL and the `anon` / publishable key.
5. Open `assets/supabase.js` and replace:
   - `YOUR_SUPABASE_PROJECT_URL`
   - `YOUR_SUPABASE_ANON_KEY`
6. Do not put the `service_role` key in this website.

## 2. Create your admin login
1. In Supabase, open **Authentication → Users**.
2. Add an admin user with your email and a strong password.
3. Keep admin credentials private. Do not add a public sign-up form.

The starter uses Supabase Auth to sign in. The database policies allow authenticated users to manage CMS records and allow public visitors to read organisation content. For a production deployment with multiple staff roles, add a dedicated admin-role table and stricter role-based policies before inviting other users.

## 3. Run locally
Because the site uses JavaScript modules, open it through a local web server (not by double-clicking the HTML file).

For Python:
```bash
python -m http.server 8080
```
Then visit:
- Public site: `http://localhost:8080`
- Admin: `http://localhost:8080/admin.html`

On Android/Termux, run the same command from the project folder, then open `http://127.0.0.1:8080` in your browser.

## 4. Deploy
Upload the complete project folder to a GitHub repository and connect that repository to Vercel or Cloudflare Pages. This is a static frontend; Supabase provides the hosted database and authentication. Add no server secret to frontend environment variables.

## 5. Use the dashboard
Sign in at `/admin.html`, then use the sidebar:
- Tournaments — add/edit/delete event details and registration link
- Match schedule — add/edit/delete stage, date, time and map
- Results — publish winners, runner-up and prize pool
- Teams & players — manage roster information
- News & banners — publish news and image URLs
- Sponsors — manage partner names and links
- Website settings — edit homepage hero and about text

Changes are stored in Supabase and read by the public site.

## Current starter limitations / next build items
- The public page currently displays tournament cards, results, teams, news, sponsors and editable homepage text. The match schedule is managed in the CMS database; a dedicated public schedule section can be added in the next pass.
- News image URLs are stored; the initial public news cards are text-first. Supabase Storage image upload, tournament detail pages, standings/points table editor, role-based staff permissions, SEO metadata editor and registration workflow are suitable next upgrades.
- Add real organisation logos, approved brand artwork, official social links and contact details before launch.
- Test all admin operations on a staging project before publishing real data.
