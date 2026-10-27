// 1. Estado global del catálogo y del carrito
let catalogoProductos = [];
let carritoLumen = JSON.parse(localStorage.getItem("carritoLumen")) || [];

// 2. Selección de nodos del DOM
const contenedorProductos = document.getElementById("contenedor-productos");
const contenedorCarrito = document.getElementById("contenedor-carrito");
const totalCarritoTexto = document.getElementById("total-carrito");
const btnVaciar = document.getElementById("btn-vaciar");
const btnFinalizar = document.getElementById("btn-finalizar");
const inputBusqueda = document.getElementById("input-busqueda");
const filtroCategoria = document.getElementById("filtro-categoria");
const mensajePromo = document.getElementById("mensaje-promo");

// 3. Manejo de Storage
function guardarCarritoEnStorage() {
  try {
    localStorage.setItem("carritoLumen", JSON.stringify(carritoLumen));
  } catch (error) {
    Toastify({
      text: "Error al sincronizar el carrito.",
      duration: 2500,
      gravity: "bottom",
      position: "right",
      style: { background: "#c0392b" }
    }).showToast();
  }
}

// 4. Carga asincrónica desde data.json con fetch y async/await
async function cargarCatalogoLumen() {
  if (contenedorProductos) {
    contenedorProductos.innerHTML = "<p>Cargando productos de LUMEN...</p>";
  }

  try {
    const respuesta = await fetch("./data.json");
    if (!respuesta.ok) {
      throw new Error("No se pudo obtener el archivo data.json");
    }

    catalogoProductos = await respuesta.json();
    renderizarProductos(catalogoProductos);

    Toastify({
      text: "Catálogo cargado con éxito",
      duration: 2500,
      gravity: "bottom",
      position: "right",
      style: { background: "#27ae60" }
    }).showToast();

  } catch (error) {
    if (contenedorProductos) {
      contenedorProductos.innerHTML = "<p>No pudimos cargar los productos en este momento.</p>";
    }
    Swal.fire({
      icon: "error",
      title: "Error de carga",
      text: "Ocurrió un inconveniente al cargar el catálogo de productos."
    });
  }
}

// 5. Renderizado del catálogo en el DOM
function renderizarProductos(lista) {
  if (!contenedorProductos) return;
  contenedorProductos.innerHTML = "";

  if (lista.length === 0) {
    contenedorProductos.innerHTML = "<p>No se encontraron productos coincidentes.</p>";
    return;
  }

  lista.forEach((producto) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-producto";

    tarjeta.innerHTML =
      "<h3>" + producto.nombre + "</h3>" +
      "<p><strong>Categoría:</strong> " + producto.categoria + "</p>" +
      "<p><strong>Precio:</strong> $" + producto.precio + "</p>" +
      "<p><strong>Stock disponible:</strong> " + producto.stock + " unidades</p>";

    const botonAgregar = document.createElement("button");
    botonAgregar.className = "btn-primario";
    botonAgregar.textContent = "Agregar al carrito";
    botonAgregar.addEventListener("click", () => {
      agregarAlCarrito(producto);
    });

    tarjeta.appendChild(botonAgregar);
    contenedorProductos.appendChild(tarjeta);
  });
}

// 6. Agregar producto al carrito con alertas
function agregarAlCarrito(producto) {
  const itemExistente = carritoLumen.find((item) => item.id === producto.id);

  if (itemExistente) {
    if (itemExistente.cantidad < producto.stock) {
      itemExistente.cantidad = itemExistente.cantidad + 1;
      Toastify({
        text: "Sumaste otra unidad de " + producto.nombre,
        duration: 2000,
        gravity: "bottom",
        position: "right",
        style: { background: "#2980b9" }
      }).showToast();
    } else {
      Swal.fire({
        icon: "warning",
        title: "Stock máximo alcanzado",
        text: "No disponemos de más unidades para " + producto.nombre + "."
      });
      return;
    }
  } else {
    carritoLumen.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1
    });

    Toastify({
      text: producto.nombre + " agregado al carrito",
      duration: 2000,
      gravity: "bottom",
      position: "right",
      style: { background: "#16a085" }
    }).showToast();
  }

  guardarCarritoEnStorage();
  renderizarCarrito();
}

// 7. Quitar una unidad o eliminar ítem del carrito
function quitarDelCarrito(idProducto) {
  const item = carritoLumen.find((producto) => producto.id === idProducto);

  if (item) {
    if (item.cantidad > 1) {
      item.cantidad = item.cantidad - 1;
    } else {
      carritoLumen = carritoLumen.filter((producto) => producto.id !== idProducto);
    }

    Toastify({
      text: "Actualizaste la cantidad en el carrito",
      duration: 1500,
      gravity: "bottom",
      position: "right",
      style: { background: "#7f8c8d" }
    }).showToast();
  }

  guardarCarritoEnStorage();
  renderizarCarrito();
}

// 8. Renderizar el carrito en pantalla y calcular el total con reduce
function renderizarCarrito() {
  if (!contenedorCarrito) return;
  contenedorCarrito.innerHTML = "";

  if (carritoLumen.length === 0) {
    contenedorCarrito.innerHTML = "<p>Tu carrito está vacío.</p>";
    if (totalCarritoTexto) {
      totalCarritoTexto.textContent = "0";
    }
    return;
  }

  // Cálculo del total con reduce en una línea
  const totalAcumulado = carritoLumen.reduce((acumulador, item) => acumulador + (item.precio * item.cantidad), 0);

  carritoLumen.forEach((item) => {
    const subtotal = item.precio * item.cantidad;

    const filaCarrito = document.createElement("div");
    filaCarrito.className = "item-carrito";

    filaCarrito.innerHTML =
      "<p><strong>" + item.nombre + "</strong> - Cantidad: " + item.cantidad + " - Subtotal: $" + subtotal + "</p>";

    const botonQuitar = document.createElement("button");
    botonQuitar.className = "btn-secundario";
    botonQuitar.textContent = "Quitar";
    botonQuitar.addEventListener("click", () => {
      quitarDelCarrito(item.id);
    });

    filaCarrito.appendChild(botonQuitar);
    contenedorCarrito.appendChild(filaCarrito);
  });

  if (totalCarritoTexto) {
    totalCarritoTexto.textContent = totalAcumulado;
  }
}

// 9. Vaciar carrito completo con SweetAlert2
function vaciarCarrito() {
  if (carritoLumen.length === 0) {
    Toastify({
      text: "El carrito ya está vacío.",
      duration: 2000,
      gravity: "bottom",
      position: "right",
      style: { background: "#7f8c8d" }
    }).showToast();
    return;
  }

  Swal.fire({
    title: "¿Querés vaciar el carrito?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#c0392b",
    cancelButtonColor: "#7f8c8d",
    confirmButtonText: "Sí, vaciar",
    cancelButtonText: "Cancelar"
  }).then((resultado) => {
    if (resultado.isConfirmed) {
      carritoLumen = [];
      guardarCarritoEnStorage();
      renderizarCarrito();

      Swal.fire({
        icon: "success",
        title: "Carrito vaciado",
        text: "Se eliminaron todos los productos de tu carrito."
      });
    }
  });
}

// 10. Finalizar compra (Checkout con confirmación SweetAlert2)
function finalizarCompra() {
  if (carritoLumen.length === 0) {
    Swal.fire({
      icon: "info",
      title: "Carrito vacío",
      text: "Agregá productos antes de finalizar tu compra."
    });
    return;
  }

  Swal.fire({
    icon: "success",
    title: "¡Gracias por tu compra en LUMEN!",
    text: "Tu pedido fue registrado con éxito. Te esperamos pronto."
  });

  carritoLumen = [];
  guardarCarritoEnStorage();
  renderizarCarrito();
}

// 11. Filtrar catálogo por texto y categoría combinados
function aplicarFiltros() {
  const termino = inputBusqueda.value.toLowerCase().trim();
  const categoriaSeleccionada = filtroCategoria ? filtroCategoria.value : "todas";

  const filtrados = catalogoProductos.filter((producto) => {
    const coincideNombre = producto.nombre.toLowerCase().includes(termino);
    const coincideCategoria = categoriaSeleccionada === "todas" || producto.categoria === categoriaSeleccionada;
    return coincideNombre && coincideCategoria;
  });

  renderizarProductos(filtrados);
}

// 12. Inicialización de eventos y carga de datos
if (btnVaciar) btnVaciar.addEventListener("click", vaciarCarrito);
if (btnFinalizar) btnFinalizar.addEventListener("click", finalizarCompra);
if (inputBusqueda) inputBusqueda.addEventListener("input", aplicarFiltros);
if (filtroCategoria) filtroCategoria.addEventListener("change", aplicarFiltros);

renderizarCarrito();
cargarCatalogoLumen();
