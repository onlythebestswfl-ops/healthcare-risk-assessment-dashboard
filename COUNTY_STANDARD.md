# Florida County Standard

Repository rule: **no county left behind**.

Any county-level layer added to this project must satisfy all of the following before it is treated as part of the application:

1. All `67` Florida counties are present.
2. Every county uses the same schema.
3. Every county receives the same layer at the same time.
4. Missing values are handled explicitly in the schema, not by omitting counties.
5. A layer is not considered production-ready if it only exists for selected counties.

## Practical Meaning

- No Miami-only features.
- No pilot county logic in the production dataset.
- No “example county” shortcuts presented as statewide capability.
- No silent county exclusions when a source is incomplete.

## Promotion Rule

A new county-level layer can be promoted into the app only when:

- the official source is identified
- statewide coverage is verified
- the generated dataset validates against the county schema
- the layer is wired consistently for all counties

## Current State

The current county context layer satisfies the rule for all `67` counties with these fields:

- `acute_care_hospitals.facility_count`
- `acute_care_hospitals.licensed_beds`
- `nursing_homes.facility_count`
- `nursing_homes.licensed_beds`

Source path:

- official FloridaHealthFinder county-filtered facility search

Validation path:

- `scripts/validate_florida_county_context.py`
