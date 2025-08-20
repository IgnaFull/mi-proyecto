const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const mqttHandler = require('./mqtt_handler');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para el dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Ruta para el simulador
app.get('/simulator', (req, res) => {
    res.sendFile(path.join(__dirname, 'simulator.html'));
});

// Rutas API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/etiquetas', require('./routes/etiquetas'));
app.use('/api/simulator', require('./endpoints'));

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'eTag Server running' });
});

// Manejar actualizaciones de productos
app.post('/api/update-price', async (req, res) => {
    try {
        const { productId, newPrice, etiquetaId } = req.body;
        db.run(
            'UPDATE products SET price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newPrice, productId],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                mqttHandler.publishToEtiqueta(etiquetaId, {
                    type: 'PRICE_UPDATE',
                    productId: productId,
                    price: newPrice,
                    action: 'UPDATE'
                });
                res.json({ 
                    success: true, 
                    message: 'Precio actualizado y notificación enviada' 
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== RUTAS PARA PRODUCTOS =====

// GET todos los productos
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// GET producto por ID
app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    
    db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json(row);
    });
});

// POST crear nuevo producto
app.post('/api/products', (req, res) => {
    const { name, price, promo, etiqueta_id, user_id } = req.body;
    
    db.run(
        'INSERT INTO products (name, price, promo, etiqueta_id, user_id) VALUES (?, ?, ?, ?, ?)',
        [name, price, promo, etiqueta_id, user_id || null],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ 
                id: this.lastID, 
                message: 'Producto creado correctamente' 
            });
        }
    );
});

// PUT actualizar producto
app.put('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const { name, price, promo, etiqueta_id } = req.body;
    
    db.run(
        'UPDATE products SET name = ?, price = ?, promo = ?, etiqueta_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, price, promo, etiqueta_id, productId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            
            res.json({ 
                success: true, 
                message: 'Producto actualizado correctamente' 
            });
        }
    );
});

// DELETE eliminar producto ← ESTA ES LA QUE FALTA
app.delete('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    
    db.run('DELETE FROM products WHERE id = ?', [productId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json({ 
            success: true, 
            message: 'Producto eliminado correctamente' 
        });
    });
});

// Eliminar producto
app.delete('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    
    db.run('DELETE FROM products WHERE id = ?', [productId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json({ 
            success: true, 
            message: 'Producto eliminado correctamente' 
        });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});

