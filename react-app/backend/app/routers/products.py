from pathlib import Path
import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db

from app.dependencies.auth import (
    require_roles,
)

from app.models.category import Category
from app.models.product import Product
from app.models.invoice import InvoiceDetail
from app.models.payment import Payment, PaymentItem
from app.models.sale import SaleDetail
from app.models.user import User

from app.schemas.product import (
    ProductCreate,
    ProductStateUpdate,
    ProductUpdate,
)


router = APIRouter(
    prefix="/api/productos",
    tags=["Productos"],
)


BASE_DIR = (
    Path(__file__)
    .resolve()
    .parents[2]
)

UPLOAD_DIR = (
    BASE_DIR
    / "uploads"
    / "products"
)

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


def serialize_product(
    producto: Product
):
    return {
        "id": producto.id,
        "nombre": producto.nombre,
        "descripcion": (
            producto.descripcion
        ),
        "precio": float(
            producto.precio
        ),
        "stock": producto.stock,
        "imagen": producto.imagen,
        "categoria_id": (
            producto.categoria_id
        ),
        "categoria": (
            producto.categoria.nombre
            if producto.categoria
            else None
        ),
        "estado": (
            producto.estado
        ),
    }


@router.get("")
def get_products(
    db: Session = Depends(
        get_db
    ),
):
    productos = (
        db.query(Product)
        .order_by(
            Product.id.asc()
        )
        .all()
    )

    return {
        "ok": True,
        "productos": [
            serialize_product(
                producto
            )
            for producto
            in productos
        ],
    }


@router.post(
    "/upload-image"
)
async def upload_product_image(
    imagen: UploadFile = File(
        ...
    ),
    current_user: User = Depends(
        require_roles(
            "Administrador"
        )
    ),
):
    allowed_types = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }

    if (
        imagen.content_type
        not in allowed_types
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Solo se permiten imágenes JPG, PNG o WEBP."
            ),
        )

    content = await imagen.read()

    max_size = (
        5
        * 1024
        * 1024
    )

    if len(content) > max_size:
        raise HTTPException(
            status_code=400,
            detail=(
                "La imagen no puede superar los 5 MB."
            ),
        )

    extension = (
        allowed_types[
            imagen.content_type
        ]
    )

    filename = (
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )

    file_path = (
        UPLOAD_DIR
        / filename
    )

    file_path.write_bytes(
        content
    )

    return {
        "ok": True,
        "message": (
            "Imagen subida correctamente."
        ),
        "filename": filename,
        "url": (
            f"{settings.BACKEND_PUBLIC_URL}/uploads/products/{filename}"
            if settings.BACKEND_PUBLIC_URL
            else f"/uploads/products/{filename}"
        ),
    }


@router.get(
    "/{product_id}"
)
def get_product(
    product_id: int,
    db: Session = Depends(
        get_db
    ),
):
    producto = (
        db.query(Product)
        .filter(
            Product.id
            == product_id
        )
        .first()
    )

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Producto no encontrado."
            ),
        )

    return {
        "ok": True,
        "producto": (
            serialize_product(
                producto
            )
        ),
    }


@router.post(
    "",
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def create_product(
    data: ProductCreate,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        require_roles(
            "Administrador"
        )
    ),
):
    if (
        data.categoria_id
        is not None
    ):
        categoria = (
            db.query(Category)
            .filter(
                Category.id
                == data.categoria_id
            )
            .first()
        )

        if categoria is None:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Categoría inválida."
                ),
            )

    producto = Product(
        nombre=(
            data.nombre.strip()
        ),
        descripcion=(
            data.descripcion
        ),
        precio=data.precio,
        stock=data.stock,
        imagen=data.imagen,
        categoria_id=(
            data.categoria_id
        ),
        estado="activo",
    )

    db.add(producto)
    db.commit()
    db.refresh(producto)

    return {
        "ok": True,
        "message": (
            "Producto creado correctamente."
        ),
        "producto": (
            serialize_product(
                producto
            )
        ),
    }


@router.put(
    "/{product_id}"
)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        require_roles(
            "Administrador"
        )
    ),
):
    producto = (
        db.query(Product)
        .filter(
            Product.id
            == product_id
        )
        .first()
    )

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Producto no encontrado."
            ),
        )

    if (
        data.categoria_id
        is not None
    ):
        categoria = (
            db.query(Category)
            .filter(
                Category.id
                == data.categoria_id
            )
            .first()
        )

        if categoria is None:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Categoría inválida."
                ),
            )

    producto.nombre = (
        data.nombre.strip()
    )

    producto.descripcion = (
        data.descripcion
    )

    producto.precio = (
        data.precio
    )

    producto.stock = (
        data.stock
    )

    producto.imagen = (
        data.imagen
    )

    producto.categoria_id = (
        data.categoria_id
    )

    db.commit()
    db.refresh(producto)

    return {
        "ok": True,
        "message": (
            "Producto actualizado correctamente."
        ),
        "producto": (
            serialize_product(
                producto
            )
        ),
    }


@router.patch(
    "/{product_id}/estado"
)
def change_product_state(
    product_id: int,
    data: ProductStateUpdate,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        require_roles(
            "Administrador"
        )
    ),
):
    producto = (
        db.query(Product)
        .filter(
            Product.id
            == product_id
        )
        .first()
    )

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Producto no encontrado."
            ),
        )

    producto.estado = (
        data.estado
    )

    db.commit()

    return {
        "ok": True,
        "message": (
            "Estado actualizado correctamente."
        ),
    }


@router.delete(
    "/{product_id}"
)
def delete_product(
    product_id: int,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        require_roles(
            "Administrador"
        )
    ),
):
    producto = (
        db.query(Product)
        .filter(
            Product.id
            == product_id
        )
        .first()
    )

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Producto no encontrado."
            ),
        )

    # Los productos pueden estar referenciados por ventas y facturas.
    # Se desactivan para preservar el histórico y evitar huérfanos.
    tiene_historial = any((
        db.query(SaleDetail.id).filter(SaleDetail.producto_id == product_id).first(),
        db.query(InvoiceDetail.id).filter(InvoiceDetail.producto_id == product_id).first(),
        db.query(PaymentItem.id).filter(PaymentItem.producto_id == product_id).first(),
        db.query(Payment.id).filter(Payment.producto_id == product_id).first(),
    ))

    if tiene_historial:
        producto.estado = "inactivo"
        mensaje = "Producto desactivado porque tiene historial asociado."
    else:
        db.delete(producto)
        mensaje = "Producto eliminado correctamente."

    db.commit()

    return {
        "ok": True,
        "message": mensaje,
    }
