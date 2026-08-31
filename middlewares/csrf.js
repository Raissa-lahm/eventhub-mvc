const crypto = require('crypto');

/**
 * Gera (se necessário) um token CSRF por sessão e o disponibiliza
 * em res.locals.csrfToken para ser usado nas views (campo hidden no form).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function gerarTokenCsrf(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
}

/**
 * Verifica se o token CSRF enviado no corpo do formulário confere
 * com o token gerado para a sessão atual. Bloqueia a requisição caso não confira.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function verificarTokenCsrf(req, res, next) {
  const tokenEnviado = req.body._csrf;
  if (!tokenEnviado || tokenEnviado !== req.session.csrfToken) {
    return res.status(403).render('erro', { mensagem: 'Sessão expirada ou inválida. Recarregue a página e tente novamente.' });
  }
  next();
}

module.exports = { gerarTokenCsrf, verificarTokenCsrf };
