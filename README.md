## Sobre o projeto

Esse projeto é a entrega do Tech Challenge da fase 2 da pós em Full Stack Developement.

## Definições técnicas

- Backend em Node.js com Typescript
- Express para criação das rotas de API
- Banco de dados PostgreSQL
- Docker compose para rodar a aplicação local
- Vitest para testes automatizados

## Como rodar a aplicação local

- Único requisito é ter Docker e Docker Compose instalado.
- Não é necessário nenhuma configuração.

### Comando para inicializar

> docker-compose --env-file ./config/.env.development up

### URL da API de posts

http://localhost:3000/api/posts

### Endpoints disponíveis

- GET /posts - Lista de Posts
- GET /posts/:id - Leitura de Posts
- POST /posts - Criação de Postagens
- PUT /posts/:id
- DELETE /posts/:id
- GET /posts/search
