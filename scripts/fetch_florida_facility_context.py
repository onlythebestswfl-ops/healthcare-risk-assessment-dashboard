import json
import re
import urllib.parse
import urllib.request
import http.cookiejar
import io
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree as ET


SEARCH_URL = "https://quality.healthfinder.fl.gov/Facility-Search/FacilityLocateSearch"
HANDLER_URL = SEARCH_URL + "?handler=AdvancedSearch"
POPULATION_URL = "https://www2.census.gov/programs-surveys/popest/tables/2020-2025/counties/totals/co-est2025-pop-12.xlsx"
POPULATION_ESTIMATE_YEAR = 2025
POPULATION_ESTIMATE_DATE = "2025-07-01"

FACILITY_TYPES = {
    "acute_care_hospitals": "Hospital",
    "nursing_homes": "Nursing-Home",
}

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


def get_opener():
    cookie_jar = http.cookiejar.CookieJar()
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))


def fetch_text(opener, url, data=None):
    if data is None:
        with opener.open(url) as response:
            return response.read().decode("utf-8", errors="ignore")

    body = urllib.parse.urlencode(data).encode()
    request = urllib.request.Request(url, data=body, method="POST")
    with opener.open(request) as response:
        return response.read().decode("utf-8", errors="ignore")


def extract_token_and_counties(html):
    token_match = re.search(
        r'name="__RequestVerificationToken"[^>]*value="([^"]+)"',
        html,
        re.IGNORECASE,
    )
    if not token_match:
        raise RuntimeError("Could not find request verification token.")

    county_select_match = re.search(
        r'<select[^>]*id="county-filter"[^>]*>(.*?)</select>',
        html,
        re.IGNORECASE | re.DOTALL,
    )
    if not county_select_match:
        raise RuntimeError("Could not find county selector.")

    counties = []
    for value, title in re.findall(
        r'<option value="([^"]*)">([^<]+)</option>',
        county_select_match.group(1),
        re.IGNORECASE,
    ):
        name = title.strip()
        if value and name != "All":
            counties.append({"name": name, "value": value})

    return token_match.group(1), counties


def build_payload(token, county_value, facility_type):
    return {
        "FacilityTypeSelection": facility_type,
        "OpenClosed_LicenseStatus": "",
        "facilityName": "",
        "address": "",
        "city": "",
        "zip": "",
        "countySelection": county_value,
        "filenumber": "",
        "licensenumber": "",
        "AffiliatedWith": "",
        "BakerAct_validate": "",
        "UrgentCare_validate": "",
        "CRH_validate": "",
        "__RequestVerificationToken": token,
    }


def extract_counts(response_html):
    file_numbers = re.findall(r'"FileNumber":"([^"]+)"', response_html)
    bed_counts = [int(value) for value in re.findall(r'"BedCount":"(\d+)"', response_html)]
    return {
        "facility_count": len(file_numbers),
        "licensed_beds": sum(bed_counts),
    }


def normalize_population_county_name(raw_name):
    name = raw_name.strip().lstrip(".")
    name = re.sub(r" County, Florida$", "", name)
    name = re.sub(r"^DeSoto$", "Desoto", name)
    return name


def parse_shared_strings(zip_file):
    namespace = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    root = ET.fromstring(zip_file.read("xl/sharedStrings.xml"))
    shared = []
    for item in root.findall("x:si", namespace):
        parts = [node.text or "" for node in item.iterfind(".//x:t", namespace)]
        shared.append("".join(parts))
    return shared


def parse_population_estimates():
    namespace = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    workbook_bytes = urllib.request.urlopen(POPULATION_URL).read()
    populations = {}

    with zipfile.ZipFile(io.BytesIO(workbook_bytes)) as zip_file:
        shared_strings = parse_shared_strings(zip_file)
        sheet_root = ET.fromstring(zip_file.read("xl/worksheets/sheet1.xml"))

        for row in sheet_root.findall("x:sheetData/x:row", namespace):
            row_number = int(row.attrib["r"])
            if row_number < 6:
                continue

            cells = {}
            for cell in row.findall("x:c", namespace):
                cell_ref = cell.attrib.get("r", "")
                cell_type = cell.attrib.get("t")
                value = cell.find("x:v", namespace)
                if value is None:
                    text = ""
                elif cell_type == "s":
                    text = shared_strings[int(value.text)]
                else:
                    text = value.text or ""
                cells[cell_ref[:1]] = text

            geography = cells.get("A", "")
            if not geography.startswith("."):
                continue

            county_name = normalize_population_county_name(geography)
            if not county_name:
                continue

            populations[county_name] = {
                "resident_estimate": int(cells["H"]),
                "estimate_year": POPULATION_ESTIMATE_YEAR,
                "estimate_date": POPULATION_ESTIMATE_DATE,
            }

    missing = [county for county in EXPECTED_COUNTIES if county not in populations]
    extra = [county for county in populations if county not in EXPECTED_COUNTIES]
    if missing:
        raise RuntimeError(f"Population source missing counties: {', '.join(missing)}")
    if extra:
        raise RuntimeError(f"Population source returned unexpected counties: {', '.join(extra)}")

    return populations


def main():
    opener = get_opener()
    search_html = fetch_text(opener, SEARCH_URL)
    token, counties = extract_token_and_counties(search_html)
    population_estimates = parse_population_estimates()

    county_context = {}
    for county in counties:
        county_name = county["name"]
        county_context[county_name] = {
            "population": population_estimates[county_name],
        }
        for key, facility_type in FACILITY_TYPES.items():
            response_html = fetch_text(
                opener,
                HANDLER_URL,
                build_payload(token, county["value"], facility_type),
            )
            county_context[county_name][key] = extract_counts(response_html)

    payload = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "source": {
            "name": "FloridaHealthFinder Facility Search",
            "url": SEARCH_URL,
            "handler": HANDLER_URL,
            "notes": [
                "Counts generated from official county-filtered advanced search responses.",
                "Acute care context currently uses FacilityType=Hospital.",
                "Long-term care context currently uses FacilityType=Nursing-Home.",
            ],
        },
        "population_source": {
            "name": "U.S. Census Bureau County Population Totals: 2020-2025",
            "url": "https://www.census.gov/data/tables/time-series/demo/popest/2020s-counties-total.html",
            "dataset": POPULATION_URL,
            "notes": [
                "Population values come from the Florida county file for Vintage 2025.",
                "The county-level resident estimate used in the app is the July 1, 2025 estimate.",
            ],
        },
        "counties": county_context,
    }

    output_path = Path(__file__).resolve().parents[1] / "data" / "florida_county_facility_context.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(output_path)


if __name__ == "__main__":
    main()
