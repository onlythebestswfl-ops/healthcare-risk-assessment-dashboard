# Florida Targeted MDRO Risk Support: V1 Architecture

## Intent

Build a Florida-first decision-support prototype for state and county infection preventionists dealing with targeted healthcare-associated MDRO events.

This is **not** a validated epidemiologic model. It is a transparent operational rubric designed to:

- keep the scope narrow
- show where caution is coming from
- avoid hidden assumptions and fake precision

## V1 Scope

Initial organism set:

- `Candida auris`
- carbapenemase-producing `Enterobacterales` (`CP-CRE`)
- carbapenem-resistant `Acinetobacter baumannii` (`CRAB`)
- carbapenem-resistant `Pseudomonas aeruginosa` (`CRPA`)

Why this scope:

- CDC containment strategy explicitly treats targeted MDROs as organisms requiring coordinated public-health action in healthcare settings.
- Florida DOH already publishes organism-specific operational material for `Candida auris`.
- These events are highly dependent on healthcare-network context, transfer pathways, and containment capacity.

## Output Structure

The UI intentionally separates the assessment into four outputs instead of one opaque score:

1. `Signal severity`
2. `Spread potential`
3. `Containment fragility`
4. `Assessment confidence`

The recommendation shown to the user is `response posture`, not a claim of validated transmission probability.

## Conservative Logic

The tool is allowed to lean cautious under uncertainty, but it should do so honestly:

- missing data lowers `confidence`
- low confidence can elevate `response posture`
- low confidence must not silently masquerade as stronger evidence

This means the app can say:

- evidence suggests one level of concern
- local visibility is weak
- therefore the recommended posture is escalated conservatively

## Input Domains

### 1. Event Profile

- organism
- confirmed vs suspected vs screening-positive
- single case vs epidemiologically linked cluster vs ongoing transmission
- care setting

### 2. Local Network Conditions

- county label
- county population
- acute care facility count
- long-term care facility count
- transfer intensity
- staffing/referral mixing

### 3. Containment Readiness

- confirmatory lab access
- screening/contact investigation capacity
- isolation/PPE/disinfection readiness
- interfacility notification workflow

### 4. Visibility & Confidence

- surveillance visibility
- baseline completeness of local data

## Scoring Philosophy

The v1 prototype uses explicit rule-based points, not hidden machine learning or implied validation.

- `Signal severity` is driven mainly by organism/event characteristics.
- `Spread potential` is driven mainly by network density and movement.
- `Containment fragility` is driven mainly by response gaps.
- `Confidence` is reduced by missing or weakly verified local data.

The response posture is then selected from a simple, inspectable matrix:

- `Routine monitoring`
- `Targeted outreach`
- `Coordinated response`
- `Rapid containment posture`

## Public Data Architecture

V1 UI accepts manual context input because that is the most honest implementation that can ship quickly.

Planned data ingestion layers:

1. `AHCA / Florida Health Finder`
   - facility inventory and licensed facility context
2. `CMS Care Compare / Provider Data`
   - Medicare-certified hospitals and nursing homes, county and urban/rural indicators
3. `Florida DOH organism-specific operational guidance`
   - example: `Candida auris` toolkit and regional containment framing

## Known Limits

- No outcome validation has been performed.
- County selection is metadata in v1 unless supporting data are entered.
- The point values are explicit prototype policy weights, not evidence-validated coefficients.
- The app should be described as a decision-support rubric for response planning, not a clinical prediction tool.

## Primary Source Anchors

- CDC MDRO prevention strategies: https://www.cdc.gov/healthcare-associated-infections/php/preventing-mdros/mdro-prevention-strategies.html
- CDC containment strategy: https://www.cdc.gov/healthcare-associated-infections/php/preventing-mdros/mdro-containment-strategy.html
- CDC `Candida auris` infection control guidance: https://www.cdc.gov/candida-auris/hcp/infection-control/index.html
- Florida DOH `Candida auris` toolkit (September 2024): https://www.floridahealth.gov/diseases-and-conditions/health-care-associated-infections/_documents/candida-auris-toolkit.pdf
- AHCA data dissemination: https://ahca.myflorida.com/schs/DataD/DataD.shtml
- CMS Provider Data Catalog: https://data.cms.gov/provider-data/
