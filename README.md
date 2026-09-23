# Karibu Nchi

Location-based dating website for Kenya. People create profiles, filter by county and distance, swipe, match, and chat.

This is a frontend MVP you can host on **Netlify** from **GitHub**. Auth, likes, matches, chat, and reports are stored in the browser (`localStorage`) so you can demo the product without a backend.

## Features in this demo

- Registration / login (local)
- Profile setup (name, county, mode, bio)
- GPS permission + county filters
- Discover / swipe cards
- Filters: county, distance, age, student / professional / church mode
- Matches and chat UI
- Safety / report form
- Premium + M-Pesa placeholder

## Deploy

1. Repo: `https://github.com/gachiesamuel14/karibu-nchi`
2. In Netlify: **Add new site → Import from GitHub** → select this repo
3. Publish directory: `.` (no build command)
4. Deploy

## Production next steps

A real dating product needs:

- Auth (Clerk, Supabase Auth, or Netlify Identity)
- Database with geo queries (Postgres + PostGIS or MongoDB)
- Object storage for photos
- WebSockets for live chat
- Safaricom Daraja for M-Pesa
- Moderation queue for reports

Suggested stack: Next.js + Supabase + Netlify, or Node/Nest + Postgres hosted separately.
