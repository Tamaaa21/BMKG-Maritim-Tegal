# BMKG-Maritim-Tegal

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-h5petqgd)

## Server secrets

- Keep server-only secrets (e.g. `SUPABASE_SERVICE_ROLE_KEY`) out of source control.
- Add the service role key to your local `.env.local` and never expose it to the browser or commit it.
- This repository's `.gitignore` already excludes `.env` and `.env*.local` files.

