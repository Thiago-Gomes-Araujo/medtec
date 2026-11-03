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
18. [Notícias: CMS (com login)](#18-notícias-cms-com-login)
19. [Notícias: site público (sem login)](#19-notícias-site-público-sem-login)
20. [Avisos: site público (sem login)](#20-avisos-site-público-sem-login)
21. [Dúvidas: CMS (com login)](#21-dúvidas-cms-com-login)
22. [Dúvidas: site público (sem login)](#22-dúvidas-site-público-sem-login)
23. [Galeria: site público (sem login)](#23-galeria-site-público-sem-login)
24. [Canais de contato: site público (sem login)](#24-canais-de-contato-site-público-sem-login)
25. [Professores: CMS (com login)](#25-professores-cms-com-login)
26. [Professores: site público (sem login)](#26-professores-site-público-sem-login)
27. [Conquistas dos alunos: CMS (com login)](#27-conquistas-dos-alunos-cms-com-login)
28. [Conquistas dos alunos: site público (sem login)](#28-conquistas-dos-alunos-site-público-sem-login)
29. [Projetos pedagógicos: CMS (com login)](#29-projetos-pedagógicos-cms-com-login)
30. [Projetos pedagógicos: site público (sem login)](#30-projetos-pedagógicos-site-público-sem-login)
31. [Banners da página inicial](#31-banners-da-página-inicial)


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
    "perfil_id": 2,
    "perfil_nome": "Gestor",
    "admin": false,
    "permissoes": {
      "g_cidades": ["index"],
      "n_noticias": ["create", "despublicar", "destroy", "index", "publicar", "reprovar", "show", "update"],
      "usuarios": ["create", "destroy", "index", "show", "update"]
    }
  }
}
```

| Campo | Significado |
|---|---|
| `admin` | `true` para o perfil Administrador (tem tudo e é o único que mexe em administradores) |
| `permissoes` | o que o usuário pode fazer: perfil + permissões extras. A chave é o módulo (mesmo nome da rota, ex.: `n_noticias`, `pj_projetos`, `usuarios_permissoes_extras`); o valor, as ações liberadas. Módulo sem nenhuma ação não aparece |

**Ações:** `index` = listar, `show` = ver, `create` = criar, `update` = editar, `destroy` = excluir, `publicar`, `reprovar`, `despublicar`, `responder` (dúvidas de visitantes), `remover_anexo` (projetos), `update_all` (canais de contato).

**Como usar no front:**
```js
const pode = (modulo, acao) => usuario.permissoes[modulo]?.includes(acao) ?? false;

pode("n_noticias", "index");    // mostra o item "Notícias" no menu
pode("n_noticias", "publicar"); // mostra o botão "Publicar"
```

- Chame o `/auth/me` depois do login e depois de cada refresh. As permissões não ficam no token: se o Administrador mudar algo, o próximo `/auth/me` já traz a lista nova.
- Isso serve só para a **tela**. A API continua conferindo cada requisição e devolve 403 `sem_permissao` se faltar a permissão.

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

> **Administrador só é alterado por Administrador.** Quem não é admin (ex.: Gestor) recebe **403** `usuario_administrador` (`"Somente o Administrador pode alterar administradores"`) ao editar ou excluir um usuário Administrador, ou ao criar/editar alguém com o `perfil_id` do Administrador. Sugestão de tela: para quem não é admin, esconder o perfil Administrador do select e os botões de editar/excluir nas linhas de administradores.

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
- Quem não é Administrador (ex.: Gestor):
  - **403** `"Somente o Administrador pode alterar administradores"`: não mexe nas exceções de um Administrador.
  - **403** `"Você só pode conceder permissões que você tem"`: só concede regras que ele mesmo tem (pelo perfil ou por exceção). Sugestão de tela: desabilitar os checkboxes que o usuário logado não tem.
  - Exceções que um Administrador deu e que estão fora do alcance de quem salva **são mantidas**, mesmo que não venham na lista.

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
>
> Para o site (sem login), use `GET /publico/a_avisos` ([seção 20](#20-avisos-site-público-sem-login)).

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
| GET | `/n_categorias_noticia` | sim | sim | 200 paginado |
| GET | `/n_categorias_noticia/:id` | sim | sim | 200 objeto |
| POST | `/n_categorias_noticia` | sim | sim | 201 objeto |
| PATCH | `/n_categorias_noticia/:id` | sim | sim | 200 objeto |
| DELETE | `/n_categorias_noticia/:id` | sim | sim | 204 |
| GET | `/n_status_noticias` | sim | sim | 200 paginado |
| GET | `/n_noticias` | sim | sim | 200 paginado |
| GET | `/n_noticias/:id` | sim | sim | 200 objeto |
| POST | `/n_noticias` | sim | sim | 201 objeto |
| PATCH | `/n_noticias/:id` | sim | sim | 200 objeto |
| DELETE | `/n_noticias/:id` | sim | sim | 204 |
| PATCH | `/n_noticias/:id/publicar` | sim | sim (Publicar) | 200 objeto |
| PATCH | `/n_noticias/:id/reprovar` | sim | sim (Reprovar) | 200 objeto |
| PATCH | `/n_noticias/:id/despublicar` | sim | sim (Despublicar) | 200 objeto |
| GET | `/publico/n_noticias` | não | não | 200 paginado |
| GET | `/publico/n_noticias/:slug` | não | não | 200 envelope |
| GET | `/publico/n_categorias_noticia` | não | não | 200 envelope |
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
| GET | `/publico/a_avisos` | não | não | 200 paginado |
| GET | `/d_categorias_duvida` | sim | sim | 200 paginado |
| GET | `/d_categorias_duvida/:id` | sim | sim | 200 objeto |
| POST | `/d_categorias_duvida` | sim | sim | 201 objeto |
| PATCH | `/d_categorias_duvida/:id` | sim | sim | 200 objeto |
| DELETE | `/d_categorias_duvida/:id` | sim | sim | 204 |
| GET | `/d_duvidas` | sim | sim | 200 paginado |
| GET | `/d_duvidas/:id` | sim | sim | 200 objeto |
| POST | `/d_duvidas` | sim | sim | 201 objeto |
| PATCH | `/d_duvidas/:id` | sim | sim | 200 objeto |
| DELETE | `/d_duvidas/:id` | sim | sim | 204 |
| PATCH | `/d_duvidas/:id/publicar` | sim | sim (Publicar) | 200 objeto |
| PATCH | `/d_duvidas/:id/reprovar` | sim | sim (Reprovar) | 200 objeto |
| PATCH | `/d_duvidas/:id/despublicar` | sim | sim (Despublicar) | 200 objeto |
| GET | `/d_duvidas_visitante` | sim | sim | 200 paginado |
| GET | `/d_duvidas_visitante/:id` | sim | sim | 200 objeto |
| PATCH | `/d_duvidas_visitante/:id/responder` | sim | sim (Responder) | 200 objeto |
| DELETE | `/d_duvidas_visitante/:id` | sim | sim | 204 |
| GET | `/publico/d_duvidas` | não | não | 200 paginado |
| GET | `/publico/d_categorias_duvida` | não | não | 200 envelope |
| POST | `/publico/d_duvidas_visitante` | não | não | 201 envelope |
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
| GET | `/publico/fotos_galeria` | não | não | 200 paginado |
| GET | `/publico/categorias_galeria` | não | não | 200 envelope |
| GET | `/canais_contato` | sim | sim | 200 paginado |
| PUT | `/canais_contato` | sim | sim | 200 envelope |
| GET | `/publico/canais_contato` | não | não | 200 envelope |
| GET | `/p_disciplinas` | sim | sim | 200 paginado |
| GET | `/p_disciplinas/:id` | sim | sim | 200 objeto |
| POST | `/p_disciplinas` | sim | sim | 201 objeto |
| PATCH | `/p_disciplinas/:id` | sim | sim | 200 objeto |
| DELETE | `/p_disciplinas/:id` | sim | sim | 204 |
| GET | `/p_professores` | sim | sim | 200 paginado |
| GET | `/p_professores/:id` | sim | sim | 200 objeto |
| POST | `/p_professores` | sim | sim | 201 objeto |
| PATCH | `/p_professores/:id` | sim | sim | 200 objeto |
| DELETE | `/p_professores/:id` | sim | sim | 204 |
| GET | `/p_relatos` | sim | sim | 200 paginado |
| GET | `/p_relatos/:id` | sim | sim | 200 objeto |
| DELETE | `/p_relatos/:id` | sim | sim | 204 |
| PATCH | `/p_relatos/:id/publicar` | sim | sim (Publicar) | 200 objeto |
| PATCH | `/p_relatos/:id/reprovar` | sim | sim (Reprovar) | 200 objeto |
| PATCH | `/p_relatos/:id/despublicar` | sim | sim (Despublicar) | 200 objeto |
| GET | `/escolas` | sim | sim | 200 paginado |
| GET | `/publico/p_professores` | não | não | 200 paginado |
| GET | `/publico/p_professores/:id` | não | não | 200 envelope |
| POST | `/publico/p_professores/:id/p_relatos` | não | não | 201 envelope |
| GET | `/publico/p_disciplinas` | não | não | 200 envelope |
| GET | `/c_categorias_conquista_aluno` | sim | sim | 200 paginado |
| GET | `/c_categorias_conquista_aluno/:id` | sim | sim | 200 objeto |
| POST | `/c_categorias_conquista_aluno` | sim | sim | 201 objeto |
| PATCH | `/c_categorias_conquista_aluno/:id` | sim | sim | 200 objeto |
| DELETE | `/c_categorias_conquista_aluno/:id` | sim | sim | 204 |
| GET | `/c_conquistas_aluno` | sim | sim | 200 paginado |
| GET | `/c_conquistas_aluno/:id` | sim | sim | 200 objeto |
| POST | `/c_conquistas_aluno` | sim | sim | 201 objeto |
| PATCH | `/c_conquistas_aluno/:id` | sim | sim | 200 objeto |
| DELETE | `/c_conquistas_aluno/:id` | sim | sim | 204 |
| PATCH | `/c_conquistas_aluno/:id/publicar` | sim | sim (Publicar) | 200 objeto |
| PATCH | `/c_conquistas_aluno/:id/reprovar` | sim | sim (Reprovar) | 200 objeto |
| PATCH | `/c_conquistas_aluno/:id/despublicar` | sim | sim (Despublicar) | 200 objeto |
| GET | `/publico/c_conquistas_aluno` | não | não | 200 paginado |
| GET | `/publico/c_conquistas_aluno/:id` | não | não | 200 envelope |
| GET | `/publico/c_categorias_conquista_aluno` | não | não | 200 envelope |
| GET | `/pj_temas` | sim | sim | 200 paginado |
| GET | `/pj_temas/:id` | sim | sim | 200 objeto |
| POST | `/pj_temas` | sim | sim | 201 objeto |
| PATCH | `/pj_temas/:id` | sim | sim | 200 objeto |
| DELETE | `/pj_temas/:id` | sim | sim | 204 |
| GET | `/pj_membros` | sim | sim | 200 paginado |
| GET | `/pj_membros/:id` | sim | sim | 200 objeto |
| POST | `/pj_membros` | sim | sim | 201 objeto |
| PATCH | `/pj_membros/:id` | sim | sim | 200 objeto |
| DELETE | `/pj_membros/:id` | sim | sim | 204 |
| GET | `/pj_projetos` | sim | sim | 200 paginado |
| GET | `/pj_projetos/:id` | sim | sim | 200 objeto |
| POST | `/pj_projetos` | sim | sim | 201 objeto |
| PATCH | `/pj_projetos/:id` | sim | sim | 200 objeto |
| DELETE | `/pj_projetos/:id` | sim | sim | 204 |
| PATCH | `/pj_projetos/:id/publicar` | sim | sim (Publicar) | 200 objeto |
| PATCH | `/pj_projetos/:id/reprovar` | sim | sim (Reprovar) | 200 objeto |
| PATCH | `/pj_projetos/:id/despublicar` | sim | sim (Despublicar) | 200 objeto |
| DELETE | `/pj_projetos/:id/anexos/:anexo_id` | sim | sim (Remover anexo) | 204 |
| GET | `/publico/pj_projetos` | não | não | 200 paginado |
| GET | `/publico/pj_projetos/:id` | não | não | 200 envelope |
| GET | `/publico/pj_temas` | não | não | 200 envelope |
| GET | `/b_banners` | sim | sim | 200 paginado |
| GET | `/b_banners/:id` | sim | sim | 200 objeto |
| POST | `/b_banners` | sim | sim | 201 objeto |
| PATCH | `/b_banners/:id` | sim | sim | 200 objeto |
| DELETE | `/b_banners/:id` | sim | sim | 204 |
| GET | `/publico/b_banners` | não | não | 200 envelope |

> `PATCH` e `PUT` funcionam igual em todas as rotas de edição.

---

## 18. Notícias: CMS (com login)

Tela "Publicar Nova Notícia" do painel. Token + permissão do perfil: hoje **Administrador** e **Gestor** cadastram e editam; **publicar, reprovar e despublicar são permissões separadas**, hoje só do **Administrador** (o Gestor recebe 403 nessas três rotas). O Jornalista recebe 403 em tudo.

**Objeto notícia**
```json
{
  "id": 1,
  "titulo": "Polo ribeirinho recebe novos computadores",
  "slug": "polo-ribeirinho-recebe-novos-computadores",
  "resumo": "Breve resumo para o card.",
  "conteudo": "Parágrafos completos...",
  "data_publicacao": "2026-10-26",
  "n_categoria_noticia_id": 1,
  "categoria_nome": "Pedagógico",
  "n_status_noticia_id": 3,
  "status": "publicada",
  "status_nome": "Publicada",
  "motivo_reprovacao": null,
  "autor_id": 3,
  "autor_nome": "Maria Silva",
  "avaliado_por_id": 1,
  "avaliado_por_nome": "Administrador",
  "imagem_capa": "/rails/active_storage/blobs/redirect/.../capa.png",
  "created_at": "...",
  "updated_at": "..."
}
```

- `imagem_capa`:
  - quando a foto foi enviada do computador, vem um **caminho**: junte com a URL do servidor da API (sem o `/api/v1`) para montar o `src` da imagem;
  - quando foi colado um link, vem o próprio link;
  - sem capa, vem `null`.
- `autor_*`: é **sempre o usuário logado** que cadastrou. O front **não envia** autor; o campo "Autor da Publicação" da tela vira só exibição (use o `nome` do `/auth/me`).
- `status` (slug) e `status_nome` (texto para a tela), vindos da tabela `n_status_noticias`:

  | `status` | `status_nome` | Quando | No site? |
  |---|---|---|---|
  | `aguardando` | Aguardando aprovação | acabou de ser cadastrada, foi corrigida depois de reprovada ou foi despublicada | não |
  | `reprovada` | Reprovada | alguém clicou em **Reprovar**; o motivo vem em `motivo_reprovacao` | não |
  | `publicada` | Publicada | alguém clicou em **Publicar** | sim, a partir da `data_publicacao` |

  Publicada com `data_publicacao` futura está **agendada**: se quiser mostrar esse rótulo, compare a data no front.
- `motivo_reprovacao`: preenchido só quando `status` é `reprovada`. Mostre para o autor saber o que corrigir.
- `avaliado_por_*`: quem tomou a última decisão. O significado depende da `status`:
  - `publicada`: quem clicou em **Publicar** ("Publicada por Maria");
  - `reprovada`: quem clicou em **Reprovar** ("Reprovada por Maria");
  - `aguardando`: `null`, ninguém avaliou ainda.

### `GET /n_noticias`: listar
Paginado, da mais nova para a mais antiga. Filtros úteis:
- `q[titulo_cont]=polo`;
- `q[n_categoria_noticia_id_eq]=1`;
- `q[n_status_noticia_slug_eq]=aguardando`: a **fila de aprovação**;
- `q[n_status_noticia_slug_eq]=reprovada`: as que voltaram para correção;
- `q[n_status_noticia_id_eq]=1`: pelo id, usando o select de `GET /n_status_noticias`.

### `GET /n_noticias/:id`: ver uma
Objeto notícia (sem envelope).

### `POST /n_noticias`: cadastrar

**Com link de imagem (JSON):**
```json
{
  "n_noticia": {
    "titulo": "Polo ribeirinho recebe novos computadores",
    "n_categoria_noticia_id": 1,
    "data_publicacao": "2026-10-26",
    "imagem_capa_url": "https://exemplo.com/foto.jpg",
    "resumo": "Breve resumo para o card.",
    "conteudo": "Parágrafos completos..."
  }
}
```

**Com foto do computador:** envie `multipart/form-data` (com `FormData`, sem definir o `Content-Type` à mão):
```js
const form = new FormData();
form.append("n_noticia[titulo]", titulo);
form.append("n_noticia[n_categoria_noticia_id]", categoriaId);
form.append("n_noticia[conteudo]", conteudo);
form.append("n_noticia[imagem_capa]", arquivo);        // File do <input type="file">
await api.post("/n_noticias", form);
```

| Campo | Obrigatório | Regras |
|---|---|---|
| `titulo` | sim | gera o `slug` (endereço da notícia) |
| `conteudo` | sim | |
| `n_categoria_noticia_id` | sim | id de `GET /n_categorias_noticia` |
| `data_publicacao` | não | `AAAA-MM-DD`; se publicar sem data, a API usa a data de hoje; data futura só aparece no site a partir do dia |
| `imagem_capa` | não | arquivo PNG, JPG ou WEBP até 5 MB |
| `imagem_capa_url` | não | link da imagem; ignorado se vier `imagem_capa` junto |
| `resumo` | não | texto do card |

Toda notícia nasce **aguardando aprovação** (`status: "aguardando"`). Mandar a situação no cadastro ou na edição não tem efeito: quem aprova usa as rotas abaixo.

**201**: objeto notícia. **422**: validação (`errors` com as mensagens, ex.: "Titulo não pode ficar em branco", "Imagem capa deve ser PNG, JPG ou WEBP").

> Campos **removidos** da tela: Pasta, Destacar na página inicial e Marcar como urgência.

### `PATCH /n_noticias/:id`: editar
Mesmos campos, todos opcionais. O autor não muda. Editar uma notícia **reprovada** devolve ela para a fila (`aguardando`) e limpa o `motivo_reprovacao` e o `avaliado_por_id`. Enviar `imagem_capa_url` numa notícia que tinha foto enviada troca a capa pelo link (a foto antiga é apagada). **200**: objeto notícia.

### `PATCH /n_noticias/:id/publicar`: botão "Publicar"
Sem corpo. A API muda a situação para `publicada`, limpa o `motivo_reprovacao`, grava `avaliado_por_id` com o **usuário logado** e, se `data_publicacao` estiver vazia, usa a data de hoje (data futura fica agendada). **200**: objeto notícia. **403** para quem não tem a permissão "Publicar".

### `PATCH /n_noticias/:id/reprovar`: botão "Reprovar"
```json
{ "motivo": "Falta a fonte da foto de capa." }
```
A situação vira `reprovada`, o motivo fica em `motivo_reprovacao` e `avaliado_por_id` recebe o **usuário logado**. Se a notícia estava publicada, ela sai do site. **200**: objeto notícia. **422** sem motivo ("Motivo reprovacao não pode ficar em branco"). **403** para quem não tem a permissão "Reprovar".

### `PATCH /n_noticias/:id/despublicar`: tirar do site
Sem corpo. Sai do site, volta para a fila de aprovação (`status: "aguardando"`) e limpa `avaliado_por_id`. **200**: objeto notícia.

### `DELETE /n_noticias/:id`: excluir
**204**. A notícia sai do CMS e do site (exclusão lógica: continua no banco).

### Status: `GET /n_status_noticias`
Opções do filtro "Status" da lista. Só leitura: os três status vêm do seed.
```json
{ "id": 1, "nome": "Aguardando aprovação", "slug": "aguardando" }
```
Use `?page=all` para trazer todas de uma vez.

### Categorias: `/n_categorias_noticia`
Opções do select "Categoria". CRUD igual ao de perfis.

```json
{ "id": 1, "nome": "Pedagógico", "slug": "pedagogico", "ativo": true, "created_at": "...", "updated_at": "..." }
```
- Select do formulário: `GET /n_categorias_noticia?q[ativo_true]=1&page=all` (já vem em ordem alfabética).
- `DELETE` de categoria que tem notícia: **422**.

---

## 19. Notícias: site público (sem login)

O que o visitante vê. **Não envie token.** Só aparecem notícias **publicadas** com data até hoje; as que aguardam aprovação, as agendadas e as excluídas não aparecem.

**Objeto notícia pública**
```json
{
  "slug": "polo-ribeirinho-recebe-novos-computadores",
  "titulo": "Polo ribeirinho recebe novos computadores",
  "resumo": "Breve resumo para o card.",
  "conteudo": "Parágrafos completos...",
  "data_publicacao": "2026-10-26",
  "categoria_nome": "Pedagógico",
  "categoria_slug": "pedagogico",
  "autor_nome": "Maria Silva",
  "imagem_capa": "https://exemplo.com/foto.jpg"
}
```

### `GET /publico/n_noticias`: cards da home e lista
Paginado (`page`, `per_page`), da mais nova para a mais antiga. Filtros:
- `categoria=pedagogico` (slug da categoria);
- `busca=polo` (procura no título).

### `GET /publico/n_noticias/:slug`: "Ler notícia completa"
**200** no envelope (`data` = objeto notícia pública). **404** se não existir ou não estiver publicada.

### `GET /publico/n_categorias_noticia`: filtro do site
**200** no envelope: `[{ "nome": "Pedagógico", "slug": "pedagogico" }, ...]` (só as ativas, em ordem alfabética).

---

## 20. Avisos: site público (sem login)

O que o visitante vê no topo do site. **Não envie token.** Só aparecem avisos **ativos** de tipos **ativos**; os desativados e os excluídos não aparecem. O cadastro continua pelo CMS ([seção 13](#13-avisos)).

**Objeto aviso público**
```json
{
  "titulo": "Plantão de fim de semana",
  "conteudo": "Escala atualizada para o fim de semana.",
  "link_texto": "Ver escala",
  "link_url": "https://exemplo.com/escala",
  "tipo_nome": "Urgente",
  "tipo_slug": "urgente",
  "tipo_cor": "#DC2626",
  "created_at": "..."
}
```

- `tipo_cor` é a cor base em hexadecimal; o front deriva os tons (fundo, borda, texto).
- `link_texto` e `link_url` podem vir `null` (aviso sem botão).

### `GET /publico/a_avisos`: avisos do site
Paginado (`page`, `per_page`; `page=all` traz todos), do mais novo para o mais antigo. Filtro:
- `tipo=urgente` (slug do tipo de aviso).

---

## 21. Dúvidas: CMS (com login)

Tela de dúvidas recorrentes (FAQ) do painel. Token + permissão do perfil. Usa o **mesmo fluxo de aprovação das notícias** (situações da tabela `n_status_noticias`):

- Quem tem a permissão **Publicar** de dúvidas (hoje **Gestor** e **Administrador**) cria a dúvida **já publicada**.
- Os outros perfis com permissão de criar cadastram como **aguardando** e o Gestor/Administrador publica ou reprova.
- Não existe motivo de reprovação: reprovar só muda a situação e grava quem reprovou. Quando o autor edita uma dúvida reprovada, ela volta para **aguardando**.

**Objeto dúvida**
```json
{
  "id": 1,
  "pergunta": "Como faço minha matrícula?",
  "resposta": "Procure a secretaria do polo com seus documentos.",
  "d_categoria_duvida_id": 1,
  "categoria_nome": "Matrícula",
  "n_status_noticia_id": 3,
  "status": "publicada",
  "status_nome": "Publicada",
  "autor_id": 2,
  "autor_nome": "Gestora",
  "avaliado_por_id": 2,
  "avaliado_por_nome": "Gestora",
  "created_by": "2",
  "updated_by": "2",
  "created_at": "...",
  "updated_at": "..."
}
```

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /d_duvidas` | Listar (paginado, mais recentes primeiro). Filtros: `q[pergunta_cont]`, `q[d_categoria_duvida_id_eq]`, `q[n_status_noticia_slug_eq]=aguardando` | 200 envelope paginado |
| `GET /d_duvidas/:id` | Ver uma | 200 objeto |
| `POST /d_duvidas` | Criar (autor = usuário logado) | 201 objeto |
| `PATCH /d_duvidas/:id` | Editar | 200 objeto |
| `DELETE /d_duvidas/:id` | Excluir (lógica) | 204 |
| `PATCH /d_duvidas/:id/publicar` | Publicar (avaliado por = usuário logado) | 200 objeto |
| `PATCH /d_duvidas/:id/reprovar` | Reprovar (avaliado por = usuário logado) | 200 objeto |
| `PATCH /d_duvidas/:id/despublicar` | Tirar do site (volta para aguardando) | 200 objeto |

**Corpo de criar/editar**
```json
{
  "d_duvida": {
    "d_categoria_duvida_id": 1,
    "pergunta": "Como faço minha matrícula?",
    "resposta": "Procure a secretaria do polo com seus documentos."
  }
}
```

| Campo | Obrigatório | Regras |
|---|---|---|
| `d_categoria_duvida_id` | sim | categoria de dúvida existente |
| `pergunta` | sim | pergunta completa |
| `resposta` | sim | resposta oficial completa |

- Autor e situação **não são enviados**: o autor é o usuário logado e a situação muda só pelas rotas publicar/reprovar/despublicar.

### Categorias de dúvida: `/d_categorias_duvida`
CRUD igual ao das categorias de notícia. Corpo: `{ "d_categoria_duvida": { "nome": "Matrícula", "slug": "matricula", "ativo": true } }` (o `slug` sai do nome se não for enviado). Não dá para excluir categoria com dúvidas (**422** `"Não foi possível excluir"`).

### Dúvidas enviadas pelo site: `/d_duvidas_visitante`
Lista do que os visitantes mandaram pelo formulário do site. A equipe responde **por e-mail ou telefone, fora do sistema**, e depois marca como respondida.

```json
{
  "id": 1,
  "nome": "Ana",
  "email": "ana@exemplo.com",
  "telefone": "(69) 99999-0000",
  "descricao": "Tem curso de informática no meu polo?",
  "respondida": false,
  "respondida_por_id": null,
  "respondida_por_nome": null,
  "respondida_em": null,
  "created_at": "...",
  "updated_at": "..."
}
```

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /d_duvidas_visitante` | Listar (mais recentes primeiro). Pendentes: `q[respondida_false]=1` | 200 envelope paginado |
| `GET /d_duvidas_visitante/:id` | Ver uma | 200 objeto |
| `PATCH /d_duvidas_visitante/:id/responder` | Marcar como respondida (respondida por = usuário logado) | 200 objeto |
| `DELETE /d_duvidas_visitante/:id` | Excluir (lógica) | 204 |

---

## 22. Dúvidas: site público (sem login)

**Não envie token.** Só aparecem dúvidas **publicadas**.

**Objeto dúvida pública**
```json
{
  "id": 1,
  "pergunta": "Como faço minha matrícula?",
  "resposta": "Procure a secretaria do polo com seus documentos.",
  "categoria_nome": "Matrícula",
  "categoria_slug": "matricula"
}
```

### `GET /publico/d_duvidas`: lista de dúvidas recorrentes
Paginado (`page`, `per_page`; `page=all` traz todas), em ordem alfabética da pergunta. Filtros:
- `categoria=matricula` (slug da categoria);
- `busca=matrícula` (procura na pergunta).

### `GET /publico/d_categorias_duvida`: filtro do site
**200** no envelope: `[{ "nome": "Matrícula", "slug": "matricula" }, ...]` (só as ativas, em ordem alfabética).

### `POST /publico/d_duvidas_visitante`: "Não encontrou sua dúvida?"
```json
{
  "d_duvida_visitante": {
    "nome": "Ana",
    "email": "ana@exemplo.com",
    "telefone": "(69) 99999-0000",
    "descricao": "Tem curso de informática no meu polo?"
  }
}
```

| Campo | Obrigatório | Regras |
|---|---|---|
| `nome` | sim | |
| `email` | sim | formato de e-mail |
| `telefone` | não | |
| `descricao` | sim | a dúvida |

- **201** no envelope: `"message": "Dúvida enviada. Em breve entraremos em contato."` (`data: null`).
- **422** com as mensagens de validação.
- **429** `"muitas_tentativas"` depois de 5 envios no mesmo minuto.

---

## 23. Galeria: site público (sem login)

**Não envie token.** Só aparecem fotos de categorias **ativas**; as excluídas não aparecem. O cadastro continua pelo CMS ([seção 14](#14-categorias-da-galeria) e [seção 15](#15-fotos-da-galeria)).

**Objeto foto pública**
```json
{
  "id": 1,
  "titulo": "Fachada",
  "descricao": "Entrada principal do polo.",
  "imagem": "/rails/active_storage/blobs/redirect/.../fachada.jpg",
  "categoria_nome": "Estrutura",
  "categoria_slug": "estrutura"
}
```

- `imagem` é o caminho do arquivo enviado (junte com a URL do servidor) ou, se a foto foi cadastrada por link, a `imagem_url` completa.
- `descricao` pode vir `null`.

### `GET /publico/fotos_galeria`: fotos do site
Paginado (`page`, `per_page`; `page=all` traz todas), da mais nova para a mais antiga. Filtro:
- `categoria=eventos` (slug da categoria).

### `GET /publico/categorias_galeria`: filtro da galeria
**200** no envelope: `[{ "nome": "Salas de Aula", "slug": "salas-de-aula" }, ...]` (só as ativas, na ordem da posição definida no CMS).

---

## 24. Canais de contato: site público (sem login)

### `GET /publico/canais_contato`: contatos e redes sociais
**Não envie token.** Para o rodapé e a página de contato. Só vêm os canais **ativos**, na ordem da posição definida no CMS. Não é paginado.

```json
{
  "success": true,
  "message": "Canais de contato encontrados",
  "data": [
    { "rede": "youtube", "valor": "https://www.youtube.com/@SeducRondonia" },
    { "rede": "instagram", "valor": "https://www.instagram.com/governoro/" },
    { "rede": "whatsapp", "valor": "https://wa.me/5569999999999" },
    { "rede": "telefone", "valor": "(69) 3216-5300" },
    { "rede": "email", "valor": "medtec@seduc.ro.gov.br" }
  ]
}
```

- `rede` é fixa (`youtube`, `instagram`, `facebook`, `whatsapp`, `telefone`, `email`, `endereco`); use para escolher o ícone.
- `valor` é o link ou o texto a exibir. Canal desativado no CMS não vem na lista.

---

## 25. Professores: CMS (com login)

Portfólio de professores do site. Token + permissão do perfil (hoje **Gestor** e **Administrador**). O professor não faz login: é só conteúdo do site.

### Disciplinas: `/p_disciplinas`
CRUD igual ao das categorias de dúvida. Corpo: `{ "p_disciplina": { "nome": "Biologia", "slug": "biologia", "ativo": true } }` (o `slug` sai do nome se não for enviado). Não dá para excluir disciplina ligada a professor, nem a professor inativo (**422** `"Não foi possível excluir"`, com `errors: ["Disciplina vinculada a professor não pode ser excluída"]`); desative com `"ativo": false`. Professores já excluídos não bloqueiam.

### Escolas: `GET /escolas`
Só listagem, para o select de escola do formulário de professor. As escolas vêm de outro sistema e não são cadastradas aqui. Use `page=all` e a busca `q[nome_cont]=bolívar`.

```json
{ "id": 1, "nome": "EEEFM Simón Bolívar", "inep": "11000000", "g_cidade_id": 1, "cidade_nome": "Guajará-Mirim" }
```

### Professores: `/p_professores`

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /p_professores` | Listar (ordem alfabética). Filtros: `q[nome_cont]`, `q[escola_id_eq]`, `q[escola_g_cidade_id_eq]`, `q[p_disciplinas_id_eq]`, `q[ativo_true]=1` | 200 envelope paginado |
| `GET /p_professores/:id` | Ver um | 200 objeto |
| `POST /p_professores` | Criar | 201 objeto |
| `PATCH /p_professores/:id` | Editar | 200 objeto |
| `DELETE /p_professores/:id` | Excluir (lógica). Os relatos do professor são excluídos junto | 204 |

**Corpo de criar/editar**
```json
{
  "p_professor": {
    "nome": "Ana Beatriz Moura",
    "escola_id": 1,
    "pratica_pedagogica": "Transforma o bioma amazônico em laboratório vivo.",
    "ativo": true,
    "p_disciplina_ids": [1, 2]
  }
}
```

| Campo | Obrigatório | Regras |
|---|---|---|
| `nome` | sim | |
| `escola_id` | sim | escola existente (a cidade vem dela) |
| `pratica_pedagogica` | sim | prévia sobre o professor, mostrada no card do site |
| `p_disciplina_ids` | sim | lista com ao menos uma disciplina. Na edição, **substitui** a lista inteira |
| `ativo` | não | padrão `true`; inativo some do site |

**Objeto professor**
```json
{
  "id": 1,
  "nome": "Ana Beatriz Moura",
  "pratica_pedagogica": "Transforma o bioma amazônico em laboratório vivo.",
  "ativo": true,
  "escola_id": 1,
  "escola_nome": "EEEFM Simón Bolívar",
  "cidade_nome": "Guajará-Mirim",
  "p_disciplina_ids": [1],
  "disciplinas": [{ "id": 1, "nome": "Biologia" }],
  "created_by": "1",
  "updated_by": "1",
  "created_at": "...",
  "updated_at": "..."
}
```

### Relatos dos alunos: `/p_relatos`
Chegam pelo site ([seção 26](#26-professores-site-público-sem-login)) como **aguardando**. O Gestor publica (aparece no site) ou reprova. Aqui a equipe vê o e-mail e o telefone do aluno; no site, nunca.

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /p_relatos` | Listar (mais recentes primeiro). Filtros: `q[p_professor_id_eq]`, `q[n_status_noticia_slug_eq]=aguardando` | 200 envelope paginado |
| `GET /p_relatos/:id` | Ver um | 200 objeto |
| `PATCH /p_relatos/:id/publicar` | Publicar (avaliado por = usuário logado) | 200 objeto |
| `PATCH /p_relatos/:id/reprovar` | Reprovar (não aparece no site) | 200 objeto |
| `PATCH /p_relatos/:id/despublicar` | Tirar do site (volta para aguardando) | 200 objeto |
| `DELETE /p_relatos/:id` | Excluir (lógica) | 204 |

```json
{
  "id": 1,
  "p_professor_id": 1,
  "professor_nome": "Ana Beatriz Moura",
  "nome": "João",
  "email": "joao@exemplo.com",
  "telefone": "69999990000",
  "texto": "A professora Ana mudou meu jeito de estudar.",
  "n_status_noticia_id": 1,
  "status": "aguardando",
  "status_nome": "Aguardando aprovação",
  "avaliado_por_id": null,
  "avaliado_por_nome": null,
  "created_at": "...",
  "updated_at": "..."
}
```

---

## 26. Professores: site público (sem login)

**Não envie token.** Só aparecem professores **ativos** e relatos **publicados**. E-mail e telefone do aluno nunca aparecem.

**Objeto professor público**
```json
{
  "id": 1,
  "nome": "Ana Beatriz Moura",
  "pratica_pedagogica": "Transforma o bioma amazônico em laboratório vivo.",
  "escola_nome": "EEEFM Simón Bolívar",
  "cidade_nome": "Guajará-Mirim",
  "disciplinas": [{ "nome": "Biologia", "slug": "biologia" }]
}
```

As iniciais do card (ex.: "AM") o front monta a partir do `nome`.

### `GET /publico/p_professores`: portfólio
Paginado (`page`, `per_page`; `page=all` traz todos), em ordem alfabética. Filtros:
- `disciplina=biologia` (slug da disciplina);
- `cidade=1` (id da cidade da escola);
- `busca=texto` (procura no nome, na disciplina, na escola e no município, igual à caixa de busca da tela).

### `GET /publico/p_professores/:id`: página do professor
**200** no envelope, com o objeto professor público mais os relatos publicados (mais recentes primeiro). Professor inativo ou excluído dá **404**.

```json
{
  "success": true,
  "message": "Professor encontrado",
  "data": {
    "id": 1,
    "nome": "Ana Beatriz Moura",
    "...": "...",
    "relatos": [
      { "nome": "João", "texto": "A professora Ana mudou meu jeito de estudar.", "created_at": "..." }
    ]
  }
}
```

### `GET /publico/p_disciplinas`: filtro do site
**200** no envelope: `[{ "nome": "Biologia", "slug": "biologia" }, ...]` (só as ativas, em ordem alfabética).

### `POST /publico/p_professores/:id/p_relatos`: relato do aluno
O aluno não tem cadastro: o relato fica ligado ao professor da URL.

```json
{
  "p_relato": {
    "nome": "João",
    "email": "joao@exemplo.com",
    "telefone": "(69) 99999-0000",
    "texto": "A professora Ana mudou meu jeito de estudar."
  }
}
```

| Campo | Obrigatório | Regras |
|---|---|---|
| `nome` | sim | aparece no site junto com o relato |
| `email` | sim | formato de e-mail; **um relato por e-mail para cada professor** |
| `telefone` | sim | com DDD, 10 ou 11 dígitos; pode ir com ou sem máscara |
| `texto` | sim | o relato |

- **201** no envelope: `"message": "Relato enviado. Ele aparece no site depois de aprovado."` (`data: null`).
- **404** se o professor não existe ou está inativo.
- **422** com as mensagens de validação (ex.: `"Email já enviou um relato para este professor"`).
- **429** `"muitas_tentativas"` depois de 5 envios no mesmo minuto.

---

## 27. Conquistas dos alunos: CMS (com login)

Tela "Alunos que Inspiram" do painel. Token + permissão do perfil. Usa o **mesmo fluxo de aprovação das dúvidas** (situações da tabela `n_status_noticias`):

- Quem tem a permissão **Publicar** de conquistas (hoje **Gestor** e **Administrador**) cria a conquista **já publicada**.
- Os outros perfis com permissão de criar cadastram como **aguardando** e o Gestor/Administrador publica ou reprova.
- Não existe motivo de reprovação. Quando o autor edita uma conquista reprovada, ela volta para **aguardando**.
- A **cidade vem da escola**: no formulário, o select de município só serve para filtrar as escolas (`GET /escolas?q[g_cidade_id_eq]=1&page=all`).

### Categorias da conquista: `/c_categorias_conquista_aluno`
CRUD igual ao das categorias de dúvida. Corpo: `{ "c_categoria_conquista_aluno": { "nome": "Robótica", "slug": "robotica", "ativo": true } }` (o `slug` sai do nome se não for enviado). O seed já cria Vestibular, Olimpíada, Robótica e Feira de Ciências. Não dá para excluir categoria com conquistas (**422** `"Não foi possível excluir"`); desative com `"ativo": false`.

### Conquistas: `/c_conquistas_aluno`

**Objeto conquista**
```json
{
  "id": 1,
  "nome_aluno": "Ana Souza",
  "titulo": "Aprovada em Medicina",
  "relato": "Estudou pelo MEDTEC e passou na federal.",
  "c_categoria_conquista_aluno_id": 1,
  "categoria_nome": "Vestibular",
  "escola_id": 3,
  "escola_nome": "EEEFM Simón Bolívar",
  "cidade_nome": "Porto Velho",
  "imagem_url": null,
  "imagem": "/rails/active_storage/blobs/redirect/.../foto.png",
  "n_status_noticia_id": 3,
  "status": "publicada",
  "status_nome": "Publicada",
  "autor_id": 2,
  "autor_nome": "Gestora",
  "avaliado_por_id": 2,
  "avaliado_por_nome": "Gestora",
  "created_by": "2",
  "updated_by": "2",
  "created_at": "...",
  "updated_at": "..."
}
```

`imagem` é o caminho do arquivo enviado (junte com a URL do servidor, sem o `/api/v1`); `imagem_url` é o link externo. Mostre o que vier preenchido.

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /c_conquistas_aluno` | Listar (paginado, mais recentes primeiro). Filtros: `q[nome_aluno_cont]`, `q[titulo_cont]`, `q[c_categoria_conquista_aluno_id_eq]`, `q[escola_id_eq]`, `q[escola_g_cidade_id_eq]`, `q[n_status_noticia_slug_eq]=aguardando` | 200 envelope paginado |
| `GET /c_conquistas_aluno/:id` | Ver uma | 200 objeto |
| `POST /c_conquistas_aluno` | Criar (autor = usuário logado) | 201 objeto |
| `PATCH /c_conquistas_aluno/:id` | Editar | 200 objeto |
| `DELETE /c_conquistas_aluno/:id` | Excluir (lógica) | 204 |
| `PATCH /c_conquistas_aluno/:id/publicar` | Publicar (avaliado por = usuário logado) | 200 objeto |
| `PATCH /c_conquistas_aluno/:id/reprovar` | Reprovar (avaliado por = usuário logado) | 200 objeto |
| `PATCH /c_conquistas_aluno/:id/despublicar` | Tirar do site (volta para aguardando) | 200 objeto |

**Corpo de criar/editar com link (JSON)**
```json
{
  "c_conquista_aluno": {
    "nome_aluno": "Ana Souza",
    "titulo": "Aprovada em Medicina",
    "relato": "Estudou pelo MEDTEC e passou na federal.",
    "c_categoria_conquista_aluno_id": 1,
    "escola_id": 3,
    "imagem_url": "https://exemplo.com/foto.jpg"
  }
}
```

**Com upload:** envie como `multipart/form-data` (sem o header `Content-Type: application/json`), com os campos no formato `c_conquista_aluno[nome_aluno]`, `c_conquista_aluno[imagem]` (arquivo) etc.

| Campo | Obrigatório | Regras |
|---|---|---|
| `nome_aluno` | sim | nome autorizado para divulgação |
| `titulo` | sim | |
| `relato` | sim | relato completo |
| `c_categoria_conquista_aluno_id` | sim | categoria existente |
| `escola_id` | sim | escola de `GET /escolas`; a cidade vem dela |
| `imagem` | não | arquivo PNG, JPG ou WEBP, até 5 MB |
| `imagem_url` | não | link externo da imagem |

- Autor e situação **não são enviados**: o autor é o usuário logado e a situação muda só pelas rotas publicar/reprovar/despublicar.
- Erros de validação: **422** (ex.: `"Imagem deve ser PNG, JPG ou WEBP"`, `"Escola é obrigatório(a)"`).

---

## 28. Conquistas dos alunos: site público (sem login)

**Não envie token.** Só aparecem as conquistas **publicadas**. Autor, quem avaliou e auditoria não aparecem.

**Objeto conquista pública**
```json
{
  "id": 1,
  "nome_aluno": "Ana Souza",
  "titulo": "Aprovada em Medicina",
  "relato": "Estudou pelo MEDTEC e passou na federal.",
  "categoria_nome": "Vestibular",
  "categoria_slug": "vestibular",
  "escola_nome": "EEEFM Simón Bolívar",
  "cidade_nome": "Porto Velho",
  "imagem": null,
  "imagem_url": "https://exemplo.com/foto.jpg",
  "created_at": "..."
}
```

### `GET /publico/c_conquistas_aluno`: listagem
Paginado (`page`, `per_page`; `page=all` traz todas), mais recentes primeiro. Filtros:
- `categoria=robotica` (slug da categoria);
- `cidade=1` (id da cidade da escola);
- `busca=texto` (procura no nome do aluno e no título).

### `GET /publico/c_conquistas_aluno/:id`: conquista completa
**200** no envelope (`"message": "Conquista encontrada"`, `data` = objeto conquista pública). Conquista que não está publicada ou foi excluída dá **404**.

### `GET /publico/c_categorias_conquista_aluno`: filtro do site
**200** no envelope: `[{ "nome": "Feira de Ciências", "slug": "feira-de-ciencias" }, ...]` (só as ativas, em ordem alfabética).

---

## 29. Projetos pedagógicos: CMS (com login)

Tela "Projetos Pedagógicos" do painel. Token + permissão do perfil. Usa o **mesmo fluxo de aprovação das dúvidas e conquistas** (situações da tabela `n_status_noticias`):

- Quem tem a permissão **Publicar** de projetos (hoje **Gestor** e **Administrador**) cria o projeto **já publicado**.
- Os outros perfis com permissão de criar cadastram como **aguardando** e o Gestor/Administrador publica ou reprova.
- Não existe motivo de reprovação. Quando o autor edita um projeto reprovado, ele volta para **aguardando**.
- A **cidade vem da escola**: o select de município da tela só filtra as escolas (`GET /escolas?q[g_cidade_id_eq]=1&page=all`).
- **Membros** ficam numa tabela própria (nome e CPF) e são reaproveitados entre projetos. A **função** é do vínculo: a mesma pessoa pode ser coordenadora num projeto e aluna em outro.

### Temas: `/pj_temas`
CRUD igual ao das categorias de conquista. Corpo: `{ "pj_tema": { "nome": "Ciência na Amazônia", "slug": "ciencia-na-amazonia", "ativo": true } }` (o `slug` sai do nome se não for enviado). O seed já cria Agroecologia & NBAZ, Ciência na Amazônia, Saberes Indígenas & História e Tecnologia Solar & Robótica. Não dá para excluir tema com projetos (**422** `"Não foi possível excluir"`); desative com `"ativo": false`.

### Membros: `/pj_membros`

```json
{ "id": 1, "nome": "Maria Ribeiro", "cpf": "01251667708", "created_by": "1", "updated_by": null, "created_at": "...", "updated_at": "..." }
```

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /pj_membros` | Listar (ordem alfabética). Filtros: `q[nome_cont]`, `q[cpf_eq]` (só números) | 200 envelope paginado |
| `GET /pj_membros/:id` | Ver um | 200 objeto |
| `POST /pj_membros` | Criar | 201 objeto |
| `PATCH /pj_membros/:id` | Editar | 200 objeto |
| `DELETE /pj_membros/:id` | Excluir. Membro que está em algum projeto não sai (**422** `"Não foi possível excluir"`) | 204 |

Corpo: `{ "pj_membro": { "nome": "Maria Ribeiro", "cpf": "012.516.677-08" } }`.

| Campo | Obrigatório | Regras |
|---|---|---|
| `nome` | sim | |
| `cpf` | sim | CPF válido e **único**; com ou sem máscara (salvo só com números). Nunca aparece no site |

**Fluxo sugerido no formulário do projeto:** digitar o CPF → `GET /pj_membros?q[cpf_eq]=01251667708`. Se vier, usa o `id`; se não, cadastra com `POST /pj_membros` e usa o `id` novo.

### Projetos: `/pj_projetos`

**Objeto projeto**
```json
{
  "id": 1,
  "titulo": "Hortas em Jirau",
  "relato": "Alunos montaram hortas suspensas com a comunidade ribeirinha.",
  "pj_tema_id": 1,
  "tema_nome": "Agroecologia & NBAZ",
  "escola_id": 3,
  "escola_nome": "EEEFM Simón Bolívar",
  "cidade_nome": "Porto Velho",
  "imagem_url": null,
  "imagem": "/rails/active_storage/blobs/redirect/.../capa.png",
  "anexos": [
    { "id": 10, "nome": "relatorio.pdf", "tipo": "application/pdf", "tamanho": 52344, "url": "/rails/active_storage/blobs/redirect/.../relatorio.pdf" },
    { "id": 11, "nome": "foto.jpg", "tipo": "image/jpeg", "tamanho": 181220, "url": "/rails/active_storage/blobs/redirect/.../foto.jpg" }
  ],
  "membros": [
    { "id": 5, "pj_membro_id": 1, "nome": "Maria Ribeiro", "cpf": "01251667708", "funcao": "Professora mediadora" }
  ],
  "n_status_noticia_id": 3,
  "status": "publicada",
  "status_nome": "Publicada",
  "autor_id": 2,
  "autor_nome": "Gestora",
  "avaliado_por_id": 2,
  "avaliado_por_nome": "Gestora",
  "created_by": "2",
  "updated_by": "2",
  "created_at": "...",
  "updated_at": "..."
}
```

- `imagem` e `url` dos anexos são caminhos: junte com a URL do servidor, sem o `/api/v1`. `imagem_url` é o link externo da capa. Mostre o que vier preenchido.
- Em `membros`, o `id` é o **do vínculo** (usado para editar a função ou tirar o membro do projeto); `pj_membro_id` é o do membro.

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /pj_projetos` | Listar (paginado, mais recentes primeiro). Filtros: `q[titulo_cont]`, `q[pj_tema_id_eq]`, `q[escola_id_eq]`, `q[escola_g_cidade_id_eq]`, `q[pj_membros_id_eq]`, `q[n_status_noticia_slug_eq]=aguardando` | 200 envelope paginado |
| `GET /pj_projetos/:id` | Ver um | 200 objeto |
| `POST /pj_projetos` | Criar (autor = usuário logado) | 201 objeto |
| `PATCH /pj_projetos/:id` | Editar | 200 objeto |
| `DELETE /pj_projetos/:id` | Excluir (lógica) | 204 |
| `PATCH /pj_projetos/:id/publicar` | Publicar (avaliado por = usuário logado) | 200 objeto |
| `PATCH /pj_projetos/:id/reprovar` | Reprovar (avaliado por = usuário logado) | 200 objeto |
| `PATCH /pj_projetos/:id/despublicar` | Tirar do site (volta para aguardando) | 200 objeto |
| `DELETE /pj_projetos/:id/anexos/:anexo_id` | Remover um anexo (`anexo_id` = `id` do item em `anexos`) | 204 |

**Corpo de criar (JSON, capa por link)**
```json
{
  "pj_projeto": {
    "titulo": "Hortas em Jirau",
    "pj_tema_id": 1,
    "relato": "Alunos montaram hortas suspensas com a comunidade ribeirinha.",
    "escola_id": 3,
    "imagem_url": "https://exemplo.com/capa.jpg",
    "pj_projeto_membros_attributes": [
      { "pj_membro_id": 1, "funcao": "Professora mediadora" },
      { "pj_membro_id": 2, "funcao": "Aluno" }
    ]
  }
}
```

**Com arquivos (capa e anexos):** envie como `multipart/form-data` (sem o header `Content-Type: application/json`). Dá para mandar **vários anexos de tipos diferentes na mesma requisição** (ex.: 2 PDFs e 3 fotos), repetindo a chave `pj_projeto[anexos][]`:

```
pj_projeto[titulo]                                   Hortas em Jirau
pj_projeto[pj_tema_id]                               1
pj_projeto[relato]                                   Alunos montaram hortas...
pj_projeto[escola_id]                                3
pj_projeto[imagem]                                   (arquivo da capa)
pj_projeto[anexos][]                                 (relatorio.pdf)
pj_projeto[anexos][]                                 (foto1.jpg)
pj_projeto[pj_projeto_membros_attributes][0][pj_membro_id]   1
pj_projeto[pj_projeto_membros_attributes][0][funcao]         Professora mediadora
```

| Campo | Obrigatório | Regras |
|---|---|---|
| `titulo` | sim | |
| `pj_tema_id` | sim | tema existente |
| `relato` | sim | relato do projeto |
| `escola_id` | sim | escola de `GET /escolas`; a cidade vem dela |
| `imagem` | não | capa: PNG, JPG ou WEBP, até 5 MB |
| `imagem_url` | não | link externo da capa |
| `anexos[]` | não | PDF, Word, Excel, PowerPoint, PNG, JPG ou WEBP, **até 10 MB cada** |
| `pj_projeto_membros_attributes` | não | lista de `{ pj_membro_id, funcao }`; o mesmo membro não entra duas vezes no projeto |

**Editar:**
- Os **anexos enviados na edição são acrescentados** aos que já existem. Para tirar um, use `DELETE /pj_projetos/:id/anexos/:anexo_id`.
- Membros: mande só o que muda em `pj_projeto_membros_attributes`:
  - novo membro: `{ "pj_membro_id": 3, "funcao": "Aluna" }`;
  - mudar a função: `{ "id": 5, "funcao": "Coordenadora" }` (`id` do vínculo);
  - tirar do projeto: `{ "id": 5, "_destroy": true }` (o membro continua cadastrado).
- Autor e situação **não são enviados**: o autor é o usuário logado e a situação muda só pelas rotas publicar/reprovar/despublicar.
- Erros de validação: **422** (ex.: `"Anexos documento.txt: deve ser PDF, Word, Excel, PowerPoint ou imagem"`, `"Escola é obrigatório(a)"`, `"O mesmo membro foi informado mais de uma vez"`).

---

## 30. Projetos pedagógicos: site público (sem login)

**Não envie token.** Só aparecem os projetos **publicados**. Autor, quem avaliou, CPF e auditoria não aparecem.

**Objeto projeto público (listagem)**
```json
{
  "id": 1,
  "titulo": "Hortas em Jirau",
  "relato": "Alunos montaram hortas suspensas com a comunidade ribeirinha.",
  "tema_nome": "Agroecologia & NBAZ",
  "tema_slug": "agroecologia-nbaz",
  "escola_nome": "EEEFM Simón Bolívar",
  "cidade_nome": "Porto Velho",
  "imagem": null,
  "imagem_url": "https://exemplo.com/capa.jpg",
  "created_at": "..."
}
```

### `GET /publico/pj_projetos`: listagem
Paginado (`page`, `per_page`; `page=all` traz todos), mais recentes primeiro. Filtros:
- `tema=agroecologia-nbaz` (slug do tema);
- `cidade=1` (id da cidade da escola);
- `busca=texto` (procura no título).

### `GET /publico/pj_projetos/:id`: página do projeto
**200** no envelope (`"message": "Projeto encontrado"`), com o objeto da listagem **mais** membros (só nome e função) e anexos para download. Projeto não publicado ou excluído dá **404**.

```json
{
  "success": true,
  "message": "Projeto encontrado",
  "data": {
    "id": 1,
    "titulo": "Hortas em Jirau",
    "...": "...",
    "membros": [
      { "nome": "Maria Ribeiro", "funcao": "Professora mediadora" },
      { "nome": "João Lima", "funcao": "Aluno" }
    ],
    "anexos": [
      { "id": 10, "nome": "relatorio.pdf", "tipo": "application/pdf", "tamanho": 52344, "url": "/rails/active_storage/blobs/redirect/.../relatorio.pdf" }
    ]
  }
}
```

### `GET /publico/pj_temas`: filtro do site
**200** no envelope: `[{ "nome": "Agroecologia & NBAZ", "slug": "agroecologia-nbaz" }, ...]` (só os ativos, em ordem alfabética).

---

## 31. Banners da página inicial

Carrossel do topo da home. Cada banner é **só a imagem** (o texto vem desenhado na arte), por **upload ou link**. Editar serve para **trocar a imagem**. A ordem do carrossel é a **ordem do cadastro** (o mais antigo primeiro).

### CMS (com login): `/b_banners`

**Objeto banner**
```json
{
  "id": 1,
  "imagem": "http://172.16.107.63:3001/rails/active_storage/blobs/redirect/.../banner.png",
  "imagem_url": null,
  "created_by": "1",
  "updated_by": null,
  "created_at": "...",
  "updated_at": "..."
}
```

`imagem` é a **URL completa** do arquivo enviado (já com o endereço do servidor, pronta para o `<img>`); `imagem_url` é o link externo. Um dos dois vem preenchido.

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /b_banners` | Listar (ordem do cadastro). Para trazer todos: `page=all` | 200 envelope paginado |
| `GET /b_banners/:id` | Ver um | 200 objeto |
| `POST /b_banners` | Cadastrar | 201 objeto |
| `PATCH /b_banners/:id` | Trocar a imagem (mesmo corpo do cadastrar). O que vier passa a valer: mandando arquivo, o link é limpo; mandando link, o arquivo antigo é apagado | 200 objeto |
| `DELETE /b_banners/:id` | Apagar (lógica): some do site | 204 |

**Com link (JSON):** `{ "b_banner": { "imagem_url": "https://exemplo.com/banner.jpg" } }`

**Com upload:** `multipart/form-data` (sem o header `Content-Type: application/json`), campo `b_banner[imagem]` com o arquivo.

| Campo | Obrigatório | Regras |
|---|---|---|
| `imagem` | um dos dois | PNG, JPG ou WEBP, até 5 MB. Use artes largas |
| `imagem_url` | um dos dois | link externo da imagem |

Sem nenhum dos dois: **422** `"Envie uma imagem ou informe a URL"`. Arquivo de outro tipo: **422** `"Imagem deve ser PNG, JPG ou WEBP"`.

### Site (sem login): `GET /publico/b_banners`

**Não envie token.** **200** no envelope, com todos os banners na ordem do carrossel (sem paginação). `imagem` já vem **sempre como URL completa**, pronta para o `<img src>`: a do arquivo enviado (com o endereço do servidor que você chamou) ou, se o banner foi cadastrado por link, o próprio link.

```json
{
  "success": true,
  "message": "Banners encontrados",
  "data": [
    { "id": 1, "imagem": "http://172.16.107.63:3001/rails/active_storage/blobs/redirect/.../banner.png" },
    { "id": 2, "imagem": "https://exemplo.com/banner.jpg" }
  ]
}
```

Basta um slide por item, na ordem da lista: `<img src={banner.imagem}>`. Não precisa juntar com o endereço da API.
