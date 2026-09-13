"""In-memory seed data mirroring the frontend's src/data/*.ts mocks.

Swap this module for a real database (Postgres/SQLite) later without changing
the router contracts below.
"""

vessels = [
    {
        "id": "seabreeze", "name": "MV Seabreeze", "imo": "8765432", "mmsi": "538090123",
        "callSign": "V7AB3", "type": "Oil Tanker", "flag": "Marshall Islands", "flagEmoji": "🇲🇭",
        "risk": 96, "riskLevel": "high", "status": "Under Investigation",
        "length": 274, "breadth": 48, "lastSeen": "4 Sep 2026, 11:02 UTC",
        "x": 705, "y": 400, "heading": 210, "suspicious": True,
        "route": [{"x": 900, "y": 210}, {"x": 810, "y": 300}, {"x": 745, "y": 365}, {"x": 705, "y": 400}],
    },
    {
        "id": "coral-dawn", "name": "MT Coral Dawn", "imo": "9182736", "mmsi": "412456789",
        "callSign": "V9CD4", "type": "Chemical Tanker", "flag": "Panama", "flagEmoji": "🇵🇦",
        "risk": 78, "riskLevel": "high", "status": "Under Investigation",
        "length": 228, "breadth": 42, "lastSeen": "4 Sep 2026, 10:40 UTC",
        "x": 615, "y": 470, "heading": 45, "suspicious": False,
        "route": [{"x": 500, "y": 560}, {"x": 560, "y": 515}, {"x": 615, "y": 470}],
    },
    {
        "id": "ocean-star", "name": "MV Ocean Star", "imo": "9234567", "mmsi": "477009812",
        "callSign": "V4OS1", "type": "Bulk Carrier", "flag": "Liberia", "flagEmoji": "🇱🇷",
        "risk": 62, "riskLevel": "medium", "status": "Monitored",
        "length": 190, "breadth": 32, "lastSeen": "4 Sep 2026, 10:55 UTC",
        "x": 830, "y": 165, "heading": 300, "suspicious": False,
        "route": [{"x": 950, "y": 90}, {"x": 890, "y": 125}, {"x": 830, "y": 165}],
    },
    {
        "id": "eastern-wind", "name": "MV Eastern Wind", "imo": "9345612", "mmsi": "563099211",
        "callSign": "V5EW7", "type": "Container Ship", "flag": "Singapore", "flagEmoji": "🇸🇬",
        "risk": 41, "riskLevel": "medium", "status": "Monitored",
        "length": 205, "breadth": 30, "lastSeen": "4 Sep 2026, 09:58 UTC",
        "x": 300, "y": 205, "heading": 160, "suspicious": False,
        "route": [{"x": 250, "y": 120}, {"x": 280, "y": 165}, {"x": 300, "y": 205}],
    },
    {
        "id": "sea-voyager", "name": "MT Sea Voyager", "imo": "9654321", "mmsi": "601233456",
        "callSign": "V2SV9", "type": "Oil Tanker", "flag": "Malta", "flagEmoji": "🇲🇹",
        "risk": 28, "riskLevel": "low", "status": "Cleared",
        "length": 250, "breadth": 44, "lastSeen": "4 Sep 2026, 08:30 UTC",
        "x": 175, "y": 480, "heading": 90, "suspicious": False,
        "route": [{"x": 110, "y": 500}, {"x": 145, "y": 490}, {"x": 175, "y": 480}],
    },
    {
        "id": "horizon", "name": "MV Horizon", "imo": "9345678", "mmsi": "412009876",
        "callSign": "V3HZ2", "type": "Bulk Carrier", "flag": "Panama", "flagEmoji": "🇵🇦",
        "risk": 18, "riskLevel": "low", "status": "Cleared",
        "length": 180, "breadth": 28, "lastSeen": "4 Sep 2026, 10:12 UTC",
        "x": 560, "y": 545, "heading": 260, "suspicious": False,
        "route": [{"x": 650, "y": 560}, {"x": 600, "y": 552}, {"x": 560, "y": 545}],
    },
    {
        "id": "bluewave", "name": "MT Bluewave", "imo": "9123456", "mmsi": "538077654",
        "callSign": "V6BW5", "type": "Oil Tanker", "flag": "Marshall Islands", "flagEmoji": "🇲🇭",
        "risk": 12, "riskLevel": "low", "status": "Cleared",
        "length": 260, "breadth": 46, "lastSeen": "4 Sep 2026, 09:15 UTC",
        "x": 850, "y": 530, "heading": 130, "suspicious": False,
        "route": [{"x": 900, "y": 470}, {"x": 875, "y": 500}, {"x": 850, "y": 530}],
    },
]

incidents = [
    {
        "id": "inc-1", "title": "Oil Spill — Bay of Bengal", "vessel": "MV Seabreeze",
        "status": "Active", "severity": "high", "reported": "4 Sep 2026, 10:24 UTC", "area": "12.4 km²",
    },
    {
        "id": "inc-2", "title": "Unregistered AIS gap", "vessel": "MT Coral Dawn",
        "status": "Investigating", "severity": "medium", "reported": "4 Sep 2026, 06:12 UTC", "area": "—",
    },
    {
        "id": "inc-3", "title": "Route deviation flagged", "vessel": "MV Eastern Wind",
        "status": "Resolved", "severity": "low", "reported": "3 Sep 2026, 21:40 UTC", "area": "—",
    },
]

oil_spill_incident = {
    "id": "spill-001", "title": "Oil Spill Detected", "area": 12.4, "confidence": 96,
    "detected": "4 Sep 2026, 10:24 UTC", "severity": "high",
    "center": {"x": 655, "y": 350},
    "polygon": [
        {"x": 590, "y": 300}, {"x": 630, "y": 285}, {"x": 670, "y": 295}, {"x": 705, "y": 285},
        {"x": 735, "y": 310}, {"x": 730, "y": 345}, {"x": 745, "y": 375}, {"x": 715, "y": 400},
        {"x": 675, "y": 410}, {"x": 635, "y": 400}, {"x": 600, "y": 415}, {"x": 570, "y": 390},
        {"x": 565, "y": 355}, {"x": 580, "y": 325},
    ],
}

notifications = [
    {"id": "n1", "severity": "critical", "title": "Oil spill detected", "detail": "MV Seabreeze flagged as high risk", "time": "6 min ago", "read": False},
    {"id": "n2", "severity": "info", "title": "Spill analysis completed", "detail": "SAR image processed", "time": "22 min ago", "read": False},
    {"id": "n3", "severity": "success", "title": "Vessel route updated", "detail": "MV Ocean Star entered monitored zone", "time": "1 hr ago", "read": True},
]

kpi = [
    {"id": "vessels-tracked", "label": "Vessels Tracked", "value": "1,240", "delta": "+12%", "deltaDirection": "up", "accent": "cyan", "icon": "ship"},
    {"id": "active-incidents", "label": "Active Incidents", "value": "3", "delta": "+0", "deltaDirection": "flat", "accent": "magenta", "icon": "flame"},
    {"id": "spill-area", "label": "Total Oil Spill Area", "value": "12.4 km²", "delta": "+28%", "deltaDirection": "up", "accent": "purple", "icon": "waves"},
    {"id": "detection-accuracy", "label": "AI Detection Accuracy", "value": "98.7%", "accent": "cyan", "icon": "cpu"},
]
