const express = require('express');
const router = express.Router();

const facturas = require('../controllers/facturas.controller');

const fact = new facturas;

router.get('/',fact.getAll.bind(fact));
router.post('/',fact.create.bind(fact));
router.get('/:id',fact.getOne.bind(fact));
router.put('/:id',fact.edit.bind(fact));
router.delete('/:id',fact.delete.bind(fact));

module.exports = router;