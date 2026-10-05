-- ============================================================
-- nassauTickets - Modelo físico (MySQL 8.0)
-- Fase 2: substituirá o armazenamento em memória do backend.
-- ============================================================
CREATE DATABASE IF NOT EXISTS nassaudb
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE nassaudb;

CREATE TABLE usuario (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(100) NOT NULL,
  login       VARCHAR(50)  NOT NULL UNIQUE,
  hash_senha  VARCHAR(255) NOT NULL,
  gestor      BOOLEAN NOT NULL DEFAULT FALSE,
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE guiche (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  numero  INT NOT NULL UNIQUE,
  ativo   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE sessao (
  token       CHAR(36) PRIMARY KEY,
  usuario_id  INT NOT NULL,
  guiche_id   INT NOT NULL,
  expira_em   DATETIME NOT NULL,
  CONSTRAINT fk_sessao_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  CONSTRAINT fk_sessao_guiche  FOREIGN KEY (guiche_id)  REFERENCES guiche(id),
  UNIQUE KEY uk_sessao_guiche (guiche_id)
);

CREATE TABLE tipo_senha (
  codigo       CHAR(2) PRIMARY KEY,
  nome         VARCHAR(40) NOT NULL,
  prioridade   TINYINT NOT NULL,
  tm_base_min  DECIMAL(5,2) NOT NULL
);

CREATE TABLE sequencia_diaria (
  data           DATE NOT NULL,
  tipo           CHAR(2) NOT NULL,
  ultimo_numero  SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (data, tipo),
  CONSTRAINT fk_seq_tipo FOREIGN KEY (tipo) REFERENCES tipo_senha(codigo)
);

CREATE TABLE senha (
  id                     BIGINT AUTO_INCREMENT PRIMARY KEY,
  numero                 CHAR(12) NOT NULL UNIQUE,         -- YYMMDD-PPSQ
  tipo                   CHAR(2) NOT NULL,
  estado                 ENUM('EMITIDA','AGUARDANDO','CHAMADA','CHAMADA_NOVAMENTE',
                              'EM_ATENDIMENTO','ATENDIDA','NAO_COMPARECEU') NOT NULL,
  emitida_em             DATETIME(3) NOT NULL,
  guiche_id              INT NULL,
  usuario_id             INT NULL,
  primeira_chamada_em    DATETIME(3) NULL,
  segunda_chamada_em     DATETIME(3) NULL,
  inicio_atendimento_em  DATETIME(3) NULL,
  fim_atendimento_em     DATETIME(3) NULL,
  motivo_encerramento    VARCHAR(40) NULL,
  CONSTRAINT fk_senha_tipo    FOREIGN KEY (tipo)       REFERENCES tipo_senha(codigo),
  CONSTRAINT fk_senha_guiche  FOREIGN KEY (guiche_id)  REFERENCES guiche(id),
  CONSTRAINT fk_senha_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  INDEX idx_fila (estado, tipo, emitida_em),   -- acelera a escolha da próxima senha
  INDEX idx_relatorio (emitida_em)
);

CREATE TABLE historico_estado (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  senha_id       BIGINT NOT NULL,
  estado         ENUM('EMITIDA','AGUARDANDO','CHAMADA','CHAMADA_NOVAMENTE',
                      'EM_ATENDIMENTO','ATENDIDA','NAO_COMPARECEU') NOT NULL,
  registrado_em  DATETIME(3) NOT NULL,
  CONSTRAINT fk_hist_senha FOREIGN KEY (senha_id) REFERENCES senha(id)
);

CREATE TABLE log_evento (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id     INT NULL,
  tipo           VARCHAR(40) NOT NULL,
  detalhes       JSON NULL,
  registrado_em  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_log_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

-- Dados iniciais
INSERT INTO tipo_senha (codigo, nome, prioridade, tm_base_min) VALUES
  ('SP', 'Prioritária', 1, 15.00),
  ('SE', 'Retirada de Exames', 2, 1.00),
  ('SG', 'Geral', 3, 5.00);

INSERT INTO guiche (numero) VALUES (1), (2), (3), (4), (5);
