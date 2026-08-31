const eventoModel = require('../models/eventoModel');
const inscricaoModel = require('../models/inscricaoModel');

/**
 * Lista todos os eventos cadastrados.
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 * @throws {Error} Propaga para o try/catch caso o banco falhe.
 */
async function listar(req, res) {
  try {
    const eventos = await eventoModel.listarTodos();
    res.render('eventos/lista', { eventos, usuario: req.session.usuario });
  } catch (erro) {
    console.error('Erro ao listar eventos:', erro.message);
    res.status(500).render('erro', { mensagem: 'Não foi possível carregar os eventos.' });
  }
}

/**
 * Exibe os detalhes de um evento específico.
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 * @throws {Error} Propaga para o try/catch caso o banco falhe.
 */
async function detalhes(req, res) {
  try {
    const evento = await eventoModel.buscarPorId(req.params.id);
    if (!evento) {
      return res.status(404).render('erro', { mensagem: 'Evento não encontrado.' });
    }

    let jaInscrito = false;
    if (req.session.usuario) {
      jaInscrito = await inscricaoModel.jaInscrito(evento.id, req.session.usuario.id);
    }

    res.render('eventos/detalhes', { evento, usuario: req.session.usuario, jaInscrito });
  } catch (erro) {
    console.error('Erro ao buscar detalhes do evento:', erro.message);
    res.status(500).render('erro', { mensagem: 'Não foi possível carregar o evento.' });
  }
}

/**
 * Renderiza o formulário de criação de evento (apenas organizador).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function telaCriar(req, res) {
  res.render('eventos/form', { evento: null, erro: null });
}

/**
 * Cria um novo evento vinculado ao organizador logado.
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 * @throws {Error} Propaga para o try/catch caso o banco falhe.
 */
async function criar(req, res) {
  try {
    const { titulo, descricao, local, dataEvento, vagas } = req.body;

    if (!titulo || !dataEvento) {
      return res.render('eventos/form', { evento: req.body, erro: 'Título e data são obrigatórios.' });
    }

    await eventoModel.criar({
      organizadorId: req.session.usuario.id,
      titulo,
      descricao,
      local,
      dataEvento,
      vagas: Math.max(0, Number(vagas) || 0)
    });

    res.redirect('/eventos');
  } catch (erro) {
    console.error('Erro ao criar evento:', erro.message);
    res.status(500).render('erro', { mensagem: 'Não foi possível criar o evento.' });
  }
}

/**
 * Renderiza o formulário de edição de um evento existente.
 * Garante que apenas o organizador dono do evento pode editar.
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 * @throws {Error} Propaga para o try/catch caso o banco falhe.
 */
async function telaEditar(req, res) {
  try {
    const evento = await eventoModel.buscarPorId(req.params.id);
    if (!evento) {
      return res.status(404).render('erro', { mensagem: 'Evento não encontrado.' });
    }
    if (evento.organizador_id !== req.session.usuario.id) {
      return res.status(403).render('erro', { mensagem: 'Você não pode editar este evento.' });
    }
    res.render('eventos/form', { evento, erro: null });
  } catch (erro) {
    console.error('Erro ao carregar edição do evento:', erro.message);
    res.status(500).render('erro', { mensagem: 'Não foi possível carregar o evento.' });
  }
}

/**
 * Atualiza um evento existente, validando a posse pelo organizador logado.
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 * @throws {Error} Propaga para o try/catch caso o banco falhe.
 */
async function atualizar(req, res) {
  try {
    const evento = await eventoModel.buscarPorId(req.params.id);
    if (!evento) {
      return res.status(404).render('erro', { mensagem: 'Evento não encontrado.' });
    }
    if (evento.organizador_id !== req.session.usuario.id) {
      return res.status(403).render('erro', { mensagem: 'Você não pode editar este evento.' });
    }

    const { titulo, descricao, local, dataEvento, vagas } = req.body;
    await eventoModel.atualizar(req.params.id, {
      titulo,
      descricao,
      local,
      dataEvento,
      vagas: Math.max(0, Number(vagas) || 0)
    });

    res.redirect(`/eventos/${req.params.id}`);
  } catch (erro) {
    console.error('Erro ao atualizar evento:', erro.message);
    res.status(500).render('erro', { mensagem: 'Não foi possível atualizar o evento.' });
  }
}

/**
 * Remove um evento, validando a posse pelo organizador logado.
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 * @throws {Error} Propaga para o try/catch caso o banco falhe.
 */
async function remover(req, res) {
  try {
    const evento = await eventoModel.buscarPorId(req.params.id);
    if (!evento) {
      return res.status(404).render('erro', { mensagem: 'Evento não encontrado.' });
    }
    if (evento.organizador_id !== req.session.usuario.id) {
      return res.status(403).render('erro', { mensagem: 'Você não pode excluir este evento.' });
    }

    await eventoModel.remover(req.params.id);
    res.redirect('/eventos');
  } catch (erro) {
    console.error('Erro ao remover evento:', erro.message);
    res.status(500).render('erro', { mensagem: 'Não foi possível remover o evento.' });
  }
}

/**
 * Lista os inscritos de um evento (visível apenas ao organizador dono).
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 * @throws {Error} Propaga para o try/catch caso o banco falhe.
 */
async function listarInscritos(req, res) {
  try {
    const evento = await eventoModel.buscarPorId(req.params.id);
    if (!evento) {
      return res.status(404).render('erro', { mensagem: 'Evento não encontrado.' });
    }
    if (evento.organizador_id !== req.session.usuario.id) {
      return res.status(403).render('erro', { mensagem: 'Você não pode ver os inscritos deste evento.' });
    }

    const inscritos = await inscricaoModel.listarPorEvento(req.params.id);
    res.render('eventos/inscritos', { evento, inscritos });
  } catch (erro) {
    console.error('Erro ao listar inscritos:', erro.message);
    res.status(500).render('erro', { mensagem: 'Não foi possível carregar os inscritos.' });
  }
}

module.exports = {
  listar,
  detalhes,
  telaCriar,
  criar,
  telaEditar,
  atualizar,
  remover,
  listarInscritos
};
