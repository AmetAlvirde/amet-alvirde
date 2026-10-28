# ADR Index

| ADR | Title | Scope | Status | Summary |
| --- | ----- | ----- | ------ | ------- |
| [ADR-001](./ADR-001-sub-apps-mount-under-a-path-prefix-and-own-their-slashes.md) | Sub-apps mount under a path prefix and own their trailing slashes | product | Accepted | Apps mount at `/<section>/<project>/` through a fixed three-entry block per app in the site's `vercel.json`: bare-prefix redirect, rewrite to the app's production `*.vercel.app` host, cache headers. Each app owns its slashes below the prefix and exempts the root. noema emits its slash routes from its own build through the Build Output API. Rejected: site-side folder rules (spike r3, verified, lost on locality) and a generated app `vercel.json` (Vercel ignores one rewritten during the build). |
