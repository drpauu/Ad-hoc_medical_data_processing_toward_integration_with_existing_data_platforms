import sys
import click
from ingestion.loader import load_file
from preview.preview import preview_file
from pipeline.etl import run_etl
from logs.log_manager import show_logs

@click.group()
def cli():
    """CLI de ingesta y ETL para datos 6-MWT (MongoDB Atlas)."""

@cli.command(help="CU 1: Cargar JSON y validar sintaxis/esquema")
@click.argument("src_path", type=click.Path(exists=True, dir_okay=False))
def load(src_path):
    load_file(src_path)

@cli.command(help="CU 2: Previsualizar 100 filas y validar campos")
@click.argument("tmp_path", type=click.Path(exists=True, dir_okay=False))
def preview(tmp_path):
    preview_file(tmp_path)

@cli.command(help="CU 3: Ejecutar pipeline ETL (upsert)")
@click.argument("tmp_path", type=click.Path(exists=True, dir_okay=False))
def execute(tmp_path):
    run_etl(tmp_path)

@cli.command(help="CU 4: Listar o visualizar logs")
@click.option("--job-id", help="Nombre del archivo .log a mostrar")
def logs(job_id):
    show_logs(job_id)

if __name__ == "__main__":
    try:
        cli()
    except click.ClickException as ce:
        click.secho(f"[ERROR] {ce}", fg="red", err=True)
        sys.exit(1)
