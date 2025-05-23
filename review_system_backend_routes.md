# Definição das Rotas de Backend para o Sistema de Avaliação e Comentários

**Arquivo de Rota Principal:** `server/routes/review.routes.js` (a ser criado)

**Controlador Associado:** `server/controllers/review.controller.js` (a ser criado)

**Middleware de Autenticação:** `authMiddleware.verifyToken` será usado para rotas que exigem que o usuário esteja logado (ex: criar, atualizar, deletar avaliação).

## Rotas

1.  **`POST /api/reviews/product/:productId`**
    *   **Descrição:** Cria uma nova avaliação e comentário para um produto específico.
    *   **Controlador:** `reviewController.createReview`
    *   **Autenticação:** Requerida (usuário logado).
    *   **Corpo da Requisição (JSON):**
        ```json
        {
          "rating": 5, // TINYINT, 1-5
          "comment_text": "Ótimo produto, recomendo!" // TEXT, opcional
        }
        ```
    *   **Resposta de Sucesso (201 Created):**
        ```json
        {
          "message": "Avaliação criada com sucesso!",
          "review": { ...dados da avaliação criada... }
        }
        ```
    *   **Respostas de Erro:**
        *   `400 Bad Request`: Dados inválidos (ex: rating fora do range, produto não existe).
        *   `401 Unauthorized`: Usuário não autenticado.
        *   `403 Forbidden`: Usuário já avaliou este produto (se essa regra for implementada).
        *   `500 Internal Server Error`: Erro no servidor.

2.  **`GET /api/reviews/product/:productId`**
    *   **Descrição:** Obtém todas as avaliações e comentários para um produto específico.
    *   **Controlador:** `reviewController.getProductReviews`
    *   **Autenticação:** Não requerida.
    *   **Parâmetros de Query (Opcionais):**
        *   `page`: Número da página para paginação (default: 1).
        *   `limit`: Número de avaliações por página (default: 10).
        *   `sortBy`: Critério de ordenação (ex: `created_at_desc`, `rating_asc`, default: `created_at_desc`).
    *   **Resposta de Sucesso (200 OK):**
        ```json
        {
          "reviews": [ ...lista de avaliações... ],
          "currentPage": 1,
          "totalPages": 5,
          "totalReviews": 50
        }
        ```
    *   **Respostas de Erro:**
        *   `404 Not Found`: Produto não encontrado.
        *   `500 Internal Server Error`: Erro no servidor.

3.  **`GET /api/reviews/user/:userId`**
    *   **Descrição:** Obtém todas as avaliações feitas por um usuário específico.
    *   **Controlador:** `reviewController.getUserReviews`
    *   **Autenticação:** Requerida (e o `userId` deve ser o do usuário logado, ou o usuário deve ser admin).
    *   **Parâmetros de Query (Opcionais):** Similar ao GET de produto.
    *   **Resposta de Sucesso (200 OK):** Similar ao GET de produto.
    *   **Respostas de Erro:**
        *   `401 Unauthorized`: Usuário não autenticado.
        *   `403 Forbidden`: Usuário não autorizado a ver avaliações de outro usuário.
        *   `404 Not Found`: Usuário não encontrado.
        *   `500 Internal Server Error`: Erro no servidor.

4.  **`PUT /api/reviews/:reviewId`**
    *   **Descrição:** Atualiza uma avaliação existente.
    *   **Controlador:** `reviewController.updateReview`
    *   **Autenticação:** Requerida (usuário deve ser o autor da avaliação).
    *   **Corpo da Requisição (JSON):**
        ```json
        {
          "rating": 4, // Opcional
          "comment_text": "Atualizando meu comentário." // Opcional
        }
        ```
    *   **Resposta de Sucesso (200 OK):**
        ```json
        {
          "message": "Avaliação atualizada com sucesso!",
          "review": { ...dados da avaliação atualizada... }
        }
        ```
    *   **Respostas de Erro:**
        *   `400 Bad Request`: Dados inválidos.
        *   `401 Unauthorized`: Usuário não autenticado.
        *   `403 Forbidden`: Usuário não é o autor da avaliação.
        *   `404 Not Found`: Avaliação não encontrada.
        *   `500 Internal Server Error`: Erro no servidor.

5.  **`DELETE /api/reviews/:reviewId`**
    *   **Descrição:** Deleta uma avaliação existente.
    *   **Controlador:** `reviewController.deleteReview`
    *   **Autenticação:** Requerida (usuário deve ser o autor da avaliação ou um administrador).
    *   **Resposta de Sucesso (200 OK):**
        ```json
        {
          "message": "Avaliação deletada com sucesso!"
        }
        ```
    *   **Respostas de Erro:**
        *   `401 Unauthorized`: Usuário não autenticado.
        *   `403 Forbidden`: Usuário não autorizado a deletar a avaliação.
        *   `404 Not Found`: Avaliação não encontrada.
        *   `500 Internal Server Error`: Erro no servidor.

## Considerações Adicionais:

*   **Validação de Dados:** Implementar validação robusta para todos os dados de entrada no backend (ex: usando uma biblioteca como Joi ou express-validator).
*   **Tratamento de Erros:** Garantir que todos os erros sejam tratados adequadamente e que respostas claras sejam enviadas ao cliente.
*   **Segurança:** Considerar medidas de segurança como sanitização de inputs para prevenir XSS, especialmente no `comment_text`.
*   **Performance:** Otimizar as consultas ao banco de dados, especialmente para listagem de avaliações.

