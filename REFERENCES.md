# References

Formal source register for the Florida Targeted MDRO Risk Support prototype.

Reviewed March 27-28, 2026.

## Purpose

This file tracks official sources currently informing:

- organism scope
- infection prevention and containment logic
- Florida-specific operational assumptions
- public facility and provider data strategy

Repository maintainers should prefer official CDC, Florida state, AHCA, and CMS sources. If a source is replaced or superseded, update this file rather than silently swapping logic in code.

## Source Rules

- Prefer official sources over secondary summaries.
- Record what each source is used for.
- Distinguish `guidance`, `operational source`, `public dataset`, and `background only`.
- If a source is organism-specific, note that explicitly.
- If a source is not suitable for direct scoring, mark it as contextual only.

## A. CDC Guidance

### 1. MDRO Containment Strategy

- Title: `MDRO Containment Strategy | HAIs | CDC`
- URL: <https://www.cdc.gov/healthcare-associated-infections/php/preventing-mdros/mdro-containment-strategy.html>
- Type: `guidance`
- Status in prototype: `active`
- Why it matters:
  - anchors the concept of public-health response to novel and targeted MDROs
  - supports infection-control assessment domains such as hand hygiene, PPE, environmental cleaning, device reprocessing, and water management
  - supports interfacility communication during transfer
- Notes:
  - CDC states this page supersedes the older high-risk facility containment section with newer interim guidance
  - Best used for response workflow and assessment domains, not as a validated scoring formula

### 2. MDRO Prevention Strategies

- Title: `MDRO Prevention Strategies | HAIs | CDC`
- URL: <https://www.cdc.gov/healthcare-associated-infections/php/preventing-mdros/mdro-prevention-strategies.html>
- Type: `guidance`
- Status in prototype: `active`
- Why it matters:
  - supports selecting focus MDROs rather than trying to score every organism at once
  - supports the prevention-plan structure of education, IPC, detection, and communication
  - explicitly notes that local epidemiology can differ across areas in the same jurisdiction
- Notes:
  - Useful for product scope and jurisdiction strategy
  - Not a source for direct weights

### 3. Candida auris Infection Control Guidance

- Title: `Infection Control Guidance: Candida auris | CDC`
- URL: <https://www.cdc.gov/candida-auris/hcp/infection-control/index.html>
- Type: `guidance`
- Status in prototype: `active`
- Organism scope: `Candida auris`
- Why it matters:
  - supports communication at transfer and referral
  - supports setting-specific actions for dialysis and outpatient settings
  - supports environmental cleaning and use of EPA products with claims for `C. auris`
- Notes:
  - Strong operational source for action recommendations
  - Not intended as a regional spread model

### 4. Candida auris Colonization Detection Guidance

- Title: `Guidance for Detection of C. auris Colonization | CDC`
- URL: <https://www.cdc.gov/candida-auris/hcp/laboratories/detection-colonization.html>
- Type: `guidance`
- Status in prototype: `watchlist`
- Organism scope: `Candida auris`
- Why it matters:
  - useful if the app later supports screening workflow assumptions
  - supports point prevalence and colonization-screening context
- Notes:
  - Not yet wired directly into the UI logic

### 5. Candida auris Surveillance

- Title: `Surveillance of C. auris | CDC`
- URL: <https://www.cdc.gov/candida-auris/php/surveillance/index.html>
- Type: `guidance`
- Status in prototype: `watchlist`
- Organism scope: `Candida auris`
- Why it matters:
  - supports how screening and surveillance inform control activity
- Notes:
  - Good source for later data-ingestion or surveillance-specific features

## B. Florida Department of Health

### 6. Florida Candida auris Infection Prevention and Control Toolkit

- Title: `Candida auris Infection Prevention and Control Toolkit`
- URL: <https://www.floridahealth.gov/diseases-and-conditions/health-care-associated-infections/_documents/candida-auris-toolkit.pdf>
- Type: `operational source`
- Status in prototype: `active`
- Organism scope: `Candida auris`
- Publication date: `September 2024`
- Why it matters:
  - Florida-specific operational framing for single cases, clusters, and outbreaks
  - includes Florida-specific data framing, identification, PPS, containment, environmental cleaning, occupational health, and precautions
  - explicitly defines outbreak threshold and containment topics relevant to county/state IP users
- Notes:
  - One of the strongest Florida-first sources in the repo
  - Should remain core to Florida v1 until a broader Florida MDRO framework exists

### 7. Florida Candida auris Statewide Action Plan (2023-2025)

- Title: `Candida auris Statewide Action Plan (2023-2025)`
- URL: <https://www.floridahealth.gov/diseases-and-conditions/health-care-associated-infections/_documents/florida-candida-auris-plan.pdf>
- Type: `operational source`
- Status in prototype: `active`
- Organism scope: `Candida auris`
- Why it matters:
  - shows Florida DOH and AHCA priorities around communication, testing, resources, and continuity of care
  - confirms Florida’s county/region response framing
- Notes:
  - Best used for roadmap and integration priorities, not direct risk-scoring coefficients

### 8. Florida Public Health Laboratory Candida auris ID

- Title: `Candida auris ID | Florida Bureau of Public Health Laboratories`
- URL: <https://www.floridahealth.gov/community-environmental-public-health/public-health-laboratories/testing/mycology/candida-auris-id/>
- Type: `operational source`
- Status in prototype: `active`
- Organism scope: `Candida auris`
- Why it matters:
  - supports the confirmatory-lab-access concept in the UI
  - provides practical turnaround, testing location, specimen type, and process context
- Notes:
  - Useful when converting readiness assumptions into more specific Florida lab pathways

### 9. Florida NHSN Overview

- Title: `National Healthcare Safety Network | Florida Department of Health`
- URL: <https://www.floridahealth.gov/statistics-data/population-surveillance/health-care-associated-infections/national-healthcare-safety-network/>
- Type: `operational source`
- Status in prototype: `watchlist`
- Why it matters:
  - useful for future surveillance and reporting context
  - identifies facility types already reporting HAI data through NHSN-linked programs
- Notes:
  - Contextual for data strategy, not direct scoring

## C. Florida Facility and Capacity Data

### 10. AHCA Office of Data Dissemination and Transparency

- Title: `Office of Data Dissemination and Transparency | AHCA`
- URL: <https://ahca.myflorida.com/agency-administration/florida-center-for-health-information-and-transparency/office-of-data-dissemination-and-transparency>
- Type: `public dataset portal`
- Status in prototype: `active`
- Why it matters:
  - primary gateway for Florida hospital, ambulatory surgery, and emergency department data access
  - links to Florida Health Finder research/order-data pathways
- Notes:
  - Good anchor source for a future ingestion pipeline

### 11. AHCA Florida Licensed Hospitals

- Title: `Florida Licensed Hospitals`
- URL: <https://ahca.myflorida.com/content/download/24546/file/Florida_Licensed_Hospitals.pdf>
- Type: `public dataset`
- Status in prototype: `active`
- Data date on document: `September 2, 2025`
- Why it matters:
  - fast statewide inventory of licensed hospitals and bed counts
  - good for sanity checks and county-level facility context
- Notes:
  - PDF summary, not the whole universe of Florida care settings
  - likely best paired with other AHCA or CMS facility data

### 12. FloridaHealthFinder Facility Locate Search

- Title: `FloridaHealthFinder | Locate Facility`
- URL: <https://quality.healthfinder.fl.gov/Facility-Search/FacilityLocateSearch>
- Type: `public dataset interface`
- Status in prototype: `active`
- Why it matters:
  - current integrated source for county-level hospital and nursing-home counts
  - supports generated county context file used by the dashboard
- Notes:
  - current repo script posts to the official advanced-search handler and captures county-filtered results
  - acute care context currently uses `FacilityType=Hospital`
  - long-term care context currently uses `FacilityType=Nursing-Home`

### 13. AHCA Hospitals Program Page

- Title: `Hospitals | Florida Agency for Health Care Administration`
- URL: <https://ahca.myflorida.com/health-care-policy-and-oversight/bureau-of-health-facility-regulation/hospital-outpatient-services-unit/hospitals>
- Type: `regulatory context`
- Status in prototype: `watchlist`
- Why it matters:
  - supports what counts as a licensed hospital in Florida
  - useful for later facility-type normalization

### 14. AHCA Frequently Requested Data

- Title: `Frequently Requested Data | AHCA`
- URL: <https://ahca.myflorida.com/health-quality-assurance/bureau-of-central-services/frequently-requested-data>
- Type: `public dataset portal`
- Status in prototype: `watchlist`
- Why it matters:
  - likely useful for licensed beds dashboards and quick-download operational data

## D. CMS Public Data

### 15. CMS Data Available to Everyone

- Title: `Data Available to Everyone | CMS`
- URL: <https://www.cms.gov/data-research/cms-data/data-available-everyone>
- Type: `public dataset portal`
- Status in prototype: `active`
- Page modified: `July 22, 2025`
- Why it matters:
  - official entry point for CMS public data products
  - confirms `data.cms.gov` and `data.cms.gov/provider-data/` as official access points
- Notes:
  - Core source for future provider and facility enrichment

### 16. CMS Provider Data Catalog

- Title: `Provider Data Catalog | CMS`
- URL: <https://data.cms.gov/provider-data/>
- Type: `public dataset portal`
- Status in prototype: `active`
- Why it matters:
  - likely best source for Medicare provider directories and Care Compare-backed datasets
  - supports future enrichment for nursing homes and hospitals
- Notes:
  - Should be used with dataset-specific dictionaries and methodologies

### 17. CMS Nursing Home Data Dictionary

- Title: `Nursing Home Care Compare and Provider Data Catalog Data Dictionary`
- URL: <https://data.cms.gov/provider-data/sites/default/files/data_dictionaries/nursing_home/NH_Data_Dictionary.pdf>
- Type: `data dictionary`
- Status in prototype: `watchlist`
- Updated: `November 2025`
- Why it matters:
  - useful if nursing home capacity, staffing, or quality fields are added

### 18. CMS Provider Specific Data for Public Use

- Title: `Provider Specific Data for Public Use in Text Format | CMS`
- URL: <https://www.cms.gov/medicare/payment/prospective-payment-systems/provider-specific-data-public-use-text-format>
- Type: `public dataset`
- Status in prototype: `watchlist`
- Page modified: `March 10, 2026`
- Why it matters:
  - provides current provider-specific public use files for multiple provider types
- Notes:
  - More technical and reimbursement-oriented than the current UI needs, but potentially useful later

## E. Interpretation Notes

These sources currently support:

- narrowing organism scope
- designing response-posture logic
- distinguishing confidence from evidence
- planning future Florida data ingestion

These sources do **not** currently justify:

- claiming a validated transmission-risk model
- presenting coefficients as epidemiologically proven
- using the current UI output as a clinical prediction tool

## F. Maintenance Checklist

When updating this file:

1. Confirm the URL is still live and official.
2. Note whether the source is superseded, replaced, or still active.
3. Update dates when a page or PDF clearly publishes a revision date.
4. If the app logic changes because of a source, reference that change in commit history or architecture notes.
5. Remove stale sources only if they are replaced by something better; otherwise mark them `archived` or `superseded`.
