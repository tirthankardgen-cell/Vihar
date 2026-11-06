# Production deployment

## Canonical destinations

| Setting | Value |
| --- | --- |
| Website | `https://vihar.online` |
| Repository | `https://github.com/tirthankardgen-cell/Vihar` |
| Production branch | `main` |
| Game deployment | `https://rasta.vihar.online` (separate from this website) |
| Gulam Chor deployment | `https://gulamchor.vihar.online` (separate from this website) |
| Hosting | Vercel, Next.js preset |
| Node.js | `26.x` |
| Install / build | `npm ci` / `npm run build` |
| Output directory | Next.js default; do not override |

Keep the Vercel project rooted at this repository’s root. Configure the production domain and environment values in the existing project. Do not create a replacement production project as part of a routine release.

## Before release

1. Run `npm run check`, `npm run test:rules`, and `npm run verify`.
2. Review environment changes against [`.env.example`](../.env.example). Keep `NEXT_PUBLIC_FIREBASE_EMULATORS=false` in production.
3. Confirm any Firebase schema/rules dependency and the target Firebase project. The repository’s `.firebaserc` records the existing default; verify it against the intended deployment account.
4. Deploy compatible Firestore rules before publishing dependent UI changes, using the authenticated Firebase CLI and the explicitly verified project:

   ```sh
   npx firebase deploy --only firestore:rules --project YOUR_VERIFIED_PROJECT_ID
   ```

   Replace the placeholder; do not run it literally. A Git push or Vercel deployment does not deploy these rules.

5. Push the reviewed commit to `main`. The connected Vercel project can then start production deployment.
6. Check GitHub Actions and the Vercel deployment result for that exact commit. A successful push is not proof of successful deployment.

Do not enable advertising merely to pass a check. Existing serving controls require approval and consent readiness; preview deployments remain ad-free and noindex according to the application’s current safeguards.

## Production smoke check

- Confirm the canonical domain loads over HTTPS and public navigation works.
- Check `/games`, the playable Vihar game page, and a known published community listing.
- With designated test accounts, verify login, draft privacy, publishing, launch receipts, and review ownership.
- Verify the creator dashboard on desktop and mobile, including independent desktop scrolling and footer removal.
- Confirm `/sitemap.xml`, `/robots.txt`, and social metadata reflect the intended production origin.
- Check failure/loading states and hosting logs without exposing credentials or user data.

Community images and external game hosts can fail independently of Vihar. Inspect both the listing and the external destination when diagnosing these reports.

## Rollback

Use the existing Vercel project to restore a known-good deployment if a release regresses. Record the affected commit, symptoms, and mitigation. Review database compatibility before changing Firebase rules: a website rollback does not roll back rules or stored records. Avoid deleting user data as a rollback shortcut. Ship a focused corrective commit and rerun the checks before replacing the rollback.

## Repository About settings

The intended GitHub About values are:

- **Description:** Discover, play, and share games. Vihar brings original browser games, independent creators, player profiles, and community reviews together.
- **Website:** `https://vihar.online`

Repository administrators can edit these fields from the gear beside About on the repository homepage. They are GitHub settings, not values controlled by a README commit or `package.json`.
