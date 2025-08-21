// routes/etiquetas.js
const express = require('express');
const router = express.Router();

// Ruta de ejemplo para etiquetas
router.get('/', (req, res) => {
  res.json({ message: 'Ruta de etiquetas funcionando' });
});

module.exports = router;