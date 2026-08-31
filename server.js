require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const { gerarTokenCsrf } = require('./middlewares/csrf');
const authRoutes = require('./routes/authRoutes');
const eventoRoutes = require('./routes/eventoRoutes');

const app = express();

// Engine de views (renderização server-side, característica da arquitetura MVC)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Necessário em produção: o Render fica atrás de um proxy reverso.
// Sem isso, o Express não reconhece a conexão como HTTPS e o cookie
// de sessão (marcado como secure em produção) não persiste corretamente.
app.set('trust proxy', 1);

// Parsers e arquivos estáticos
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sessão com cookie httpOnly (exigência de segurança da atividade)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 4 // 4 horas
  }
}));

// Disponibiliza o usuário logado para todas as views automaticamente
app.use((req, res, next) => {
  res.locals.usuarioLogado = req.session.usuario || null;
  next();
});

// Gera o token CSRF da sessão e disponibiliza em res.locals.csrfToken para os forms
app.use(gerarTokenCsrf);

// Rotas
app.get('/', (req, res) => res.redirect('/eventos'));
app.use('/auth', authRoutes);
app.use('/eventos', eventoRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('erro', { mensagem: 'Página não encontrada.' });
});

// Tratamento central de erros — evita vazar stack trace em produção
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.message);
  res.status(500).render('erro', { mensagem: 'Ocorreu um erro interno no servidor.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`EventHub rodando na porta ${PORT}`);
});