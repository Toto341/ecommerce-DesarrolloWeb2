const URL_JSON = 'js/productos.json';
divProductos = document.getElementById('divProductos');

const miCarrito = 'carritoPizzeria';
const contadorCarritoElemento = document.getElementById('contador-carrito');

document.addEventListener('DOMContentLoaded', () => {
    
    desplegarProductos();
    const carritoInicial = obtenerCarrito();
    actualizarContadorCarrito(carritoInicial);
    renderizarCarrito();
});

async function desplegarProductos() {

    try {

        const respuesta = await fetch(URL_JSON);
    
        if (!respuesta.ok) {
            throw new Error(`Error de red o archivo no encontrado: ${respuesta.status}`);
        }
    
        const productos = await respuesta.json();
        productosGlobal = productos;
    
        productos.forEach(producto => {

            const cardHTML = `

                        <!-- Card -->
                        <div class="col-sm-3 mb-5" data-id="${producto.id}" data-tipo="${producto.tipo}">
                            
                        <img src="data:image/jpeg;base64,${producto.imagen}" class="card-img-top rounded" alt="${producto.descripcion_breve}">
                            
                            <div class="card-body">
                                
                                <h5 class="mt-3">${producto.nombre}</h5>
                                
                                <p class="cardDescrip">${producto.descripcion_breve}</p>
                                
                                <div class="mb-3">
                                    Precio: <strong>$${producto.precio.toFixed(2)}</strong>
                                </div>
                                
                                <button 
                                    class="btn btn-success btn-sm rounded w-100" 
                                    data-producto-id="${producto.id}"
                                    data-nombre="${producto.nombre}"
                                    data-precio="${producto.precio.toFixed(2)}"
                                    onclick="agregarPorID(${producto.id})">
                                    QUIERO UNA
                                </button>
                            </div>
                        </div>
                        <!-- /Card -->`;
                
                divProductos.insertAdjacentHTML('beforeend', cardHTML);            

        });

    } catch (error) {

        console.error("❌ Hubo un problema al procesar los productos:", error);
    }
}

function obtenerCarrito() {

    const carritoJSON = localStorage.getItem(miCarrito);
    return carritoJSON ? JSON.parse(carritoJSON) : [];
}

function guardarCarrito(carrito) {
    localStorage.setItem(miCarrito, JSON.stringify(carrito));
    actualizarContadorCarrito(carrito);
    renderizarCarrito(); 
}

function actualizarContadorCarrito(carrito) {
    const totalItems = carrito.reduce((acumulado, producto) => acumulado + producto.cantidad, 0);
    contadorCarritoElemento.textContent = totalItems;
}

function agregarAlCarrito(nuevoProducto) {

    let carrito = obtenerCarrito();
    
    const productoExistente = carrito.find(item => item.id === nuevoProducto.id);

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({
            id: nuevoProducto.id,
            nombre: nuevoProducto.nombre,
            precio: nuevoProducto.precio,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);

    Toastify({

        text: "Producto agregado al carrito",
        
        duration: 2000,
        close: true,
        gravity: "bottom",
        position: "right",
                
        className: "toastify-verde-exito"
        
    }).showToast();
}

function agregarPorID(productoId) {

    const productoCompleto = productosGlobal.find(p => p.id === productoId);
    
    if (productoCompleto) {

        const productoParaCarrito = {
            id: productoCompleto.id,
            nombre: productoCompleto.nombre,
            precio: parseFloat(productoCompleto.precio), 
        };
        
        agregarAlCarrito(productoParaCarrito);
        
    } else {
        console.error("Error: Producto con ID " + productoId + " no encontrado.");
    }
}

const listaItemsCarritoElemento = document.getElementById('lista-items-carrito');
const totalMontoElemento = document.getElementById('total-monto');

function renderizarCarrito() {
    const carrito = obtenerCarrito();
    let contenidoHTML = '';
    let total = 0;

    if (carrito.length === 0) {
        contenidoHTML = '<p class="text-center text-muted">El carrito está vacío. ¡Añade tu primera porción!</p>';
    } else {
        carrito.forEach(item => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;

            contenidoHTML += `

                <div class="item-carrito d-flex justify-content-between align-items-center py-1 border-bottom">
                        
                        <div class="item-info me-auto" style="width: 60%;">

                        <p class="mb-0 text-start"><strong>${item.nombre}</strong></p>
                        <p class="text-muted small mb-0">$${item.precio.toFixed(2)} x ${item.cantidad}</p>
                    </div>
                    
                    <div class="item-acciones d-flex align-items-center px-0 mx-0">

                        <p class="mb-0 me-3"><strong>$${subtotal.toFixed(2)}</strong></p>

                        <a  href="javascript:quitarItemDelCarrito(${item.id})" 
                            id="contador-carrito" 
                            class="badge bg-danger p-2">

                            <i class="fas fa-times"></i>
                        </a>

                    </div>
                </div>
            `;
        });
    }

    listaItemsCarritoElemento.innerHTML = contenidoHTML;
    totalMontoElemento.textContent = `$${total.toFixed(2)}`;
}

function vaciarCarrito() {
    carrito = [];
    guardarCarrito(carrito);
}

function quitarItemDelCarrito(productoId) {

    let carrito = obtenerCarrito();

    carrito = carrito.filter(item => item.id !== productoId);
    guardarCarrito(carrito); 

    Toastify({
        text: "Producto eliminado del carrito.",
        duration: 3000, 
        gravity: "bottom", 
        position: "right", 
        style: {
            backgroundColor: "#dc3545", 
        }
    }).showToast();
}

function finalizarCompra() {

    Swal.fire({
        title: "Finalizar compra",
        text: "Gracias por comprar en La 8va Porción",
        icon: "success"
    });

    vaciarCarrito();    
}