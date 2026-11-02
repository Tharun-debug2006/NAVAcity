"""SIMULATED holidays and special events for the fictional city of NavaCity.

These are invented for the simulation.  The dates follow a plausible
January-June pattern (a few civic holidays plus a weekend festival), but
they do not describe any real city calendar.
"""

from __future__ import annotations

from datetime import date

# --------------------------------------------------------------------------
# Public holidays (SIMULATED)
# --------------------------------------------------------------------------
HOLIDAYS: dict[date, str] = {
    date(2025, 1, 1): "Founders' Day",
    date(2025, 1, 26): "Civic Day",
    date(2025, 3, 14): "Spring Festival",
    date(2025, 4, 14): "Heritage Day",
    date(2025, 5, 1): "Workers' Day",
    date(2025, 6, 26): "Harvest Festival",
}

# --------------------------------------------------------------------------
# Special events (SIMULATED).
#
# ``places``  - stations / stops whose surrounding demand is boosted
# ``routes``  - transit lines and bus routes that are directly affected
# ``attraction`` - multiplier applied to the demand of the affected places
# ``hour_span`` - hours (inclusive) during which the event is active
# --------------------------------------------------------------------------
SPECIAL_EVENTS: list[dict] = [
    {
        "id": "EV-001",
        "name": "NavaCity Derby Final",
        "venue": "NavaCity Arena",
        "date": date(2025, 2, 23),
        "hour_start": 15,
        "hour_end": 22,
        "places": ["Hillcrest", "Heritage Gate"],
        "routes": ["M2", "B02"],
        "attraction": 1.55,
    },
    {
        "id": "EV-002",
        "name": "Civic Park Music Festival",
        "venue": "Garden Station",
        "date": date(2025, 3, 15),
        "hour_start": 16,
        "hour_end": 23,
        "places": ["Garden Station", "Government Plaza", "Heritage Square"],
        "routes": ["M2", "B07"],
        "attraction": 1.48,
    },
    {
        "id": "EV-003",
        "name": "East Tech Expo",
        "venue": "Tech Park",
        "date": date(2025, 4, 11),
        "hour_start": 9,
        "hour_end": 18,
        "places": ["Tech Park", "Civic Center", "Civic Park", "Innovator Park"],
        "routes": ["M1", "B03"],
        "attraction": 1.40,
    },
    {
        "id": "EV-004",
        "name": "University Spring Fest",
        "venue": "West Circle",
        "date": date(2025, 4, 25),
        "hour_start": 10,
        "hour_end": 20,
        "places": ["West Circle", "North Terminal", "Central Market"],
        "routes": ["M4", "B08", "B10"],
        "attraction": 1.35,
    },
    {
        "id": "EV-005",
        "name": "Harbour Lights Festival",
        "venue": "Rivergate",
        "date": date(2025, 5, 24),
        "hour_start": 17,
        "hour_end": 23,
        "places": ["Rivergate", "Market Station", "Heritage Square"],
        "routes": ["M2", "B02", "B07"],
        "attraction": 1.44,
    },
    {
        "id": "EV-006",
        "name": "NavaCity Marathon",
        "venue": "Central Exchange",
        "date": date(2025, 6, 15),
        "hour_start": 5,
        "hour_end": 12,
        "places": ["Central Exchange", "Central Market", "Grand Central"],
        "routes": ["M1", "M2", "M3", "M4", "M5", "M6"],
        "attraction": 1.30,
    },
    {
        "id": "EV-007",
        "name": "Lakeview Food Festival",
        "venue": "Lakeview",
        "date": date(2025, 6, 8),
        "hour_start": 11,
        "hour_end": 21,
        "places": ["Lakeview", "Millbridge", "Evergreen Park"],
        "routes": ["M6", "B01", "B04", "B09", "B11", "B17"],
        "attraction": 1.32,
    },
    {
        "id": "EV-008",
        "name": "Central Market Weekend",
        "venue": "Central Market",
        "date": date(2025, 5, 17),
        "hour_start": 10,
        "hour_end": 21,
        "places": ["Central Market", "Central Depot", "Government Plaza"],
        "routes": ["M4", "B07", "B10", "B14", "B18"],
        "attraction": 1.38,
    },
    {
        "id": "EV-009",
        "name": "Northpoint Tech Convention",
        "venue": "Innovator Park",
        "date": date(2025, 4, 18),
        "hour_start": 9,
        "hour_end": 19,
        "places": [
            "Innovator Park", "East Gate", "Brookside",
            "Transit Hub", "Northpoint",
        ],
        "routes": ["B03", "B13", "B17"],
        "attraction": 1.36,
    },
    {
        "id": "EV-010",
        "name": "NavaCity International Expo",
        "venue": "NavaCity Intl Airport",
        "date": date(2025, 3, 21),
        "hour_start": 8,
        "hour_end": 20,
        "places": [
            "NavaCity Intl Airport", "Airport North", "Aviation Park",
        ],
        "routes": ["M6", "B01", "B04", "B11", "B17"],
        "attraction": 1.42,
    },
]


def events_by_date() -> dict[date, list[dict]]:
    """Index the special events by calendar date."""
    index: dict[date, list[dict]] = {}
    for event in SPECIAL_EVENTS:
        index.setdefault(event["date"], []).append(event)
    return index


def holiday_name(day: date) -> str | None:
    """Return the holiday name for a date, or None if it is a working day."""
    return HOLIDAYS.get(day)
