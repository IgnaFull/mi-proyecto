const express = require('express');
const db = require('../database');
const mqttHandler = require('../mqtt_handler');
const router = express.Router();

// Get all products
router.get('/', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Create new product
router.post('/', (req, res) => {
    const { name, price, promo, etiqueta_id } = req.body;

    db.run(
        `INSERT INTO products (name, price, promo, etiqueta_id) 
         VALUES (?, ?, ?, ?)`,
        [name, price, promo, etiqueta_id],
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

// Update product
router.put('/:id', (req, res) => {
    const { name, price, promo } = req.body;
    const productId = req.params.id;

    db.run(
        `UPDATE products SET name = ?, price = ?, promo = ? WHERE id = ?`,
        [name, price, promo, productId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Notificar a la etiqueta via MQTT
            db.get(
                'SELECT etiqueta_id FROM products WHERE id = ?',
                [productId],
                (err, row) => {
                    if (row && row.etiqueta_id) {
                        mqttHandler.publishToEtiqueta(row.etiqueta_id, {
                            type: 'PRODUCT_UPDATE',
                            productId: productId,
                            name: name,
                            price: price,
                            promo: promo,
                            action: 'UPDATE'
                        });
                    }
                }
            );

            res.json({ message: 'Producto actualizado correctamente' });
        }
    );
});

module.exports = router;