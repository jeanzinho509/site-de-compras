# Especificação da Interface do Usuário (UI) para o Sistema de Avaliação e Comentários

## Localização da Funcionalidade:

*   **Página de Detalhes do Produto:** Abaixo das informações do produto e antes de produtos relacionados (se houver).

## Componentes da Interface:

1.  **Seção de Exibição de Avaliações Existentes:**
    *   **Título:** "Avaliações de Clientes" ou similar.
    *   **Sumário de Avaliações (Opcional, mas recomendado):**
        *   Nota média do produto (ex: 4.5 de 5 estrelas).
        *   Número total de avaliações.
        *   Distribuição de estrelas (ex: gráfico de barras mostrando quantas avaliações de 5 estrelas, 4 estrelas, etc.).
    *   **Lista de Avaliações Individuais:**
        *   Cada avaliação exibirá:
            *   Nome do usuário (ou "Usuário Anônimo" se não logado ou se a política permitir).
            *   Nota em estrelas (ex: ⭐️⭐️⭐️⭐️☆).
            *   Data da avaliação.
            *   Texto do comentário.
            *   Botões "Editar" e "Excluir" (visíveis apenas para o autor da avaliação ou administrador).
        *   **Paginação:** Se houver muitas avaliações, implementar paginação (ex: 5-10 avaliações por página).
        *   **Filtros/Ordenação (Opcional):** Permitir ordenar por mais recentes, mais antigas, maior nota, menor nota.

2.  **Formulário para Submeter Nova Avaliação/Comentário (Visível apenas para usuários logados que compraram o produto - a ser definido se a compra é um pré-requisito):**
    *   **Título:** "Deixe sua Avaliação" ou "Avalie este Produto".
    *   **Campo de Seleção de Nota (Rating):**
        *   Representação visual com estrelas interativas (o usuário clica na estrela para definir a nota).
        *   Input numérico oculto que reflete a seleção de estrelas (1 a 5).
        *   Obrigatório.
    *   **Campo de Texto para Comentário:**
        *   Textarea para o usuário escrever seu comentário.
        *   Limite de caracteres (ex: 500 caracteres) com contador visual.
        *   Opcional (ou obrigatório, dependendo da política).
    *   **Botão de Submissão:**
        *   Texto: "Enviar Avaliação" ou "Publicar".
        *   Desabilitado até que os campos obrigatórios (pelo menos a nota) sejam preenchidos.
    *   **Feedback ao Usuário:**
        *   Mensagem de sucesso após submissão.
        *   Mensagens de erro claras se a submissão falhar (ex: erro de validação, erro no servidor).

## Interações do Usuário:

*   **Visualizar Avaliações:** Usuários (logados ou não) podem ver as avaliações existentes.
*   **Submeter Avaliação:**
    *   Apenas usuários logados (e possivelmente que compraram o produto) podem submeter avaliações.
    *   O usuário seleciona a nota clicando nas estrelas.
    *   O usuário digita o comentário (se desejar/obrigatório).
    *   Ao clicar em "Enviar Avaliação", os dados são enviados para o backend (`POST /api/reviews/product/:productId`).
    *   A nova avaliação aparece na lista (ou a lista é atualizada) após a submissão bem-sucedida.
*   **Editar Avaliação:**
    *   O autor da avaliação (ou admin) clica no botão "Editar".
    *   O formulário de avaliação é preenchido com os dados da avaliação existente.
    *   O usuário modifica a nota e/o comentário.
    *   Ao clicar em "Salvar Alterações" (o botão de submissão muda de texto), os dados são enviados para o backend (`PUT /api/reviews/:reviewId`).
    *   A avaliação é atualizada na lista.
*   **Excluir Avaliação:**
    *   O autor da avaliação (ou admin) clica no botão "Excluir".
    *   Uma caixa de diálogo de confirmação aparece ("Tem certeza que deseja excluir esta avaliação?").
    *   Se confirmado, a requisição é enviada para o backend (`DELETE /api/reviews/:reviewId`).
    *   A avaliação é removida da lista.

## Considerações de Design e Usabilidade:

*   **Responsividade:** A seção de avaliações e o formulário devem ser totalmente responsivos e funcionar bem em dispositivos móveis, tablets e desktops.
*   **Acessibilidade (A11y):**
    *   Garantir que os controles de estrelas sejam acessíveis via teclado.
    *   Usar atributos ARIA apropriados para descrever os elementos interativos.
    *   Contraste de cores adequado.
*   **Clareza Visual:** As notas em estrelas devem ser fáceis de entender. O texto do comentário deve ser legível.
*   **Feedback Imediato:** Fornecer feedback visual durante as interações (ex: ao passar o mouse sobre as estrelas, ao submeter o formulário).
*   **Prevenção de Submissões Múltiplas:** Desabilitar o botão de submissão após o primeiro clique até que a resposta do servidor seja recebida.

## Arquivos a Serem Modificados/Criados (Frontend):

*   **HTML:** Página de detalhes do produto (ex: `product-details.html` ou similar, se não for renderizado dinamicamente via JS).
*   **CSS:** Arquivo de estilos principal (`style.css`) ou um novo arquivo CSS específico para a seção de avaliações (ex: `reviews.css`).
*   **JavaScript:**
    *   Script da página de detalhes do produto para buscar e renderizar avaliações.
    *   Lógica para manipulação do formulário de submissão (validação, envio AJAX).
    *   Lógica para interações de edição e exclusão.
    *   Pode ser parte do `script.js` existente ou um novo arquivo (ex: `product-reviews.js`).

