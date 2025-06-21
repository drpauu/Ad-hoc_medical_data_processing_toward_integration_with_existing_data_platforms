import json
import time
import logging
from uuid import uuid4
from datetime import datetime
from typing import Any
import click
from pymongo import UpdateOne
from pymongo.errors import BulkWriteError
from config.settings import settings
from db.client import raw_coll

logger = logging.getLogger(__name__)


def cast_numeric(val: Any) -> Any:
    try:
        return int(val)
    except (ValueError, TypeError):
        try:
            return float(val)
        except (ValueError, TypeError):
            return val


def transform_row(doc: dict) -> dict:
    """Normaliza tipos y rellena valores faltantes."""

    if "tid" not in doc["test"]:
        doc["test"]["tid"] = uuid4().hex


    date_str = doc["test"].get("date")
    if date_str and isinstance(date_str, str):
        try:
            doc["test"]["date"] = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except ValueError:
            pass  


    numeric_paths = [
        ("initial", "spo"), ("initial", "hr"), ("initial", "d"), ("initial", "f"),
        ("final", "meters"), ("final", "d"), ("final", "f"),
        ("final", "half_rest_spo"), ("final", "half_rest_hr"),
        ("final", "end_rest_spo"), ("final", "end_rest_hr"),
        ("test", "cone_distance"), ("test", "weight"),
        ("test", "height"), ("test", "age"), ("test", "o2")
    ]
    for parent, key in numeric_paths:
        section = doc.get(parent, {})
        if key in section:
            section[key] = cast_numeric(section[key])


    for arrkey, numeric_fields in [
        ("data", ["t", "s", "h", "p"]),
        ("pascon", ["t", "s", "h", "n"]),
        ("stops", ["time", "len"]),
    ]:
        for item in doc.get(arrkey, []):
            for f in numeric_fields:
                if f in item:
                    item[f] = cast_numeric(item[f])

    return doc


def run_etl(path: str):
    records = json.load(open(path))
    if isinstance(records, dict):
        records = [records]

    start = time.perf_counter()
    ops, report = [], {"inserted": 0, "modified": 0, "errors": 0}

    for raw in records:
        try:
            clean = transform_row(raw)
            ops.append(
                UpdateOne(
                    {"test.tid": clean["test"]["tid"]},
                    {"$set": clean},
                    upsert=True,
                )
            )
            if len(ops) >= settings.BATCH_SIZE:
                res = raw_coll.bulk_write(ops, ordered=False)
                report["inserted"]  += res.upserted_count
                report["modified"] += res.modified_count
                ops.clear()
        except Exception as exc:
            logger.error("Error al transformar registro: %s", exc, exc_info=True)
            report["errors"] += 1


    if ops:
        res = raw_coll.bulk_write(ops, ordered=False)
        report["inserted"]  += res.upserted_count
        report["modified"] += res.modified_count

    elapsed = time.perf_counter() - start
    click.echo(f"Insertados nuevos:   {report['inserted']}")
    click.echo(f"Actualizados (set):  {report['modified']}")
    click.echo(f"Errores al procesar: {report['errors']}")
    click.echo(f"Tiempo total:        {elapsed:.2f} s")
    logger.info("ETL completada – %s", report)

    if report["errors"]:
        raise click.ClickException("Finalizado con errores; revise los logs.")
