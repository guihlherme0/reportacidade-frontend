# Reporta Cidade Frontend

Frontend simples em **React + Vite + Tailwind CSS** para o backend Flask `reporta-cidade-backend`.

A interface usa a paleta **Nord Snow Storm** como base visual:

- `nord4`: `#d8dee9`
- `nord5`: `#e5e9f0`
- `nord6`: `#eceff4`

Também foram adicionadas cores Nord auxiliares no `tailwind.config.js` para texto, botões, estados de erro e sucesso.

## Funcionalidades

### Conta cidadão

- Cadastro e login de usuário.
- Listagem de denúncias.
- Cadastro de nova denúncia.
- Exclusão da própria denúncia.
- Tela de perfil.
- Alteração de senha.

### Conta prefeitura

- Cadastro e login de prefeitura.
- Dashboard com resumo das denúncias da cidade.
- Agrupamento por status, categoria e bairro.
- Listagem de denúncias.
- Alteração de status das denúncias.
- Tela de perfil.
- Alteração de senha.

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

Se o backend estiver rodando na porta padrão, mantenha:

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

## Observações importantes

No backend, o CORS já está configurado para aceitar `http://localhost:5173` por padrão. Se mudar a porta do frontend, ajuste a variável `CORS_ORIGINS` no `.env` do backend.

Este frontend usa `localStorage` para guardar o JWT:

```txt
reporta_token
reporta_user
```

Para testar o dashboard, entre com uma conta do tipo **prefeitura**. Para criar denúncias, entre com uma conta do tipo **cidadão**.
