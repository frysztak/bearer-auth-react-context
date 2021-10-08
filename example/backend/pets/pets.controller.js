const express = require('express');
const router = express.Router();
const authorize = require("_middleware/authorize");
const petService = require('./pet.service');

router.get('/pet', authorize(), getPet);

function getPet(req, res, next) {
    res.json(petService.getPet());
}

module.exports = router;
