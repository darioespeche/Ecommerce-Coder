# Análisis de mejoras para el e-commerce

Fecha: 2026-04-25

## Diagnóstico rápido

El proyecto ya cubre un MVP funcional (catálogo, carrito, paginación básica y updates en tiempo real), pero aún le faltan varias capacidades clave para operar como e-commerce listo para producción.

## Hallazgos principales y qué falta

### 1) Seguridad y control de acceso (prioridad alta)
- No hay autenticación ni autorización para endpoints de administración.
- Cualquier cliente puede crear/editar/eliminar productos y manipular carritos vía API.
- Falta proteger acciones sensibles por rol (admin vs cliente).

**Mejoras sugeridas**
- Implementar login con JWT o sesión + cookies seguras.
- Crear middleware de autorización por rol en rutas críticas.
- Agregar rate-limiting y helmet para endurecer seguridad HTTP.

### 2) Validación de datos y manejo de errores (prioridad alta)
- Hay validaciones puntuales en routers, pero faltan validaciones de negocio consistentes (por ejemplo stock disponible al agregar al carrito).
- Se devuelven muchos `500` por errores de input que deberían ser `400`/`422`.
- No existe un middleware centralizado de errores.

**Mejoras sugeridas**
- Usar esquemas de validación (Joi/Zod/express-validator) para `body`, `params` y `query`.
- Estandarizar formato de errores (`code`, `message`, `details`).
- Middleware global de errores con mapeo de errores Mongoose.

### 3) Flujo comercial incompleto (prioridad alta)
- No existe checkout, órdenes, estados de compra ni pagos.
- El carrito no reserva stock ni recalcula precios ante cambios.

**Mejoras sugeridas**
- Incorporar entidad `Order` con estados (`pending`, `paid`, `cancelled`, `shipped`).
- Integrar pasarela de pago (Mercado Pago / Stripe).
- Validar stock en tiempo real antes de confirmar compra.

### 4) UX y producto digital (prioridad media)
- Se usa `alert()` para feedback y se recarga la pantalla en acciones del carrito.
- No hay búsqueda/filtros en UI pese a existir soporte parcial en API.
- Falta estado visual de loading, errores y carrito persistente en servidor por usuario.

**Mejoras sugeridas**
- Reemplazar `alert()` por toasts/no-intrusive notifications.
- Agregar barra de búsqueda y filtros por categoría/precio.
- Mejorar navegación del carrito (sin recargar) y mostrar subtotal/total.

### 5) Observabilidad, calidad y escalabilidad (prioridad media)
- No hay tests automáticos (el script `test` no está implementado).
- Logs con `console.log` sin niveles/estructura.
- Conexión WebSocket se define en el router de productos, lo que complica mantenimiento.

**Mejoras sugeridas**
- Agregar tests unitarios e integración (Jest + Supertest).
- Incorporar logger estructurado (pino/winston) y trazabilidad.
- Extraer capa `services` y separar eventos Socket.IO en módulo dedicado.

### 6) SEO y accesibilidad básica (prioridad media-baja)
- HTML sin metadatos relevantes (meta description, OG tags) ni mejoras de accesibilidad (aria labels, foco, etc.).

**Mejoras sugeridas**
- Mejorar semántica HTML, etiquetas ARIA y navegación por teclado.
- Añadir metadatos para compartir productos.

## Roadmap recomendado (30-60-90 días)

### 0-30 días
1. Autenticación + autorización por roles.
2. Validación completa de entradas y middleware de errores.
3. Test de humo para endpoints críticos (`products`, `carts`).

### 31-60 días
1. Checkout + órdenes + stock transaccional.
2. Mejoras UX de carrito (toasts, subtotal, actualizaciones sin reload).
3. Observabilidad (logger + métricas básicas).

### 61-90 días
1. Integración de pagos.
2. Panel admin básico (inventario, pedidos).
3. Hardening: rate-limit, auditoría, backups y documentación operativa.

## KPIs para medir mejora

- Conversion rate (visita -> compra).
- Abandono de carrito.
- Tiempo medio de checkout.
- Error rate API (4xx/5xx por endpoint).
- Tiempo de respuesta p95.
