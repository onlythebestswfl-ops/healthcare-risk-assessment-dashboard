import json
import re
import urllib.parse
import urllib.request
import http.cookiejar
from datetime import datetime, timezone
from pathlib import Path


SEARCH_URL = "https://quality.healthfinder.fl.gov/Facility-Search/FacilityLocateSearch"
HANDLER_URL = SEARCH_URL + "?handler=AdvancedSearch"

FACILITY_TYPES = {
    "acute_care_hospitals": "Hospital",
    "nursing_homes": "Nursing-Home",
}


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


def main():
    opener = get_opener()
    search_html = fetch_text(opener, SEARCH_URL)
    token, counties = extract_token_and_counties(search_html)

    county_context = {}
    for county in counties:
        county_context[county["name"]] = {}
        for key, facility_type in FACILITY_TYPES.items():
            response_html = fetch_text(
                opener,
                HANDLER_URL,
                build_payload(token, county["value"], facility_type),
            )
            county_context[county["name"]][key] = extract_counts(response_html)

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
        "counties": county_context,
    }

    output_path = Path(__file__).resolve().parents[1] / "data" / "florida_county_facility_context.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(output_path)


if __name__ == "__main__":
    main()
