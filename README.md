# Reporta Cidade Frontend

Frontend em **React + Vite + Tailwind CSS** para o backend Flask `reporta-cidade-backend`.

O sistema permite que cidadãos registrem denúncias urbanas e que prefeituras acompanhem os registros por dashboard, filtros e mudança de status.

## Stack

- React 
- Vite 
- Tailwind CSS 3
- CSS com paleta Nord customizada em `tailwind.config.js`
- Fetch API com tratamento centralizado em `src/services/api.js`

## Funcionalidades

### Conta cidadão

- Cadastro e login.
- Listagem de denúncias.
- Busca local por ID, endereço, descrição, bairro, cidade e referência.
- Filtros por cidade, status, categoria e bairro.
- Ordenação por denúncias recentes, antigas ou status.
- Paginação da listagem.
- Cadastro de nova denúncia com validação dos campos.
- Seleção de foto com prévia local.
- Exclusão da própria denúncia com modal de confirmação.
- Tela de perfil.
- Alteração de senha.

### Conta prefeitura

- Cadastro e login.
- Dashboard com resumo das denúncias.
- Agrupamento por status, categoria e bairro.
- Listagem de denúncias com busca, filtros, ordenação e paginação.
- Alteração de status das denúncias.
- Tela de perfil.
- Alteração de senha.

## Rotas do frontend

O app usa navegação baseada na History API:

```txt
/dashboard       Dashboard da prefeitura
/denuncias       Listagem de denúncias
/nova-denuncia   Cadastro de denúncia para cidadão
/perfil          Dados da conta e alteração de senha
```

Ao acessar uma rota protegida sem sessão ativa, o usuário volta para a tela de autenticação.

Em produção, configure o servidor para fazer fallback de qualquer rota do frontend para `index.html`. Sem esse fallback, acessar diretamente URLs como `/dashboard` ou `/perfil` pode retornar 404 no servidor.

## Rotas consumidas do backend

```txt
POST   /api/auth/usuarios/cadastro
POST   /api/auth/usuarios/login
POST   /api/auth/prefeituras/cadastro
POST   /api/auth/prefeituras/login
GET    /api/auth/eu

GET    /api/denuncias/listar
POST   /api/denuncias/criar
PATCH  /api/denuncias/atualizar/:id
DELETE /api/denuncias/excluir/:id

GET    /api/dashboard/resumo
GET    /api/dashboard/status
GET    /api/dashboard/categorias
GET    /api/dashboard/bairros

GET    /api/perfil/
PUT    /api/perfil/atualizar
PATCH  /api/perfil/senha
```

## Como rodar

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Configure a URL do backend:

```env
VITE_API_URL=http://localhost:5000
```

Rode o frontend:

```bash
npm run dev
```

Acesse:

```txt
http://localhost:5173
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: gera a versão de produção em `dist/`.
- `npm run preview`: serve localmente o build de produção.

## Sessão e API

O frontend guarda a sessão no `localStorage`:

```txt
reporta_token
reporta_user
```

O token é enviado no cabeçalho:

```txt
Authorization: Bearer <token>
```

As requisições têm timeout de 15 segundos. Quando o backend retorna `401`, o app limpa a sessão local e volta para a autenticação.

## Denúncias e fotos

No cadastro de denúncia, o campo de foto mostra uma prévia local no navegador.

Atualmente o frontend mantém compatibilidade com o backend enviando apenas o nome do arquivo no campo:

```txt
foto_filename
```

Ou seja, a imagem selecionada ainda não é enviada como upload real para o backend. Para upload completo, o backend precisa expor uma rota que aceite `multipart/form-data` ou outro fluxo de armazenamento de arquivos.

## CORS

No backend, o CORS deve aceitar a origem do Vite:

```txt
http://localhost:5173
```

Se mudar a porta ou domínio do frontend, ajuste a configuração `CORS_ORIGINS` no backend.

## Teste manual recomendado

Para testar o dashboard, entre com uma conta do tipo **prefeitura**.

Para criar denúncias, entre com uma conta do tipo **cidadão**.
