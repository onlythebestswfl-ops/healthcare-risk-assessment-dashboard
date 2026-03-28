import json
from pathlib import Path


EXPECTED_COUNTIES = [
    "Alachua", "Baker", "Bay", "Bradford", "Brevard", "Broward", "Calhoun",
    "Charlotte", "Citrus", "Clay", "Collier", "Columbia", "Desoto", "Dixie",
    "Duval", "Escambia", "Flagler", "Franklin", "Gadsden", "Gilchrist",
    "Glades", "Gulf", "Hamilton", "Hardee", "Hendry", "Hernando", "Highlands",
    "Hillsborough", "Holmes", "Indian River", "Jackson", "Jefferson",
    "Lafayette", "Lake", "Lee", "Leon", "Levy", "Liberty", "Madison",
    "Manatee", "Marion", "Martin", "Miami-Dade", "Monroe", "Nassau",
    "Okaloosa", "Okeechobee", "Orange", "Osceola", "Palm Beach", "Pasco",
    "Pinellas", "Polk", "Putnam", "Santa Rosa", "Sarasota", "Seminole",
    "St. Johns", "St. Lucie", "Sumter", "Suwannee", "Taylor", "Union",
    "Volusia", "Wakulla", "Walton", "Washington"
]

EXPECTED_FIELDS = [
    ("population", "resident_estimate"),
    ("population", "estimate_year"),
    ("population", "estimate_date"),
    ("acute_care_hospitals", "facility_count"),
    ("acute_care_hospitals", "licensed_beds"),
    ("nursing_homes", "facility_count"),
    ("nursing_homes", "licensed_beds"),
]


def main():
    data_path = Path(__file__).resolve().parents[1] / "data" / "florida_county_facility_context.json"
    payload = json.loads(data_path.read_text(encoding="utf-8"))
    counties = payload.get("counties", {})

    missing_counties = [county for county in EXPECTED_COUNTIES if county not in counties]
    extra_counties = [county for county in counties if county not in EXPECTED_COUNTIES]

    if missing_counties:
        raise SystemExit(f"Missing counties: {', '.join(missing_counties)}")

    if extra_counties:
        raise SystemExit(f"Unexpected counties: {', '.join(extra_counties)}")

    for county in EXPECTED_COUNTIES:
        county_record = counties[county]
        for section, field in EXPECTED_FIELDS:
            if section not in county_record:
                raise SystemExit(f"{county} missing section {section}")
            if field not in county_record[section]:
                raise SystemExit(f"{county} missing field {section}.{field}")
            value = county_record[section][field]
            if field == "estimate_date":
                if not isinstance(value, str) or len(value) != 10:
                    raise SystemExit(f"{county} has invalid field {section}.{field}: {value!r}")
                continue
            if not isinstance(value, int):
                raise SystemExit(f"{county} has non-integer field {section}.{field}: {value!r}")

    print("Validated Florida county facility context for all 67 counties.")


if __name__ == "__main__":
    main()
