# Planejamento do Fluxo de Checkout e Integração com Gateways de Pagamento

Este documento detalha o fluxo de checkout e a integração com os gateways de pagamento Stripe (para Cartões de Crédito/Débito e Google Pay) e PayPal (para pagamentos com conta PayPal) no projeto HTeasy.com.

## Gateways Escolhidos (Proposta Inicial):

*   **Stripe:** Para processamento de Cartões de Crédito/Débito e Google Pay. Oferece SDKs robustos (Node.js para backend, Stripe.js/Elements para frontend) e simplifica a conformidade PCI DSS.
*   **PayPal:** Para pagamentos utilizando saldo da conta PayPal. Utilizará o PayPal JavaScript SDK no frontend e a API REST do PayPal v2 no backend.

## Fluxo Geral de Checkout:

1.  **Carrinho de Compras:**
    *   Usuário adiciona produtos ao carrinho.
    *   Usuário visualiza o carrinho com os itens, quantidades e subtotal.
    *   Botão "Finalizar Compra" ou "Ir para Pagamento".

2.  **Página de Checkout (Single Page ou Multi-Step):**
    *   **Informações do Cliente:**
        *   Se logado, preencher dados de endereço de entrega/cobrança salvos.
        *   Se não logado, ou para novos endereços, formulário para inserir nome, endereço, contato.
    *   **Opções de Envio (se aplicável):** Seleção do método de envio e cálculo do frete.
    *   **Resumo do Pedido:** Itens, subtotal, frete, total a pagar.
    *   **Seleção do Método de Pagamento:**
        *   Opção 1: Cartão de Crédito/Débito (integrado com Stripe Elements).
        *   Opção 2: Google Pay (botão do Google Pay, integrado com Stripe).
        *   Opção 3: PayPal (botão do PayPal).

## Detalhamento da Integração por Método de Pagamento:

### 1. Cartão de Crédito/Débito (via Stripe)

*   **Frontend (Página de Checkout):
    *   Utilizar **Stripe.js** e **Stripe Elements** para criar um formulário de cartão seguro (campos para número do cartão, validade, CVC).
    *   Os dados do cartão são enviados diretamente para a Stripe, não para o servidor do HTeasy.com, minimizando o escopo PCI.
    *   Ao submeter o formulário de pagamento:
        1.  O frontend solicita ao backend a criação de um `PaymentIntent` no Stripe. Este `PaymentIntent` representa a intenção de cobrar o cliente e inclui o valor.
        2.  O backend cria o `PaymentIntent` usando o SDK Node.js da Stripe e retorna o `client_secret` do `PaymentIntent` para o frontend.
        3.  O frontend usa o `client_secret` e os dados do Stripe Elements para confirmar o pagamento com `stripe.confirmCardPayment(clientSecret, {payment_method: {card: cardElement}})`.
        4.  Stripe processa o pagamento. O frontend recebe o resultado (sucesso ou falha).
*   **Backend (Node.js):
    *   **Rota para criar `PaymentIntent`:**
        *   `POST /api/payments/stripe/create-payment-intent`
        *   Recebe o ID do pedido ou valor total.
        *   Cria um `PaymentIntent` na Stripe com o valor e moeda.
        *   Retorna o `client_secret` do `PaymentIntent`.
    *   **Webhook Handler para Stripe:**
        *   `POST /api/payments/stripe/webhook`
        *   Recebe eventos da Stripe (ex: `payment_intent.succeeded`, `payment_intent.payment_failed`).
        *   Verifica a assinatura do webhook para segurança.
        *   Atualiza o status do pedido no banco de dados do HTeasy.com com base no evento.
        *   Envia confirmação de pedido ao cliente (e.g., email) se o pagamento for bem-sucedido.
*   **Banco de Dados HTeasy.com:**
    *   Armazenar o `payment_intent_id` da Stripe associado ao pedido.
    *   Armazenar o status do pagamento (pendente, sucedido, falhou).

### 2. Google Pay (via Stripe)

*   **Frontend (Página de Checkout):
    *   Utilizar a **API Google Pay** e o **Stripe.js**.
    *   Exibir o botão do Google Pay.
    *   Ao clicar no botão Google Pay:
        1.  O frontend solicita ao backend a criação de um `PaymentIntent` no Stripe (similar ao fluxo de cartão).
        2.  O backend retorna o `client_secret`.
        3.  O frontend usa o `client_secret` para apresentar a interface do Google Pay ao usuário.
        4.  Após o usuário autorizar no Google Pay, o Google Pay retorna um token de pagamento.
        5.  O frontend usa `stripe.confirmCardPayment(clientSecret, {payment_method: {card: {token: googlePayToken}}})` (ou método similar dependendo da versão da API Stripe para Google Pay) para confirmar o pagamento com a Stripe usando o token do Google Pay.
*   **Backend (Node.js):
    *   A rota para criar `PaymentIntent` e o Webhook Handler são os mesmos utilizados para pagamentos com cartão via Stripe.
*   **Banco de Dados HTeasy.com:** Similar ao fluxo de cartão.

### 3. PayPal

*   **Frontend (Página de Checkout):
    *   Utilizar o **PayPal JavaScript SDK**.
    *   Renderizar o botão de pagamento do PayPal (`paypal.Buttons({...})`).
    *   **Configuração do Botão PayPal:**
        *   `createOrder`: Função que é chamada quando o usuário clica no botão PayPal. Esta função deve fazer uma chamada ao backend do HTeasy.com para criar uma ordem no PayPal.
        *   `onApprove`: Função que é chamada após o usuário aprovar o pagamento na janela do PayPal. Esta função recebe o `orderID` do PayPal e deve fazer uma chamada ao backend do HTeasy.com para capturar o pagamento.
*   **Backend (Node.js):
    *   **Rota para Criar Ordem no PayPal:**
        *   `POST /api/payments/paypal/create-order`
        *   Recebe o ID do pedido ou valor total do HTeasy.com.
        *   Usa o SDK Node.js do PayPal (API v2 Orders) para criar uma ordem no PayPal com os detalhes da transação (valor, itens).
        *   Retorna o `orderID` do PayPal para o frontend.
    *   **Rota para Capturar Pagamento no PayPal:**
        *   `POST /api/payments/paypal/capture-order`
        *   Recebe o `orderID` do PayPal (aprovado pelo usuário no frontend).
        *   Usa o SDK Node.js do PayPal para capturar o pagamento para a ordem especificada.
        *   Se a captura for bem-sucedida, atualiza o status do pedido no banco de dados do HTeasy.com e envia confirmação ao cliente.
    *   **Webhook Handler para PayPal (Recomendado):**
        *   `POST /api/payments/paypal/webhook`
        *   Recebe eventos do PayPal (ex: `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`).
        *   Verifica a assinatura do webhook.
        *   Atualiza o status do pedido e lida com lógicas de negócio.
*   **Banco de Dados HTeasy.com:**
    *   Armazenar o `paypal_order_id` e `paypal_capture_id` (ou `transaction_id`) associados ao pedido.
    *   Armazenar o status do pagamento.

## Considerações Gerais:

*   **Segurança:**
    *   Utilizar HTTPS em todas as comunicações.
    *   Nunca armazenar dados sensíveis de cartão no servidor HTeasy.com. Delegar isso aos gateways (Stripe Elements, iframes do PayPal).
    *   Proteger chaves de API e segredos (usar variáveis de ambiente).
    *   Validar todas as entradas e saídas.
    *   Implementar proteção contra CSRF e XSS.
*   **Experiência do Usuário:**
    *   Fornecer feedback claro durante todo o processo de pagamento.
    *   Lidar graciosamente com erros e permitir que o usuário tente novamente ou escolha outro método.
    *   Otimizar para dispositivos móveis.
*   **Testes:**
    *   Utilizar os ambientes de teste (sandbox) fornecidos pela Stripe e PayPal.
    *   Testar todos os fluxos de sucesso e falha.
*   **Reembolsos e Disputas:** Planejar como os reembolsos serão processados (geralmente através do painel do gateway ou via API).

Este planejamento servirá como base para a criação das rotas de backend, componentes de frontend e atualizações no banco de dados necessárias para a Funcionalidade 2.
