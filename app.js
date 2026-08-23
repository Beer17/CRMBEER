const contenedorApp = document.getElementById("app");

const clientes = [
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

let clienteEditandoId = null;

function crearElemento(tag, clase, texto = "") {
  const elemento = document.createElement(tag);
  if (clase) elemento.className = clase;
  if (texto) elemento.textContent = texto;
  return elemento;
}

function renderizar() {
  contenedorApp.innerHTML = "";

  const panel = crearElemento("section", "panel");

  const header = crearElemento("div", "panel__header");
  header.appendChild(crearElemento("h1", "", "CRM básico y personalizable"));
  header.appendChild(crearElemento("p", "", "Añade clientes, cambia etiquetas y adapta los campos a tu flujo."));
  panel.appendChild(header);

  const mensaje = crearElemento("p", "mensaje", "Etiqueta de ejemplo: nombre, email, empresa, estatus y prioridad.");
  panel.appendChild(mensaje);

  const formulario = crearElemento("form", "formulario");
  formulario.addEventListener("submit", manejarEnvio);

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

    if (campo.name === "etiquetas") {
      input.value = "";
    }

    contenedor.appendChild(label);
    contenedor.appendChild(input);
    formulario.appendChild(contenedor);

    if (campo.name === "nombre") {
      input.dataset.nombre = "campo-principal";
    }
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
      const botonEditar = crearElemento("button", "btn btn--secondary", "Editar");
      botonEditar.type = "button";
      botonEditar.addEventListener("click", () => prepararEdicion(cliente));

      const botonEliminar = crearElemento("button", "btn btn--danger", "Eliminar");
      botonEliminar.type = "button";
      botonEliminar.addEventListener("click", () => {
        const indice = clientes.findIndex((item) => item.id === cliente.id);
        if (indice >= 0) {
          clientes.splice(indice, 1);
          renderizar();
        }
      });

      accionesCliente.appendChild(botonEditar);
      accionesCliente.appendChild(botonEliminar);

      item.appendChild(info);
      item.appendChild(accionesCliente);
      lista.appendChild(item);
    });
  }

  panel.appendChild(lista);
  contenedorApp.appendChild(panel);
}

function manejarEnvio(evento) {
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
    const mensaje = document.querySelector(".mensaje");
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

  clienteEditandoId = null;
  renderizar();
}

function prepararEdicion(cliente) {
  clienteEditandoId = cliente.id;
  renderizar();
  const formulario = document.querySelector(".formulario");
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