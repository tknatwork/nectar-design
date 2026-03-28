# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in nectar-design (private repository), please report it responsibly.

**Contact:** Email [hi@tusharkantnaik.com](mailto:hi@tusharkantnaik.com)

**Please do not** open a public GitHub issue for security vulnerabilities.

## Supported Versions

| Version | Supported |
| ------- | --------- |
| Latest  | Yes       |

## Scope

nectar-design is a client-side React component library with no server-side code
and no user input processing. The primary security concerns are supply chain
integrity and XSS prevention in component rendering.

The Biomimetic Adaptive Theme engine (`nectar-design/circadian`) uses:

- **SunCalc** — pure offline math (no network requests)
- **chroma-js** — color conversion (no network requests)
- **Browser Geolocation API** (optional) — requires user consent, location is never transmitted to any server, stored only in localStorage
- **BroadcastChannel API** — local inter-tab communication only (no network)
