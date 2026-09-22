from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from openai import OpenAI

from app.core.config import settings
from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.conversation import Conversation, Message
from app.models.product import Product
from app.models.service import Service
from app.models.user import User
from app.schemas.chatbot import ChatMessageCreate, ChatMessageResponse


router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])


def _faq_answer(message: str) -> str:
    text = message.lower()
    if any(word in text for word in ["producto", "videojuego", "juego", "catálogo"]):
        return "Puedes explorar los productos disponibles en el catálogo de GameZone y abrir cada ficha para consultar precio, stock y detalles."
    if any(word in text for word in ["servicio", "servicios"]):
        return "GameZone ofrece servicios publicados en su catálogo. Revisa sus detalles y precios desde la sección de servicios."
    if any(word in text for word in ["comprar", "compra", "pedido"]):
        return "Para comprar, agrega productos al carrito y continúa con el checkout. El pago en línea se procesa mediante Stripe cuando está configurado."
    if any(word in text for word in ["pago", "stripe", "tarjeta"]):
        return "Los pagos en línea se gestionan mediante Stripe. Si tienes un problema con un pago, conserva el identificador de la sesión y contacta a GameZone."
    if any(word in text for word in ["pqr", "queja", "reclamo", "petición"]):
        return "Puedes crear un PQR desde tu panel de cliente indicando tipo, asunto y descripción. Luego podrás consultar su estado y respuestas."
    if any(word in text for word in ["hola", "buenas", "ayuda"]):
        return "Hola, soy el asistente de GameZone. Puedo orientarte sobre productos, servicios, compras, pagos y PQR."
    return "Puedo ayudarte con productos, servicios, compras, métodos de pago y PQR. Cuéntame qué necesitas encontrar."


def _can_access(conversation: Conversation, current_user: User) -> bool:
    role = current_user.rol.nombre if current_user.rol else None
    return role in {"Administrador", "Empleado"} or conversation.usuario_id == current_user.id


def _catalog_context(db: Session) -> str:
    products = db.query(Product).filter(Product.estado == "activo").order_by(Product.nombre.asc()).limit(20).all()
    services = db.query(Service).filter(Service.estado == "activo").order_by(Service.nombre.asc()).limit(20).all()
    product_text = "; ".join(f"{item.nombre} (${item.precio})" for item in products) or "ninguno publicado"
    service_text = "; ".join(f"{item.nombre} (${item.precio})" for item in services) or "ninguno publicado"
    return f"Catálogo actual de GameZone. Productos: {product_text}. Servicios: {service_text}."


def _openai_answer(db: Session, conversation: Conversation, message: str):
    fallback = _faq_answer(message)
    if not settings.GROQ_API_KEY:
        return fallback, "faq", None, None

    history = (
        db.query(Message)
        .filter(Message.conversacion_id == conversation.id)
        .order_by(Message.created_at.desc())
        .limit(10)
        .all()
    )
    history.reverse()
    input_messages = [{
        "role": "developer",
        "content": (
            "Eres el asistente oficial de GameZone. Responde siempre en español, con claridad y brevedad. "
            "Usa únicamente la información disponible; no inventes precios, stock, políticas ni estados de pedidos. "
            "Si no sabes algo, indica que el usuario debe contactar soporte o crear un PQR.\n\n"
            + _catalog_context(db)
        ),
    }]
    for previous in history:
        input_messages.append({
            "role": "assistant" if previous.remitente == "asistente" else "user",
            "content": previous.contenido,
        })
    input_messages.append({"role": "user", "content": message})

    try:
        client = OpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
        )
        response = client.responses.create(
            model=settings.GROQ_MODEL,
            input=input_messages,
        )
        answer = (response.output_text or "").strip()
        if not answer:
            return fallback, "faq", None, None
        usage = getattr(response, "usage", None)
        return (
            answer,
            "groq",
            getattr(usage, "input_tokens", None),
            getattr(usage, "output_tokens", None),
        )
    except Exception:
        return fallback, "faq", None, None


@router.post("/mensaje", response_model=ChatMessageResponse)
def send_message(
    data: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = None
    if data.conversacion_id is not None:
        conversation = db.query(Conversation).filter(Conversation.id == data.conversacion_id).first()
        if conversation is None:
            raise HTTPException(status_code=404, detail="Conversación no encontrada.")
        if not _can_access(conversation, current_user):
            raise HTTPException(status_code=403, detail="No puedes consultar esta conversación.")
    if conversation is None:
        conversation = Conversation(usuario_id=current_user.id, canal="web", estado="activa", titulo="Asistencia GameZone")
        db.add(conversation)
        db.flush()

    message_text = data.mensaje.strip()
    db.add(Message(conversacion_id=conversation.id, remitente="usuario", usuario_id=current_user.id, contenido=message_text))
    answer, provider, input_tokens, output_tokens = _openai_answer(db, conversation, message_text)
    bot_message = Message(
        conversacion_id=conversation.id,
        remitente="asistente",
        contenido=answer,
        proveedor_ia=provider,
        modelo_ia=settings.GROQ_MODEL if provider == "groq" else None,
        tokens_entrada=input_tokens,
        tokens_salida=output_tokens,
    )
    db.add(bot_message)
    db.commit()
    db.refresh(bot_message)
    return {"conversacion_id": conversation.id, "respuesta": answer, "created_at": bot_message.created_at}


@router.get("/conversaciones")
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = current_user.rol.nombre if current_user.rol else None
    query = db.query(Conversation)
    if role not in {"Administrador", "Empleado"}:
        query = query.filter(Conversation.usuario_id == current_user.id)
    return [{"id": item.id, "usuario_id": item.usuario_id, "titulo": item.titulo, "estado": item.estado, "created_at": item.created_at, "updated_at": item.updated_at} for item in query.order_by(Conversation.updated_at.desc()).all()]


@router.get("/conversaciones/{conversation_id}")
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversación no encontrada.")
    if not _can_access(conversation, current_user):
        raise HTTPException(status_code=403, detail="No puedes consultar esta conversación.")
    return {"id": conversation.id, "usuario_id": conversation.usuario_id, "titulo": conversation.titulo, "estado": conversation.estado, "mensajes": [{"id": message.id, "remitente": message.remitente, "contenido": message.contenido, "created_at": message.created_at} for message in conversation.mensajes]}
