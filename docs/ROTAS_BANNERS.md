# Banners da página inicial: rotas novas

Rotas do carrossel do topo da home. Cada banner é **só a imagem** (o texto vem desenhado na arte), enviada por **upload ou link**. A equipe cadastra, troca e apaga no CMS; o site mostra todos, na ordem do cadastro.

- **URL base:** `http://localhost:3000/api/v1` em desenvolvimento. Nos outros ambientes, use a URL do servidor + `/api/v1`.
- **Formato:** JSON (`Content-Type: application/json`), exceto o envio de arquivo, que vai em `multipart/form-data`.
- **Coleção do Postman:** `docs/postman/medtec-api.postman_collection.json`, nas pastas "Banners" e "Site público - banners".
- O guia completo da API (login, refresh do token, paginação) está no `docs/ROTAS_FRONT.md`.

---

## Sumário

1. [Como funciona](#1-como-funciona)
2. [Resumo das rotas](#2-resumo-das-rotas)
3. [Formato das respostas e erros](#3-formato-das-respostas-e-erros)
4. [CMS (com login)](#4-cms-com-login-b_banners)
5. [Site público (sem login)](#5-site-público-sem-login-get-publicob_banners)

---

## 1. Como funciona

1. A equipe cadastra o banner mandando a arte (upload) **ou** o link de uma imagem.
2. **Editar** serve para trocar a imagem: o que vier passa a valer. Mandando arquivo, o link é limpo; mandando link, o arquivo antigo é apagado.
3. **Apagar** tira o banner do site.
4. O carrossel mostra **todos** os banners, na **ordem do cadastro** (o mais antigo primeiro). Não há link de clique, ordem manual nem opção de esconder.
5. A `imagem` sempre volta como **URL completa**, pronta para o `<img>`, montada com o endereço do servidor que o front chamou. Não precisa juntar com o endereço da API.

---

## 2. Resumo das rotas

| Método | Rota | Token | Permissão | Sucesso |
|---|---|---|---|---|
| GET | `/b_banners` | sim | sim | 200 paginado |
| GET | `/b_banners/:id` | sim | sim | 200 objeto |
| POST | `/b_banners` | sim | sim | 201 objeto |
| PATCH | `/b_banners/:id` | sim | sim | 200 objeto |
| DELETE | `/b_banners/:id` | sim | sim | 204 |
| GET | `/publico/b_banners` | não | não | 200 envelope |

> `PATCH` e `PUT` funcionam igual na edição.

---

## 3. Formato das respostas e erros

- **Listar no CMS:** envelope paginado (`data.items` + `data.pagination`). Use `page=all` para trazer todos.
- **Ver, cadastrar e editar no CMS:** devolvem o **objeto direto**, sem `success`/`data`.
- **Apagar:** **204** sem corpo.
- **Site:** envelope (`success`, `message`, `data`).

**Erro:**
```json
{
  "success": false,
  "message": "Erro de validação",
  "errors": ["Envie uma imagem ou informe a URL"],
  "timestamp": "2026-11-02T12:00:00-03:00"
}
```

| Status | Quando acontece |
|---|---|
| 401 | Sem token, token expirado ou revogado (só no CMS) |
| 403 | O perfil não tem a permissão da ação (`"Sem permissão"`) |
| 404 | Banner não existe |
| 422 | Sem imagem, ou arquivo que não é PNG, JPG ou WEBP, ou maior que 5 MB |

---

## 4. CMS (com login): `/b_banners`

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

---

## 5. Site público (sem login): `GET /publico/b_banners`

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
