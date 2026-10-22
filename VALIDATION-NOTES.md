# Validation scope

Run the pinned package scripts documented in README.md against every proposed release. Check the generated Astro Worker with its actual ASSETS directory, not a static mock of the home page. Verify every existing route, HTTP-to-HTTPS path/query preservation, GET/HEAD errors and noindex, metadata, sitemap, image mappings and internal links.

For the existing consent controls, exercise loaded-grant withdrawal, local/session read and write failures independently, retained-tab denial, failure to clear a refusal, separate sessions with shared local storage, regrant and repeated saves. Displayed controls and feedback must match the effective runtime state.

For weather and sea level, exercise successful upstream fixtures and unavailable/null data, both language cache orders, date labels, a failed initial server render followed by client recovery, later refresh failures and full graph/event refresh. A fixture result proves the tested runtime path, not live forecast availability. Check the built client module as well as the server handlers.

Public source and served client assets must be scanned for private material before release. Local checks do not certify deployment, domain binding inventory, TLS or rendered desktop/mobile interactions.
