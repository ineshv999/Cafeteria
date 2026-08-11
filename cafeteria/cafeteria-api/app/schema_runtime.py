from sqlalchemy import inspect, text

import app.models  # noqa: F401 - registra todo el metadata.
from app.database import Base, engine


REQUIRED_RUNTIME_TABLES = {
    "pedido_operacion",
    "insumo",
    "compra",
    "detalle_compra",
    "movimiento_inventario",
    "gasto",
    "promocion",
    "detalle_pedido_promocion",
    "notificacion",
    "notificacion_lectura",
    "evento_auditoria",
    "preferencia_negocio",
}


def missing_runtime_tables(bind=engine) -> list[str]:
    existentes = set(inspect(bind).get_table_names())
    return sorted(REQUIRED_RUNTIME_TABLES - existentes)


def runtime_schema_drift(bind=engine) -> dict[str, list[str]]:
    inspector = inspect(bind)
    existentes = set(inspector.get_table_names())
    drift = {}
    for table_name in sorted(REQUIRED_RUNTIME_TABLES & existentes):
        expected = set(Base.metadata.tables[table_name].columns.keys())
        actual = {column["name"] for column in inspector.get_columns(table_name)}
        missing = sorted(expected - actual)
        if missing:
            drift[table_name] = missing
    return drift


def ensure_runtime_schema(bind=engine) -> None:
    """Crea extensiones operativas faltantes sin alterar las tablas heredadas."""
    Base.metadata.create_all(bind=bind, checkfirst=True)

    # Una instalación que alcanzó a crear pedido_operacion con la primera
    # migración puede no tener todavía las columnas añadidas posteriormente.
    if bind.dialect.name == "postgresql":
        with bind.begin() as connection:
            connection.execute(text(
                "ALTER TABLE pedido_operacion "
                "ADD COLUMN IF NOT EXISTS demora_reportada_en TIMESTAMPTZ"
            ))
            connection.execute(text(
                "ALTER TABLE pedido_operacion "
                "ADD COLUMN IF NOT EXISTS nota_cocina TEXT"
            ))
            connection.execute(text(
                "INSERT INTO pedido_operacion (id_pedido, creado_en) "
                "SELECT id_pedido, COALESCE(fecha, CURRENT_TIMESTAMP) FROM pedido "
                "ON CONFLICT (id_pedido) DO NOTHING"
            ))

    faltantes = missing_runtime_tables(bind)
    if faltantes:
        raise RuntimeError(
            "No se pudieron preparar las tablas operativas: "
            + ", ".join(faltantes)
        )
