from typing import Optional
import math


COCHABAMBA_BOUNDS = {
    "min_lat": -17.50,
    "max_lat": -17.30,
    "min_lng": -66.35,
    "max_lng": -66.05,
}

KNOWN_LOCATIONS = {
    "plaza 14 de septiembre": {"lat": -17.3895, "lng": -66.1568},
    "plaza principal": {"lat": -17.3895, "lng": -66.1568},
    "centro": {"lat": -17.3895, "lng": -66.1568},
    "terminal": {"lat": -17.3942, "lng": -66.1570},
    "terminal de buses": {"lat": -17.3942, "lng": -66.1570},
    "quillacollo": {"lat": -17.3850, "lng": -66.2800},
    "cala cala": {"lat": -17.3750, "lng": -66.1780},
    "umss": {"lat": -17.3940, "lng": -66.1470},
    "universidad": {"lat": -17.3940, "lng": -66.1470},
    "cancha": {"lat": -17.3970, "lng": -66.1600},
    "la cancha": {"lat": -17.3970, "lng": -66.1600},
    "mayorazgo": {"lat": -17.4100, "lng": -66.1400},
    "colcapirhua": {"lat": -17.3720, "lng": -66.2600},
    "sacaba": {"lat": -17.3980, "lng": -66.0500},
    "ticti": {"lat": -17.3600, "lng": -66.1680},
    "ticti norte": {"lat": -17.3600, "lng": -66.1680},
}


def geocode_location(name: str) -> Optional[dict]:
    """Geocodifica un nombre de lugar conocido en Cochabamba."""
    normalized = name.lower().strip()
    if normalized in KNOWN_LOCATIONS:
        return KNOWN_LOCATIONS[normalized]
    # búsqueda parcial
    for key, coords in KNOWN_LOCATIONS.items():
        if normalized in key or key in normalized:
            return coords
    return None


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calcula distancia en km entre dos coordenadas."""
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def estimate_travel_time(distance_km: float, speed_kmh: float = 25.0) -> int:
    """Estima tiempo de viaje en minutos dado distancia y velocidad promedio."""
    return max(5, int((distance_km / speed_kmh) * 60))


def find_best_route(routes: list, origin: str, destination: str) -> Optional[dict]:
    """
    Encuentra la mejor ruta entre origen y destino basándose en coordenadas.
    Devuelve la ruta con puntuación más alta.
    """
    origin_coords = geocode_location(origin)
    dest_coords = geocode_location(destination)

    if not origin_coords or not dest_coords:
        return None

    best_route = None
    best_score = float("inf")

    for route in routes:
        coords = route.get("coordinates", [])
        if not coords:
            continue

        start = coords[0]
        end = coords[-1]

        d_origin = haversine_distance(
            origin_coords["lat"], origin_coords["lng"],
            start["lat"], start["lng"]
        )
        d_dest = haversine_distance(
            dest_coords["lat"], dest_coords["lng"],
            end["lat"], end["lng"]
        )

        score = d_origin + d_dest
        if score < best_score:
            best_score = score
            best_route = route

    return best_route


def is_within_cochabamba(lat: float, lng: float) -> bool:
    """Verifica si una coordenada está dentro de los límites de Cochabamba."""
    b = COCHABAMBA_BOUNDS
    return b["min_lat"] <= lat <= b["max_lat"] and b["min_lng"] <= lng <= b["max_lng"]
