
CREATE DATABASE IF NOT EXISTS martialtech
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE martialtech;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS quiz_acertos, quiz_respostas, quiz_alternativas, quiz_perguntas,
  progresso_aulas, aulas, artes_marciais, beneficios, desempenho_escolar, usuarios;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuarios (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(120) NOT NULL,
  email       VARCHAR(160) NOT NULL UNIQUE,
  senha_hash  VARCHAR(100) NOT NULL,            -- hash bcrypt, nunca a senha pura
  tipo        ENUM('Aluno','Professor','Gestor escolar','Administrador') NOT NULL DEFAULT 'Aluno',
  criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE artes_marciais (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug       VARCHAR(20) NOT NULL UNIQUE,       -- judo, jj, mt
  nome       VARCHAR(60) NOT NULL,
  descricao  VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE aulas (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  arte_id      INT UNSIGNED NOT NULL,
  titulo       VARCHAR(150) NOT NULL,
  professor    VARCHAR(100) NOT NULL,
  duracao_min  SMALLINT UNSIGNED NOT NULL,
  nivel        ENUM('Iniciante','Intermediário','Avançado') NOT NULL,
  video_url    VARCHAR(255) NULL,
  FOREIGN KEY (arte_id) REFERENCES artes_marciais(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE progresso_aulas (
  usuario_id     INT UNSIGNED NOT NULL,
  aula_id        INT UNSIGNED NOT NULL,
  percentual     TINYINT UNSIGNED NOT NULL DEFAULT 0,
  atualizado_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, aula_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (aula_id)    REFERENCES aulas(id)    ON DELETE CASCADE,
  CONSTRAINT ck_percentual CHECK (percentual <= 100)
) ENGINE=InnoDB;

CREATE TABLE quiz_perguntas (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  arte_id     INT UNSIGNED NOT NULL,
  enunciado   VARCHAR(255) NOT NULL,
  explicacao  TEXT NOT NULL,
  FOREIGN KEY (arte_id) REFERENCES artes_marciais(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE quiz_alternativas (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pergunta_id  INT UNSIGNED NOT NULL,
  texto        VARCHAR(200) NOT NULL,
  correta      BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (pergunta_id) REFERENCES quiz_perguntas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE quiz_respostas (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id     INT UNSIGNED NOT NULL,
  pergunta_id    INT UNSIGNED NOT NULL,
  alternativa_id INT UNSIGNED NOT NULL,
  correta        BOOLEAN NOT NULL,
  respondido_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id)     REFERENCES usuarios(id)          ON DELETE CASCADE,
  FOREIGN KEY (pergunta_id)    REFERENCES quiz_perguntas(id)    ON DELETE CASCADE,
  FOREIGN KEY (alternativa_id) REFERENCES quiz_alternativas(id) ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE quiz_acertos (
  usuario_id   INT UNSIGNED NOT NULL,
  pergunta_id  INT UNSIGNED NOT NULL,
  xp           SMALLINT UNSIGNED NOT NULL DEFAULT 10,
  ganho_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, pergunta_id),
  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)       ON DELETE CASCADE,
  FOREIGN KEY (pergunta_id) REFERENCES quiz_perguntas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE beneficios (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo     VARCHAR(100) NOT NULL,
  descricao  VARCHAR(255) NOT NULL,
  icone      VARCHAR(30)  NOT NULL,
  fonte      VARCHAR(120) NULL
) ENGINE=InnoDB;

-- Médias simuladas (antes e depois), usadas no gráfico de desempenho.
CREATE TABLE desempenho_escolar (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  disciplina    VARCHAR(40) NOT NULL UNIQUE,
  media_antes   DECIMAL(3,1) NOT NULL,
  media_depois  DECIMAL(3,1) NOT NULL,
  simulado      BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- MartialTech: dados iniciais. Rode depois de schema.sql.
USE martialtech;
SET NAMES utf8mb4;

INSERT INTO artes_marciais (id, slug, nome, descricao) VALUES
(1, 'judo', 'Judô', 'Origem, princípios e fundamentos do caminho suave.'),
(2, 'jj', 'Jiu-jitsu', 'Luta no solo, guarda, finalizações e história no Brasil.'),
(3, 'mt', 'Muay Thai', 'A arte das oito armas, seus rituais e golpes.');

INSERT INTO aulas (arte_id, titulo, professor, duracao_min, nivel) VALUES
(1, 'Fundamentos do Judô', 'Prof. Exemplo A', 45, 'Iniciante'),
(1, 'Técnicas Avançadas de Judô', 'Prof. Exemplo A', 60, 'Avançado'),
(1, 'Quedas e Rolamentos - Judô', 'Prof. Exemplo B', 35, 'Iniciante'),
(2, 'Fundamentos do Jiu-jitsu', 'Prof. Exemplo C', 50, 'Iniciante'),
(2, 'Guarda e Finalizações', 'Prof. Exemplo C', 55, 'Intermediário'),
(3, 'Fundamentos do Muay Thai', 'Prof. Exemplo D', 40, 'Iniciante');

INSERT INTO beneficios (titulo, descricao, icone, fonte) VALUES
('Melhora da Concentração', 'Desenvolva foco e atenção através das práticas marciais', 'brain', 'Trusz (2023)'),
('Desenvolvimento da Disciplina', 'Aprenda valores que refletem no desempenho escolar', 'shield', 'Ribeiro (2025)'),
('Controle Emocional', 'Gerencie emoções e reduza ansiedade', 'heart', 'Silva (2020)'),
('Redução da Ansiedade', 'Técnicas de respiração e meditação aplicadas', 'trend', 'Silva (2020); Trusz (2023)'),
('Aumento da Autoestima', 'Conquiste confiança através de cada progresso', 'star', 'Silva (2020); Trusz (2023)'),
('Melhor Desempenho Escolar', 'Estudos relacionam a prática das artes marciais a melhores resultados escolares', 'trophy', 'Silva (2020)'),
('Respeito e Convivência Social', 'Aprenda trabalho em equipe e respeito mútuo', 'users', 'Ribeiro (2025)'),
('Persistência nos Estudos', 'Transfira a mentalidade de não desistir para os estudos', 'target', 'IJPE (2020)');

-- Dados simulados, para ilustrar o gráfico (ver PFI, Figura 7).
INSERT INTO desempenho_escolar (disciplina, media_antes, media_depois, simulado) VALUES
('Matemática', 6, 7.4, TRUE),
('Português', 6.5, 8, TRUE),
('Ciências', 6.2, 7.6, TRUE),
('História', 6.8, 8.4, TRUE),
('Geografia', 6.4, 7.9, TRUE);

INSERT INTO quiz_perguntas (id, arte_id, enunciado, explicacao) VALUES
(1, 1, 'Quem criou o judô?', 'Jigoro Kano criou o judô no Japão, em 1882, e fundou o Kodokan, a escola que o ensina até hoje.'),
(2, 1, 'O que significa a palavra "judô"?', '"Ju" quer dizer suave e "do" quer dizer caminho. O judô ensina a usar a força do oponente a seu favor.'),
(3, 1, 'No judô, o que é o "ippon"?', 'O ippon é a pontuação máxima e dá a vitória na hora. Ele vale, por exemplo, para uma projeção limpa, controlada e de grande impacto.'),
(4, 1, 'Para que servem os "ukemi"?', 'Ukemi são as técnicas de queda e rolamento. É a primeira coisa que o aluno aprende e dá segurança para treinar.'),
(5, 1, 'O princípio "Seiryoku Zen''yo" do judô significa:', 'É a ideia de usar corpo e mente da forma mais eficiente. Kano também defendia a "prosperidade mútua", em que treinar é ajudar o colega a evoluir.'),
(6, 2, 'Quem ensinou a técnica que originou o jiu-jitsu brasileiro à família Gracie?', 'O japonês Mitsuyo Maeda, conhecido como Conde Koma, ensinou Carlos Gracie, e a família desenvolveu o estilo que hoje é o jiu-jitsu brasileiro.'),
(7, 2, 'Qual é o foco principal do jiu-jitsu brasileiro?', 'A técnica permite que uma pessoa menor controle um oponente maior no chão, usando alavancas e estrangulamentos.'),
(8, 2, 'No jiu-jitsu, o que é a "guarda"?', 'Na guarda, o praticante fica de costas no chão e usa pernas e quadril para controlar a distância e preparar ataques.'),
(9, 2, 'O que é uma "finalização"?', 'Finalizações são chaves de articulação e estrangulamentos. A luta termina quando o oponente desiste.'),
(10, 2, 'Como o praticante sinaliza que desiste durante um treino?', 'O "tap" é a regra de segurança do jiu-jitsu. Quem recebe o tap solta a técnica na hora, o que ensina respeito e cuidado com o parceiro.'),
(11, 3, 'De qual país vem o Muay Thai?', 'O Muay Thai nasceu na Tailândia e é conhecido como a arte nacional de combate do país.'),
(12, 3, 'Por que o Muay Thai é chamado de "arte das oito armas"?', 'São dois punhos, dois cotovelos, dois joelhos e duas canelas, ou seja, oito pontos de contato.'),
(13, 3, 'O que é o "Wai Khru" realizado antes das lutas?', 'O Wai Khru é uma dança e saudação em agradecimento aos professores. Mostra que o respeito faz parte da arte.'),
(14, 3, 'No Muay Thai, o que é o "clinch"?', 'No clinch, os lutadores se seguram pelo pescoço e pelos braços e aplicam joelhadas e desequilíbrios.'),
(15, 3, 'Como é chamado o praticante de Muay Thai?', '"Nak Muay" significa lutador de Muay. Sensei é o termo japonês para professor e judoca é o praticante de judô.');

INSERT INTO quiz_alternativas (id, pergunta_id, texto, correta) VALUES
(1, 1, 'Jigoro Kano', TRUE),
(2, 1, 'Helio Gracie', FALSE),
(3, 1, 'Mitsuyo Maeda', FALSE),
(4, 1, 'Bruce Lee', FALSE),
(5, 2, 'Caminho suave', TRUE),
(6, 2, 'Arte das oito armas', FALSE),
(7, 2, 'Luta do chão', FALSE),
(8, 2, 'Punho de ferro', FALSE),
(9, 3, 'A saudação inicial', FALSE),
(10, 3, 'A pontuação máxima, que encerra a luta', TRUE),
(11, 3, 'Um tipo de faixa', FALSE),
(12, 3, 'A roupa usada no treino', FALSE),
(13, 4, 'Aplicar golpes no oponente', FALSE),
(14, 4, 'Cair com segurança, sem se machucar', TRUE),
(15, 4, 'Cumprimentar o professor', FALSE),
(16, 4, 'Segurar a faixa', FALSE),
(17, 5, 'Vencer a qualquer custo', FALSE),
(18, 5, 'Máxima eficiência com o mínimo de esforço', TRUE),
(19, 5, 'Treinar apenas a força', FALSE),
(20, 5, 'Nunca cair', FALSE),
(21, 6, 'Mitsuyo Maeda', TRUE),
(22, 6, 'Jigoro Kano', FALSE),
(23, 6, 'Anderson Silva', FALSE),
(24, 6, 'Funakoshi', FALSE),
(25, 7, 'Chutes em pé', FALSE),
(26, 7, 'Luta no solo e finalizações', TRUE),
(27, 7, 'Uso de armas', FALSE),
(28, 7, 'Corrida e resistência', FALSE),
(29, 8, 'A faixa preta', FALSE),
(30, 8, 'Posição por baixo em que as pernas controlam o oponente', TRUE),
(31, 8, 'Uma saudação', FALSE),
(32, 8, 'Um tipo de quimono', FALSE),
(33, 9, 'O fim do treino', FALSE),
(34, 9, 'Uma técnica que força o oponente a desistir', TRUE),
(35, 9, 'Um tipo de queda', FALSE),
(36, 9, 'O último round', FALSE),
(37, 10, 'Gritando o nome do professor', FALSE),
(38, 10, 'Batendo (tap) no oponente ou no chão', TRUE),
(39, 10, 'Levantando as duas pernas', FALSE),
(40, 10, 'Soltando a faixa', FALSE),
(41, 11, 'Japão', FALSE),
(42, 11, 'Brasil', FALSE),
(43, 11, 'Tailândia', TRUE),
(44, 11, 'Coreia do Sul', FALSE),
(45, 12, 'Usa oito tipos de armas de metal', FALSE),
(46, 12, 'Usa punhos, cotovelos, joelhos e canelas', TRUE),
(47, 12, 'Tem oito faixas', FALSE),
(48, 12, 'Cada luta tem oito rounds', FALSE),
(49, 13, 'Um aquecimento de corrida', FALSE),
(50, 13, 'Um ritual de respeito ao mestre e à tradição', TRUE),
(51, 13, 'A pesagem dos lutadores', FALSE),
(52, 13, 'Uma técnica de defesa', FALSE),
(53, 14, 'Um tipo de chute alto', FALSE),
(54, 14, 'A luta em curta distância, com os lutadores agarrados', TRUE),
(55, 14, 'O corte de cabelo tradicional', FALSE),
(56, 14, 'O descanso entre rounds', FALSE),
(57, 15, 'Sensei', FALSE),
(58, 15, 'Nak Muay', TRUE),
(59, 15, 'Judoca', FALSE),
(60, 15, 'Capoeirista', FALSE);