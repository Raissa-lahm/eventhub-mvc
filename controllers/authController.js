const bcrypt = require('bcryptjs');
const usuarioModel = require('../models/usuarioModel');

/**
 * Renderiza a tela de cadastro.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function telaCadastro(req, res) {
  res.render('auth/cadastro', { erro: null });
}

/**
 * Renderiza a tela de login.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function telaLogin(req, res) {
  res.render('auth/login', { erro: null });
}

/**
 * Processa o cadastro de um novo usuário (organizador ou participante).
 * A senha é sempre armazenada com hash (bcrypt), nunca em texto puro.
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 * @throws {Error} Propaga para o try/catch caso o banco falhe.
 */
async function cadastrar(req, res) {
  try {
    const { nome, email, senha, tipo } = req.body;

    if (!nome || !email || !senha || !tipo) {
      return res.render('auth/cadastro', { erro: 'Preencha todos os campos.' });
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValido) {
      return res.render('auth/cadastro', { erro: 'Informe um e-mail válido.' });
    }

    if (senha.length < 8) {
      return res.render('auth/cadastro', { erro: 'A senha precisa ter no mínimo 8 caracteres.' });
    }

    // Nunca confiar em valores de enum vindos do cliente sem checar contra uma lista fixa
    if (!['organizador', 'participante'].includes(tipo)) {
      return res.render('auth/cadastro', { erro: 'Tipo de conta inválido.' });
    }

    const usuarioExistente = await usuarioModel.buscarPorEmail(email);
    if (usuarioExistente) {
      return res.render('auth/cadastro', { erro: 'Este e-mail já está cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    await usuarioModel.criar({ nome, email, senhaHash, tipo });

    res.redirect('/auth/login');
  } catch (erro) {
    console.error('Erro ao cadastrar usuário:', erro.message);
    res.status(500).render('erro', { mensagem: 'Não foi possível concluir o cadastro.' });
  }
}

/**
 * Processa o login, valida a senha com bcrypt e cria a sessão httpOnly.
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 * @throws {Error} Propaga para o try/catch caso o banco falhe.
 */
async function login(req, res) {
  try {
    const { email, senha } = req.body;

    const usuario = await usuarioModel.buscarPorEmail(email);
    if (!usuario) {
      return res.render('auth/login', { erro: 'E-mail ou senha inválidos.' });
    }

    const senhaConfere = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaConfere) {
      return res.render('auth/login', { erro: 'E-mail ou senha inválidos.' });
    }

    req.session.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      tipo: usuario.tipo
    };

    res.redirect('/eventos');
  } catch (erro) {
    console.error('Erro ao autenticar usuário:', erro.message);
    res.status(500).render('erro', { mensagem: 'Não foi possível realizar o login.' });
  }
}

/**
 * Encerra a sessão do usuário.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function logout(req, res) {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
}

module.exports = { telaCadastro, telaLogin, cadastrar, login, logout };
