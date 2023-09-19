CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(60)  NOT NULL,
  email VARCHAR(60)  NOT NULL,
  password VARCHAR(60)  NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE blogs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(255)  NOT NULL,
  contenido text  NOT NULL,
  usuario_id int NOT NULL,
  created_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE etiquetas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255)  NOT NULL
);

CREATE TABLE blogs_etiquetas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    etiqueta_id INT,
    blog_id INT,
    FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id) ON DELETE CASCADE,
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
);

-- CREATE TABLE blogs_etiquetas (
--     etiqueta_id INT,
--     blog_id INT,
--     PRIMARY KEY (etiqueta_id, blog_id),
--     FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id) ON DELETE CASCADE,
--     FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
-- );

-- CREATE TABLE blogs_etiquetas (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     etiqueta_id INT,
--     blog_id INT,
--     FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id) ON DELETE CASCADE,
--     FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
-- );