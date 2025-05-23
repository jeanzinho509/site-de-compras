# Especificação Técnica: Novas Categorias de Produtos

## 1. Visão Geral

Esta funcionalidade visa expandir as categorias de produtos oferecidas no HTeasy.com, adicionando as seguintes novas categorias principais:

*   Furniture and Real Estate
*   Food Product
*   Cosmetic Product
*   Pharmaceutical Product

## 2. Impacto no Modelo de Dados (Backend)

Assumindo que existe uma tabela `categories` no banco de dados com uma estrutura similar a:

```sql
CREATE TABLE categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE, -- Para URLs amigáveis
  description TEXT NULL,
  parent_category_id INT NULL, -- Para subcategorias, se aplicável
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_category_id) REFERENCES categories(category_id)
);
```

**Ações Necessárias:**

1.  **Inserir Novas Categorias:** Adicionar as novas categorias na tabela `categories`. Se houver um painel de administração de categorias, elas podem ser adicionadas por lá. Caso contrário, será necessário um script SQL ou uma inserção manual.

    *   **Exemplo de Inserção (SQL):**
        ```sql
        INSERT INTO categories (name, slug) VALUES
        ('Furniture and Real Estate', 'furniture-real-estate'),
        ('Food Product', 'food-product'),
        ('Cosmetic Product', 'cosmetic-product'),
        ('Pharmaceutical Product', 'pharmaceutical-product');
        ```
    *   **Considerar Subcategorias:** Se estas novas categorias principais puderem ter subcategorias (ex: "Furniture and Real Estate" -> "Sofas", "Tables", "Apartments for Rent"), o campo `parent_category_id` seria utilizado. Para esta especificação inicial, elas serão tratadas como categorias principais.

2.  **Rotas de Backend para Categorias:**
    *   As rotas existentes para listar categorias (`GET /api/categories`) devem automaticamente incluir as novas categorias após a inserção no banco.
    *   Verificar se a lógica de criação/edição de produtos no backend (`POST /api/products`, `PUT /api/products/:productId` e as equivalentes do painel do vendedor) permite associar produtos às novas `category_id`s.

## 3. Impacto na Interface do Usuário (Frontend)

As novas categorias precisam ser refletidas em todas as áreas do site onde as categorias são exibidas ou utilizadas para filtragem.

1.  **Menu de Navegação Principal (Header):**
    *   O dropdown "Categories" no `index.html` (e outras páginas com o mesmo header) precisa ser atualizado para incluir as novas categorias.
    *   **Arquivo a ser modificado:** `index.html` (e arquivos HTML de categorias como `Electronics.html`, `Fashion.html`, etc., que replicam o header).
    *   **Lógica:** Se a lista de categorias no dropdown é carregada dinamicamente via JavaScript a partir da API (`GET /api/categories`), nenhuma alteração manual no HTML será necessária para o conteúdo do dropdown, apenas garantir que a API retorne as novas categorias. Se for estático, o HTML precisará ser editado.
        *   **Análise do `script.js`:** O `script.js` atual tem uma lógica para o `categories-list` que redireciona para `selectedValue` (que parece ser o nome do arquivo HTML da categoria). Será preciso criar arquivos HTML para as novas categorias (ex: `FurnitureAndRealEstate.html`) ou mudar a lógica para usar slugs e uma página de categoria genérica que filtre por slug/ID.

2.  **Página Principal (Seção "Popular Categories" em `index.html`):**
    *   Decidir se alguma das novas categorias será destacada como "Popular". Se sim, adicionar os respectivos cards.
    *   **Arquivo a ser modificado:** `index.html`.
    *   **Exemplo de Card (HTML):**
        ```html
        <a href="FurnitureAndRealEstate.html" class="category-card">
            <img src="assets/furniture.jpg" alt="Furniture and Real Estate"> <!-- Imagem placeholder -->
            <h3>Furniture and Real Estate</h3>
        </a>
        ```
    *   Será necessário adicionar imagens representativas para as novas categorias na pasta `assets/`.

3.  **Páginas de Categoria Dedicadas:**
    *   Atualmente, o projeto parece ter arquivos HTML separados para cada categoria (ex: `Electronics.html`). Se este padrão for mantido, será necessário criar novos arquivos HTML para cada nova categoria:
        *   `FurnitureAndRealEstate.html`
        *   `FoodProduct.html`
        *   `CosmeticProduct.html`
        *   `PharmaceuticalProduct.html`
    *   Estes arquivos provavelmente replicam a estrutura das páginas de categoria existentes, mas filtrarão produtos da respectiva nova categoria.
    *   **Alternativa (Recomendado para Escalabilidade):** Refatorar para ter uma única página de template de categoria (ex: `category.html`) que carrega produtos dinamicamente com base em um parâmetro na URL (ex: `category.html?slug=food-product`). Isso evitaria a duplicação de HTML.

4.  **Filtros de Produtos (Se existentes em páginas de listagem geral ou busca):**
    *   Se houver filtros de categoria em outras partes do site, eles também precisarão ser atualizados para incluir as novas opções.

5.  **Painel Administrativo (Geral e do Vendedor):**
    *   No formulário de criação/edição de produtos (tanto no painel de admin geral quanto no painel do vendedor), o dropdown ou seletor de categorias deve listar as novas categorias para que os produtos possam ser associados a elas.
    *   Isso geralmente é populado dinamicamente a partir da API (`GET /api/categories`), então deve funcionar automaticamente se a API estiver correta.

## 4. Tarefas de Implementação

1.  **Backend:**
    *   [ ] Adicionar as novas categorias à tabela `categories` no banco de dados.
    *   [ ] Verificar e garantir que as APIs de produto (`/api/products`, `/api/seller/products`) e categoria (`/api/categories`) funcionem corretamente com as novas categorias.

2.  **Frontend:**
    *   [ ] **Decidir a estratégia para páginas de categoria:** Manter arquivos HTML separados ou refatorar para um template dinâmico.
    *   [ ] Se mantendo arquivos separados: Criar os novos arquivos HTML (`FurnitureAndRealEstate.html`, `FoodProduct.html`, etc.) baseados nos existentes.
    *   [ ] Atualizar o dropdown de categorias no header (`index.html` e outras páginas relevantes) para incluir as novas categorias e seus respectivos links.
    *   [ ] (Opcional) Adicionar cards para as novas categorias na seção "Popular Categories" do `index.html` (requer novas imagens em `assets/`).
    *   [ ] Garantir que os formulários de adição/edição de produto nos painéis administrativos (geral e vendedor) listem as novas categorias.
    *   [ ] Testar a navegação e a exibição de produtos para as novas categorias.

## 5. Considerações Adicionais

*   **Imagens para Categorias:** Providenciar ou encontrar imagens placeholder adequadas para representar as novas categorias nos cards da página inicial e, possivelmente, em banners ou outras seções visuais.
*   **SEO:** Se novas páginas HTML forem criadas, garantir que tenham metatags (título, descrição) adequadas para SEO.
*   **Tradução/Localização:** Se o site suportar múltiplos idiomas, os nomes das novas categorias precisarão ser traduzidos.

Este documento orientará a implementação da adição de novas categorias de produtos.
