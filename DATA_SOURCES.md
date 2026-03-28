# Data Sources

Quick-capture list of data-bearing sources that may feed the Florida Targeted MDRO Risk Support prototype.

This file is intentionally lightweight for now. It is a staging area for likely inputs, not a finalized ingestion architecture.

Reviewed March 27-28, 2026.

## Active Candidates

### Florida / AHCA

- AHCA Office of Data Dissemination and Transparency
  - <https://ahca.myflorida.com/agency-administration/florida-center-for-health-information-and-transparency/office-of-data-dissemination-and-transparency>
  - Use case: hospital, emergency department, and related Florida facility/public data access

- Florida Licensed Hospitals
  - <https://ahca.myflorida.com/content/download/24546/file/Florida_Licensed_Hospitals.pdf>
  - Use case: statewide hospital inventory and bed-count context

- AHCA Frequently Requested Data
  - <https://ahca.myflorida.com/health-quality-assurance/bureau-of-central-services/frequently-requested-data>
  - Use case: possible quick-download operational datasets

### Florida DOH

- Florida Bureau of Public Health Laboratories: Candida auris ID
  - <https://www.floridahealth.gov/community-environmental-public-health/public-health-laboratories/testing/mycology/candida-auris-id/>
  - Use case: confirmatory lab pathway and readiness assumptions

- Florida NHSN overview
  - <https://www.floridahealth.gov/statistics-data/population-surveillance/health-care-associated-infections/national-healthcare-safety-network/>
  - Use case: surveillance/reporting context

### CMS

- CMS Data Available to Everyone
  - <https://www.cms.gov/data-research/cms-data/data-available-everyone>
  - Use case: official public-data entry point

- CMS Provider Data Catalog
  - <https://data.cms.gov/provider-data/>
  - Use case: provider/facility enrichment for hospitals and nursing homes

- CMS Nursing Home Data Dictionary
  - <https://data.cms.gov/provider-data/sites/default/files/data_dictionaries/nursing_home/NH_Data_Dictionary.pdf>
  - Use case: field mapping if nursing home inputs are added

- CMS Provider Specific Data for Public Use
  - <https://www.cms.gov/medicare/payment/prospective-payment-systems/provider-specific-data-public-use-text-format>
  - Use case: provider-level public-use files if needed later

## Guidance-Adjacent but Not Direct Data Feeds

- Florida Candida auris Infection Prevention and Control Toolkit
  - <https://www.floridahealth.gov/diseases-and-conditions/health-care-associated-infections/_documents/candida-auris-toolkit.pdf>
  - Use case: operational logic, not structured ingestion

- Florida Candida auris Statewide Action Plan
  - <https://www.floridahealth.gov/diseases-and-conditions/health-care-associated-infections/_documents/florida-candida-auris-plan.pdf>
  - Use case: roadmap and state response framing, not structured ingestion

- CDC MDRO prevention strategies
  - <https://www.cdc.gov/healthcare-associated-infections/php/preventing-mdros/mdro-prevention-strategies.html>
  - Use case: scope and control logic, not structured ingestion

- CDC containment strategy for targeted MDROs
  - <https://www.cdc.gov/healthcare-associated-infections/php/preventing-mdros/mdro-containment-strategy.html>
  - Use case: containment workflow logic, not structured ingestion

## Notes

- If a source starts influencing scoring or UI logic, it should also be listed in `REFERENCES.md`.
- If a source becomes part of a real ingestion flow, we can later add fields like:
  - access method
  - refresh cadence
  - normalization status
  - county coverage
  - license/usage notes
