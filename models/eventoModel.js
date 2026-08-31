const pool = require('../config/db');

/**
 * Lista todos os eventos, com nome do organizador e total de inscritos.
 * @async
 * @returns {Promise<Array<Object>>} Lista de eventos.
 * @throws {Error} Se a consulta falhar.
 */
async function listarTodos() {
  const [linhas] = await pool.execute(`
    SELECT e.*, u.nome AS organizador_nome,
      (SELECT COUNT(*) FROM inscricoes i WHERE i.evento_id = e.id) AS total_inscritos
    FROM eventos e
    JOIN usuarios u ON u.id = e.organizador_id
    ORDER BY e.data_evento ASC
  `);
  return linhas;
}

/**
 * Busca um evento pelo id, incluindo total de inscritos.
 * @async
 * @param {number} id - Id do evento.
 * @returns {Promise<Object|null>} Evento encontrado ou null.
 * @throws {Error} Se a consulta falhar.
 */
async function buscarPorId(id) {
  const [linhas] = await pool.execute(`
    SELECT e.*, u.nome AS organizador_nome,
      (SELECT COUNT(*) FROM inscricoes i WHERE i.evento_id = e.id) AS total_inscritos
    FROM eventos e
    JOIN usuarios u ON u.id = e.organizador_id
    WHERE e.id = ?
  `, [id]);
  return linhas[0] || null;
}

/**
 * Lista os eventos criados por um organizador específico.
 * @async
 * @param {number} organizadorId - Id do organizador.
 * @returns {Promise<Array<Object>>} Lista de eventos do organizador.
 * @throws {Error} Se a consulta falhar.
 */
async function listarPorOrganizador(organizadorId) {
  const [linhas] = await pool.execute(
    'SELECT * FROM eventos WHERE organizador_id = ? ORDER BY data_evento ASC',
    [organizadorId]
  );
  return linhas;
}

/**
 * Cria um novo evento.
 * @async
 * @param {{organizadorId: number, titulo: string, descricao: string, local: string, dataEvento: string, vagas: number}} dados
 * @returns {Promise<number>} Id do evento criado.
 * @throws {Error} Se a inserção falhar.
 */
async function criar({ organizadorId, titulo, descricao, local, dataEvento, vagas }) {
  const [resultado] = await pool.execute(
    `INSERT INTO eventos (organizador_id, titulo, descricao, local, data_evento, vagas)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [organizadorId, titulo, descricao, local, dataEvento, vagas]
  );
  return resultado.insertId;
}

/**
 * Atualiza um evento existente.
 * @async
 * @param {number} id - Id do evento.
 * @param {{titulo: string, descricao: string, local: string, dataEvento: string, vagas: number}} dados
 * @returns {Promise<void>}
 * @throws {Error} Se a atualização falhar.
 */
async function atualizar(id, { titulo, descricao, local, dataEvento, vagas }) {
  await pool.execute(
    `UPDATE eventos SET titulo = ?, descricao = ?, local = ?, data_evento = ?, vagas = ?
     WHERE id = ?`,
    [titulo, descricao, local, dataEvento, vagas, id]
  );
}

/**
 * Remove um evento pelo id.
 * @async
 * @param {number} id - Id do evento.
 * @returns {Promise<void>}
 * @throws {Error} Se a remoção falhar.
 */
async function remover(id) {
  await pool.execute('DELETE FROM eventos WHERE id = ?', [id]);
}

module.exports = {
  listarTodos,
  buscarPorId,
  listarPorOrganizador,
  criar,
  atualizar,
  remover
};
