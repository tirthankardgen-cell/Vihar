<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Required project record

- Read `development.md` before starting work. It is the single source for current architecture, setup, production operations, decisions and historical verification. Current-state guidance takes precedence over dated historical entries.
- Every agent must update `development.md` in the same change as its work, before committing or declaring completion. This applies to code, UI, configuration, documentation, cleanup and deployment changes.
- Update any affected current-state sections and add a new dated entry under **Change log**. Include **Author**, **Request**, **Changes**, **Decisions**, **Validation**, and **Release**. Explain what changed, why it changed, why the approach was chosen, exact checks and outcomes, and any pending release or follow-up work.
- Never report unrun or blocked checks as passed. Keep credentials, private user data and authentication tokens out of the record.
- Run `npm run check:log` before delivery. CI also checks that the change includes the required entry. A passing gate does not replace accurate documentation.
- Do not create another development log, developer guide, changelog, handoff or permanent task report. Keep README.md concise; keep legal and third-party notices intact. Temporary evidence goes under ignored `output/` and is removed after review.
- Preserve the existing architecture, production assets, original artwork, automated tests, local environment files and deployment linkage. Resolve cleanup targets within this workspace and stop owned processes before removing their artifacts.
