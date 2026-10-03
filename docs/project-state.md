# Project State

## Current Phase
Phase 6 — Fix Retention Semantics and Production Verification

## Status
The local source now retains assignments by the real current calendar month and its immediately previous month, regardless of the displayed month. Phase 5 functionality remains in the local source.

## Completed
- Changed retention calculation to use the system date rather than displayed month or navigation history.
- Preserved real current/previous assignment buckets while navigating several months backward or forward.
- Out-of-window months render unassigned and are not persisted; the explicit save action explains when a viewed month is outside retention.
- Preserved January/December year-boundary behavior.
- Updated README and requirements, architecture, domain, decision, and project-state documentation.

## Current Work
None. Phase 6 local changes and verification are complete.

## Next Step
Stop here as requested. Do not implement Phase 7.

## Known Limitations
- Assignment and theme data remain local to the browser and origin; there is no synchronization or backup.
- The live GitHub Pages site currently serves a version without the Phase 5 save, theme, and export controls. The Phase 6 retention fix and those controls therefore remain unverified on the deployed build until it is updated.
- There is no persistent automated test suite.

## Verification
- `node --check app.js`, workspace diagnostics, and `git diff --check`: passed.
- Local static HTTP browser verification passed 22 retention/navigation checks and 10 Phase 5 theme/export checks, with no browser errors.
- Confirmed October/September assignments remain stored when July or other out-of-window months are displayed; older keys are pruned.
- Confirmed current and previous assignments save, survive refresh, and restore after navigation; out-of-window months remain unassigned and are not recreated.
- Confirmed Jan/Dec retention keys, theme persistence, and a valid 1080 by 1180 PNG with calendar content, assignment legend, and no application controls.
- Tested the live GitHub Pages URL directly: page, three people, JavaScript, CSS, localStorage, assignment persistence, and month navigation work without console errors. The live site lacks Phase 5 controls, so Phase 5/6 production behavior was not claimed as verified.
- Restored original localStorage values after browser tests and stopped the temporary static server.
