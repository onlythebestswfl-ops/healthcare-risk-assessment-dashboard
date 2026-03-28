# Florida Targeted MDRO Risk Support

Florida-focused static prototype for state and county infection prevention decision support around
targeted MDRO events.

## What changed

The original rescued artifact has been preserved in `sourced-artifact.html`, but the app homepage is
now a cleaner v1 architecture prototype that:

- narrows scope to targeted healthcare-associated MDRO events
- treats county-level layers as statewide-only, with no county left behind
- separates signal severity, spread potential, containment fragility, and confidence
- escalates posture conservatively when key local data are weak or missing
- can apply official county population, hospital, and nursing-home context from Census and FloridaHealthFinder
- links back to official CDC, Florida DOH, AHCA, and CMS source anchors

## Files

- `index.html`: active v1 dashboard
- `app.js`: transparent rubric and response-posture logic
- `styles.css`: dashboard styling
- `V1_ARCHITECTURE.md`: architecture notes and source anchors
- `REFERENCES.md`: formal source register and maintenance notes
- `DATA_SOURCES.md`: lightweight capture list for likely data inputs
- `COUNTY_STANDARD.md`: statewide county coverage rule
- `data/florida_county_facility_context.json`: generated county hospital/nursing-home context
- `schemas/florida_county_facility_context.schema.json`: current county context schema
- `scripts/fetch_florida_facility_context.py`: refresh script for official county facility context
- `scripts/validate_florida_county_context.py`: statewide coverage validator
- `sourced-artifact.html`: preserved extracted Claude artifact

## Local preview

Open `index.html` directly in a browser or serve the folder with any static file server.
