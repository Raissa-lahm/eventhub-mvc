/**
 * Garante que existe um usuário logado na sessão.
 * Caso contrário, redireciona para a tela de login.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function estaAutenticado(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }
  return res.redirect('/auth/login');
}

/**
 * Garante que o usuário logado é do tipo organizador.
 * Usado para proteger criação/edição/exclusão de eventos.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function ehOrganizador(req, res, next) {
  if (req.session && req.session.usuario && req.session.usuario.tipo === 'organizador') {
    return next();
  }
  return res.status(403).render('erro', {
    mensagem: 'Acesso restrito a organizadores.'
  });
}

module.exports = { estaAutenticado, ehOrganizador };
