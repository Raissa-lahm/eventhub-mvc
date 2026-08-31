const inscricaoModel = require('../models/inscricaoModel');
const eventoModel = require('../models/eventoModel');

/**
 * Inscreve o participante logado em um evento, evitando duplicidade.
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 * @throws {Error} Propaga para o try/catch caso o banco falhe.
 */
async function inscrever(req, res) {
  try {
    const eventoId = req.params.id;
    const participanteId = req.session.usuario.id;

    const evento = await eventoModel.buscarPorId(eventoId);
    if (!evento) {
      return res.status(404).render('erro', { mensagem: 'Evento não encontrado.' });
    }

    const estaInscrito = await inscricaoModel.jaInscrito(eventoId, participanteId);
    if (estaInscrito) {
      return res.redirect(`/eventos/${eventoId}`);
    }

    if (evento.vagas > 0 && evento.total_inscritos >= evento.vagas) {
      return res.status(400).render('erro', { mensagem: 'Não há mais vagas para este evento.' });
    }

    await inscricaoModel.criar(eventoId, participanteId);
    res.redirect(`/eventos/${eventoId}`);
  } catch (erro) {
    console.error('Erro ao inscrever participante:', erro.message);
    res.status(500).render('erro', { mensagem: 'Não foi possível concluir a inscrição.' });
  }
}

/**
 * Cancela a inscrição do participante logado em um evento.
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 * @throws {Error} Propaga para o try/catch caso o banco falhe.
 */
async function cancelar(req, res) {
  try {
    const eventoId = req.params.id;
    const participanteId = req.session.usuario.id;
    await inscricaoModel.cancelar(eventoId, participanteId);
    res.redirect(`/eventos/${eventoId}`);
  } catch (erro) {
    console.error('Erro ao cancelar inscrição:', erro.message);
    res.status(500).render('erro', { mensagem: 'Não foi possível cancelar a inscrição.' });
  }
}

module.exports = { inscrever, cancelar };
