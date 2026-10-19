from datetime import timedelta, timezone

API_PREFIX = "/api/v1"

def location_of(resource: str, resource_id: int) -> str:
    return f"{API_PREFIX}/{resource}/{resource_id}"

BRT = timezone(timedelta(hours=-3))