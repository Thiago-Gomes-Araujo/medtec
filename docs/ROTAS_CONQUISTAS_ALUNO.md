# Conquistas dos alunos: rotas novas

Rotas da página "Alunos que Inspiram": a equipe cadastra a conquista do aluno no CMS, o Gestor aprova e o site mostra só as publicadas.

- **URL base:** `http://localhost:3000/api/v1` em desenvolvimento. Nos outros ambientes, use a URL do servidor + `/api/v1`.
- **Formato:** JSON (`Content-Type: application/json`), exceto o cadastro com upload de imagem, que vai em `multipart/form-data`.
- **Coleção do Postman:** `docs/postman/medtec-api.postman_collection.json`, nas pastas "Categorias da conquista", "Conquistas dos alunos" e "Site público - conquistas".
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

1. A equipe cadastra a conquista no painel: nome do aluno, título, relato, categoria, escola e imagem (opcional; upload **ou** link).
2. Quem tem a permissão **Publicar** (Gestor e Administrador) já cria a conquista **publicada**. Os outros perfis criam como **aguardando**, e o Gestor publica ou reprova.
3. Uma conquista **reprovada** que é editada volta para **aguardando**.
4. O site só mostra as conquistas **publicadas**.
5. A **cidade vem da escola**: não existe campo de cidade na conquista. No formulário, o select de município só filtra o select de escolas.

---

## 2. Resumo das rotas

| Método | Rota | Token | Permissão | Sucesso |
|---|---|---|---|---|
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

**Ver um, criar, editar, publicar, reprovar e despublicar no CMS** devolvem o **objeto direto**, sem `success`/`data`. **Excluir** devolve **204 sem corpo**.

**Rotas do site** (`/publico/...`, exceto a listagem paginada) usam o envelope:
```json
{ "success": true, "message": "Conquista encontrada", "data": { } }
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
| 404 | Registro não existe; no site, também conquista não publicada |
| 422 | Dados inválidos, ou categoria em uso que não pode ser excluída |

---

## 4. CMS (com login)

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

## 5. Site público (sem login)

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
