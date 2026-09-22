# GameZone — quinto avance

## Arquitectura

- **Frontend:** React + Vite + Tailwind CSS.
- **Backend:** FastAPI + SQLAlchemy + JWT.
- **Base de datos:** PostgreSQL mediante `psycopg[binary]`.
- **Pagos:** Stripe Checkout y webhook idempotente.
- **IA:** Groq desde FastAPI usando el cliente compatible con OpenAI; la clave nunca llega al navegador.

El frontend consume exclusivamente la API mediante `src/services/api.js`. En desarrollo, Vite puede reenviar `/api` y `/uploads` al backend mediante `VITE_BACKEND_URL`.

## Módulos

- Usuarios, roles, permisos y autenticación JWT.
- Productos y servicios.
- Ventas y detalles de venta para productos y servicios.
- Stripe, pagos aprobados, stock y relación con ventas.
- Facturas y descarga PDF.
- Reportes diarios JSON, PDF y Excel.
- Dashboards administrativo y de ventas.
- PQR para clientes, empleados y administradores.
- Conversaciones y chatbot con contexto del catálogo.

## Endpoints principales

| Módulo | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/login`, `GET /api/auth/me` |
| Ventas | `POST/GET /api/ventas`, `GET /api/ventas/{id}`, `PATCH /api/ventas/{id}/estado`, `GET /api/ventas/mis-compras` |
| Reportes | `GET /api/reportes/ventas-diarias`, `/pdf`, `/excel` |
| Facturas | `POST/GET /api/facturas`, `GET /api/facturas/{id}`, `GET /api/facturas/{id}/pdf` |
| Dashboards | `GET /api/dashboard/admin`, `GET /api/dashboard/ventas` |
| PQR | `POST/GET /api/pqr`, `GET /api/pqr/{id}`, `PATCH /api/pqr/{id}/estado`, `POST /api/pqr/{id}/respuestas` |
| Chatbot | `POST /api/chatbot/mensaje` |
| Pagos | `POST /api/pagos/stripe/checkout`, `POST /api/pagos/stripe/cart-checkout`, `POST /api/pagos/stripe/webhook` |

## Seguridad

- Los endpoints privados requieren `Authorization: Bearer <JWT>`.
- Administradores acceden a la administración completa.
- Empleados acceden a operación, ventas, reportes, facturas y PQR autorizados.
- Clientes solo pueden consultar sus ventas, facturas, PQR, pagos y conversaciones.
- Los secretos se cargan desde `.env`, excluido por Git.
- El webhook de Stripe valida la firma y evita duplicar ventas o descontar stock.

## Variables de entorno

Backend (`backend/.env`):

```env
DATABASE_URL=
JWT_SECRET=
FRONTEND_URL=
BACKEND_PUBLIC_URL=
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-120b
```

Frontend (`frontend/.env`):

```env
VITE_API_URL=
VITE_BACKEND_URL=
```

Nunca subir valores reales de estas variables al repositorio.

## Ejecución local

Backend:

```powershell
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Swagger queda disponible en `/docs`.

## Despliegue

- Backend: servicio FastAPI usando el `Procfile` de `backend/`.
- Frontend: ejecutar `npm run build` y publicar `frontend/dist`.
- Configurar `DATABASE_URL`, `FRONTEND_URL`, `BACKEND_PUBLIC_URL`, Stripe y Groq en el proveedor.
- Configurar `VITE_API_URL` con la URL pública del backend antes de compilar el frontend.
- No usar credenciales de desarrollo en producción.

## Checklist de evidencias

- [ ] Registro de venta e historial.
- [ ] Reporte diario, PDF y Excel.
- [ ] Generación, consulta y PDF de factura.
- [ ] Dashboard administrativo y de ventas.
- [ ] Cards, gráfico de barras y gráfico lineal.
- [ ] Registro y gestión de PQR.
- [ ] Chatbot y conversación con IA.
- [ ] Variables de entorno sin secretos visibles.
- [ ] Pruebas en Thunder Client/Postman.
- [ ] Frontend y backend desplegados.
- [ ] URL pública documentada.

## Verificación ejecutada

- `python -m compileall -q app`
- `python -m pip check`
- Conexión PostgreSQL y tablas requeridas.
- Rutas documentadas en Swagger.
- Login JWT y control de acceso por rol.
- `npm run lint`
- `npm run build`
