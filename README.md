# Florida Targeted MDRO Risk Support

Florida-focused static prototype for state and county infection prevention decision support around
targeted MDRO events.

## What changed

The original rescued artifact has been preserved in `sourced-artifact.html`, but the app homepage is
now a cleaner v1 architecture prototype that:

- narrows scope to targeted healthcare-associated MDRO events
- separates signal severity, spread potential, containment fragility, and confidence
- escalates posture conservatively when key local data are weak or missing
- links back to official CDC, Florida DOH, AHCA, and CMS source anchors

## Files

- `index.html`: active v1 dashboard
- `app.js`: transparent rubric and response-posture logic
- `styles.css`: dashboard styling
- `V1_ARCHITECTURE.md`: architecture notes and source anchors
- `sourced-artifact.html`: preserved extracted Claude artifact

## Local preview

Open `index.html` directly in a browser or serve the folder with any static file server.
