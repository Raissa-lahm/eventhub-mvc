const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginLimiter } = require('../middlewares/rateLimit');
const { verificarTokenCsrf } = require('../middlewares/csrf');

router.get('/cadastro', authController.telaCadastro);
router.post('/cadastro', verificarTokenCsrf, authController.cadastrar);
router.get('/login', authController.telaLogin);
router.post('/login', verificarTokenCsrf, loginLimiter, authController.login);
router.get('/logout', authController.logout);

module.exports = router;
