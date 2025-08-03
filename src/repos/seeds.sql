
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS teacher;

CREATE TABLE teacher (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    teacher_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teacher(id)
);

INSERT INTO teacher (name) VALUES ('Pedro'), ('Sara');

INSERT INTO posts (title, summary, content, teacher_id) VALUES
    ('Post 1', 'Summary 1', 'Content of post 1', 1),
    ('Post 2', 'Summary 2', 'Content of post 2', 2),
    ('Post 3', 'Summary 3', 'Content of post 3', 1);