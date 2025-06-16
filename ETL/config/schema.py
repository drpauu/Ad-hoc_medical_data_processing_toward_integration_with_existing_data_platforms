"""Carga el JSON Schema y lo expone como variable de módulo."""

from pathlib import Path
import json

# Ruta al archivo schema.json situado en el mismo directorio
_schema_path = Path(__file__).with_suffix(".json")

with _schema_path.open("r") as fh:
    json_schema = json.load(fh)
