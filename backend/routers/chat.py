import re
import json as _json
from datetime import date
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from config import get_settings
from database.supabase_client import get_supabase
from services.ai_service import (
    chat_with_trufibot,
    modo_seguro as _modo_seguro,
    build_system_prompt,
    extract_json_from_response,
    clean_response_text,
)

router = APIRouter()

FREE_DAILY_LIMIT = 10


def _check_plan_limit(user_id: str | None) -> None:
    """Raises HTTP 429 if free user reached daily AI message limit."""
    if not user_id:
        return
    try:
        db = get_supabase()
        profile = db.table("profiles").select("plan").eq("id", user_id).maybe_single().execute()
        plan = (profile.data or {}).get("plan", "free")
        if plan == "premium":
            return
        today = date.today().isoformat()
        usage = db.table("chat_daily_usage").select("count").eq("user_id", user_id).eq("date", today).maybe_single().execute()
        current = (usage.data or {}).get("count", 0)
        if current >= FREE_DAILY_LIMIT:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "limit_reached",
                    "message": f"Alcanzaste el límite de {FREE_DAILY_LIMIT} mensajes diarios del plan gratuito. Actualiza a Premium para mensajes ilimitados.",
                },
            )
        db.table("chat_daily_usage").upsert({"user_id": user_id, "date": today, "count": current + 1}).execute()
    except HTTPException:
        raise
    except Exception as e:
        print(f"[WAYRA] Error en _check_plan_limit: {e}")

# Known routes for text-based fallback detection
_ROUTE_INFO = {
    '101': ('Trufi 101', 'alta',  ['Ciudad del Niño', 'Plaza 14 de Septiembre', 'Tamborada'],              '7 min',  '30 min'),
    '110': ('Trufi 110', 'alta',  ['Torrentera Logustani', 'UMSS', 'Plaza Colón', 'Calle Portugal'],       '8 min',  '25 min'),
    '120': ('Trufi 120', 'alta',  ['Univalle', 'Recoleta', 'Plaza 14 de Septiembre', 'Tupac Katari'],      '10 min', '35 min'),
    '132': ('Trufi 132', 'media', ['Sacaba Arocagua', 'Hipódromo', 'Plaza 14 de Septiembre', 'Av. Autonomía'], '10 min', '40 min'),
    '134': ('Trufi 134', 'media', ['Av. Chiquicollo', 'Cala Cala', 'Av. Circunvalación'],                 '12 min', '30 min'),
    '150': ('Trufi 150', 'alta',  ['Univalle', 'Recoleta', 'Av. América', 'Av. República'],               '12 min', '30 min'),
    '200': ('Micro 200', 'media', ['Calle Litoral', 'Av. Blanco Galindo', 'Colcapirhua', 'Quillacollo Plaza Bolívar'], '8 min', '45 min'),
    '212': ('Micro 212', 'media', ['Calle Acre', 'Av. Ayacucho', 'Hipódromo', 'Sacaba Molino Blanco'],    '8 min',  '40 min'),
    '215': ('Trufi 215', 'alta',  ['Mayorazgo', 'Av. Circunvalación', 'Plaza Colón', 'Plaza 14 de Septiembre'], '10 min', '30 min'),
    '244': ('Trufi 244', 'media', ['Calle Paucarpata', 'Plaza 14 de Septiembre', 'Hipódromo', 'Sacaba Av. Villazón'], '10 min', '35 min'),
    '250': ('Trufi 250', 'alta',  ['Av. Blanco Galindo', 'Quillacollo', 'Colcapirhua', 'Tiquipaya'],      '15 min', '50 min'),
    '260': ('Trufi 260', 'media', ['Calle Litoral', 'Av. Blanco Galindo', 'Quillacollo', 'Vinto', 'Sipe Sipe'], '20 min', '60 min'),
}


def _detect_route_from_text(text: str) -> dict | None:
    """Detect a trufi/micro number mentioned in the response text and build route_data."""
    match = (
        re.search(r'(?:trufi|micro|línea|linea)\s+(\d{2,3})\b', text, re.IGNORECASE)
        or re.search(r'\b(101|110|120|132|134|150|200|212|215|244|250|260)\b', text)
    )
    if not match:
        return None
    num = match.group(1)
    if num not in _ROUTE_INFO:
        return None
    name, seg, paradas, espera, viaje = _ROUTE_INFO[num]
    return {
        'tipo': 'ruta',
        'trufi': name,
        'tiempo_espera': espera,
        'tiempo_viaje': viaje,
        'precio_adulto': 'Bs 3.00',
        'precio_estudiante': 'Bs 2.00',
        'precio_tercera_edad': 'Bs 1.50',
        'precio_nino': 'Bs 1.50',
        'seguridad': seg,
        'paradas': paradas,
        'consejo': '',
        'modo_seguro': False,
    }


class ChatRequest(BaseModel):
    message: str
    user_id: str | None = None
    conversation_history: list[dict] = []
    origin: str | None = None
    destination: str | None = None


class ChatResponse(BaseModel):
    text: str
    route_data: dict | None = None
    is_night_mode: bool = False


@router.post("/", response_model=ChatResponse)
async def enviar_mensaje(req: ChatRequest):
    try:
        _check_plan_limit(req.user_id)
    except HTTPException:
        raise
    except Exception as e:
        print(f"[WAYRA] Error en check_plan_limit (POST /): {e}")
    try:
        resultado = await chat_with_trufibot(req.message, req.conversation_history)
        datos = resultado.get("datos")

        # Fallback: if AI didn't produce structured JSON, detect route from text
        if not datos or datos.get("tipo") != "ruta":
            datos = _detect_route_from_text(resultado["texto"]) or datos

        return ChatResponse(
            text=resultado["texto"],
            route_data=datos,
            is_night_mode=bool(datos and datos.get("modo_seguro")),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stream")
async def stream_mensaje(req: ChatRequest):
    _check_plan_limit(req.user_id)
    settings = get_settings()

    async def generate():
        try:
            system_prompt = build_system_prompt()
            history_plus_user = req.conversation_history + [{"role": "user", "content": req.message}]
            full_text = ""

            if settings.ai_provider == "ollama":
                import ollama
                client = ollama.AsyncClient(host=settings.ollama_base_url)
                async for part in await client.chat(
                    model=settings.ollama_model,
                    messages=[{"role": "system", "content": system_prompt}] + history_plus_user,
                    stream=True,
                ):
                    chunk = (part["message"]["content"] if isinstance(part, dict) else part.message.content) or ""
                    full_text += chunk
                    if chunk:
                        yield f"data: {_json.dumps({'chunk': chunk})}\n\n"
            else:
                from anthropic import AsyncAnthropic
                client = AsyncAnthropic(api_key=settings.anthropic_api_key)
                async with client.messages.stream(
                    model=settings.anthropic_model,
                    max_tokens=2048,
                    temperature=0,
                    system=system_prompt,
                    messages=history_plus_user,
                ) as stream:
                    async for chunk in stream.text_stream:
                        full_text += chunk
                        yield f"data: {_json.dumps({'chunk': chunk})}\n\n"

            datos = extract_json_from_response(full_text)
            if not datos or datos.get("tipo") != "ruta":
                datos = _detect_route_from_text(clean_response_text(full_text)) or datos

            yield f"data: {_json.dumps({'done': True, 'route_data': datos, 'is_night_mode': bool(datos and datos.get('modo_seguro'))})}\n\n"

        except Exception as e:
            yield f"data: {_json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/seguro")
async def modo_seguro_endpoint(origen: str, hora: str, rutas: list = [], puntos: list = []):
    return await _modo_seguro(origen, hora, rutas, puntos)
