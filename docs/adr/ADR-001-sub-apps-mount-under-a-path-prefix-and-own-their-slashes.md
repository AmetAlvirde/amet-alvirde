# Sub-apps mount under a path prefix and own their trailing slashes

_Made during: spec #34, the sub-app mount contract, after slice S1 (#35) proved
the mechanism on throwaway deployments. Decision by Amet, 2026-10-28._
_Scope: product_
_Status: accepted_

## Decision

Projects built with other tools mount at `/<section>/<project>/` on
`www.ametalvirde.com`. The first is noema at `/writing/noema/`. For each app,
the site's `vercel.json` holds exactly three entries and none of them names a
path below the prefix. `P` is the prefix and `H` is the app's assigned
production `*.vercel.app` host, never a scope-suffixed alias:

```json
"redirects": [{ "source": "/P", "destination": "/P/", "permanent": true }],
"rewrites":  [{ "source": "/P/:path(.*)", "destination": "https://H/P/:path" }],
"headers":   [{ "source": "/P/:path(.*)", "headers": [
  { "key": "CDN-Cache-Control", "value": "max-age=300" },
  { "key": "x-vercel-enable-rewrite-caching", "value": "1" }
]}]
```

Each app owns its trailing slashes below the prefix, and it exempts the prefix
root: `GET /P/` returns 200 from the app and never a redirect, because the
site's bare-prefix redirect owns `/P` → `/P/`. The site sets no global
`trailingSlash` or `cleanUrls`.

Adding a folder to an app must change nothing in the site repo. Quartz folder
pages need the trailing slash and notes and tag pages must drop it, so the
slash rules depend on the app's content. Content knowledge belongs to the app.

For noema the build itself emits its slash routes. A post-build step derives
the folder add-slash and note strip routes from the build's own output and
writes them as Build Output API routes. The committed `vercel.json` holds only
the build command and never changes when content does. Slice S2 (#36) confirmed
this under the GitHub-integration build: a commit that only added a folder
redeployed noema, and the new folder's page worked in both URL forms.

## Considered Options

- **Folder-aware slash rules in the site's `vercel.json`.** This was the 10-27
  spike's r3 layout, and it was verified working. It was rejected for locality.
  The site would carry every app's folder list, and a folder added without
  regenerating the site config returns 200 with broken CSS and links.
- **Slash redirects in the app's own `vercel.json`, generated from the
  folder list.** This passed the contract check, but only while the committed
  file was current. Vercel ignores a `vercel.json` rewritten during the build.
  A folder added without regenerating and committing the file broke both URL
  forms of that folder silently, which would put a regenerate-and-commit step
  on noema's publish script.

## Consequences

- **A blanket slash setting on any app loops at the prefix root.** With
  `trailingSlash: false` on noema, `/writing/noema/` bounced between the app's
  strip and the site's add-slash until the browser gave up. Straight at the
  origin it was one redirect and a 200, so origin-only tests cannot see the
  loop. Only a request through the site host shows it. A future app's
  framework setting that strips every slash will cause the same loop.
- **A cached 308 outlives its fix.** The site caches proxied redirects under
  the 300-second CDN lifetime. After the origin was corrected, the site kept
  serving the looping 308 at `age` 157 to 161. One site redeploy cleared it on
  the next request, which is one observation and not a guarantee.
- **Quartz emits no canonical.** noema's post-build step injects an absolute
  `<link rel="canonical">` to `https://www.ametalvirde.com/writing/noema/...`
  in the form that returns 200, so search engines index `www` and not the
  `*.vercel.app` copy. Quartz's `og:url` stays wrong for folder pages. An app
  must not send a blanket `noindex` header, because the site passes the origin's
  `X-Robots-Tag` through to `www`.
- **The contract is judged by the site repo's contract check, not by resemblance
  to noema.** Only one app meets it so far, so its generality is still a claim.
