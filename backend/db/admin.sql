-- E-mail: admin@martialtech.com   |   Senha: Admin@2026

USE martialtech;

ALTER TABLE usuarios
  MODIFY tipo ENUM('Aluno','Professor','Gestor escolar','Administrador') NOT NULL DEFAULT 'Aluno';

INSERT INTO usuarios (nome, email, senha_hash, tipo)
VALUES ('Administrador', 'admin@martialtech.com',
        '$2a$10$Lw2PiiyAwB3P8aqz2iNaQua0bzlv8wBwhPhPxNcq/fw0ToULjpduO', 'Administrador');
