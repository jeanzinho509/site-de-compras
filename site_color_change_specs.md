# Especificação Técnica: Alteração de Cores do Site

## 1. Visão Geral

Esta funcionalidade visa alterar o esquema de cores do site HTeasy.com, modificando:
- **Cor de fundo principal:** Mudar para amarelo
- **Cor do texto:** Mudar para azul

## 2. Arquivos CSS a Serem Modificados

Com base na análise do projeto, o principal arquivo CSS que controla o estilo do site é:

- **`style.css`** - Arquivo CSS principal que define os estilos globais do site

Outros arquivos CSS que podem precisar de modificação:
- **`login.css`** - Estilos específicos para a página de login
- Quaisquer outros arquivos CSS específicos para componentes ou páginas

## 3. Alterações Específicas no `style.css`

### 3.1. Cores de Fundo

As seguintes propriedades CSS precisam ser modificadas para alterar o fundo para amarelo:

```css
/* Cor de fundo do body */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #FFFF00; /* Amarelo */
}

/* Navbar (atualmente azul) */
.navbar {
    background: #FFFF00; /* Mudar de #256AF5 (azul) para amarelo */
    color: #0000FF; /* Mudar de white para azul */
    padding: 1rem 0;
    position: relative;
}

/* Seção de categorias */
.categories {
    background: #FFFF00; /* Mudar de rgb(255, 255, 255) para amarelo */
    padding: 2rem 0;
    text-align: center;
}

/* Cards de categoria */
.category-card {
    background: #FFFF00; /* Mudar de #FFFF para amarelo */
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    flex: 1;
    min-width: 250px;
    max-width: 300px;
    text-align: center;
    box-shadow: 0 2px 5px #ddd;
    transition: transform 0.3s ease;
}

/* Footer */
.footer {
    background: #FFFF00; /* Mudar de #256AF5 para amarelo */
    color: #0000FF; /* Mudar de white para azul */
    text-align: center;
    padding: 1rem 0;
    margin-top: 2rem;
    width: 100%;
}

/* Seção About */
.about-section {
    padding: 4rem 0;
    background: #FFFF00; /* Mudar de #f9f9f9 para amarelo */
}
```

### 3.2. Cores de Texto

As seguintes propriedades CSS precisam ser modificadas para alterar o texto para azul:

```css
/* Texto do body */
body {
    color: #0000FF; /* Azul */
}

/* Links na navegação */
.nav-links a {
    color: #0000FF; /* Mudar de white para azul */
    text-decoration: none;
    font-weight: bold;
}

/* Botões */
.btn {
    background: rgb(241, 241, 241);
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: 5px;
    color: #0000FF; /* Mudar de black para azul */
    font-weight: bold;
}

/* Container */
.container {
    display: flex;
    color: #0000FF; /* Mudar de black para azul */
    justify-content: space-between;
    align-items: center;
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
}

/* Títulos e parágrafos */
h1, h2, h3, h4, h5, h6, p {
    color: #0000FF; /* Azul */
}

/* Texto na seção About */
.about-content p {
    margin-bottom: 1.5rem;
    line-height: 1.6;
    font-size: 1.1rem;
    color: #0000FF; /* Mudar de #555 para azul */
}
```

### 3.3. Ícones e Elementos Interativos

```css
/* Ícones de carrinho e wishlist */
.icon-btn {
    position: relative;
    color: #0000FF; /* Mudar de white para azul */
    font-size: 1.2rem;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-btn:hover {
    color: #0000AA; /* Azul mais escuro para hover */
}

/* Botão de menu mobile */
.mobile-menu-btn span {
    display: block;
    width: 25px;
    height: 3px;
    background-color: #0000FF; /* Mudar de white para azul */
    margin: 5px 0;
    transition: all 0.3s ease;
    transform-origin: center;
}
```

## 4. Alterações em Outros Arquivos CSS

### 4.1. `login.css`

Verificar e modificar as cores de fundo e texto no arquivo `login.css` para manter a consistência:

```css
/* Exemplo de alterações necessárias em login.css */
body {
    background-color: #FFFF00; /* Amarelo */
    color: #0000FF; /* Azul */
}

.login-container {
    background-color: #FFFF00; /* Amarelo */
}

.login-form label, .login-form input {
    color: #0000FF; /* Azul */
}

/* ... outras alterações conforme necessário ... */
```

## 5. Considerações Importantes

### 5.1. Contraste e Acessibilidade

- A combinação de amarelo (fundo) e azul (texto) deve ser testada para garantir contraste adequado e legibilidade.
- Recomenda-se usar ferramentas de verificação de contraste para garantir que o site permaneça acessível.
- Pode ser necessário ajustar os tons específicos de amarelo e azul para melhorar o contraste.

### 5.2. Consistência Visual

- Garantir que todas as páginas e componentes do site adotem o novo esquema de cores.
- Verificar elementos que podem ter estilos inline ou classes específicas que sobrescrevem os estilos globais.
- Testar em diferentes navegadores e dispositivos para garantir consistência.

### 5.3. Elementos de Marca e Imagens

- Considerar se logotipos, ícones ou imagens precisam ser atualizados para combinar com o novo esquema de cores.
- Verificar se há elementos visuais que podem parecer deslocados com o novo esquema.

## 6. Tarefas de Implementação

1. **Backup:**
   - [ ] Fazer backup dos arquivos CSS originais antes de qualquer modificação.

2. **Modificações:**
   - [ ] Modificar `style.css` conforme especificado acima.
   - [ ] Modificar `login.css` e outros arquivos CSS específicos.
   - [ ] Verificar e ajustar quaisquer estilos inline em arquivos HTML.

3. **Testes:**
   - [ ] Testar todas as páginas do site para garantir que as alterações de cor sejam aplicadas consistentemente.
   - [ ] Verificar a legibilidade e o contraste em diferentes dispositivos e navegadores.
   - [ ] Testar a responsividade para garantir que as alterações funcionem bem em todos os tamanhos de tela.

4. **Refinamento:**
   - [ ] Ajustar tons específicos de amarelo e azul conforme necessário para melhorar a estética e a legibilidade.
   - [ ] Corrigir quaisquer inconsistências ou problemas identificados durante os testes.

Este documento orientará a implementação da alteração de cores do site HTeasy.com.
