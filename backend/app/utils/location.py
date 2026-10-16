API_PREFIX = "/api/v1"

def location_of(resource: str, resource_id: int) -> str:
    return f"{API_PREFIX}/{resource}/{resource_id}"