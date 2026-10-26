# Medtec API: guia de rotas para o front

Tudo o que o front precisa para consumir a API: autenticação, formato das respostas, erros e cada rota com exemplo.

- **URL base:** `http://localhost:3000/api/v1` em desenvolvimento. Nos outros ambientes, use a URL do servidor + `/api/v1` (ex.: `http://172.16.107.63:3023/api/v1`).
- **Formato:** JSON. Envie sempre o header `Content-Type: application/json`.
- **CORS:** a origem do front precisa estar em `ALLOWED_ORIGINS` no `.env` da API (ex.: `http://localhost:5173` ou `http://localhost:3000`).
- **Coleção do Postman:** `docs/postman/medtec-api.postman_collection.json`.

---

## Sumário

1. [Autenticação: como funciona](#1-autenticação-como-funciona)
2. [Formato das respostas](#2-formato-das-respostas)
3. [Erros comuns a todas as rotas](#3-erros-comuns-a-todas-as-rotas)
4. [Paginação e filtros](#4-paginação-e-filtros)
5. [Rotas de autenticação](#5-rotas-de-autenticação-auth)
6. [Usuários](#6-usuários)
7. [Perfis](#7-perfis)
8. [Permissões do perfil](#8-permissões-do-perfil)
9. [Permissões extras do usuário](#9-permissões-extras-do-usuário)
10. [Estados](#10-estados)
11. [Cidades](#11-cidades)
12. [Resumo de todas as rotas](#12-resumo-de-todas-as-rotas)

---

## 1. Autenticação: como funciona

O login é feito com **CPF + senha** e devolve dois tokens:

| Token | Para que serve | Validade | Onde usar |
|---|---|---|---|
| `access_token` | Acessar as rotas da API | **15 minutos** | Header `Authorization: Bearer <access_token>` em toda requisição |
| `refresh_token` | Gerar um novo par de tokens sem pedir a senha de novo | **24 horas desde o login** | Corpo do `POST /auth/refresh_token` |

### Fluxo recomendado

```
1. Login ─────────────> guarda access_token e refresh_token
2. Toda requisição ───> Authorization: Bearer <access_token>
3. Recebeu 401 com errors = ["token_expirado"]?
      └─> POST /auth/refresh_token { refresh_token }
            ├─ 200: guarda os DOIS tokens novos e repete a requisição original
            └─ 401: manda o usuário para a tela de login
4. Logout ────────────> DELETE /auth/logout e apaga os tokens do front
```

### Regras importantes

- **Cada refresh devolve um `refresh_token` novo, e o antigo para de valer na hora.** Sempre substitua os dois tokens guardados.
- **As 24h não renovam.** Mesmo renovando o token várias vezes, 24h depois do login a pessoa precisa entrar de novo.
- **O logout derruba todas as sessões do usuário** (outros navegadores e celular também).
- **Trocar a senha também derruba todas as sessões.**
- **Usuário desativado** perde o acesso na próxima requisição (401 `usuario_inativo`).
- **Evite renovar em paralelo.** Se várias requisições derem `token_expirado` ao mesmo tempo, faça **um único** refresh e reaproveite o resultado nas outras. Como o refresh antigo é invalidado, um segundo refresh em paralelo recebe 401.

### Dados dentro do access token

O payload do JWT pode ser lido no front **sem** a chave secreta:

```json
{
  "user_id": 1,
  "perfil_id": 3,
  "perfil_nome": "Administrador",
  "usuario_ativo": true,
  "iat": 1792772987.30,
  "exp": 1792773887,
  "jti": "d5fe6138-bf59-4566-a03d-35a771d5830f"
}
```

| Campo | Significado |
|---|---|
| `user_id` | id do usuário logado |
| `perfil_id` / `perfil_nome` | perfil do usuário |
| `usuario_ativo` | se o usuário estava ativo quando o token foi gerado |
| `iat` | quando o token foi gerado (timestamp em segundos) |
| `exp` | quando o token expira (timestamp em segundos). Dá para renovar **antes** de expirar comparando com `Date.now() / 1000` |
| `jti` | id único do token (uso interno, para o logout) |

---

## 2. Formato das respostas

### Sucesso (envelope padrão)

```json
{
  "success": true,
  "message": "Login efetuado com sucesso.",
  "data": { },
  "timestamp": "2026-10-23T12:00:00-03:00"
}
```

### Listagens (paginadas)

```json
{
  "success": true,
  "message": "Registros encontrados com sucesso",
  "data": {
    "items": [ ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_count": 25,
      "per_page": 10
    }
  }
}
```

### Erro

```json
{
  "success": false,
  "message": "Texto para mostrar ao usuário",
  "errors": ["codigo_ou_detalhe"],
  "timestamp": "2026-10-23T12:00:00-03:00"
}
```

---

## 3. Erros comuns a todas as rotas

| Status | `errors` | Quando acontece | O que o front faz |
|---|---|---|---|
| 400 | detalhe do parâmetro | Corpo vazio ou sem os campos esperados | Corrigir o envio |
| 401 | `nao_autenticado` | Sem header `Authorization`, ou token inválido/adulterado | Ir para o login |
| 401 | `token_expirado` | Access token passou dos 15 min | **Chamar o refresh** e repetir a requisição |
| 401 | `token_revogado` | Logout feito, ou senha trocada | Ir para o login |
| 401 | `usuario_inativo` | Usuário foi desativado depois do login | Ir para o login e avisar |
| 403 | `sem_permissao` | O perfil do usuário não tem acesso a essa ação | Mostrar aviso; esconder a ação na tela |
| 404 | detalhe | Registro não existe | Mostrar "não encontrado" |
| 422 | mensagens de validação | Dados inválidos | Mostrar os erros no formulário |
| 429 | `muitas_tentativas` | Mais de 10 logins ou refreshes por minuto | Pedir para aguardar 1 minuto |
| 500 | detalhe | Erro inesperado | Mensagem genérica |

---

## 4. Paginação e filtros

Valem para todas as rotas de **listagem** (`GET /usuarios`, `/perfis`, `/g_estados`, `/g_cidades`).

### Paginação
- `page`: Número da página (padrão: 1). `page=all` devolve tudo.
- `per_page`: Itens por página (padrão: 10, máximo 100).

### Filtros
Filtros em `q[campo_predicado]=valor`:
- `_eq`: igual a
- `_cont`: contém
- `_start`: começa com
- `_in`: lista de valores
- `_true` / `_false`: booleano
- `s`: ordenação (ex.: `q[s]=nome desc`)

---

## 5. Rotas de autenticação (`/auth`)

- `POST /auth/login`: `{ "cpf": "...", "password": "..." }`
- `POST /auth/refresh_token`: `{ "refresh_token": "..." }`
- `GET /auth/me`: retorna dados do usuário autenticado
- `DELETE /auth/logout`: encerra a sessão e invalida tokens

---

## 6. Usuários (`/usuarios`)

- `GET /usuarios`: listar usuários (paginado)
- `GET /usuarios/:id`: obter detalhes do usuário
- `POST /usuarios`: criar usuário `{ nome, cpf, password, perfil_id, ativo }`
- `PATCH /usuarios/:id`: editar usuário
- `DELETE /usuarios/:id`: excluir usuário
- `GET /usuarios/:id/permissoes_extras`: listar regras extras
- `PUT /usuarios/:id/permissoes_extras`: salvar regras extras `{ "regra_ids": [...] }`

---

## 7. Perfis (`/perfis`)

- `GET /perfis`: listar perfis
- `GET /perfis/:id`: ver detalhes do perfil
- `POST /perfis`: criar perfil `{ perfil: { nome, descricao, ativo } }`
- `PATCH /perfis/:id`: editar perfil
- `DELETE /perfis/:id`: excluir perfil
- `GET /perfis/:id/permissoes`: listar permissões do perfil (módulos e regras com `marcada: true/false`)
- `PUT /perfis/:id/permissoes`: salvar permissões do perfil `{ "regra_ids": [...] }`

---

## 8. Estados e Cidades (`/g_estados` e `/g_cidades`)

- `GET /g_estados`: listar estados
- `GET /g_cidades`: listar cidades por estado (`q[g_estado_id_eq]=1&page=all`)
