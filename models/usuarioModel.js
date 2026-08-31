const pool = require('../config/db');

/**
 * Busca um usuário pelo e-mail.
 * @async
 * @param {string} email - E-mail do usuário.
 * @returns {Promise<Object|null>} Usuário encontrado ou null.
 * @throws {Error} Se a consulta ao banco falhar.
 */
async function buscarPorEmail(email) {
  const [linhas] = await pool.execute(
    'SELECT * FROM usuarios WHERE email = ?',
    [email]
  );
  return linhas[0] || null;
}

/**
 * Busca um usuário pelo id.
 * @async
 * @param {number} id - Id do usuário.
 * @returns {Promise<Object|null>} Usuário encontrado ou null.
 * @throws {Error} Se a consulta ao banco falhar.
 */
async function buscarPorId(id) {
  const [linhas] = await pool.execute(
    'SELECT id, nome, email, tipo FROM usuarios WHERE id = ?',
    [id]
  );
  return linhas[0] || null;
}

/**
 * Cria um novo usuário.
 * @async
 * @param {{nome: string, email: string, senhaHash: string, tipo: string}} dados
 * @returns {Promise<number>} Id do usuário criado.
 * @throws {Error} Se a inserção falhar (ex: e-mail duplicado).
 */
async function criar({ nome, email, senhaHash, tipo }) {
  const [resultado] = await pool.execute(
    'INSERT INTO usuarios (nome, email, senha_hash, tipo) VALUES (?, ?, ?, ?)',
    [nome, email, senhaHash, tipo]
  );
  return resultado.insertId;
}

module.exports = { buscarPorEmail, buscarPorId, criar };
