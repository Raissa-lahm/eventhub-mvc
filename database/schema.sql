-- ============================================================
-- Schema do banco EventHub
-- Execute este script no seu banco MySQL em nuvem (Aiven/Neon)
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  tipo ENUM('organizador', 'participante') NOT NULL DEFAULT 'participante',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizador_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  local VARCHAR(200),
  data_evento DATETIME NOT NULL,
  vagas INT NOT NULL DEFAULT 0,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizador_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inscricoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evento_id INT NOT NULL,
  participante_id INT NOT NULL,
  inscrito_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  FOREIGN KEY (participante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY unico_inscricao (evento_id, participante_id)
);
