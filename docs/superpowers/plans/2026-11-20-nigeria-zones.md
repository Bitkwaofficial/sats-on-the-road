# Nigeria zones and city visits

Approved scope: replace long Nigeria copy with a visual six-zone explorer, coverage numbers and an operational city invitation form; publish through the existing GitHub/Vercel workflow.

- [x] Create a lightweight six-zone cartogram, explicitly labelled not to scale, with interactive state lists and proposed hubs.
- [x] Show geographic totals only: six zones, 36 states, one FCT.
- [x] Route state selections to the correct zone. Send city, host and event details through the established Formspree endpoint; keep input on failure and prevent duplicate in-flight submissions.
- [x] Allow only the established form service in the browser connection policy.
- [x] Preserve EN/FR support and native form validation.
- [ ] Complete desktop/mobile, keyboard, link and form checks; publish and verify.

Validation: Node tests cover all 37 unique state/FCT assignments, request transport, rejected requests and network errors. Browser checks use no real submission; inbox delivery is not claimed as tested.
