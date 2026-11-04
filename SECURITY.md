# Security policy

## Report privately

Email **[contact@vihar.online](mailto:contact@vihar.online)** with the subject **“Security report — Vihar”**. Do not disclose exploitable details, credentials, or personal data in public issues or pull requests.

Include:

- The affected URL, component, and commit or deployment if known.
- A description of the vulnerability and its potential impact.
- Minimal reproduction steps using accounts and data you control.
- Redacted screenshots or logs that help reproduce the issue.
- A contact address for follow-up.

Do not send passwords, access tokens, session cookies, service-account keys, or other users’ data. If sensitive evidence is necessary, first request an appropriate private way to share it.

## Scope and responsible handling

Reports about Vihar authentication, account data, publishing, Firestore authorization, review ownership, or the production website are relevant. Third-party game hosts and services have their own owners and reporting channels.

Use local emulators where possible. Do not access or modify another person’s data, disrupt service, run denial-of-service tests, or publish a working exploit. Stop if a test exposes data you do not own and report only the minimum information needed to explain the issue. This policy is not authorization for intrusive testing and does not establish a bug-bounty program.

## Supported code

Security fixes target the current production deployment and the latest `main` branch. Historical commits, unmerged branches, preview deployments, and old builds do not have a separate maintenance commitment. The production website may lag behind `main`; include both identifiers when available.

Maintainers assess reports, seek clarification when needed, and coordinate remediation and disclosure. No fixed response deadline or payment is promised.

## Development safeguards

Keep secrets out of source control and browser bundles. `NEXT_PUBLIC_*` values are visible to visitors. Firebase web configuration identifies the project; authorization depends on Authentication and deployed Firestore rules. Run rules tests and deploy compatible rules before shipping dependent website changes. See [Architecture](docs/ARCHITECTURE.md) and [Deployment](docs/DEPLOYMENT.md).
