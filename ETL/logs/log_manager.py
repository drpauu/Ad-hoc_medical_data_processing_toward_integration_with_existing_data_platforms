from pathlib import Path
import click
import logging
import datetime as dt

LOG_DIR = Path("logs_storage")
LOG_DIR.mkdir(exist_ok=True)


logging.basicConfig(
    filename=LOG_DIR / "etl_cli.log",
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    encoding="utf-8",
)

def save_run_log(report: dict):
    ts = dt.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    path = LOG_DIR / f"{ts}.log"
    path.write_text(json.dumps(report, indent=2))
    return ts

def list_logs():
    return sorted(p.name for p in LOG_DIR.glob("*.log"))

def show_logs(job_id: str | None):
    if job_id:
        file = LOG_DIR / f"{job_id}.log"
        if not file.exists():
            raise click.ClickException("Ejecución no encontrada.")
        click.echo_via_pager(file.read_text())
    else:
        for name in list_logs():
            click.echo(name)
