# Esquema do Banco de Dados para o Sistema de Avaliação e Comentários

## Tabela: `reviews`

Esta tabela armazenará as avaliações e comentários feitos pelos usuários para os produtos.

| Coluna         | Tipo de Dado | Restrições                     | Descrição                                           |
|----------------|--------------|--------------------------------|-----------------------------------------------------|
| `review_id`    | INT          | PRIMARY KEY, AUTO_INCREMENT    | Identificador único da avaliação.                   |
| `product_id`   | INT          | FOREIGN KEY (references `products.product_id`) | Identificador do produto que está sendo avaliado.    |
| `user_id`      | INT          | FOREIGN KEY (references `users.user_id`)       | Identificador do usuário que fez a avaliação.       |
| `rating`       | TINYINT      | NOT NULL, CHECK (rating >= 1 AND rating <= 5) | Nota da avaliação (e.g., de 1 a 5 estrelas).        |
| `comment_text` | TEXT         | NULL                           | Texto do comentário opcional.                       |
| `created_at`   | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP      | Data e hora de criação da avaliação.                |
| `updated_at`   | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Data e hora da última atualização da avaliação.     |

## Considerações Adicionais:

*   **Índices:** Criar índices nas colunas `product_id` e `user_id` para otimizar consultas.
*   **Relacionamentos:**
    *   Um produto pode ter várias avaliações.
    *   Um usuário pode fazer várias avaliações.
*   **Moderação:** Considerar a necessidade futura de um campo para status de moderação do comentário (ex: `status` ENUM('pending', 'approved', 'rejected')). Por enquanto, não será incluído, mas é um ponto para evolução.
*   **Respostas a Comentários:** Se houver necessidade de respostas a comentários, uma nova tabela ou uma auto-referência na tabela `reviews` (com um campo `parent_review_id`) poderia ser considerada.

