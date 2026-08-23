# CRM con integración de Hwars AI

Este proyecto es un CRM básico para gestionar clientes con una capa opcional de IA usando la API de Hwars.

## Características

- Gestión de clientes y etiquetas
- Login y registro local
- Persistencia con localStorage
- Análisis con IA para resumir clientes, priorizar oportunidades y sugerir acciones
- Fallback local si la API no está disponible

## Requisitos

- Navegador moderno
- Un endpoint de Hwars con soporte para IA
- Opcionalmente, una clave API si tu backend la exige

## Configuración

1. Abre el archivo `hwars.config.js`.
2. Activa la integración y coloca la URL y la clave de tu API:

```js
window.HWARS_CONFIG = {
  enabled: true,
  apiUrl: "https://api.hwars.example.com",
  apiKey: "tu_clave_api"
};
```

> Si `enabled` se deja en `false`, la app funciona con análisis local y sin conexión externa.

## Cómo ejecutar la app

Desde la raíz del proyecto:

```bash
python -m http.server 3000
```

O si prefieres:

```bash
npx http-server . -p 3000
```

Luego abre en tu navegador:

```text
http://localhost:3000
```

## Uso

1. Inicia sesión con:
   - Email: `admin@crm.com`
   - Contraseña: `1234`
2. Agrega o edita clientes.
3. En la lista de clientes, usa el botón `IA` para generar un análisis.
4. La app enviará el cliente al endpoint:

```http
POST /api/clients/analyze
```

Con un cuerpo similar a:

```json
{
  "client": {
    "nombre": "João",
    "email": "joao@example.com",
    "empresa": "SystemsBeer",
    "prioridad": "alta",
    "estatus": "activo"
  },
  "intent": "customer-insight",
  "mode": "crm",
  "source": "hwars-ai"
}
```

## Respuesta esperada

La API de Hwars debe responder con un JSON como este:

```json
{
  "summary": "Cliente con alto potencial y buena probabilidad de cierre.",
  "score": 92,
  "risk": "bajo",
  "action": "Agendar llamada de seguimiento en 48 horas.",
  "status": "oportunidad fuerte"
}
```

Si la API no responde, la aplicación vuelve a un análisis heurístico local para que tu flujo no se rompa.

## Estructura relevante

- `index.js`: lógica del CRM
- `hwarsApi.js`: cliente para consumir Hwars AI
- `hwars.config.js`: configuración de endpoint y clave
- `styles.css`: estilos del panel IA

## Personalización

Puedes ajustar la integración para que tu backend Hwars haga análisis más específicos, como:

- score de intención de compra
- prioridad de atención
- sugerencias de mensajes personalizados
- automatización de follow-up por canal
