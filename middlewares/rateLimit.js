const rateLimit = require('express-rate-limit');

/**
 * Limita tentativas de login por IP, para dificultar ataques de força bruta.
 * 10 tentativas a cada 15 minutos.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).render('erro', {
      mensagem: 'Muitas tentativas de login. Tente novamente em alguns minutos.'
    });
  }
});

module.exports = { loginLimiter };
