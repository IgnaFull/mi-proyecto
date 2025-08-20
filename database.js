const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt'); // ← Agregar esta línea

const dbPath = path.join(__dirname, 'etag.db');
const db = new sqlite3.Database(dbPath);

// Crear tablas
db.serialize(() => {
    // Tabla de usuarios
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de productos
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        promo TEXT,
        etiqueta_id TEXT UNIQUE,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Insertar usuario demo CON CONTRASEÑA HASHEADA
    const password = 'admin123';
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
        } else {
            db.run(`INSERT OR IGNORE INTO users (email, password, name) 
                    VALUES (?, ?, ?)`, 
                    ['admin@etag.com', hashedPassword, 'Administrador']);
        }
    });
});

module.exports = db;