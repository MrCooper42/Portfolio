`use strict`;

const express = require('express');
const router = express.Router();

const API = require('../api/dice.js')

router.get('/', (req, res, next) => res.send('API Works'));

module.exports = router;
