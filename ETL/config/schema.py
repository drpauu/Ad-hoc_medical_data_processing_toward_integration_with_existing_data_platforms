
from pathlib import Path
import json


_schema_path = Path(__file__).with_suffix(".json")

with _schema_path.open("r") as fh:
    json_schema = json.load(fh)
