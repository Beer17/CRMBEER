// Sección principal donde se dibujará la interfaz del CRM
const contenedorApp = document.getElementById("app");

// Claves de almacenamiento en el navegador para datos simples y persistentes
const STORAGE_KEY = "crm_usuarios";
const SESSION_KEY = "crm_sesion";
const CLIENTES_KEY = "crm_clientes";
const WHATSAPP_CONFIG_KEY = "crm_whatsapp_config";

// Carga los usuarios desde el almacenamiento local
function cargarUsuarios() {
  const datos = localStorage.getItem(STORAGE_KEY);
  if (datos) {
    try {
      return JSON.parse(datos);
    } catch (error) {
      console.error("No se pudieron cargar los usuarios", error);
    }
  }

  return [
    { id: 1, nombre: "Admin", email: "admin@crm.com", password: "1234", role: "admin" }
  ];
}

function guardarUsuarios() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
}

function cargarSesion() {
  const datos = localStorage.getItem(SESSION_KEY);
  if (datos) {
    try {
      return JSON.parse(datos);
    } catch (error) {
      console.error("No se pudo cargar la sesión", error);
    }
  }
  return null;
}

function guardarSesion() {
  if (usuarioActual) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(usuarioActual));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

function cargarClientes() {
  const datos = localStorage.getItem(CLIENTES_KEY);
  if (datos) {
    try {
      return JSON.parse(datos);
    } catch (error) {
      console.error("No se pudieron cargar los clientes", error);
    }
  }

  return [
    {
      id: 1,
      nombre: "João",
      email: "joao@example.com",
      telefono: "555-0101",
      empresa: "SystemsBeer",
      estatus: "activo",
      prioridad: "alta",
      etiquetas: ["nuevo", "importante"]
    },
    {
      id: 2,
      nombre: "Maria",
      email: "maria@example.com",
      telefono: "555-0102",
      empresa: "Acme",
      estatus: "inactivo",
      prioridad: "media",
      etiquetas: ["seguimiento"]
    }
  ];
}

function guardarClientes() {
  localStorage.setItem(CLIENTES_KEY, JSON.stringify(clientes));
}

function cargarConfigWhatsApp() {
  try {
    return JSON.parse(localStorage.getItem(WHATSAPP_CONFIG_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function guardarConfigWhatsApp(configuracion) {
  localStorage.setItem(WHATSAPP_CONFIG_KEY, JSON.stringify(configuracion));
}

// Usuarios disponibles para login y registro
const usuarios = cargarUsuarios();
usuarios.forEach((usuario) => {
  usuario.role = usuario.role || (usuario.id === 1 ? "admin" : "seller");
});

// Usuario autenticado actualmente
let usuarioActual = cargarSesion();
if (usuarioActual && !usuarioActual.role) {
  usuarioActual.role = usuarioActual.id === 1 ? "admin" : "seller";
}

// Lista de clientes del CRM
let clientes = cargarClientes();
let configuracionWhatsApp = cargarConfigWhatsApp();

// Guarda el ID del cliente que se está editando
let clienteEditandoId = null;

// Controla si la pantalla muestra login o registro
let modoRegistro = false;

let slideActual = "resumen";

function aplicarApariencia() {
  const apariencia = usuarioActual?.appearance || {};
  const root = document.documentElement;
  root.style.setProperty("--blue", apariencia.color || "#1769e0");
  root.style.setProperty("--blue-dark", apariencia.colorDark || "#0d3f94");
  root.style.setProperty("--blue-soft", apariencia.colorSoft || "#e6f1ff");
}

// Función reutilizable para crear elementos del DOM
function crearElemento(tag, clase, texto = "") {
  const elemento = document.createElement(tag);
  if (clase) elemento.className = clase;
  if (texto) elemento.textContent = texto;
  return elemento;
}

function aplicarFoto(elemento, usuario) {
  if (!usuario.appearance?.photo) return;
  elemento.textContent = "";
  elemento.style.backgroundImage = `url(${usuario.appearance.photo})`;
  elemento.style.backgroundSize = "cover";
  elemento.style.backgroundPosition = "center";
}

function etiquetaRol(role) {
  return { admin: "Admin", seller: "Vendedor", rh: "RH", compras: "Compras" }[role] || "Vendedor";
}

// Dibuja la interfaz según si hay sesión activa o no
function renderizar() {
  contenedorApp.innerHTML = "";
  aplicarApariencia();

  if (!usuarioActual) {
    renderizarAuth();
    return;
  }

  renderizarCRM2();
}

function renderizarAuth() {
  const panel = crearElemento("section", "panel auth");
  const header = crearElemento("div", "panel__header");
  header.appendChild(crearElemento("h1", "", modoRegistro ? "Registro básico" : "Acceso al CRM"));
  header.appendChild(crearElemento("p", "", modoRegistro
    ? "Crea una cuenta sencilla para empezar a administrar clientes."
    : "Ingresa con tu correo y contraseña para entrar al CRM."));
  panel.appendChild(header);

  const mensaje = crearElemento("p", "mensaje", "Usuario de prueba: admin@crm.com / 1234");
  panel.appendChild(mensaje);

  const formulario = crearElemento("form", "formulario auth__form");
  formulario.addEventListener("submit", (evento) => manejarAuth(evento, mensaje));

  if (modoRegistro) {
    const campoNombre = crearElemento("div", "campo campo--full");
    const labelNombre = crearElemento("label", "campo__label", "Nombre");
    const inputNombre = document.createElement("input");
    inputNombre.name = "nombre";
    inputNombre.type = "text";
    inputNombre.placeholder = "Tu nombre";
    campoNombre.appendChild(labelNombre);
    campoNombre.appendChild(inputNombre);
    formulario.appendChild(campoNombre);
  }

  const campoEmail = crearElemento("div", "campo campo--full");
  const labelEmail = crearElemento("label", "campo__label", "Correo");
  const inputEmail = document.createElement("input");
  inputEmail.name = "email";
  inputEmail.type = "email";
  inputEmail.placeholder = "correo@empresa.com";
  campoEmail.appendChild(labelEmail);
  campoEmail.appendChild(inputEmail);
  formulario.appendChild(campoEmail);

  const campoPassword = crearElemento("div", "campo campo--full");
  const labelPassword = crearElemento("label", "campo__label", "Contraseña");
  const inputPassword = document.createElement("input");
  inputPassword.name = "password";
  inputPassword.type = "password";
  inputPassword.placeholder = "Tu contraseña";
  campoPassword.appendChild(labelPassword);
  campoPassword.appendChild(inputPassword);
  formulario.appendChild(campoPassword);

  if (modoRegistro) {
    const campoConfirmar = crearElemento("div", "campo campo--full");
    const labelConfirmar = crearElemento("label", "campo__label", "Confirmar contraseña");
    const inputConfirmar = document.createElement("input");
    inputConfirmar.name = "confirmar";
    inputConfirmar.type = "password";
    inputConfirmar.placeholder = "Repite la contraseña";
    campoConfirmar.appendChild(labelConfirmar);
    campoConfirmar.appendChild(inputConfirmar);
    formulario.appendChild(campoConfirmar);
  }

  const acciones = crearElemento("div", "acciones");
  const botonEnviar = crearElemento("button", "btn btn--primary", modoRegistro ? "Crear cuenta" : "Entrar");
  botonEnviar.type = "submit";
  const botonCambio = crearElemento("button", "btn btn--secondary", modoRegistro ? "Ya tengo cuenta" : "Crear cuenta");
  botonCambio.type = "button";
  botonCambio.addEventListener("click", () => {
    modoRegistro = !modoRegistro;
    renderizar();
  });

  acciones.appendChild(botonEnviar);
  acciones.appendChild(botonCambio);
  formulario.appendChild(acciones);

  panel.appendChild(formulario);
  contenedorApp.appendChild(panel);
}

function renderizarCRM() {
  const panel = crearElemento("section", "panel");

  const header = crearElemento("div", "panel__header");
  header.appendChild(crearElemento("h1", "", "CRM básico y personalizable"));
  header.appendChild(crearElemento("p", "", "Gestiona clientes y cambia tu correo desde el área de perfil."));
  panel.appendChild(header);

  const toolbar = crearElemento("div", "toolbar");
  toolbar.appendChild(crearElemento("div", "toolbar__title", `Hola, ${usuarioActual.nombre}`));

  const botonSalir = crearElemento("button", "btn btn--secondary", "Cerrar sesión");
  botonSalir.type = "button";
  botonSalir.addEventListener("click", () => {
    usuarioActual = null;
    guardarSesion();
    renderizar();
  });
  toolbar.appendChild(botonSalir);
  panel.appendChild(toolbar);

  const mensaje = crearElemento("p", "mensaje", "Añade clientes, cambia etiquetas y adapta los campos a tu flujo.");
  panel.appendChild(mensaje);

  const perfil = crearElemento("div", "perfil");
  perfil.appendChild(crearElemento("h2", "", "Área de edición de perfil"));
  perfil.appendChild(crearElemento("p", "", "Cambia tu correo desde aquí para mantener tus datos actualizados."));

  const perfilForm = crearElemento("form", "formulario perfil__form");
  perfilForm.addEventListener("submit", (evento) => manejarCambioCorreo(evento, mensaje));

  const campoPerfil = crearElemento("div", "campo campo--full");
  const labelPerfil = crearElemento("label", "campo__label", "Correo actual");
  const inputPerfil = document.createElement("input");
  inputPerfil.name = "email";
  inputPerfil.type = "email";
  inputPerfil.value = usuarioActual.email;
  campoPerfil.appendChild(labelPerfil);
  campoPerfil.appendChild(inputPerfil);
  perfilForm.appendChild(campoPerfil);

  const botonPerfil = crearElemento("button", "btn btn--primary", "Guardar correo");
  botonPerfil.type = "submit";
  perfilForm.appendChild(botonPerfil);

  perfil.appendChild(perfilForm);
  panel.appendChild(perfil);

  const formulario = crearElemento("form", "formulario");
  formulario.addEventListener("submit", (evento) => manejarEnvio(evento, mensaje));

  const campos = [
    { label: "Nombre", name: "nombre", type: "text", placeholder: "Nombre del cliente" },
    { label: "Email", name: "email", type: "email", placeholder: "correo@empresa.com" },
    { label: "Teléfono", name: "telefono", type: "text", placeholder: "+52 55 1234 5678" },
    { label: "Empresa", name: "empresa", type: "text", placeholder: "Nombre de la empresa" },
    { label: "Estatus", name: "estatus", type: "select", options: ["activo", "inactivo", "potencial"] },
    { label: "Prioridad", name: "prioridad", type: "select", options: ["baja", "media", "alta"] },
    { label: "Etiquetas", name: "etiquetas", type: "text", placeholder: "nuevo, importante, seguimiento", full: true }
  ];

  campos.forEach((campo) => {
    const contenedor = crearElemento("div", campo.full ? "campo campo--full" : "campo");
    const label = crearElemento("label", "campo__label", campo.label);
    label.setAttribute("for", campo.name);

    let input;
    if (campo.type === "select") {
      input = document.createElement("select");
      campo.options.forEach((opcion) => {
        const option = document.createElement("option");
        option.value = opcion;
        option.textContent = opcion;
        input.appendChild(option);
      });
    } else {
      input = document.createElement("input");
      input.type = campo.type;
      input.placeholder = campo.placeholder;
    }

    input.id = campo.name;
    input.name = campo.name;
    contenedor.appendChild(label);
    contenedor.appendChild(input);
    formulario.appendChild(contenedor);
  });

  const acciones = crearElemento("div", "acciones");
  const botonGuardar = crearElemento("button", "btn btn--primary", "Guardar cliente");
  botonGuardar.type = "submit";

  const botonLimpiar = crearElemento("button", "btn btn--secondary", "Limpiar");
  botonLimpiar.type = "button";
  botonLimpiar.addEventListener("click", () => {
    formulario.reset();
    clienteEditandoId = null;
    botonGuardar.textContent = "Guardar cliente";
    mensaje.textContent = "Formulario reiniciado. Puedes agregar otro cliente.";
    mensaje.className = "mensaje";
  });

  acciones.appendChild(botonGuardar);
  acciones.appendChild(botonLimpiar);
  formulario.appendChild(acciones);

  panel.appendChild(formulario);

  const lista = crearElemento("div", "lista");
  const tituloLista = crearElemento("h2", "", "Clientes registrados");
  lista.appendChild(tituloLista);

  if (clientes.length === 0) {
    const vacio = crearElemento("div", "lista__vacio", "No hay clientes aún. Añade uno para empezar.");
    lista.appendChild(vacio);
  } else {
    clientes.forEach((cliente) => {
      const item = crearElemento("article", "cliente");
      const info = crearElemento("div", "cliente__info");
      const nombre = crearElemento("div", "cliente__nombre", cliente.nombre);
      const meta = crearElemento("div", "cliente__meta", `${cliente.empresa} • ${cliente.email}`);
      const etiquetas = crearElemento("div", "cliente__tags");

      cliente.etiquetas.forEach((etiqueta) => {
        etiquetas.appendChild(crearElemento("span", "tag", etiqueta));
      });

      const estado = crearElemento("span", "badge", cliente.estatus);
      info.appendChild(nombre);
      info.appendChild(meta);
      info.appendChild(etiquetas);
      info.appendChild(estado);

      const accionesCliente = crearElemento("div", "cliente__acciones");
      const botonIA = crearElemento("button", "btn btn--secondary", cliente.ai ? "Revisar IA" : "Analizar IA");
      botonIA.type = "button";
      botonIA.addEventListener("click", async () => {
        if (!window.HwarsCRM || typeof window.HwarsCRM.analyzeClient !== "function") {
          mensaje.textContent = "La integración de Hwars no está configurada.";
          mensaje.className = "mensaje mensaje--error";
          return;
        }

        botonIA.disabled = true;
        botonIA.textContent = "Analizando...";

        const resultado = await window.HwarsCRM.analyzeClient(cliente);
        cliente.ai = resultado;
        guardarClientes();
        renderizar();
      });

      const botonEditar = crearElemento("button", "btn btn--secondary", "Editar");
      botonEditar.type = "button";
      botonEditar.addEventListener("click", () => prepararEdicion(cliente));

      const botonEliminar = crearElemento("button", "btn btn--danger", "Eliminar");
      botonEliminar.type = "button";
      botonEliminar.addEventListener("click", () => {
        const indice = clientes.findIndex((item) => item.id === cliente.id);
        if (indice >= 0) {
          clientes.splice(indice, 1);
          guardarClientes();
          renderizar();
        }
      });

      const resumenIA = cliente.ai ? crearElemento("div", "cliente__ia") : null;
      if (resumenIA) {
        const titulo = crearElemento("div", "cliente__ia-title", "Resumen IA de Hwars");
        const texto = crearElemento("p", "cliente__ia-text", `${cliente.ai.summary} Riesgo: ${cliente.ai.risk}. Sugerencia: ${cliente.ai.action}`);
        const indicador = crearElemento("div", "cliente__meta", `Puntuación: ${cliente.ai.score}/100 · Estado: ${cliente.ai.status}`);
        resumenIA.appendChild(titulo);
        resumenIA.appendChild(indicador);
        resumenIA.appendChild(texto);
      }

      accionesCliente.appendChild(botonIA);
      accionesCliente.appendChild(botonEditar);
      accionesCliente.appendChild(botonEliminar);

      item.appendChild(info);
      if (resumenIA) item.appendChild(resumenIA);
      item.appendChild(accionesCliente);
      lista.appendChild(item);
    });
  }

  panel.appendChild(lista);
  contenedorApp.appendChild(panel);
}

function renderizarCRM2() {
  if (["users", "config"].includes(slideActual) && usuarioActual.role !== "admin") slideActual = "perfil";
  const panel = crearElemento("section", "shell");
  const sidebar = crearElemento("aside", "sidebar");
  const brand = crearElemento("div", "brand");
  brand.appendChild(crearElemento("span", "brand__mark", "S"));
  brand.appendChild(crearElemento("span", "brand__name", "Salesboard"));
  sidebar.appendChild(brand);
  sidebar.appendChild(crearElemento("p", "sidebar__eyebrow", "Espacio de trabajo"));

  const navegacion = crearElemento("nav", "nav");
  const itemsNavegacion = [["resumen", "Resumen", "01"], ["clientes", "Clientes", String(clientes.length).padStart(2, "0")]];
  if (usuarioActual.role === "admin") itemsNavegacion.push(["users", "Users", "03"]);
  if (usuarioActual.role === "admin") itemsNavegacion.push(["config", "Config", "04"]);
  itemsNavegacion.push(["perfil", "Mi perfil", usuarioActual.role === "admin" ? "05" : "04"]);
  itemsNavegacion.forEach(([id, texto, numero]) => {
    const boton = crearElemento("button", `nav__item${slideActual === id ? " nav__item--active" : ""}`);
    boton.type = "button";
    boton.appendChild(crearElemento("span", "nav__number", numero));
    boton.appendChild(crearElemento("span", "nav__label", texto));
    boton.addEventListener("click", () => { slideActual = id; clienteEditandoId = null; renderizar(); });
    navegacion.appendChild(boton);
  });
  sidebar.appendChild(navegacion);
  const sidebarFooter = crearElemento("div", "sidebar__footer");
  sidebarFooter.appendChild(crearElemento("span", "status-dot"));
  sidebarFooter.appendChild(crearElemento("span", "sidebar__status", "Espacio activo"));
  sidebar.appendChild(sidebarFooter);
  panel.appendChild(sidebar);

  const contenido = crearElemento("main", "workspace");
  const toolbar = crearElemento("header", "toolbar");
  const toolbarCopy = crearElemento("div", "toolbar__copy");
  toolbarCopy.appendChild(crearElemento("span", "toolbar__kicker", "Salesboard / 2026"));
  toolbarCopy.appendChild(crearElemento("strong", "toolbar__title", `Buenos días, ${usuarioActual.nombre}`));
  toolbar.appendChild(toolbarCopy);
  const acciones = crearElemento("div", "toolbar__actions");
  const avatar = crearElemento("button", "avatar", usuarioActual.nombre.charAt(0).toUpperCase());
  avatar.type = "button";
  avatar.title = "Abrir mi perfil";
  if (usuarioActual.appearance?.photo) {
    avatar.textContent = "";
    avatar.style.backgroundImage = `url(${usuarioActual.appearance.photo})`;
    avatar.style.backgroundSize = "cover";
    avatar.style.backgroundPosition = "center";
  }
  avatar.addEventListener("click", () => { slideActual = "perfil"; renderizar(); });
  const salir = crearElemento("button", "btn btn--ghost", "Salir");
  salir.type = "button";
  salir.addEventListener("click", () => { usuarioActual = null; guardarSesion(); renderizar(); });
  acciones.appendChild(avatar);
  acciones.appendChild(salir);
  toolbar.appendChild(acciones);
  contenido.appendChild(toolbar);

  const slide = crearElemento("div", "slide");
  if (slideActual === "resumen") {
    const activos = clientes.filter((cliente) => cliente.estatus === "activo").length;
    const oportunidades = clientes.filter((cliente) => cliente.estatus === "potencial").length;
    const alta = clientes.filter((cliente) => cliente.prioridad === "alta").length;
    const cabecera = crearElemento("div", "slide__header");
    cabecera.appendChild(crearElemento("span", "slide__index", "01 / Resumen"));
    cabecera.appendChild(crearElemento("h1", "", "Tu pipeline, a primera vista."));
    cabecera.appendChild(crearElemento("p", "", "Convierte cada conversación en una oportunidad de venta."));
    slide.appendChild(cabecera);
    const etapas = crearElemento("div", "etapas");
    ["Calificación", "Presentación", "Propuesta", "Negociación", "Cerrado"].forEach((etapa, indice) => {
      const paso = crearElemento("div", `etapa${indice === 0 ? " etapa--activa" : ""}`, etapa);
      paso.appendChild(crearElemento("span", "etapa__chevron", indice === 0 ? "✓" : String(indice + 1).padStart(2, "0")));
      etapas.appendChild(paso);
    });
    slide.appendChild(etapas);
    const metricas = crearElemento("div", "metricas");
    [["Clientes totales", clientes.length, "base de contactos"], ["Activos", activos, "en seguimiento"], ["Oportunidades", oportunidades, "por convertir"], ["Prioridad alta", alta, "requieren atención"]].forEach(([titulo, valor, detalle]) => {
      const metrica = crearElemento("article", "metrica");
      metrica.appendChild(crearElemento("span", "metrica__label", titulo));
      metrica.appendChild(crearElemento("strong", "metrica__value", String(valor).padStart(2, "0")));
      metrica.appendChild(crearElemento("span", "metrica__detail", detalle));
      metricas.appendChild(metrica);
    });
    slide.appendChild(metricas);
    const resumenGrid = crearElemento("div", "resumen-grid");
    const pipeline = crearElemento("section", "surface");
    pipeline.appendChild(crearElemento("div", "surface__title", "Estado del pipeline"));
    [["Activo", activos, "badge--activo"], ["Potencial", oportunidades, "badge--potencial"], ["Inactivo", clientes.filter((cliente) => cliente.estatus === "inactivo").length, "badge--inactivo"]].forEach(([nombre, total, clase]) => {
      const fila = crearElemento("div", "pipeline-row");
      fila.appendChild(crearElemento("span", `pipeline-row__dot ${clase}`));
      fila.appendChild(crearElemento("span", "pipeline-row__name", nombre));
      fila.appendChild(crearElemento("strong", "pipeline-row__total", String(total).padStart(2, "0")));
      pipeline.appendChild(fila);
    });
    const verClientes = crearElemento("button", "btn btn--primary", "Ver clientes");
    verClientes.type = "button";
    verClientes.addEventListener("click", () => { slideActual = "clientes"; renderizar(); });
    pipeline.appendChild(verClientes);
    resumenGrid.appendChild(pipeline);
    const actividad = crearElemento("section", "surface surface--accent");
    actividad.appendChild(crearElemento("span", "surface__eyebrow", "Siguiente acción"));
    actividad.appendChild(crearElemento("h2", "", alta ? "Atiende tus cuentas clave" : "Construye tu primera oportunidad"));
    actividad.appendChild(crearElemento("p", "", alta ? `${alta} cliente${alta === 1 ? " necesita" : "s necesitan"} seguimiento prioritario.` : "Añade un cliente para comenzar a ordenar tu proceso comercial."));
    resumenGrid.appendChild(actividad);
    slide.appendChild(resumenGrid);
  } else if (slideActual === "users" && usuarioActual.role === "admin") {
    renderizarUsuarios(slide);
  } else if (slideActual === "config" && usuarioActual.role === "admin") {
    renderizarConfiguracion(slide);
  } else if (slideActual === "perfil") {
    slide.appendChild(crearElemento("div", "slide__index", "04 / Mi perfil"));
    slide.appendChild(crearElemento("h1", "", "Tu perfil comercial."));
    slide.appendChild(crearElemento("p", "slide__intro", "Mantén actualizados tus datos para trabajar con confianza."));
    const perfil = crearElemento("section", "profile-card");
    const profileAvatar = crearElemento("div", "profile-card__avatar", usuarioActual.nombre.charAt(0).toUpperCase());
    if (usuarioActual.appearance?.photo) {
      profileAvatar.textContent = "";
      profileAvatar.style.backgroundImage = `url(${usuarioActual.appearance.photo})`;
      profileAvatar.style.backgroundSize = "cover";
      profileAvatar.style.backgroundPosition = "center";
    }
    perfil.appendChild(profileAvatar);
    const perfilCopy = crearElemento("div", "profile-card__copy");
    perfilCopy.appendChild(crearElemento("h2", "", usuarioActual.nombre));
    perfilCopy.appendChild(crearElemento("p", "", usuarioActual.role === "admin" ? "Administrador del espacio de ventas" : "Vendedor del espacio de ventas"));
    perfil.appendChild(perfilCopy);
    slide.appendChild(perfil);
    const mensaje = crearElemento("p", "mensaje", "Actualiza el correo que usas para acceder.");
    slide.appendChild(mensaje);
    const perfilForm = crearElemento("form", "formulario perfil__form");
    perfilForm.addEventListener("submit", (evento) => manejarCambioCorreo(evento, mensaje));
    const campo = crearElemento("div", "campo campo--full");
    campo.appendChild(crearElemento("label", "campo__label", "Correo de acceso"));
    const input = document.createElement("input");
    input.name = "email";
    input.type = "email";
    input.value = usuarioActual.email;
    campo.appendChild(input);
    perfilForm.appendChild(campo);
    const guardar = crearElemento("button", "btn btn--primary", "Guardar cambios");
    guardar.type = "submit";
    perfilForm.appendChild(guardar);
    slide.appendChild(perfilForm);
    if (usuarioActual.role === "admin") {
      const adminPanel = crearElemento("section", "admin-panel");
      adminPanel.appendChild(crearElemento("span", "slide__index", "Permisos de administrador"));
      adminPanel.appendChild(crearElemento("h2", "", "Personaliza tu espacio"));
      adminPanel.appendChild(crearElemento("p", "", "Estos cambios se aplican a todo el equipo comercial."));
      const apariencia = crearElemento("div", "appearance-controls");
      const colorField = crearElemento("label", "color-field", "Color principal");
      const color = document.createElement("input");
      color.type = "color";
      color.value = usuarioActual.appearance?.color || "#1769e0";
      color.addEventListener("input", () => actualizarApariencia({ color: color.value }));
      colorField.appendChild(color);
      const photoField = crearElemento("label", "upload-field", "Foto de perfil");
      const photoInput = document.createElement("input");
      photoInput.type = "file";
      photoInput.accept = "image/png,image/jpeg,image/webp";
      photoInput.addEventListener("change", () => {
        const archivo = photoInput.files?.[0];
        if (!archivo) return;
        const lector = new FileReader();
        lector.addEventListener("load", () => actualizarApariencia({ photo: lector.result }));
        lector.readAsDataURL(archivo);
      });
      photoField.appendChild(photoInput);
      apariencia.appendChild(colorField);
      apariencia.appendChild(photoField);
      adminPanel.appendChild(apariencia);
      const equipo = crearElemento("div", "team-section");
      equipo.appendChild(crearElemento("h3", "", "Equipo comercial"));
      equipo.appendChild(crearElemento("p", "", `${usuarios.length} perfil${usuarios.length === 1 ? "" : "es"} con acceso al espacio.`));
      const teamList = crearElemento("div", "team-list");
      usuarios.forEach((usuario) => {
        const teamMember = crearElemento("div", "team-member");
        const memberAvatar = crearElemento("span", "team-member__avatar", usuario.nombre.charAt(0).toUpperCase());
        aplicarFoto(memberAvatar, usuario);
        teamMember.appendChild(memberAvatar);
        const memberCopy = crearElemento("div", "team-member__copy");
        memberCopy.appendChild(crearElemento("strong", "", usuario.nombre));
        memberCopy.appendChild(crearElemento("span", "", usuario.email));
        teamMember.appendChild(memberCopy);
        teamMember.appendChild(crearElemento("span", "team-member__role", etiquetaRol(usuario.role)));
        teamList.appendChild(teamMember);
      });
      equipo.appendChild(teamList);
      const teamMessage = crearElemento("p", "mensaje", "");
      const teamForm = crearElemento("form", "formulario team-form");
      teamForm.appendChild(crearElemento("h3", "team-form__title", "Crear nuevo perfil"));
      [["Nombre", "nombre", "text", "Nombre completo"], ["Correo", "email", "email", "correo@empresa.com"], ["Contraseña", "password", "password", "Contraseña temporal"]].forEach(([labelText, name, type, placeholder]) => {
        const field = crearElemento("div", "campo");
        field.appendChild(crearElemento("label", "campo__label", labelText));
        const fieldInput = document.createElement("input");
        fieldInput.name = name;
        fieldInput.type = type;
        fieldInput.placeholder = placeholder;
        fieldInput.required = true;
        field.appendChild(fieldInput);
        teamForm.appendChild(field);
      });
      const roleField = crearElemento("div", "campo");
      roleField.appendChild(crearElemento("label", "campo__label", "Rol"));
      const roleInput = document.createElement("select");
      roleInput.name = "role";
      [["seller", "Vendedor"], ["admin", "Administrador"]].forEach(([value, text]) => { const option = document.createElement("option"); option.value = value; option.textContent = text; roleInput.appendChild(option); });
      roleField.appendChild(roleInput);
      teamForm.appendChild(roleField);
      const createButton = crearElemento("button", "btn btn--primary team-form__button", "Crear perfil");
      createButton.type = "submit";
      teamForm.appendChild(createButton);
      teamForm.addEventListener("submit", (evento) => manejarCrearPerfil(evento, teamMessage));
      equipo.appendChild(teamForm);
      equipo.appendChild(teamMessage);
      adminPanel.appendChild(equipo);
      slide.appendChild(adminPanel);
    }
  } else {
    const cabecera = crearElemento("div", "slide__header slide__header--row");
    const copy = crearElemento("div", "");
    copy.appendChild(crearElemento("span", "slide__index", "02 / Clientes"));
    copy.appendChild(crearElemento("h1", "", "Tus relaciones, ordenadas."));
    copy.appendChild(crearElemento("p", "", "Registra, prioriza y prepara el siguiente contacto."));
    cabecera.appendChild(copy);
    slide.appendChild(cabecera);
    const mensaje = crearElemento("p", "mensaje", "Los cambios se guardan automáticamente en este dispositivo.");
    slide.appendChild(mensaje);
    const formulario = crearElemento("form", "formulario cliente-formulario");
    formulario.addEventListener("submit", (evento) => manejarEnvio(evento, mensaje));
    const campos = [
      { label: "Nombre", name: "nombre", type: "text", placeholder: "Nombre del cliente" },
      { label: "Email", name: "email", type: "email", placeholder: "correo@empresa.com" },
      { label: "Teléfono", name: "telefono", type: "text", placeholder: "+52 55 1234 5678" },
      { label: "Empresa", name: "empresa", type: "text", placeholder: "Nombre de la empresa" },
      { label: "Estatus", name: "estatus", type: "select", options: ["activo", "inactivo", "potencial"] },
      { label: "Prioridad", name: "prioridad", type: "select", options: ["baja", "media", "alta"] },
      { label: "Etiquetas", name: "etiquetas", type: "text", placeholder: "nuevo, importante, seguimiento", full: true }
    ];
    campos.forEach((campo) => {
      const envoltura = crearElemento("div", campo.full ? "campo campo--full" : "campo");
      envoltura.appendChild(crearElemento("label", "campo__label", campo.label));
      const input = campo.type === "select" ? document.createElement("select") : document.createElement("input");
      input.name = campo.name;
      input.id = campo.name;
      if (campo.type === "select") campo.options.forEach((opcion) => { const option = document.createElement("option"); option.value = opcion; option.textContent = opcion; input.appendChild(option); });
      else { input.type = campo.type; input.placeholder = campo.placeholder; }
      envoltura.appendChild(input);
      formulario.appendChild(envoltura);
    });
    const accionesForm = crearElemento("div", "acciones");
    const guardar = crearElemento("button", "btn btn--primary", "Guardar cliente");
    guardar.type = "submit";
    const limpiar = crearElemento("button", "btn btn--secondary", "Limpiar");
    limpiar.type = "button";
    limpiar.addEventListener("click", () => { formulario.reset(); clienteEditandoId = null; guardar.textContent = "Guardar cliente"; });
    accionesForm.appendChild(guardar);
    accionesForm.appendChild(limpiar);
    formulario.appendChild(accionesForm);
    slide.appendChild(formulario);
    const lista = crearElemento("div", "lista");
    lista.appendChild(crearElemento("h2", "lista__title", `${clientes.length} clientes registrados`));
    clientes.forEach((cliente) => {
      const item = crearElemento("article", "cliente");
      const info = crearElemento("div", "cliente__info");
      info.appendChild(crearElemento("div", "cliente__nombre", cliente.nombre));
      info.appendChild(crearElemento("div", "cliente__meta", `${cliente.empresa} • ${cliente.email}`));
      const etiquetas = crearElemento("div", "cliente__tags");
      cliente.etiquetas.forEach((etiqueta) => etiquetas.appendChild(crearElemento("span", "tag", etiqueta)));
      info.appendChild(etiquetas);
      info.appendChild(crearElemento("span", `badge badge--${cliente.estatus}`, cliente.estatus));
      item.appendChild(info);
      const accionesCliente = crearElemento("div", "cliente__acciones");
      const botonIA = crearElemento("button", "btn btn--secondary", cliente.ai ? "Revisar IA" : "Analizar IA");
      botonIA.type = "button";
      botonIA.addEventListener("click", async () => {
        if (!window.HwarsCRM || typeof window.HwarsCRM.analyzeClient !== "function") return;
        botonIA.disabled = true;
        botonIA.textContent = "Analizando...";
        cliente.ai = await window.HwarsCRM.analyzeClient(cliente);
        guardarClientes();
        renderizar();
      });
      const editar = crearElemento("button", "btn btn--secondary", "Editar");
      editar.type = "button";
      editar.addEventListener("click", () => prepararEdicion(cliente));
      const eliminar = crearElemento("button", "btn btn--danger", "Eliminar");
      eliminar.type = "button";
      eliminar.addEventListener("click", () => { const indice = clientes.findIndex((actual) => actual.id === cliente.id); if (indice >= 0) { clientes.splice(indice, 1); guardarClientes(); renderizar(); } });
      accionesCliente.appendChild(botonIA);
      accionesCliente.appendChild(editar);
      accionesCliente.appendChild(eliminar);
      item.appendChild(accionesCliente);
      lista.appendChild(item);
    });
    slide.appendChild(lista);
  }
  contenido.appendChild(slide);
  panel.appendChild(contenido);
  contenedorApp.appendChild(panel);
}

function renderizarUsuarios(contenedor) {
  contenedor.appendChild(crearElemento("div", "slide__index", "03 / Users"));
  contenedor.appendChild(crearElemento("h1", "", "Tu equipo comercial."));
  contenedor.appendChild(crearElemento("p", "slide__intro", "Crea perfiles y controla quién tiene acceso al espacio."));
  const teamSection = crearElemento("section", "team-section team-section--page");
  teamSection.appendChild(crearElemento("h2", "", "Usuarios del equipo"));
  teamSection.appendChild(crearElemento("p", "", `${usuarios.length} perfil${usuarios.length === 1 ? "" : "es"} con acceso al CRM.`));
  const teamList = crearElemento("div", "team-list");
  usuarios.forEach((usuario) => {
    const member = crearElemento("div", "team-member");
    const memberAvatar = crearElemento("span", "team-member__avatar", usuario.nombre.charAt(0).toUpperCase());
    aplicarFoto(memberAvatar, usuario);
    member.appendChild(memberAvatar);
    const copy = crearElemento("div", "team-member__copy");
    copy.appendChild(crearElemento("strong", "", usuario.nombre));
    copy.appendChild(crearElemento("span", "", usuario.email));
    member.appendChild(copy);
    member.appendChild(crearElemento("span", "team-member__role", etiquetaRol(usuario.role)));
    if (usuario.id !== usuarioActual.id) {
      const edit = crearElemento("button", "team-member__edit", "Editar");
      edit.type = "button";
      edit.addEventListener("click", () => editarPerfil(usuario.id));
      member.appendChild(edit);
      const remove = crearElemento("button", "team-member__remove", "Eliminar");
      remove.type = "button";
      remove.addEventListener("click", () => eliminarPerfil(usuario.id));
      member.appendChild(remove);
    }
    teamList.appendChild(member);
  });
  teamSection.appendChild(teamList);
  const mensaje = crearElemento("p", "mensaje", "");
  const form = crearElemento("form", "formulario team-form");
  form.appendChild(crearElemento("h3", "team-form__title", "Crear nuevo perfil"));
  [["Nombre", "nombre", "text", "Nombre completo"], ["Correo", "email", "email", "correo@empresa.com"], ["Contraseña", "password", "password", "Contraseña temporal"]].forEach(([labelText, name, type, placeholder]) => {
    const field = crearElemento("div", "campo");
    field.appendChild(crearElemento("label", "campo__label", labelText));
    const input = document.createElement("input");
    input.name = name; input.type = type; input.placeholder = placeholder; input.required = true;
    field.appendChild(input); form.appendChild(field);
  });
  const photoField = crearElemento("div", "campo campo--full");
  photoField.appendChild(crearElemento("label", "campo__label", "Foto del perfil"));
  const photoInput = document.createElement("input");
  photoInput.name = "photo"; photoInput.type = "file"; photoInput.accept = "image/png,image/jpeg,image/webp";
  photoField.appendChild(photoInput); form.appendChild(photoField);
  const roleField = crearElemento("div", "campo");
  roleField.appendChild(crearElemento("label", "campo__label", "Rol"));
  const roleInput = document.createElement("select");
  roleInput.name = "role";
  [["seller", "Vendedor"], ["rh", "RH"], ["compras", "Compras"], ["admin", "Administrador"]].forEach(([value, text]) => { const option = document.createElement("option"); option.value = value; option.textContent = text; roleInput.appendChild(option); });
  roleField.appendChild(roleInput); form.appendChild(roleField);
  const button = crearElemento("button", "btn btn--primary team-form__button", "Crear perfil");
  button.type = "submit"; form.appendChild(button);
  form.addEventListener("submit", (evento) => manejarCrearPerfil(evento, mensaje));
  teamSection.appendChild(form); teamSection.appendChild(mensaje); contenedor.appendChild(teamSection);
}

function renderizarConfiguracion(contenedor) {
  contenedor.appendChild(crearElemento("div", "slide__index", "04 / Config"));
  contenedor.appendChild(crearElemento("h1", "", "Conecta tu operación."));
  contenedor.appendChild(crearElemento("p", "slide__intro", "Configura WhatsApp Business para preparar tus conversaciones comerciales."));
  const panel = crearElemento("section", "config-card");
  panel.appendChild(crearElemento("span", "config-card__brand", "WhatsApp Business API"));
  panel.appendChild(crearElemento("h2", "", "Datos de conexión"));
  const aviso = crearElemento("p", "config-card__notice", "El token debe guardarse en un backend seguro antes de activar envíos reales.");
  panel.appendChild(aviso);
  const form = crearElemento("form", "formulario config-form");
  [["URL del backend", "apiUrl", "url", "https://tu-backend.com/api/whatsapp"], ["ID del número", "phoneNumberId", "text", "Phone Number ID de Meta"], ["Token de acceso", "accessToken", "password", "Token permanente de Meta"], ["ID de cuenta WhatsApp", "businessAccountId", "text", "WABA ID (opcional)"]].forEach(([labelText, name, type, placeholder]) => {
    const field = crearElemento("div", "campo");
    field.appendChild(crearElemento("label", "campo__label", labelText));
    const input = document.createElement("input");
    input.name = name; input.type = type; input.placeholder = placeholder; input.value = configuracionWhatsApp[name] || "";
    field.appendChild(input); form.appendChild(field);
  });
  const enabledField = crearElemento("label", "config-toggle");
  const enabled = document.createElement("input");
  enabled.type = "checkbox"; enabled.name = "enabled"; enabled.checked = configuracionWhatsApp.enabled === true;
  enabledField.appendChild(enabled); enabledField.appendChild(crearElemento("span", "", "Activar integración cuando el backend esté listo"));
  form.appendChild(enabledField);
  const save = crearElemento("button", "btn btn--primary config-form__button", "Guardar configuración");
  save.type = "submit"; form.appendChild(save);
  const message = crearElemento("p", "mensaje", "");
  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = new FormData(form);
    configuracionWhatsApp = { apiUrl: datos.get("apiUrl").toString().trim(), phoneNumberId: datos.get("phoneNumberId").toString().trim(), accessToken: datos.get("accessToken").toString().trim(), businessAccountId: datos.get("businessAccountId").toString().trim(), enabled: enabled.checked };
    guardarConfigWhatsApp(configuracionWhatsApp);
    message.textContent = "Configuración guardada en este dispositivo.";
  });
  panel.appendChild(form); panel.appendChild(message); contenedor.appendChild(panel);
}

function actualizarApariencia(cambios) {
  if (!usuarioActual || usuarioActual.role !== "admin") return;
  usuarioActual.appearance = { ...(usuarioActual.appearance || {}), ...cambios };
  const usuarioEnLista = usuarios.find((usuario) => usuario.id === usuarioActual.id);
  if (usuarioEnLista) usuarioEnLista.appearance = usuarioActual.appearance;
  guardarUsuarios();
  guardarSesion();
  renderizar();
}

function eliminarPerfil(id) {
  if (!usuarioActual || usuarioActual.role !== "admin" || id === usuarioActual.id) return;
  const indice = usuarios.findIndex((usuario) => usuario.id === id);
  if (indice < 0) return;
  usuarios.splice(indice, 1);
  guardarUsuarios();
  renderizar();
}

function editarPerfil(id) {
  if (!usuarioActual || usuarioActual.role !== "admin" || id === usuarioActual.id) return;
  const usuario = usuarios.find((actual) => actual.id === id);
  if (!usuario) return;
  const nombre = window.prompt("Nombre del usuario", usuario.nombre);
  if (!nombre?.trim()) return;
  const email = window.prompt("Correo del usuario", usuario.email)?.trim().toLowerCase();
  if (!email || usuarios.some((actual) => actual.id !== id && actual.email.toLowerCase() === email)) return;
  const role = window.prompt("Rol: seller, rh, compras o admin", usuario.role)?.trim().toLowerCase();
  if (!["seller", "rh", "compras", "admin"].includes(role)) return;
  const password = window.prompt("Nueva contraseña (vacío para conservarla)", "");
  usuario.nombre = nombre.trim();
  usuario.email = email;
  usuario.role = role;
  if (password?.trim()) usuario.password = password.trim();
  guardarUsuarios();
  renderizar();
}

function manejarCrearPerfil(evento, mensaje) {
  evento.preventDefault();
  if (!usuarioActual || usuarioActual.role !== "admin") return;
  const datos = new FormData(evento.target);
  const nombre = datos.get("nombre")?.toString().trim();
  const email = datos.get("email")?.toString().trim().toLowerCase();
  const password = datos.get("password")?.toString().trim();
  const rolesPermitidos = ["seller", "rh", "compras", "admin"];
  const rolSolicitado = datos.get("role")?.toString();
  const role = rolesPermitidos.includes(rolSolicitado) ? rolSolicitado : "seller";
  if (!nombre || !email || !password) return;
  if (usuarios.some((usuario) => usuario.email.toLowerCase() === email)) {
    mensaje.textContent = "Ese correo ya está registrado.";
    mensaje.className = "mensaje mensaje--error";
    return;
  }
  const guardarPerfil = (photo = "") => {
    usuarios.push({ id: Date.now(), nombre, email, password, role, appearance: photo ? { photo } : {} });
    guardarUsuarios();
    mensaje.textContent = `Perfil de ${nombre} creado correctamente.`;
    mensaje.className = "mensaje";
    renderizar();
  };
  const archivo = evento.target.elements.photo?.files?.[0];
  if (archivo) {
    const lector = new FileReader();
    lector.addEventListener("load", () => guardarPerfil(lector.result));
    lector.readAsDataURL(archivo);
  } else {
    guardarPerfil();
  }
}

function manejarAuth(evento, mensaje) {
  evento.preventDefault();
  const formulario = evento.target;
  const datos = new FormData(formulario);
  const email = datos.get("email")?.toString().trim().toLowerCase();
  const password = datos.get("password")?.toString().trim();

  if (!email || !password) {
    mensaje.textContent = "Completa todos los campos.";
    mensaje.className = "mensaje mensaje--error";
    return;
  }

  if (modoRegistro) {
    const nombre = datos.get("nombre")?.toString().trim();
    const confirmar = datos.get("confirmar")?.toString().trim();

    if (!nombre || !confirmar || password !== confirmar) {
      mensaje.textContent = "Revisa el nombre y que las contraseñas coincidan.";
      mensaje.className = "mensaje mensaje--error";
      return;
    }

    const existe = usuarios.some((usuario) => usuario.email.toLowerCase() === email);
    if (existe) {
      mensaje.textContent = "Ese correo ya está registrado.";
      mensaje.className = "mensaje mensaje--error";
      return;
    }

    const nuevoUsuario = { id: Date.now(), nombre, email, password, role: "seller" };
    usuarios.push(nuevoUsuario);
    guardarUsuarios();
    usuarioActual = { ...nuevoUsuario };
    guardarSesion();
    modoRegistro = false;
    renderizar();
    return;
  }

  const usuarioEncontrado = usuarios.find((usuario) => usuario.email.toLowerCase() === email && usuario.password === password);
  if (!usuarioEncontrado) {
    mensaje.textContent = "Correo o contraseña incorrectos.";
    mensaje.className = "mensaje mensaje--error";
    return;
  }

  usuarioActual = { ...usuarioEncontrado };
  guardarSesion();
  renderizar();
}

function manejarCambioCorreo(evento, mensaje) {
  evento.preventDefault();
  const formulario = evento.target;
  const datos = new FormData(formulario);
  const emailNuevo = datos.get("email")?.toString().trim().toLowerCase();

  if (!emailNuevo || !emailNuevo.includes("@")) {
    mensaje.textContent = "Introduce un correo válido.";
    mensaje.className = "mensaje mensaje--error";
    return;
  }

  const duplicado = usuarios.some((usuario) => usuario.id !== usuarioActual.id && usuario.email.toLowerCase() === emailNuevo);
  if (duplicado) {
    mensaje.textContent = "Ese correo ya está en uso.";
    mensaje.className = "mensaje mensaje--error";
    return;
  }

  const usuarioEnLista = usuarios.find((usuario) => usuario.id === usuarioActual.id);
  if (usuarioEnLista) {
    usuarioEnLista.email = emailNuevo;
    guardarUsuarios();
  }

  usuarioActual.email = emailNuevo;
  guardarSesion();
  mensaje.textContent = "Correo actualizado correctamente.";
  mensaje.className = "mensaje";
  renderizar();
}

// Guarda un cliente nuevo o actualiza uno existente al enviar el formulario
function manejarEnvio(evento, mensaje) {
  evento.preventDefault();
  const formulario = evento.target;
  const datos = new FormData(formulario);

  const nombre = datos.get("nombre")?.toString().trim();
  const email = datos.get("email")?.toString().trim();
  const telefono = datos.get("telefono")?.toString().trim();
  const empresa = datos.get("empresa")?.toString().trim();
  const estatus = datos.get("estatus")?.toString().trim();
  const prioridad = datos.get("prioridad")?.toString().trim();
  const etiquetasTexto = datos.get("etiquetas")?.toString().trim();

  if (!nombre || !email) {
    mensaje.textContent = "Completa al menos el nombre y el email.";
    mensaje.className = "mensaje mensaje--error";
    return;
  }

  const etiquetas = etiquetasTexto
    ? etiquetasTexto.split(",").map((valor) => valor.trim()).filter(Boolean)
    : [];

  if (clienteEditandoId) {
    const cliente = clientes.find((item) => item.id === clienteEditandoId);
    if (cliente) {
      cliente.nombre = nombre;
      cliente.email = email;
      cliente.telefono = telefono;
      cliente.empresa = empresa;
      cliente.estatus = estatus;
      cliente.prioridad = prioridad;
      cliente.etiquetas = etiquetas;
    }
  } else {
    clientes.push({
      id: Date.now(),
      nombre,
      email,
      telefono,
      empresa,
      estatus,
      prioridad,
      etiquetas
    });
  }

  guardarClientes();
  clienteEditandoId = null;
  renderizar();
}

// Carga los datos de un cliente en el formulario para editarlo
function prepararEdicion(cliente) {
  clienteEditandoId = cliente.id;
  slideActual = "clientes";
  renderizar();
  const formulario = document.querySelector(".cliente-formulario");
  if (!formulario) return;

  const campos = formulario.elements;
  campos.nombre.value = cliente.nombre || "";
  campos.email.value = cliente.email || "";
  campos.telefono.value = cliente.telefono || "";
  campos.empresa.value = cliente.empresa || "";
  campos.estatus.value = cliente.estatus || "activo";
  campos.prioridad.value = cliente.prioridad || "media";
  campos.etiquetas.value = (cliente.etiquetas || []).join(", ");

  const botonGuardar = document.querySelector(".btn--primary");
  if (botonGuardar) {
    botonGuardar.textContent = "Actualizar cliente";
  }

  const mensaje = document.querySelector(".mensaje");
  if (mensaje) {
    mensaje.textContent = `Editando: ${cliente.nombre}`;
    mensaje.className = "mensaje";
  }
}

renderizar();
