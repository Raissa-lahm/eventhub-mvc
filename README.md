# EventHub — Sistema de Gestão de Eventos e Inscrições

Aplicação web MVC (Node.js + Express + EJS) para cadastro de eventos e controle de inscritos.

## Requisitos

- Node.js 18+
- Banco de dados MySQL em nuvem (Aiven, Neon, etc.)

## Instalação local

```bash
git clone https://github.com/SEU_USUARIO/eventhub-mvc.git
cd eventhub-mvc
npm install
cp .env.example .env
```

Edite o `.env` com as credenciais do seu banco (veja a seção "Variáveis de ambiente").

Rode o script `database/schema.sql` no seu banco (via console do Aiven/Neon ou um cliente MySQL) para criar as tabelas.

```bash
npm run dev
```

A aplicação sobe em `http://localhost:3000`.

## Variáveis de ambiente (`.env`)

| Variável | Descrição |
| --- | --- |
| `PORT` | Porta local da aplicação |
| `NODE_ENV` | `development` ou `production` |
| `DB_HOST` | Host do banco MySQL |
| `DB_PORT` | Porta do banco |
| `DB_USER` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `DB_NAME` | Nome do banco |
| `DB_SSL` | `true` para exigir SSL/TLS (recomendado em nuvem) |
| `SESSION_SECRET` | String aleatória usada para assinar o cookie de sessão |

## Estrutura do projeto

```
├── config/         # Conexão com o banco
├── controllers/     # Lógica de negócio das rotas
├── middlewares/     # Autenticação e autorização
├── models/          # Acesso a dados (prepared statements)
├── public/           # CSS estático
├── routes/           # Definição de rotas Express
├── views/            # Templates EJS (renderização server-side)
├── database/schema.sql
└── server.js
```

## Fluxo da aplicação

- **Organizador**: cadastra-se, faz login e pode criar, editar e excluir eventos, além de ver a lista de inscritos.
- **Participante**: cadastra-se, faz login, navega pelos eventos e se inscreve/cancela inscrição.

## Segurança implementada

- Senhas com hash `bcrypt`, nunca em texto puro, com validação de tamanho mínimo (8 caracteres) no servidor.
- Sessão via cookie `httpOnly`.
- Todas as queries usam *prepared statements* (`?` + array de parâmetros).
- Validação server-side de e-mail e de `tipo` de conta (whitelist), independente da validação HTML do formulário.
- Proteção contra CSRF: token por sessão gerado em `middlewares/csrf.js`, embutido como campo oculto em todo formulário POST e validado antes de qualquer alteração de dado.
- Rate limiting no login (`express-rate-limit`): 10 tentativas a cada 15 minutos por IP, para dificultar força bruta.
- Tratamento de erros com `try/catch` em todos os controllers, sem vazar stack trace ao usuário.
- Middlewares de autenticação (`estaAutenticado`) e autorização (`ehOrganizador`).

## Como testar

1. Cadastre um usuário do tipo **organizador** e outro do tipo **participante**.
2. Logado como organizador: crie um evento, edite-o e veja a lista de inscritos.
3. Logado como participante: veja a lista de eventos, entre nos detalhes, inscreva-se e depois cancele a inscrição.
4. Tente editar/excluir um evento de outro organizador (deve retornar erro 403).
5. Tente errar a senha de login mais de 10 vezes seguidas (deve bloquear temporariamente).

## Deploy em produção

1. Suba o banco no **Aiven** ou **Neon** e rode `database/schema.sql`.
2. Crie um **Web Service** no **Render** apontando para este repositório.
3. Configure as variáveis de ambiente do `.env.example` no painel do Render (com `NODE_ENV=production`).
4. Comando de start: `npm start`.
5. Teste a URL pública em uma janela anônima antes de entregar.
