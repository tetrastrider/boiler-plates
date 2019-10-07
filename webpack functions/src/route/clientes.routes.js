const express = require('express');
const router = express.Router();

const clientes = require('../controllers/clientes.controller');

const cont = new clientes;

router.get('/',cont.getAll.bind(cont));
router.post('/',cont.create.bind(cont));
router.get('/:id',cont.getOne.bind(cont));
router.put('/:id',cont.edit.bind(cont));
router.delete('/:id',cont.delete.bind(cont)); 

module.exports = router;