// app.js - CON SIMULACIÓN DE LOGIN
const API_BASE = 'http://localhost:3000/api';

// ===== DATOS DE USUARIOS FALSOS (SIMULACIÓN) =====
const users = [
    { email: 'admin@etag.com', password: 'admin123', name: 'Administrador' },
    { email: 'tienda@ejemplo.com', password: 'cliente123', name: 'Cliente Demo' },
    { email: 'test@test.com', password: 'test', name: 'Usuario Test' }
];

// ===== FUNCIÓN PARA MOSTRAR MENSAJES =====
function showMessage(text, type = 'info') {
    // Crear un mensaje simple de alerta
    alert(`${type.includes('error') ? '❌' : '✅'} ${text}`);
}

// ===== 1. FUNCIÓN PRINCIPAL AL CARGAR =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("Página cargada. Verificando autenticación...");
    inicializarApp();
    configurarModal();
});

// ===== 2. LOGIN SIMULADO =====
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Buscamos el usuario en nuestra "base de datos" falsa
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // ✔️ Login exitoso - Simulamos un token
            const fakeToken = 'fake-jwt-token-' + Math.random().toString(36).substr(2);
            
            localStorage.setItem('authToken', fakeToken);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', user.name);
            
            showMessage('✅ ¡Login exitoso! Redirigiendo...', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            // ❌ Login fallido
            showMessage('❌ Email o contraseña incorrectos', 'error');
        }
    });
}

// ===== 3. LOGOUT =====
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.location.href = 'index.html';
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

// ===== 4. CARGAR PRODUCTOS =====
async function loadProducts() {
    const tableBody = document.getElementById('productsTableBody');
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando productos...</td></tr>';
    }

    try {
        const response = await fetch(`${API_BASE}/products`);
        
        if (response.ok) {
            const products = await response.json();
            renderProducts(products);
        } else {
            // Si falla, mostramos productos de ejemplo
            showMessage('⚠️ Usando datos de ejemplo', 'info');
            const exampleProducts = [
                { id: 1, name: "LECHE 1L", price: 1300, promo: "10% hoy", etiqueta_id: "ETIQ_001" },
                { id: 2, name: "PAN", price: 800, promo: "", etiqueta_id: "ETIQ_002" },
                { id: 3, name: "AZÚCAR", price: 600, promo: "2x1", etiqueta_id: "ETIQ_003" }
            ];
            renderProducts(exampleProducts);
        }
    } catch (error) {
        console.error("Error:", error);
        showMessage('❌ Error de conexión. Mostrando datos locales.', 'error');
        // Datos de emergencia
        const localProducts = [
            { id: 1, name: "LECHE 1L", price: 1300, promo: "10% hoy", etiqueta_id: "ETIQ_001" },
            { id: 2, name: "YERBA 500g", price: 1200, promo: "", etiqueta_id: "ETIQ_002" }
        ];
        renderProducts(localProducts);
    }
}

// ===== 5. RENDER PRODUCTOS =====
function renderProducts(products) {
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) {
        console.error('No se encontró la tabla de productos');
        return;
    }

    if (!products || products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay productos. ¡Agrega uno nuevo!</td></tr>';
        return;
    }

    tableBody.innerHTML = '';
    products.forEach(product => {
        const row = document.createElement('tr');
        
        // Convertir el producto a string seguro para HTML
        const productSafe = JSON.stringify(product)
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
        
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>$${product.price}</td>
            <td>${product.promo || '-'}</td>
            <td>${product.etiqueta_id || 'No asignada'}</td>
            <td>
                <button class="btn btn-sm btn-warning me-2" onclick="abrirModalEditar(${productSafe})">
                    Editar
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${product.id})">
                    Eliminar
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ===== 6. FUNCIONES DE MODAL =====
function abrirModalEditar(producto) {
    console.log('Abriendo modal para editar:', producto);
    
    // Llenar el formulario
    document.getElementById('productId').value = producto.id;
    document.getElementById('productName').value = producto.name;
    document.getElementById('productPrice').value = producto.price;
    document.getElementById('productPromo').value = producto.promo || '';
    document.getElementById('productEtiquetaId').value = producto.etiqueta_id || '';
    
    // Cambiar título
    document.getElementById('modalTitle').textContent = 'Editar Producto';
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

function abrirModalNuevo() {
    console.log('Abriendo modal para nuevo producto');
    
    // Limpiar formulario
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    
    // Cambiar título
    document.getElementById('modalTitle').textContent = 'Nuevo Producto';
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

async function guardarProducto() {
    const productId = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        promo: document.getElementById('productPromo').value,
        etiqueta_id: document.getElementById('productEtiquetaId').value
    };

    console.log('Guardando producto:', productData);

    const url = productId ? `${API_BASE}/products/${productId}` : `${API_BASE}/products`;
    const method = productId ? 'PUT' : 'POST';

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            // ✅ Cerrar modal CORRECTAMENTE
            cerrarModalCompleto();
            
            showMessage('✅ Producto guardado correctamente', 'success');
            loadProducts(); // Recargar lista
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al guardar');
        }
    } catch (error) {
        console.error('Error guardando producto:', error);
        showMessage('❌ Error: ' + error.message, 'error');
    }
}

async function eliminarProducto(productId) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showMessage('✅ Producto eliminado', 'success');
            loadProducts(); // Recargar lista
        } else {
            throw new Error('Error al eliminar');
        }
    } catch (error) {
        console.error('Error eliminando producto:', error);
        showMessage('❌ Error al eliminar', 'error');
    }
}

// ===== 7. FUNCIÓN MEJORADA PARA CERRAR MODAL =====
function cerrarModalCompleto() {
    const modalElement = document.getElementById('productModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    
    if (modal) {
        modal.hide();
    }
    
    // Limpieza completa del backdrop
    setTimeout(() => {
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
    }, 100);
}

// ===== 8. CONFIGURACIÓN INICIAL =====
function inicializarApp() {
    if (window.location.pathname.endsWith('dashboard.html')) {
        const token = localStorage.getItem('authToken');
        const userEmail = localStorage.getItem('userEmail');
        
        if (!token || !userEmail) {
            alert("❌ Debes iniciar sesión primero.");
            window.location.href = 'index.html';
            return;
        }
        loadProducts();
        
        // Mostrar info usuario
        const userName = localStorage.getItem('userName');
        const welcomeElement = document.getElementById('userWelcome');
        if (userName && welcomeElement) {
            welcomeElement.textContent = `Hola, ${userName}`;
        }
    }

    if (window.location.pathname.endsWith('index.html')) {
        const token = localStorage.getItem('authToken');
        if (token) window.location.href = 'dashboard.html';
    }
}

function configurarModal() {
    // Formulario
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            guardarProducto();
        });
    }

    // Botón nuevo producto
    const nuevoBtn = document.querySelector('[data-bs-target="#productModal"]');
    if (nuevoBtn) nuevoBtn.addEventListener('click', abrirModalNuevo);

    // Botones de cierre
    const cancelBtn = document.querySelector('#productModal .btn-secondary');
    const closeBtn = document.querySelector('#productModal .btn-close');
    
    if (cancelBtn) cancelBtn.addEventListener('click', cerrarModalCompleto);
    if (closeBtn) closeBtn.addEventListener('click', cerrarModalCompleto);

    // Limpiar al cerrar
    const modalElement = document.getElementById('productModal');
    if (modalElement) {
        modalElement.addEventListener('hidden.bs.modal', function() {
            document.getElementById('productForm').reset();
            document.getElementById('productId').value = '';
            document.getElementById('modalTitle').textContent = 'Nuevo Producto';
        });
    }
}

// ===== 9. FUNCIÓN DE EMERGENCIA =====
function limpiarModal() {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.querySelectorAll('.modal.show').forEach(modal => {
        modal.classList.remove('show');
        modal.style.display = 'none';
    });
}

// ===== 10. HACER FUNCIONES GLOBALES =====
// Para que los onclick en HTML funcionen
window.abrirModalEditar = abrirModalEditar;
window.eliminarProducto = eliminarProducto;
window.limpiarModal = limpiarModal;