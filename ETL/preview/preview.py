import json
import click
from collections import defaultdict
from pathlib import Path
from config.settings import settings

def flatten(d, parent_key="", sep="."):
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            yield from flatten(v, new_key, sep=sep)
        else:
            yield new_key, v

def preview_file(path: str):
    path = Path(path)
    data = json.load(path.open())
    if isinstance(data, dict):
        data = [data]

    sample = data[:100]
    schema = defaultdict(set)
    for doc in sample:
        for k, v in flatten(doc):
            schema[k].add(type(v).__name__)

    click.echo(f"{'Campo':40} {'Tipos':30} Ejemplo/valor")
    click.echo("-" * 90)
    for k, typ in sorted(schema.items()):
        example = next(v for _k, v in flatten(sample[0]) if _k == k)
        click.echo(f"{k:40} {','.join(typ):30} {example!r}")


    missing = [f for f in settings.REQUIRED_FIELDS if f not in schema]
    if missing:
        click.secho(f"\n⚠ Campos obligatorios ausentes: {missing}", fg="red")
        raise click.ClickException("La previsualización ha detectado omisiones.")

    click.secho("\nPrevisualización OK – esquema completo.", fg="green")
