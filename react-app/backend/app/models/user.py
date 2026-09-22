from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    String,
    text,
)
from sqlalchemy import Integer
from sqlalchemy.orm import relationship
from app.core.database import Base
class User(Base):
    __tablename__ = "usuarios"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True,
    )

    nombre = Column(
        String(50),
        nullable=False,
    )

    apellido = Column(
        String(50),
        nullable=False,
    )

    tipo_documento = Column(
        String(20),
        nullable=False,
    )

    numero_documento = Column(
        String(20),
        unique=True,
        nullable=False,
    )

    direccion = Column(
        String(120),
        nullable=False,
    )

    telefono = Column(
        String(20),
        nullable=False,
    )

    email = Column(
        String(120),
        unique=True,
        nullable=False,
        index=True,
    )

    password = Column(
        String(255),
        nullable=False,
    )

    rol_id = Column(
        Integer,
        ForeignKey("roles.id"),
        nullable=False,
    )

    estado = Column(
        Enum(
            "activo",
            "inactivo",
            native_enum=False,
            length=10,
        ),
        default="activo",
        nullable=False,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    rol = relationship(
        "Role",
        back_populates="usuarios",
    )

    ventas_como_cliente = relationship(
        "Sale",
        foreign_keys="Sale.cliente_id",
        back_populates="cliente",
    )
    ventas_registradas = relationship(
        "Sale",
        foreign_keys="Sale.usuario_id",
        back_populates="usuario",
    )
    pagos = relationship("Payment", back_populates="usuario")
    facturas = relationship("Invoice", back_populates="cliente")
    pqr = relationship("PQR", foreign_keys="PQR.cliente_id", back_populates="cliente")
    pqr_asignadas = relationship("PQR", foreign_keys="PQR.asignado_a", back_populates="asignado")
    conversaciones = relationship("Conversation", back_populates="usuario")
    mensajes = relationship("Message", back_populates="usuario")
    reportes_generados = relationship("GeneratedReport", back_populates="usuario")
