# MVP --- Captura de Erros do Frontend com Integração ao Grafana

## 🎯 Objetivo

Criar um MVP simples, gratuito e seguro para capturar erros que
acontecem no frontend e não chegam ao backend (ex: "Failed to fetch").

Este sistema deve:

-   Registrar qual foi o erro
-   Identificar onde ocorreu (página, origem da chamada)
-   Identificar qual requisição falhou
-   Associar o usuário afetado (se autenticado)
-   Evitar exposição de dados sensíveis
-   Integrar com pipeline existente (Grafana/Loki)

------------------------------------------------------------------------

## 📐 Arquitetura

Frontend → POST /frontend-errors → Backend sanitiza → Logs → Loki →
Grafana

O frontend nunca envia logs diretamente para o Grafana.

------------------------------------------------------------------------

## 📦 Contrato do Endpoint

### POST /frontend-errors

Exemplo de payload:

``` json
{
  "errorType": "FETCH_ERROR",
  "message": "Failed to fetch",
  "page": "/courses/123",
  "origin": "CourseDetailsPage",
  "request": {
    "method": "GET",
    "url": "/api/courses/123"
  },
  "user": {
    "id": "uuid"
  },
  "metadata": {
    "userAgent": "...",
    "online": true,
    "release": "1.3.2"
  }
}
```

⚠️ Nunca enviar: - senha - token - authorization header - dados
financeiros

------------------------------------------------------------------------

## 🧼 Sanitização (Backend)

Usar whitelist de campos permitidos.

Exemplo (pseudo-code):

``` ts
sanitize(body) {
  return {
    errorType: body.errorType,
    message: body.message?.slice(0, 500),
    page: body.page,
    origin: body.origin,
    request: {
      method: body.request?.method,
      url: body.request?.url
    },
    user: body.user?.id ? { id: body.user.id } : null,
    metadata: {
      userAgent: body.metadata?.userAgent,
      online: body.metadata?.online,
      release: body.metadata?.release
    }
  }
}
```

------------------------------------------------------------------------

## 🖥 Backend (Exemplo NestJS)

``` ts
@Post("frontend-errors")
async captureFrontendError(@Req() req, @Body() body) {

  const safePayload = this.sanitize(body)

  this.logger.error({
    source: "frontend",
    ip: req.ip,
    ...safePayload
  })

  return { status: "ok" }
}
```

------------------------------------------------------------------------

## 🌐 Frontend --- fetchWrapper

``` ts
async function fetchWrapper(url, options = {}) {

  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return response

  } catch (err) {

    sendFrontendError({
      errorType: "FETCH_ERROR",
      message: err.message,
      page: window.location.pathname,
      origin: "fetchWrapper",
      request: {
        method: options.method || "GET",
        url
      },
      metadata: {
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        release: APP_VERSION
      }
    })

    throw err
  }
}
```

------------------------------------------------------------------------

## 📡 Envio usando sendBeacon

``` ts
function sendFrontendError(payload) {

  const blob = new Blob(
    [JSON.stringify(payload)],
    { type: "application/json" }
  )

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/frontend-errors", blob)
  } else {
    fetch("/frontend-errors", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    })
  }
}
```

------------------------------------------------------------------------

## 🔐 Proteções Importantes

-   Rate limit por IP/usuário
-   Limite de tamanho do payload (ex: 10kb)
-   Não confiar no userId vindo do frontend (extrair do JWT no backend)
-   Sanitização rigorosa

------------------------------------------------------------------------

## 📊 Resultados Esperados no Grafana

-   Erros por página
-   Erros por versão do frontend
-   Erros por endpoint
-   Usuários impactados
-   Frequência dos erros

------------------------------------------------------------------------

## 🚀 Evoluções Futuras

-   correlationId para ligar frontend/backend
-   métricas Prometheus
-   OpenTelemetry
-   fingerprint de erros

------------------------------------------------------------------------

## ✅ Implementação (2026-02-26)

- **API**: `POST /frontend-errors` em `api-vcnafacul/src/modules/frontend-errors/`. Sanitização por whitelist, log via `LokiLoggerService` (Grafana), e para erros **graves** (FETCH_ERROR, "Failed to fetch", "network", "load failed") envio ao Discord via `DiscordWebhook`. Rate limit: 30 req/min. `userId` extraído do JWT no header (nunca do body).
- **Cliente**: `client-vcnafacul/src/utils/sendFrontendError.ts` (build payload + send) e integração em `fetchWrapper`: qualquer `fetch()` que lance antes de receber resposta é reportado (sendBeacon ou fetch com `Authorization` para identificar usuário). Não reporta erros para o próprio endpoint `/frontend-errors`.
- **Severidade**: "grave" = envio ao Discord; "normal" = só Grafana. Regra: `errorType === 'FETCH_ERROR'` ou mensagem contendo "failed to fetch" / "network" / "load failed" / "networkerror".

------------------------------------------------------------------------

Gerado em: 2026-02-26T03:01:00.080279
