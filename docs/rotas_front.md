# Medtec API: guia de rotas para o front

Tudo o que o front precisa para consumir a API: autenticação, formato das respostas, erros e cada rota com exemplo.

- **URL base:** `http://localhost:3000/api/v1` em desenvolvimento. Nos outros ambientes, use a URL do servidor + `/api/v1`.
- **Formato:** JSON. Envie sempre o header `Content-Type: application/json`.
- **CORS:** a origem do front precisa estar em `ALLOWED_ORIGINS` no `.env` da API (ex.: `http://localhost:5173`).
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
12. [Tipos de aviso](#12-tipos-de-aviso)
13. [Avisos](#13-avisos)
14. [Categorias da galeria](#14-categorias-da-galeria)
15. [Fotos da galeria](#15-fotos-da-galeria)
16. [Canais de contato](#16-canais-de-contato)
17. [Resumo de todas as rotas](#17-resumo-de-todas-as-rotas)

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

O payload do JWT pode ser lido no front (ex.: biblioteca `jwt-decode`) **sem** a chave secreta:

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

> Use esses dados **só para a interface** (mostrar o nome do perfil, montar o menu, esconder botões). Quem decide o que o usuário pode fazer é a API, que confere as permissões no banco a cada requisição. Os dados são uma "foto" do momento do login: se o perfil mudar, só aparecem atualizados depois do próximo refresh. Para dados sempre atuais, use `GET /auth/me`.

### Exemplo de interceptor (axios)

```js
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:3000/api/v1" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let renovando = null; // garante um único refresh por vez

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const codigo = error.response?.data?.errors?.[0];

    if (error.response?.status === 401 && codigo === "token_expirado" && !original._repetida) {
      original._repetida = true;

      renovando ??= axios
        .post(`${api.defaults.baseURL}/auth/refresh_token`, {
          refresh_token: localStorage.getItem("refresh_token"),
        })
        .then(({ data }) => {
          localStorage.setItem("access_token", data.data.access_token);
          localStorage.setItem("refresh_token", data.data.refresh_token);
        })
        .finally(() => { renovando = null; });

      try {
        await renovando;
        return api(original); // repete a requisição com o token novo
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

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

Lista vazia: `items: []`, `total_count: 0` e `message: "Nenhum registro encontrado"` (continua **200**).

### Erro

```json
{
  "success": false,
  "message": "Texto para mostrar ao usuário",
  "errors": ["codigo_ou_detalhe"],
  "timestamp": "2026-10-23T12:00:00-03:00"
}
```

- `message`: texto em português, pronto para exibir.
- `errors`: lista. Nos erros de autenticação vem um **código** (ex.: `token_expirado`), que é o que o front deve comparar. Nos erros de validação vem a lista de mensagens de cada campo.
- Alguns erros trazem também `erro_bruto` com um código técnico (ex.: `perfil_admin_imutavel`).

### Atenção: rotas que **não** usam o envelope

Ver um, criar e editar (`GET /recurso/:id`, `POST /recurso`, `PATCH /recurso/:id`) de **usuários, perfis, estados, cidades, avisos, tipos de aviso, galeria e canais de contato** devolvem o **objeto direto**, sem `success`/`data`:

```json
{ "id": 1, "nome": "Minas Gerais", "sigla_uf": "MG", "codigo_ibge": "31", "created_at": "...", "updated_at": "..." }
```

Os **erros** dessas rotas seguem o formato de erro padrão. Excluir e salvar permissões respondem **204 sem corpo**.

---

## 3. Erros comuns a todas as rotas

| Status | `errors` | Quando acontece | O que o front faz |
|---|---|---|---|
| 400 | detalhe do parâmetro | Corpo vazio ou sem os campos esperados (`message: "Parâmetros incompletos na requisição"`) | Corrigir o envio |
| 401 | `nao_autenticado` | Sem header `Authorization`, ou token inválido/adulterado | Ir para o login |
| 401 | `token_expirado` | Access token passou dos 15 min | **Chamar o refresh** e repetir a requisição |
| 401 | `token_revogado` | Logout feito, ou senha trocada | Ir para o login |
| 401 | `usuario_inativo` | Usuário foi desativado depois do login | Ir para o login e avisar |
| 403 | `sem_permissao` | O perfil do usuário não tem acesso a essa ação (`message: "Sem permissão"`) | Mostrar aviso; esconder a ação na tela |
| 404 | detalhe | Registro não existe (`message: "Registro não encontrado"`) | Mostrar "não encontrado" |
| 422 | mensagens de validação | Dados inválidos (`message: "Erro de validação"`) | Mostrar os erros no formulário |
| 429 | `muitas_tentativas` | Mais de 10 logins ou refreshes por minuto | Pedir para aguardar 1 minuto |
| 500 | detalhe | Erro inesperado (`message: "Falha inesperada no servidor"`) | Mensagem genérica |

---

## 4. Paginação e filtros

Valem para todas as rotas de **listagem** (`GET /usuarios`, `/perfis`, `/g_estados`, `/g_cidades`, `/a_tipos_aviso`, `/a_avisos`, `/categorias_galeria`, `/fotos_galeria`, `/canais_contato`).

### Paginação

| Parâmetro | Padrão | Descrição |
|---|---|---|
| `page` | `1` | Número da página. `page=all` devolve tudo, sem paginar (use para selects) |
| `per_page` | `10` | Itens por página (máximo `100`). Também aceita `items` ou `limit` |

```
GET /usuarios?page=2&per_page=20
GET /g_estados?page=all
```

### Filtros

Os filtros vão em `q[campo_predicado]=valor`:

| Predicado | Significado | Exemplo |
|---|---|---|
| `_eq` | igual a | `q[sigla_uf_eq]=MG` |
| `_cont` | contém (sem diferenciar maiúscula) | `q[nome_cont]=maria` |
| `_start` | começa com | `q[nome_start]=Bel` |
| `_in` | está na lista | `q[id_in][]=1&q[id_in][]=2` |
| `_gt` / `_lt` | maior / menor que | `q[id_gt]=10` |
| `_true` / `_false` | booleano | `q[ativo_true]=1` |
| `s` | ordenação | `q[s]=nome desc` |

Dá para combinar filtros e paginação:

```
GET /usuarios?q[nome_cont]=car&q[ativo_true]=1&page=1&per_page=10
GET /g_cidades?q[g_estado_id_eq]=1&page=all
```

---

## 5. Rotas de autenticação (`/auth`)

### `POST /auth/login`: entrar

**Não precisa de token.** O CPF pode ir com ou sem pontuação.

```json
{ "cpf": "111.444.777-35", "password": "SenhaAdmin123" }
```

Também aceita os campos dentro de `auth`: `{ "auth": { "cpf": "...", "password": "..." } }`.

**200**
```json
{
  "success": true,
  "message": "Login efetuado com sucesso.",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "9f3c1a...(128 caracteres)"
  },
  "timestamp": "..."
}
```

| Status | `errors` | Quando |
|---|---|---|
| 400 | `cpf_senha_obrigatorios` | Faltou CPF ou senha |
| 401 | `credenciais_invalidas` | CPF ou senha errados |
| 403 | `usuario_inativo` | Usuário desativado |
| 429 | `muitas_tentativas` | Mais de 10 tentativas no minuto |

> O login não devolve os dados do usuário. Para isso, leia o payload do `access_token` ou chame `GET /auth/me`.

---

### `POST /auth/refresh_token`: renovar os tokens

**Não precisa de access token.**

```json
{ "refresh_token": "9f3c1a..." }
```

**200**: mesmo formato do login, com os **dois tokens novos**.
```json
{
  "success": true,
  "message": "Token renovado",
  "data": { "access_token": "eyJ...", "refresh_token": "b71e..." }
}
```

| Status | `errors` | Quando | O que fazer |
|---|---|---|---|
| 401 | `refresh_token_ausente` | Não enviou o refresh | Ir para o login |
| 401 | `refresh_token_invalido` | Token errado, já usado, ou sessão encerrada (logout/troca de senha) | Ir para o login |
| 401 | `refresh_token_expirado` | Passaram as 24h desde o login | Ir para o login |
| 401 | `usuario_inativo` | Usuário desativado | Ir para o login |
| 429 | `muitas_tentativas` | Mais de 10 renovações no minuto | Aguardar |

> Qualquer erro no refresh = mandar para o login.

---

### `GET /auth/me`: usuário logado

**Precisa de token.** Não depende de permissão do perfil: qualquer usuário logado pode chamar.

**200**
```json
{
  "success": true,
  "message": "Usuário autenticado",
  "data": {
    "id": 1,
    "nome": "Administrador",
    "cpf": "11144477735",
    "ativo": true,
    "perfil_id": 3,
    "perfil_nome": "Administrador"
  }
}
```

---

### `DELETE /auth/logout`: sair

**Precisa de token.** Encerra **todas** as sessões do usuário. Depois disso, apague os tokens guardados no front.

**200**
```json
{ "success": true, "message": "Sessão encerrada com sucesso.", "data": null }
```

---

## 6. Usuários

Todas precisam de token **e** de permissão do perfil (senão: 403 `sem_permissao`).

**Objeto usuário**
```json
{
  "id": 4,
  "nome": "Maria Silva",
  "cpf": "93541134780",
  "ativo": true,
  "perfil_id": 1,
  "perfil_nome": "Jornalista",
  "created_at": "2026-10-19T10:41:16.128-03:00",
  "updated_at": "2026-10-19T10:41:16.128-03:00"
}
```

> A senha nunca é devolvida.

### `GET /usuarios`: listar
Paginado e com filtros (ver [seção 4](#4-paginação-e-filtros)). Filtros úteis: `q[nome_cont]`, `q[cpf_eq]`, `q[perfil_id_eq]`, `q[ativo_true]`.

### `GET /usuarios/:id`: ver um
Devolve o objeto usuário (sem envelope). 404 se não existir.

### `POST /usuarios`: criar

```json
{
  "nome": "Maria Silva",
  "cpf": "935.411.347-80",
  "password": "senha12345",
  "perfil_id": 1,
  "ativo": true
}
```

Também aceita o corpo dentro de `usuario`: `{ "usuario": { ... } }`.

| Campo | Obrigatório | Regras |
|---|---|---|
| `nome` | sim | |
| `cpf` | sim | CPF válido e único; com ou sem pontuação (salvo só com números) |
| `password` | sim | mínimo 8 caracteres |
| `perfil_id` | sim | id de um perfil existente |
| `ativo` | não | padrão `true` |

**201**: objeto usuário. **422**: erros de validação, ex.: `["Cpf inválido"]` ou `["Cpf já está em uso"]`.

### `PATCH /usuarios/:id`: editar
Mesmos campos do criar, todos opcionais. Mande só o que mudou.
- Enviar `password` troca a senha e **derruba as sessões desse usuário**.
- Enviar `"ativo": false` desativa o usuário: ele perde o acesso na próxima requisição.

**200**: objeto usuário atualizado.

### `DELETE /usuarios/:id`: excluir
**204** sem corpo. **422** se não puder ser excluído (ex.: ele concedeu permissões a outros usuários).

---

## 7. Perfis

Token + permissão do perfil.

**Objeto perfil**
```json
{
  "id": 1,
  "nome": "Jornalista",
  "descricao": "Acesso às matérias",
  "ativo": true,
  "created_at": "...",
  "updated_at": "..."
}
```

### `GET /perfis`: listar
Paginado. Filtros úteis: `q[nome_cont]`, `q[ativo_true]`. Para preencher um select de perfis: `GET /perfis?page=all`.

### `GET /perfis/:id`: ver um
Objeto perfil (sem envelope).

### `POST /perfis`: criar

```json
{ "perfil": { "nome": "Editor", "descricao": "Revisa matérias", "ativo": true } }
```

| Campo | Obrigatório | Regras |
|---|---|---|
| `nome` | sim | único |
| `descricao` | não | |
| `ativo` | não | padrão `true` |

**201**: objeto perfil. **400**: corpo vazio. **422**: validação (ex.: nome repetido).

### `PATCH /perfis/:id`: editar
Mesmos campos, opcionais. **200**: objeto perfil.

### `DELETE /perfis/:id`: excluir
**204**. **422** quando:
- é o perfil **Administrador** (`"O perfil Administrador não pode ser apagado"`);
- ainda existem usuários com esse perfil.

---

## 8. Permissões do perfil

Tela de **checkboxes** do perfil: lista todos os módulos do sistema com as ações, e diz quais estão marcadas.

### `GET /perfis/:perfil_id/permissoes`

**200**
```json
{
  "success": true,
  "message": "Permissões do perfil",
  "data": [
    {
      "id": 2,
      "nome": "Usuarios",
      "regras": [
        { "id": 3, "acao": "index",   "descricao": "Listar",     "marcada": true },
        { "id": 4, "acao": "show",    "descricao": "Visualizar", "marcada": true },
        { "id": 5, "acao": "create",  "descricao": "Criar",      "marcada": false },
        { "id": 6, "acao": "update",  "descricao": "Editar",     "marcada": false },
        { "id": 7, "acao": "destroy", "descricao": "Excluir",    "marcada": false }
      ]
    }
  ]
}
```

- Cada **módulo** é uma tela/recurso da API; cada **regra** é uma ação dentro dele.
- `marcada: true` = o perfil tem essa permissão.

### `PUT /perfis/:perfil_id/permissoes`: salvar

Envie a **lista FINAL** de regras marcadas (não só as que mudaram). O que não estiver na lista é desmarcado.

```json
{ "regra_ids": [3, 4, 5] }
```

- Para desmarcar tudo: `{ "regra_ids": [] }`.
- **204** sem corpo.
- **422** `perfil_admin_imutavel`: o perfil Administrador sempre tem tudo e não pode ser alterado.

> Os usuários do perfil passam a ter as permissões novas já na próxima requisição; não precisam logar de novo.

---

## 9. Permissões extras do usuário

Exceções **por usuário**: liberam uma ação para uma pessoa específica, mesmo que o perfil dela não tenha.

### `GET /usuarios/:usuario_id/permissoes_extras`

**200**
```json
{
  "success": true,
  "message": "Permissões do usuário",
  "data": [
    {
      "id": 2,
      "nome": "Usuarios",
      "regras": [
        { "id": 3, "acao": "index",  "descricao": "Listar", "do_perfil": true,  "extra": false, "concedido_por": null },
        { "id": 5, "acao": "create", "descricao": "Criar",  "do_perfil": false, "extra": true,  "concedido_por": "Administrador" }
      ]
    }
  ]
}
```

| Campo | Significado | Sugestão de tela |
|---|---|---|
| `do_perfil` | O perfil já dá essa permissão | Checkbox marcado e **desabilitado** |
| `extra` | Liberada só para esse usuário | Checkbox marcado e editável |
| `concedido_por` | Nome de quem liberou a exceção | Mostrar como dica/legenda |

O usuário tem acesso a uma ação quando `do_perfil` **ou** `extra` for `true`.

### `PUT /usuarios/:usuario_id/permissoes_extras`: salvar

Envie a **lista FINAL** de exceções (só as extras, não as do perfil):

```json
{ "regra_ids": [5] }
```

- Para remover todas: `{ "regra_ids": [] }`.
- **204** sem corpo.
- **403** `"Você não pode alterar suas próprias permissões"`: ninguém altera as próprias exceções.

---

## 10. Estados

Token + permissão do perfil.

**Objeto estado**
```json
{ "id": 1, "nome": "Minas Gerais", "sigla_uf": "MG", "codigo_ibge": "31", "created_at": "...", "updated_at": "..." }
```

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /g_estados` | Listar (paginado). Filtros: `q[nome_cont]`, `q[sigla_uf_eq]` | 200 envelope paginado |
| `GET /g_estados/:id` | Ver um | 200 objeto |
| `POST /g_estados` | Criar | 201 objeto |
| `PATCH /g_estados/:id` | Editar | 200 objeto |
| `DELETE /g_estados/:id` | Excluir | 204 |

**Corpo de criar/editar**
```json
{ "g_estado": { "nome": "Minas Gerais", "sigla_uf": "MG", "codigo_ibge": "31" } }
```

| Campo | Obrigatório | Regras |
|---|---|---|
| `nome` | sim | |
| `sigla_uf` | sim | única |
| `codigo_ibge` | não | |

- A exclusão é lógica (o registro some das listagens, mas fica no banco).
- Não dá para excluir um estado que ainda tem cidades (**422**).

---

## 11. Cidades

Token + permissão do perfil.

**Objeto cidade** (já vem com o estado)
```json
{
  "id": 10,
  "nome": "Belo Horizonte",
  "codigo_ibge": "3106200",
  "g_estado_id": 1,
  "created_at": "...",
  "updated_at": "...",
  "g_estado": { "id": 1, "nome": "Minas Gerais", "sigla_uf": "MG", "codigo_ibge": "31", "created_at": "...", "updated_at": "..." }
}
```

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /g_cidades` | Listar (paginado). Filtros: `q[nome_cont]`, `q[g_estado_id_eq]` | 200 envelope paginado |
| `GET /g_cidades/:id` | Ver uma | 200 objeto |
| `POST /g_cidades` | Criar | 201 objeto |
| `PATCH /g_cidades/:id` | Editar | 200 objeto |
| `DELETE /g_cidades/:id` | Excluir (lógica) | 204 |

**Corpo de criar/editar**
```json
{ "g_cidade": { "g_estado_id": 1, "nome": "Belo Horizonte", "codigo_ibge": "3106200" } }
```

| Campo | Obrigatório | Regras |
|---|---|---|
| `g_estado_id` | sim | estado existente |
| `nome` | sim | |
| `codigo_ibge` | não | |

> Select de cidades por estado: `GET /g_cidades?q[g_estado_id_eq]=1&page=all`.

---

## 12. Tipos de aviso

Token + permissão do perfil. Classificam os avisos (Urgente, Informativo...) e definem a cor com que cada um aparece.

**Objeto tipo de aviso**
```json
{ "id": 1, "nome": "Urgente", "slug": "urgente", "cor": "#DC2626", "posicao": 1, "ativo": true }
```

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /a_tipos_aviso` | Listar (paginado, ordenado por `posicao`). Filtros: `q[nome_cont]`, `q[slug_eq]`, `q[ativo_true]` | 200 envelope paginado |
| `GET /a_tipos_aviso/:id` | Ver um | 200 objeto |
| `POST /a_tipos_aviso` | Criar | 201 objeto |
| `PATCH /a_tipos_aviso/:id` | Editar | 200 objeto |
| `DELETE /a_tipos_aviso/:id` | Excluir | 204 |

**Corpo de criar/editar**
```json
{ "a_tipo_aviso": { "nome": "Urgente", "slug": "urgente", "cor": "#DC2626", "posicao": 1, "ativo": true } }
```

| Campo | Obrigatório | Regras |
|---|---|---|
| `nome` | sim | texto exibido na tela |
| `slug` | sim | único; identificador fixo para usar no código e nos filtros (ex.: `urgente`). Não mude depois de criado |
| `cor` | sim | hexadecimal `#RRGGBB` (ex.: `#DC2626`). A API guarda em maiúsculas. É a cor **base**: o front deriva os tons (fundo claro, borda, texto) |
| `posicao` | não | ordem de exibição; padrão `0` |
| `ativo` | não | padrão `true` |

- Não dá para excluir um tipo que ainda tem avisos (**422** `"Não foi possível excluir"`).

> Select de tipos: `GET /a_tipos_aviso?q[ativo_true]=1&page=all`.

---

## 13. Avisos

Token + permissão do perfil.

**Objeto aviso** (já vem com o tipo)
```json
{
  "id": 7,
  "titulo": "Plantão de fim de semana",
  "a_tipo_aviso_id": 1,
  "conteudo": "Escala atualizada para o fim de semana.",
  "link_texto": "Ver escala",
  "link_url": "https://exemplo.com/escala",
  "ativo": true,
  "created_by": "admin@medtec.com",
  "updated_by": null,
  "created_at": "...",
  "updated_at": "...",
  "a_tipo_aviso": { "id": 1, "nome": "Urgente", "slug": "urgente", "cor": "#DC2626", "posicao": 1, "ativo": true }
}
```

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /a_avisos` | Listar (paginado, mais recentes primeiro). Filtros: `q[titulo_cont]`, `q[a_tipo_aviso_id_eq]`, `q[a_tipo_aviso_slug_eq]`, `q[ativo_true]` | 200 envelope paginado |
| `GET /a_avisos/:id` | Ver um | 200 objeto |
| `POST /a_avisos` | Criar | 201 objeto |
| `PATCH /a_avisos/:id` | Editar | 200 objeto |
| `DELETE /a_avisos/:id` | Excluir (lógica) | 204 |

**Corpo de criar/editar**
```json
{
  "a_aviso": {
    "titulo": "Plantão de fim de semana",
    "a_tipo_aviso_id": 1,
    "conteudo": "Escala atualizada para o fim de semana.",
    "link_texto": "Ver escala",
    "link_url": "https://exemplo.com/escala",
    "ativo": true
  }
}
```

| Campo | Obrigatório | Regras |
|---|---|---|
| `titulo` | sim | |
| `a_tipo_aviso_id` | sim | tipo de aviso existente |
| `conteudo` | sim | |
| `link_texto` / `link_url` | não | botão opcional do aviso (texto e endereço) |
| `ativo` | não | padrão `true` |

- `created_by` e `updated_by` são preenchidos pela API com o usuário logado; não envie.
- A exclusão é lógica (o aviso some das listagens, mas fica no banco).

> Avisos ativos de um tipo: `GET /a_avisos?q[ativo_true]=1&q[a_tipo_aviso_slug_eq]=urgente`.

---

## 14. Categorias da galeria

Token + permissão do perfil. Agrupam as fotos da galeria (Eventos, Estrutura...).

**Objeto categoria**
```json
{ "id": 1, "nome": "Eventos", "slug": "eventos", "posicao": 1, "ativo": true }
```

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /categorias_galeria` | Listar (paginado, ordenado por `posicao`). Filtros: `q[nome_cont]`, `q[slug_eq]`, `q[ativo_true]` | 200 envelope paginado |
| `GET /categorias_galeria/:id` | Ver uma | 200 objeto |
| `POST /categorias_galeria` | Criar | 201 objeto |
| `PATCH /categorias_galeria/:id` | Editar | 200 objeto |
| `DELETE /categorias_galeria/:id` | Excluir | 204 |

**Corpo de criar/editar**
```json
{ "categoria_galeria": { "nome": "Eventos", "slug": "eventos", "posicao": 1, "ativo": true } }
```

| Campo | Obrigatório | Regras |
|---|---|---|
| `nome` | sim | |
| `slug` | sim | único (ex.: `eventos`) |
| `posicao` | não | ordem de exibição; padrão `0` |
| `ativo` | não | padrão `true` |

- Não dá para excluir uma categoria que ainda tem fotos (**422** `"Não foi possível excluir"`).

---

## 15. Fotos da galeria

Token + permissão do perfil.

**Objeto foto** (já vem com a categoria)
```json
{
  "id": 3,
  "titulo": "Fachada",
  "categoria_galeria_id": 2,
  "descricao": "Entrada principal",
  "imagem_url": null,
  "imagem": "/rails/active_storage/blobs/redirect/eyJfcmFpbHMi.../fachada.jpg",
  "created_by": "admin@medtec.com",
  "updated_by": null,
  "created_at": "...",
  "updated_at": "...",
  "categoria_galeria": { "id": 2, "nome": "Estrutura", "slug": "estrutura", "posicao": 2, "ativo": true }
}
```

- `imagem`: caminho do arquivo enviado por upload (vem `null` se a foto usa link externo). Monte a URL completa com o endereço do servidor **sem** o `/api/v1`, ex.: `http://localhost:3000/rails/active_storage/...`.
- `imagem_url`: link externo informado no cadastro.
- Para exibir: use `imagem` se vier preenchido; senão, `imagem_url`.

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /fotos_galeria` | Listar (paginado, mais recentes primeiro). Filtros: `q[titulo_cont]`, `q[categoria_galeria_id_eq]`, `q[categoria_galeria_slug_eq]` | 200 envelope paginado |
| `GET /fotos_galeria/:id` | Ver uma | 200 objeto |
| `POST /fotos_galeria` | Criar | 201 objeto |
| `PATCH /fotos_galeria/:id` | Editar | 200 objeto |
| `DELETE /fotos_galeria/:id` | Excluir (lógica) | 204 |

**Corpo de criar/editar com link externo (JSON)**
```json
{
  "foto_galeria": {
    "titulo": "Fachada",
    "categoria_galeria_id": 2,
    "descricao": "Entrada principal",
    "imagem_url": "https://exemplo.com/fachada.jpg"
  }
}
```

**Criar/editar com upload de arquivo**: aqui o corpo é `multipart/form-data` (não JSON):

```js
const form = new FormData();
form.append("foto_galeria[titulo]", "Fachada");
form.append("foto_galeria[categoria_galeria_id]", 2);
form.append("foto_galeria[imagem]", arquivo); // File do <input type="file">
await api.post("/fotos_galeria", form); // não defina Content-Type: o navegador monta
```

| Campo | Obrigatório | Regras |
|---|---|---|
| `titulo` | sim | |
| `categoria_galeria_id` | sim | categoria existente |
| `descricao` | não | |
| `imagem` / `imagem_url` | **um dos dois** | arquivo enviado ou link externo. Sem nenhum: **422** `"Envie uma imagem ou informe a URL"` |

- A exclusão é lógica.

> Fotos de uma categoria: `GET /fotos_galeria?q[categoria_galeria_slug_eq]=eventos&page=all`.

---

## 16. Canais de contato

Token + permissão do perfil. Redes e contatos exibidos no site. A lista de redes é **fixa** (criada pelo seed): a tela mostra todas e salva tudo de uma vez. Não existe criar nem excluir canal pela API.

Redes cadastradas: `youtube`, `instagram`, `facebook`, `whatsapp`, `telefone`, `email`, `endereco`.

**Objeto canal**
```json
{ "id": 1, "rede": "youtube", "valor": "https://www.youtube.com/@SeducRondonia", "posicao": 1, "ativo": true, "created_by": null, "updated_by": "admin@medtec.com" }
```

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /canais_contato` | Listar (paginado, ordenado por `posicao`). Filtros: `q[rede_eq]`, `q[ativo_true]` | 200 envelope paginado |
| `PUT /canais_contato` | Salvar vários canais de uma vez | 200 envelope com a lista atualizada |

### `PUT /canais_contato`: salvar

Envie um item por rede que mudou (ou todas). A `rede` identifica o canal; os outros campos são opcionais.

```json
{
  "canais_contato": [
    { "rede": "whatsapp",  "valor": "https://wa.me/5569911112222" },
    { "rede": "telefone",  "valor": "(69) 3216-5300", "ativo": true },
    { "rede": "facebook",  "ativo": false }
  ]
}
```

| Campo | Obrigatório | Regras |
|---|---|---|
| `rede` | sim | uma das redes cadastradas; não pode ser alterada |
| `valor` | não | não pode ficar vazio |
| `posicao` | não | ordem de exibição |
| `ativo` | não | `false` esconde o canal no site |

**200**
```json
{
  "success": true,
  "message": "Canais de contato atualizados",
  "data": [ { "id": 1, "rede": "youtube", "valor": "...", "posicao": 1, "ativo": true, "...": "..." } ]
}
```

**422**: **nada é salvo** se algum item falhar. `errors` diz qual rede deu problema, ex.: `["whatsapp: Valor não pode ficar em branco"]` ou `["Rede tiktok não existe"]`.

> Rodapé do site: `GET /canais_contato?q[ativo_true]=1&page=all`.

---

## 17. Resumo de todas as rotas

| Método | Rota | Token | Permissão do perfil | Resposta de sucesso |
|---|---|---|---|---|
| POST | `/auth/login` | não | não | 200 envelope |
| POST | `/auth/refresh_token` | não | não | 200 envelope |
| GET | `/auth/me` | sim | não | 200 envelope |
| DELETE | `/auth/logout` | sim | não | 200 envelope |
| GET | `/usuarios` | sim | sim | 200 paginado |
| GET | `/usuarios/:id` | sim | sim | 200 objeto |
| POST | `/usuarios` | sim | sim | 201 objeto |
| PATCH | `/usuarios/:id` | sim | sim | 200 objeto |
| DELETE | `/usuarios/:id` | sim | sim | 204 |
| GET | `/usuarios/:usuario_id/permissoes_extras` | sim | sim | 200 envelope |
| PUT | `/usuarios/:usuario_id/permissoes_extras` | sim | sim | 204 |
| GET | `/perfis` | sim | sim | 200 paginado |
| GET | `/perfis/:id` | sim | sim | 200 objeto |
| POST | `/perfis` | sim | sim | 201 objeto |
| PATCH | `/perfis/:id` | sim | sim | 200 objeto |
| DELETE | `/perfis/:id` | sim | sim | 204 |
| GET | `/perfis/:perfil_id/permissoes` | sim | sim | 200 envelope |
| PUT | `/perfis/:perfil_id/permissoes` | sim | sim | 204 |
| GET | `/g_estados` | sim | sim | 200 paginado |
| GET | `/g_estados/:id` | sim | sim | 200 objeto |
| POST | `/g_estados` | sim | sim | 201 objeto |
| PATCH | `/g_estados/:id` | sim | sim | 200 objeto |
| DELETE | `/g_estados/:id` | sim | sim | 204 |
| GET | `/g_cidades` | sim | sim | 200 paginado |
| GET | `/g_cidades/:id` | sim | sim | 200 objeto |
| POST | `/g_cidades` | sim | sim | 201 objeto |
| PATCH | `/g_cidades/:id` | sim | sim | 200 objeto |
| DELETE | `/g_cidades/:id` | sim | sim | 204 |
| GET | `/a_tipos_aviso` | sim | sim | 200 paginado |
| GET | `/a_tipos_aviso/:id` | sim | sim | 200 objeto |
| POST | `/a_tipos_aviso` | sim | sim | 201 objeto |
| PATCH | `/a_tipos_aviso/:id` | sim | sim | 200 objeto |
| DELETE | `/a_tipos_aviso/:id` | sim | sim | 204 |
| GET | `/a_avisos` | sim | sim | 200 paginado |
| GET | `/a_avisos/:id` | sim | sim | 200 objeto |
| POST | `/a_avisos` | sim | sim | 201 objeto |
| PATCH | `/a_avisos/:id` | sim | sim | 200 objeto |
| DELETE | `/a_avisos/:id` | sim | sim | 204 |
| GET | `/categorias_galeria` | sim | sim | 200 paginado |
| GET | `/categorias_galeria/:id` | sim | sim | 200 objeto |
| POST | `/categorias_galeria` | sim | sim | 201 objeto |
| PATCH | `/categorias_galeria/:id` | sim | sim | 200 objeto |
| DELETE | `/categorias_galeria/:id` | sim | sim | 204 |
| GET | `/fotos_galeria` | sim | sim | 200 paginado |
| GET | `/fotos_galeria/:id` | sim | sim | 200 objeto |
| POST | `/fotos_galeria` | sim | sim | 201 objeto |
| PATCH | `/fotos_galeria/:id` | sim | sim | 200 objeto |
| DELETE | `/fotos_galeria/:id` | sim | sim | 204 |
| GET | `/canais_contato` | sim | sim | 200 paginado |
| PUT | `/canais_contato` | sim | sim | 200 envelope |

> `PATCH` e `PUT` funcionam igual em todas as rotas de edição.
