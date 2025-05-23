# Especificação Técnica: Painel Administrativo do Vendedor

## 1. Visão Geral e Escopo

O Painel Administrativo do Vendedor será uma seção dedicada no HTeasy.com, acessível apenas por usuários com perfil de "Vendedor". Este painel permitirá que os vendedores gerenciem seus produtos, visualizem e gerenciem seus pedidos, e acessem informações relevantes sobre suas vendas e clientes (dentro dos limites da privacidade e LGPD/GDPR).

**Principais Funcionalidades:**

*   **Gerenciamento de Produtos:**
    *   Listar produtos cadastrados pelo vendedor.
    *   Adicionar novo produto (com formulário detalhado: nome, descrição, preço, estoque, categoria, imagens, etc.).
    *   Editar produtos existentes.
    *   Excluir produtos (ou marcar como inativo).
    *   Visualizar status do produto (ativo, inativo, pendente de aprovação - se houver moderação).
*   **Gerenciamento de Pedidos:**
    *   Listar pedidos contendo produtos do vendedor.
    *   Visualizar detalhes de cada pedido (itens, informações do comprador - com dados sensíveis mascarados ou limitados, status do pagamento, endereço de entrega).
    *   Atualizar status do envio do pedido (ex: "Processando", "Enviado", "Entregue").
    *   Adicionar código de rastreamento.
*   **Dashboard (Visão Geral):**
    *   Resumo de vendas (total de vendas, número de pedidos no período).
    *   Produtos mais vendidos.
    *   Últimos pedidos.
    *   Notificações (ex: novo pedido, produto com baixo estoque).
*   **Gerenciamento de Perfil do Vendedor (Básico):**
    *   Visualizar e editar informações básicas do perfil de vendedor (nome da loja, descrição - se aplicável).

## 2. Estrutura de Rotas do Backend (Node.js/Express)

Será criado um novo conjunto de rotas, prefixadas com `/api/seller`, e protegidas por middleware que verifica se o usuário está autenticado e se possui o papel (`role`) de "vendedor".

**Arquivo de Rotas Principal:** `server/routes/seller.routes.js` (a ser criado)
**Controladores Associados:** `server/controllers/sellerProduct.controller.js`, `server/controllers/sellerOrder.controller.js`, `server/controllers/sellerDashboard.controller.js` (a serem criados).

### 2.1. Rotas de Gerenciamento de Produtos do Vendedor

*   **`GET /api/seller/products`**
    *   **Descrição:** Lista todos os produtos pertencentes ao vendedor logado.
    *   **Controlador:** `sellerProductController.getMyProducts`
    *   **Autenticação:** Requerida (Vendedor).
    *   **Query Params:** `page`, `limit`, `sortBy`, `filterByStatus`.
*   **`POST /api/seller/products`**
    *   **Descrição:** Cria um novo produto para o vendedor logado.
    *   **Controlador:** `sellerProductController.createProduct`
    *   **Autenticação:** Requerida (Vendedor).
    *   **Corpo da Requisição:** Dados do produto (nome, descrição, preço, estoque, categoria_id, imagens_urls, etc.).
*   **`GET /api/seller/products/:productId`**
    *   **Descrição:** Obtém detalhes de um produto específico pertencente ao vendedor logado.
    *   **Controlador:** `sellerProductController.getProductDetails`
    *   **Autenticação:** Requerida (Vendedor).
*   **`PUT /api/seller/products/:productId`**
    *   **Descrição:** Atualiza um produto existente pertencente ao vendedor logado.
    *   **Controlador:** `sellerProductController.updateProduct`
    *   **Autenticação:** Requerida (Vendedor).
    *   **Corpo da Requisição:** Campos a serem atualizados.
*   **`DELETE /api/seller/products/:productId`**
    *   **Descrição:** Exclui (ou marca como inativo) um produto pertencente ao vendedor logado.
    *   **Controlador:** `sellerProductController.deleteProduct`
    *   **Autenticação:** Requerida (Vendedor).

### 2.2. Rotas de Gerenciamento de Pedidos do Vendedor

*   **`GET /api/seller/orders`**
    *   **Descrição:** Lista todos os pedidos que contêm produtos do vendedor logado.
    *   **Controlador:** `sellerOrderController.getMyOrders`
    *   **Autenticação:** Requerida (Vendedor).
    *   **Query Params:** `page`, `limit`, `sortBy`, `filterByStatus` (status do pedido: pendente, processando, enviado, entregue, cancelado).
*   **`GET /api/seller/orders/:orderId`**
    *   **Descrição:** Obtém detalhes de um pedido específico que contém produtos do vendedor logado.
    *   **Controlador:** `sellerOrderController.getOrderDetails`
    *   **Autenticação:** Requerida (Vendedor).
*   **`PUT /api/seller/orders/:orderId/status`**
    *   **Descrição:** Atualiza o status de um item de pedido (ou do pedido, dependendo da granularidade) gerenciado pelo vendedor (ex: status do envio).
    *   **Controlador:** `sellerOrderController.updateOrderStatus`
    *   **Autenticação:** Requerida (Vendedor).
    *   **Corpo da Requisição:** `{ "status": "enviado", "tracking_code": "ABC123XYZ" }`.

### 2.3. Rotas do Dashboard do Vendedor

*   **`GET /api/seller/dashboard/summary`**
    *   **Descrição:** Obtém dados resumidos para o dashboard do vendedor (vendas recentes, contagem de pedidos, etc.).
    *   **Controlador:** `sellerDashboardController.getSummary`
    *   **Autenticação:** Requerida (Vendedor).

## 3. Interface do Usuário (UI) do Painel do Vendedor

O painel será uma nova seção no frontend, provavelmente acessível através de um link no menu do usuário logado (se ele for vendedor).

**Estrutura de Páginas/Componentes:**

1.  **Layout Principal do Painel:**
    *   Menu de navegação lateral: Dashboard, Meus Produtos, Meus Pedidos, Configurações (Perfil).
    *   Área de conteúdo principal onde as seções são carregadas.

2.  **Página/Componente: Dashboard**
    *   Cards ou seções exibindo: Total de Vendas (últimos 30 dias), Número de Pedidos Pendentes, Produtos com Baixo Estoque.
    *   Gráfico simples de vendas ao longo do tempo (opcional, para V1).
    *   Lista dos últimos pedidos recebidos.

3.  **Página/Componente: Meus Produtos**
    *   **Listagem de Produtos:**
        *   Tabela ou grade exibindo: Imagem miniatura, Nome do Produto, SKU (se houver), Preço, Estoque, Status (Ativo/Inativo).
        *   Ações por produto: Editar, Excluir, Ver Detalhes.
        *   Filtros: por status, por categoria.
        *   Botão "Adicionar Novo Produto".
    *   **Formulário de Adicionar/Editar Produto:**
        *   Campos: Nome, Descrição (com editor de rich text básico), Preço, Preço Promocional (opcional), SKU, Estoque, Categoria (dropdown), Tags, Upload de Imagens (principal e galeria), Dimensões/Peso (para cálculo de frete, se aplicável), Variações (cor, tamanho - se o sistema suportar).
        *   Validação de formulário no frontend e backend.

4.  **Página/Componente: Meus Pedidos**
    *   **Listagem de Pedidos:**
        *   Tabela exibindo: ID do Pedido, Data, Nome do Cliente (limitado), Valor Total (dos itens do vendedor), Status do Pedido, Status do Envio.
        *   Ações por pedido: Ver Detalhes.
        *   Filtros: por status do pedido, por data.
    *   **Detalhes do Pedido:**
        *   Informações completas do pedido (itens do vendedor, quantidades, preços).
        *   Informações do cliente para envio (endereço).
        *   Histórico de status do pedido.
        *   Campo para adicionar/editar código de rastreamento.
        *   Dropdown para atualizar status do envio (ex: "Confirmado", "Em preparação", "Enviado", "Entregue").

5.  **Página/Componente: Configurações (Perfil do Vendedor - Simplificado para V1)**
    *   Formulário para editar nome da loja (se aplicável), breve descrição.

**Considerações de UI/UX:**

*   **Design Limpo e Intuitivo:** Facilitar a navegação e o gerenciamento para os vendedores.
*   **Responsividade:** O painel deve ser acessível e funcional em desktops e tablets. O suporte mobile pode ser simplificado inicialmente, mas deve ser considerado.
*   **Feedback ao Usuário:** Mensagens claras de sucesso, erro e carregamento.
*   **Segurança no Frontend:** Garantir que apenas vendedores autenticados possam acessar estas rotas e funcionalidades.

## 4. Modelo de Dados (Impactos/Adições)

*   **Tabela `users`:** Adicionar um campo `role` (ex: ENUM('customer', 'seller', 'admin')) ou uma tabela de `user_roles` para gerenciar permissões.
*   **Tabela `products`:** Garantir que haja uma referência `seller_id` (FOREIGN KEY para `users.user_id`) para associar produtos a vendedores.
*   **Tabela `orders` e `order_items`:** Analisar como os pedidos são estruturados para permitir que um vendedor veja apenas os itens/pedidos que lhe pertencem, especialmente em um marketplace com múltiplos vendedores por pedido.
    *   Pode ser necessário que `order_items` tenha um `seller_id`.
*   **Nova Tabela `seller_profiles` (Opcional):** Para armazenar informações específicas do vendedor (nome da loja, CNPJ, dados bancários para repasse - para futuras funcionalidades).

## 5. Próximos Passos no Detalhamento e Implementação:

1.  **Refinar o modelo de dados** para suportar vendedores e seus produtos/pedidos.
2.  **Implementar a lógica de autenticação e autorização** para o papel de "vendedor".
3.  **Desenvolver as rotas de backend** e controladores para cada funcionalidade do painel.
4.  **Desenvolver os componentes de frontend** para cada seção do painel.
5.  **Testes exaustivos** de todas as funcionalidades do painel.

Este documento servirá como base para o planejamento detalhado da implementação da Funcionalidade 3.
