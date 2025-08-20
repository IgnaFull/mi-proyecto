const express = require('express');
const db = require('../database');
const router = express.Router();

// Login simplificado
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (row) {
                res.json({
                    success: true,
                    user: {
                        id: row.id,
                        email: row.email,
                        name: row.name
                    },
                    // En producción usar JWT tokens
                    token: 'fake-jwt-token-' + row.id
                });
            } else {
                res.status(401).json({ 
                    success: false, 
                    message: 'Credenciales inválidas' 
                });
            }
        }
    );
});

module.exports = router;