# Projetos pedagógicos: rotas novas

Rotas da tela "Projetos Pedagógicos": a equipe cadastra o projeto no CMS (com tema, escola, capa, anexos e membros), o Gestor aprova e o site mostra só os publicados.

- **URL base:** `http://localhost:3000/api/v1` em desenvolvimento. Nos outros ambientes, use a URL do servidor + `/api/v1`.
- **Formato:** JSON (`Content-Type: application/json`), exceto quando houver arquivo (capa ou anexos), que vai em `multipart/form-data`.
- **Coleção do Postman:** `docs/postman/medtec-api.postman_collection.json`, nas pastas "Temas de projeto", "Membros de projeto", "Projetos" e "Site público - projetos".
- O guia completo da API (login, refresh do token, paginação) está no `docs/ROTAS_FRONT.md`.

---

## Sumário

1. [Como funciona](#1-como-funciona)
2. [Resumo das rotas](#2-resumo-das-rotas)
3. [Formato das respostas e erros](#3-formato-das-respostas-e-erros)
4. [CMS (com login)](#4-cms-com-login)
5. [Site público (sem login)](#5-site-público-sem-login)

---

## 1. Como funciona

1. A equipe cadastra os **membros** (nome e CPF) uma vez só; o mesmo membro entra em vários projetos.
2. No projeto, cada membro recebe a **função naquele projeto** (ex.: "Professora mediadora" num, "Coordenadora" em outro).
3. O projeto tem tema, escola, relato, capa (upload **ou** link) e **anexos** (PDF, Office e imagens, vários de uma vez).
4. Quem tem a permissão **Publicar** (Gestor e Administrador) já cria o projeto **publicado**; os outros criam **aguardando** e o Gestor publica ou reprova. Projeto **reprovado** que é editado volta para **aguardando**.
5. O site só mostra os **publicados**, com membros (nome e função; **o CPF nunca aparece**) e anexos para download.
6. A **cidade vem da escola**: não existe campo de cidade no projeto. No formulário, o select de município só filtra o select de escolas.

---

## 2. Resumo das rotas

| Método | Rota | Token | Permissão | Sucesso |
|---|---|---|---|---|
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

Para o select de escolas do formulário, use a rota que já existe: `GET /escolas?page=all` (filtro por cidade: `q[g_cidade_id_eq]=1`).

> `PATCH` e `PUT` funcionam igual nas rotas de edição.

---

## 3. Formato das respostas e erros

**Listagens** (paginadas: `page`, `per_page`; `page=all` traz tudo):
```json
{
  "success": true,
  "message": "Registros encontrados com sucesso",
  "data": {
    "items": [ ],
    "pagination": { "current_page": 1, "total_pages": 3, "total_count": 25, "per_page": 10 }
  }
}
```

**Ver um, criar, editar, publicar, reprovar e despublicar no CMS** devolvem o **objeto direto**, sem `success`/`data`. **Excluir** e **remover anexo** devolvem **204 sem corpo**.

**Rotas do site** (`/publico/...`, exceto a listagem paginada) usam o envelope:
```json
{ "success": true, "message": "Projeto encontrado", "data": { } }
```

**Erro:**
```json
{
  "success": false,
  "message": "Erro de validação",
  "errors": ["Escola é obrigatório(a)"],
  "timestamp": "2026-11-01T12:00:00-03:00"
}
```

| Status | Quando acontece |
|---|---|
| 401 | Sem token, token expirado ou revogado (só no CMS) |
| 403 | O perfil não tem a permissão da ação (`"Sem permissão"`) |
| 404 | Registro não existe; no site, também projeto não publicado |
| 422 | Dados inválidos; tema ou membro em uso que não pode ser excluído |

---

## 4. CMS (com login)

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
{ "id": 1, "nome": "Maria Ribeiro", "cpf": "00000000000", "created_by": "1", "updated_by": null, "created_at": "...", "updated_at": "..." }
```

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /pj_membros` | Listar (ordem alfabética). Filtros: `q[nome_cont]`, `q[cpf_eq]` (só números) | 200 envelope paginado |
| `GET /pj_membros/:id` | Ver um | 200 objeto |
| `POST /pj_membros` | Criar | 201 objeto |
| `PATCH /pj_membros/:id` | Editar | 200 objeto |
| `DELETE /pj_membros/:id` | Excluir. Membro que está em algum projeto não sai (**422** `"Não foi possível excluir"`) | 204 |

Corpo: `{ "pj_membro": { "nome": "Maria Ribeiro", "cpf": "000.000.000-00" } }`.

| Campo | Obrigatório | Regras |
|---|---|---|
| `nome` | sim | |
| `cpf` | sim | CPF válido e **único**; com ou sem máscara (salvo só com números). Nunca aparece no site |

**Fluxo sugerido no formulário do projeto:** digitar o CPF → `GET /pj_membros?q[cpf_eq]=00000000000`. Se vier, usa o `id`; se não, cadastra com `POST /pj_membros` e usa o `id` novo.

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
    { "id": 5, "pj_membro_id": 1, "nome": "Maria Ribeiro", "cpf": "00000000000", "funcao": "Professora mediadora" }
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

## 5. Site público (sem login)

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
