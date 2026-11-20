# Countries and Nigeria implementation plan

Goal: Add Countries navigation with Nigeria as the first detailed country project, as approved in chat.

Architecture: Keep the existing static Node generator and shared header. Use a native details disclosure for accessible navigation. Generate /countries/nigeria as a real nested HTML page with root-relative resources. Retain existing EN/FR translation and signup infrastructure.

- [x] Add shared Countries disclosure, keyboard dismissal, mobile styling, and French labels. Preserve the separate wall and admin navigation.
- [x] Add Nigeria page source and manifest metadata, covering mission, learning, merchant participation, route, updates, local collaboration and joining. Do not invent dates, teams, merchant listings, outcomes or earmarked donations.
- [x] Support nested output directories and resource URLs in the generator, with Nigeria canonical and sitemap entry.
- [x] Preselect Nigeria in the existing waitlist using a validated country query parameter.
- [x] Build all pages; verify resource and anchor targets, translation coverage, syntax, desktop/mobile navigation and nested page rendering.
- [ ] Publish the verified changes and confirm the live deployment.

