const pool = require('../config/db');

/**
 * Verifica se um participante já está inscrito em um evento.
 * @async
 * @param {number} eventoId
 * @param {number} participanteId
 * @returns {Promise<boolean>} true se já existir inscrição.
 * @throws {Error} Se a consulta falhar.
 */
async function jaInscrito(eventoId, participanteId) {
  const [linhas] = await pool.execute(
    'SELECT id FROM inscricoes WHERE evento_id = ? AND participante_id = ?',
    [eventoId, participanteId]
  );
  return linhas.length > 0;
}

/**
 * Cria uma inscrição de um participante em um evento.
 * @async
 * @param {number} eventoId
 * @param {number} participanteId
 * @returns {Promise<number>} Id da inscrição criada.
 * @throws {Error} Se a inserção falhar.
 */
async function criar(eventoId, participanteId) {
  const [resultado] = await pool.execute(
    'INSERT INTO inscricoes (evento_id, participante_id) VALUES (?, ?)',
    [eventoId, participanteId]
  );
  return resultado.insertId;
}

/**
 * Lista os inscritos de um evento (visível para o organizador).
 * @async
 * @param {number} eventoId
 * @returns {Promise<Array<Object>>} Lista de participantes inscritos.
 * @throws {Error} Se a consulta falhar.
 */
async function listarPorEvento(eventoId) {
  const [linhas] = await pool.execute(`
    SELECT u.id, u.nome, u.email, i.inscrito_em
    FROM inscricoes i
    JOIN usuarios u ON u.id = i.participante_id
    WHERE i.evento_id = ?
    ORDER BY i.inscrito_em ASC
  `, [eventoId]);
  return linhas;
}

/**
 * Cancela a inscrição de um participante em um evento.
 * @async
 * @param {number} eventoId
 * @param {number} participanteId
 * @returns {Promise<void>}
 * @throws {Error} Se a remoção falhar.
 */
async function cancelar(eventoId, participanteId) {
  await pool.execute(
    'DELETE FROM inscricoes WHERE evento_id = ? AND participante_id = ?',
    [eventoId, participanteId]
  );
}

module.exports = { jaInscrito, criar, listarPorEvento, cancelar };
