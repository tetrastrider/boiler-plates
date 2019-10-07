const express = require('express');
const router = express.Router();

const recibos = require('../controllers/recibos.controller');

const rec = new recibos;

router.get('/',rec.getAll.bind(rec));
router.post('/',rec.create.bind(rec));
router.get('/:id',rec.getOne.bind(rec));
router.put('/:id',rec.edit.bind(rec));
router.delete('/:id',rec.delete.bind(rec));

module.exports = router;