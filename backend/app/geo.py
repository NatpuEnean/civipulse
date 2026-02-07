import requests

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

def detect_nearby_places(lat: float, lon: float):
    query = f"""
    [out:json];
    (
      node(around:500,{lat},{lon})["amenity"="school"];
      node(around:500,{lat},{lon})["amenity"="hospital"];
      node(around:500,{lat},{lon})["building"="residential"];
    );
    out;
    """

    try:
        res = requests.post(
            OVERPASS_URL,
            data=query,
            timeout=10
        )

        if res.status_code != 200 or not res.text.strip():
            return default_area()

        data = res.json()
        elements = data.get("elements", [])

        return {
            "schools": sum(1 for e in elements if e.get("tags", {}).get("amenity") == "school"),
            "hospitals": sum(1 for e in elements if e.get("tags", {}).get("amenity") == "hospital"),
            "residential": sum(1 for e in elements if e.get("tags", {}).get("building") == "residential")
        }

    except Exception:
        return default_area()

def default_area():
    return {
        "schools": 0,
        "hospitals": 0,
        "residential": 1
    }
