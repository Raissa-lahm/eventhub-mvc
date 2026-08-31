const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const inscricaoController = require('../controllers/inscricaoController');
const { estaAutenticado, ehOrganizador } = require('../middlewares/auth');
const { verificarTokenCsrf } = require('../middlewares/csrf');

// Rotas públicas
router.get('/', eventoController.listar);
router.get('/:id', eventoController.detalhes);

// Rotas do organizador (criação/edição/exclusão de eventos)
router.get('/novo/formulario', estaAutenticado, ehOrganizador, eventoController.telaCriar);
router.post('/novo', estaAutenticado, ehOrganizador, verificarTokenCsrf, eventoController.criar);
router.get('/:id/editar', estaAutenticado, ehOrganizador, eventoController.telaEditar);
router.post('/:id/editar', estaAutenticado, ehOrganizador, verificarTokenCsrf, eventoController.atualizar);
router.post('/:id/excluir', estaAutenticado, ehOrganizador, verificarTokenCsrf, eventoController.remover);
router.get('/:id/inscritos', estaAutenticado, ehOrganizador, eventoController.listarInscritos);

// Rotas do participante (inscrição)
router.post('/:id/inscrever', estaAutenticado, verificarTokenCsrf, inscricaoController.inscrever);
router.post('/:id/cancelar-inscricao', estaAutenticado, verificarTokenCsrf, inscricaoController.cancelar);

module.exports = router;
