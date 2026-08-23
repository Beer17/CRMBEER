(function () {
  const config = {
    enabled: false,
    apiUrl: "",
    apiKey: "",
    ...(window.HWARS_CONFIG || {})
  };

  function getBaseUrl() {
    return (config.apiUrl || "").replace(/\/$/, "");
  }

  function getHeaders(extraHeaders = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...extraHeaders
    };

    if (config.apiKey) {
      headers.Authorization = `Bearer ${config.apiKey}`;
    }

    return headers;
  }

  function normalizeResult(payload) {
    const source = payload?.result ?? payload?.data ?? payload ?? {};

    return {
      summary: source.summary || source.insight || source.message || "Cliente analizado por IA.",
      score: Number(source.score ?? source.riskScore ?? 80),
      risk: source.risk || source.level || "medio",
      action: source.action || source.recommendation || "Continuar seguimiento con el cliente.",
      status: source.status || source.classification || "recomendado",
      source: source.source || "hwars"
    };
  }

  function fallbackAnalyzeClient(cliente = {}) {
    const nombre = cliente.nombre || "Cliente";
    const prioridad = (cliente.prioridad || "media").toLowerCase();
    const estatus = (cliente.estatus || "activo").toLowerCase();
    const etiquetas = Array.isArray(cliente.etiquetas) ? cliente.etiquetas.join(", ") : "";

    let score = 72;
    if (prioridad === "alta") score += 12;
    if (prioridad === "baja") score -= 8;
    if (estatus === "potencial") score += 8;
    if (estatus === "inactivo") score -= 10;

    const riesgo = score >= 80 ? "bajo" : score >= 60 ? "medio" : "alto";
    const accion = score >= 80
      ? "Programar seguimiento inmediato y propuesta comercial."
      : score >= 60
        ? "Hacer seguimiento para mover la oportunidad."
        : "Reactivar la relación y reforzar la propuesta.";

    return {
      summary: `${nombre} presenta ${prioridad} prioridad y ${estatus} estatus. ${etiquetas ? `Etiquetas: ${etiquetas}.` : "Sin etiquetas destacadas."}`,
      score: Math.min(100, Math.max(35, score)),
      risk: riesgo,
      action: accion,
      status: score >= 80 ? "fuerte oportunidad" : "seguimiento recomendado",
      source: "fallback"
    };
  }

  async function analyzeClient(cliente = {}, options = {}) {
    const baseUrl = getBaseUrl();
    if (!config.enabled || !baseUrl) {
      return fallbackAnalyzeClient(cliente);
    }

    try {
      const response = await fetch(`${baseUrl}/api/clients/analyze`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          client: cliente,
          intent: options.intent || "customer-insight",
          mode: options.mode || "crm",
          source: "hwars-ai"
        })
      });

      if (!response.ok) {
        throw new Error(`Hwars API respondió con ${response.status}`);
      }

      const payload = await response.json();
      return normalizeResult(payload);
    } catch (error) {
      console.warn("Hm, la IA de Hwars falló; se usará análisis local.", error);
      return fallbackAnalyzeClient(cliente);
    }
  }

  async function saveClient(cliente = {}) {
    const baseUrl = getBaseUrl();
    if (!config.enabled || !baseUrl) {
      return { ok: true, source: "local" };
    }

    try {
      const response = await fetch(`${baseUrl}/api/clients`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(cliente)
      });

      if (!response.ok) {
        throw new Error(`No se pudo guardar en Hwars (${response.status})`);
      }

      return { ok: true, source: "hwars", payload: await response.json() };
    } catch (error) {
      console.warn("No se pudo sincronizar con Hwars; se conserva el registro local.", error);
      return { ok: true, source: "local" };
    }
  }

  async function sendWhatsAppMessage(cliente = {}, text = "") {
    let whatsappConfig = {};
    try {
      whatsappConfig = JSON.parse(localStorage.getItem("crm_whatsapp_config")) || {};
    } catch (error) {
      return { ok: false, source: "local" };
    }
    if (!whatsappConfig.enabled || !whatsappConfig.apiUrl || !cliente.telefono) {
      return { ok: true, source: "local" };
    }
    try {
      const response = await fetch(`${whatsappConfig.apiUrl.replace(/\/$/, "")}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumberId: whatsappConfig.phoneNumberId, to: cliente.telefono, message: text })
      });
      if (!response.ok) throw new Error(`WhatsApp backend respondió con ${response.status}`);
      return { ok: true, source: "whatsapp", payload: await response.json() };
    } catch (error) {
      console.warn("No se pudo enviar el mensaje de WhatsApp.", error);
      return { ok: false, source: "local" };
    }
  }

  window.HwarsCRM = {
    analyzeClient,
    saveClient,
    sendWhatsAppMessage,
    fallbackAnalyzeClient
  };
})();
