import json
import shutil
from pathlib import Path
import click
from uuid import uuid4
from jsonschema import validate, ValidationError
from config.settings import settings
from db.client import raw_coll
from config.schema import json_schema  
import logging

logger = logging.getLogger(__name__)

with open(Path(__file__).parent.parent / "config" / "schema.json", "r") as fh:
    json_schema = json.load(fh)


def flatten(d, parent_key="", sep="."):
    """Convierte dict anidado a notación puntuada."""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)


def load_file(path: str) -> Path:
    src = Path(path)
    if src.suffix.lower() != ".json":
        raise click.ClickException("Formato no soportado: se requiere .json")

    size_mb = src.stat().st_size / (1024 * 1024)
    if size_mb > settings.MAX_SIZE_MB:
        raise click.ClickException(
            f"Tamaño {size_mb:.1f} MB > límite {settings.MAX_SIZE_MB} MB"
        )

    dest = settings.TEMP_DIR / src.name
    shutil.copy(src, dest)

    try:
        data = json.load(dest.open())
    except json.JSONDecodeError as e:
        dest.unlink(missing_ok=True)
        raise click.ClickException(f"JSON malformado: {e}")


    if isinstance(data, dict):
        data = [data]

    for i, doc in enumerate(data, start=1):
        try:
            validate(instance=doc, schema=json_schema)
        except ValidationError as ve:
            raise click.ClickException(
                f"Documento #{i} incumple el JSON Schema\n{ve.message}"
            ) from None

        flat = flatten(doc)
        missing = [field for field in settings.REQUIRED_FIELDS if field not in flat]
        if missing:
            raise click.ClickException(
                f"Documento #{i}: faltan campos obligatorios {missing}"
            )

    click.echo(f"Carga correcta: {len(data)} documentos → {dest}")
    logger.info("Archivo %s cargado con %d documentos", dest, len(data))
    return dest
