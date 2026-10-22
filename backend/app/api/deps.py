import re
from typing import Annotated

from fastapi import Depends

from app.core.errors import NotFoundError

MAX_ID = 2_147_483_647
_ID_PATTERN = re.compile(r"[1-9][0-9]*")


def parse_path_id(id: str) -> int:
    if not _ID_PATTERN.fullmatch(id) or int(id) > MAX_ID:
        raise NotFoundError("Recurso não encontrado.")
    return int(id)


PathId = Annotated[int, Depends(parse_path_id)]
