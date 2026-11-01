# Rotas novas: avisos no site público e dúvidas

Rotas adicionadas na branch `feature/avisos`. O guia completo, com autenticação, erros e o restante das rotas, está em [ROTAS_FRONT.md](ROTAS_FRONT.md).

- **URL base:** `http://localhost:3000/api/v1` (todas as rotas abaixo partem dela).
- **Rotas do CMS:** precisam do header `Authorization: Bearer <token>` e da permissão no perfil do usuário.
- **Rotas `/publico/...`:** são do site e **não levam token**.

---

## Resumo

| Método | Rota | Login | O que faz |
|---|---|---|---|
| GET | `/publico/a_avisos` | não | Avisos que aparecem no site |
| GET | `/d_categorias_duvida` | sim | Listar categorias de dúvida |
| GET | `/d_categorias_duvida/:id` | sim | Ver uma categoria |
| POST | `/d_categorias_duvida` | sim | Criar categoria |
| PATCH | `/d_categorias_duvida/:id` | sim | Editar categoria |
| DELETE | `/d_categorias_duvida/:id` | sim | Excluir categoria |
| GET | `/d_duvidas` | sim | Listar dúvidas |
| GET | `/d_duvidas/:id` | sim | Ver uma dúvida |
| POST | `/d_duvidas` | sim | Criar dúvida |
| PATCH | `/d_duvidas/:id` | sim | Editar dúvida |
| DELETE | `/d_duvidas/:id` | sim | Excluir dúvida |
| PATCH | `/d_duvidas/:id/publicar` | sim | Publicar |
| PATCH | `/d_duvidas/:id/reprovar` | sim | Reprovar |
| PATCH | `/d_duvidas/:id/despublicar` | sim | Tirar do site |
| GET | `/d_duvidas_visitante` | sim | Listar dúvidas enviadas pelo site |
| GET | `/d_duvidas_visitante/:id` | sim | Ver uma dúvida enviada |
| PATCH | `/d_duvidas_visitante/:id/responder` | sim | Marcar como respondida |
| DELETE | `/d_duvidas_visitante/:id` | sim | Excluir dúvida enviada |
| GET | `/publico/d_duvidas` | não | Dúvidas publicadas (FAQ do site) |
| GET | `/publico/d_categorias_duvida` | não | Categorias para o filtro do site |
| POST | `/publico/d_duvidas_visitante` | não | Formulário "Não encontrou sua dúvida?" |

---

## Formato das respostas

**Listagens** vêm no envelope paginado:

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

- Paginação: `page` (padrão `1`; `page=all` traz tudo) e `per_page` (padrão `10`, máximo `100`).
- Filtros do CMS: `q[campo_predicado]=valor` (ex.: `q[pergunta_cont]=matrícula`).

**Ver, criar, editar, publicar, reprovar, despublicar e responder** devolvem o **objeto direto**, sem envelope. **Excluir** devolve **204** sem corpo.

**Erros** vêm sempre no formato padrão:

```json
{
  "success": false,
  "message": "Erro de validação",
  "errors": ["Pergunta não pode ficar em branco"],
  "timestamp": "..."
}
```

| Status | Quando |
|---|---|
| 401 | Rota do CMS sem token ou com token vencido |
| 403 | O perfil não tem a permissão (`errors: ["sem_permissao"]`) |
| 404 | Registro não existe |
| 422 | Dados inválidos (as mensagens vêm em `errors`) |
| 429 | Muitos envios em pouco tempo (`errors: ["muitas_tentativas"]`) |

---

## 1. Avisos: site público

### `GET /publico/a_avisos`

Avisos que aparecem no topo do site. Só vêm os avisos **ativos** cujo tipo também está **ativo**. Vêm do mais novo para o mais antigo, com paginação.

Filtro: `tipo=urgente` (slug do tipo de aviso).

```
GET /publico/a_avisos?page=1&per_page=10
GET /publico/a_avisos?tipo=urgente
```

**Item da lista**

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

- `tipo_cor` é a cor base em hexadecimal. O front deriva os tons de fundo, borda e texto.
- `link_texto` e `link_url` podem vir `null` quando o aviso não tem botão.
- O cadastro de avisos continua no CMS, pelas rotas `/a_avisos` e `/a_tipos_aviso`, sem mudança.

---

## 2. Dúvidas: CMS (com login)

Tela de dúvidas recorrentes (FAQ) do painel. Segue o mesmo fluxo de aprovação das notícias, com as situações **aguardando**, **reprovada** e **publicada**.

- Quem tem a permissão **Publicar** de dúvidas (hoje Gestor e Administrador) cria a dúvida **já publicada**.
- Os outros perfis com permissão de criar cadastram como **aguardando**. O Gestor ou o Administrador publica ou reprova depois.
- Reprovar só muda a situação e grava quem reprovou (não existe motivo de reprovação).
- Quando o autor edita uma dúvida reprovada, ela volta para **aguardando**.

### Categorias de dúvida: `/d_categorias_duvida`

Opções do select "Categoria" da dúvida. A listagem vem em ordem alfabética.

**Corpo de criar/editar**

```json
{
  "d_categoria_duvida": {
    "nome": "Matrícula",
    "slug": "matricula",
    "ativo": true
  }
}
```

| Campo | Obrigatório | Regras |
|---|---|---|
| `nome` | sim | |
| `slug` | não | gerado a partir do nome se não for enviado; não pode repetir |
| `ativo` | não | padrão `true`; categoria inativa some do filtro do site |

**Objeto categoria**

```json
{
  "id": 1,
  "nome": "Matrícula",
  "slug": "matricula",
  "ativo": true,
  "created_by": "1",
  "updated_by": "1",
  "created_at": "...",
  "updated_at": "..."
}
```

- Criar devolve **201**; editar devolve **200**.
- Não dá para excluir uma categoria que tem dúvidas: volta **422** com `"message": "Não foi possível excluir"`.

### Dúvidas: `/d_duvidas`

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /d_duvidas` | Listar (mais recentes primeiro) | 200 envelope paginado |
| `GET /d_duvidas/:id` | Ver uma | 200 objeto |
| `POST /d_duvidas` | Criar (o autor é o usuário logado) | 201 objeto |
| `PATCH /d_duvidas/:id` | Editar | 200 objeto |
| `DELETE /d_duvidas/:id` | Excluir | 204 |
| `PATCH /d_duvidas/:id/publicar` | Publicar (grava quem avaliou) | 200 objeto |
| `PATCH /d_duvidas/:id/reprovar` | Reprovar (grava quem avaliou) | 200 objeto |
| `PATCH /d_duvidas/:id/despublicar` | Tirar do site (volta para aguardando) | 200 objeto |

Filtros da listagem:

- `q[pergunta_cont]=matrícula`
- `q[d_categoria_duvida_id_eq]=1`
- `q[n_status_noticia_slug_eq]=aguardando` (fila de aprovação)

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

O autor e a situação **não são enviados**. O autor é o usuário logado, e a situação só muda pelas rotas publicar, reprovar e despublicar.

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

- `status` vale `aguardando`, `reprovada` ou `publicada`. Use esse campo para decidir quais botões mostrar.
- `avaliado_por_id` e `avaliado_por_nome` vêm `null` enquanto a dúvida está aguardando.

### Dúvidas enviadas pelo site: `/d_duvidas_visitante`

Lista do que os visitantes mandaram pelo formulário do site. A equipe responde **por e-mail ou telefone, fora do sistema**, e depois marca a dúvida como respondida. Essas dúvidas não são criadas pelo CMS.

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /d_duvidas_visitante` | Listar (mais recentes primeiro) | 200 envelope paginado |
| `GET /d_duvidas_visitante/:id` | Ver uma | 200 objeto |
| `PATCH /d_duvidas_visitante/:id/responder` | Marcar como respondida (grava quem respondeu e quando) | 200 objeto |
| `DELETE /d_duvidas_visitante/:id` | Excluir | 204 |

Filtros da listagem:

- `q[respondida_false]=1` (pendentes)
- `q[respondida_true]=1` (já respondidas)

**Objeto dúvida enviada**

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

A rota `responder` não leva corpo.

---

## 3. Dúvidas: site público (sem login)

### `GET /publico/d_duvidas`

Lista de dúvidas recorrentes do site. Só vêm as **publicadas**, em ordem alfabética da pergunta, com paginação.

Filtros:

- `categoria=matricula` (slug da categoria)
- `busca=matrícula` (procura na pergunta)

```
GET /publico/d_duvidas?page=1&per_page=10
GET /publico/d_duvidas?categoria=matricula&busca=trancar
```

**Item da lista**

```json
{
  "id": 1,
  "pergunta": "Como faço minha matrícula?",
  "resposta": "Procure a secretaria do polo com seus documentos.",
  "categoria_nome": "Matrícula",
  "categoria_slug": "matricula"
}
```

### `GET /publico/d_categorias_duvida`

Opções do filtro de categoria do site. Só vêm as **ativas**, em ordem alfabética. Não é paginada.

```json
{
  "success": true,
  "message": "Categorias encontradas",
  "data": [
    { "nome": "Certificados", "slug": "certificados" },
    { "nome": "Matrícula", "slug": "matricula" }
  ]
}
```

### `POST /publico/d_duvidas_visitante`

Formulário "Não encontrou sua dúvida?". O visitante não tem cadastro no site.

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
| `email` | sim | formato de e-mail válido |
| `telefone` | não | |
| `descricao` | sim | a dúvida do visitante |

**Respostas**

- **201**, para mostrar ao visitante:

  ```json
  {
    "success": true,
    "message": "Dúvida enviada. Em breve entraremos em contato.",
    "data": null,
    "timestamp": "..."
  }
  ```

- **422** com as mensagens de validação em `errors` (ex.: e-mail inválido).
- **429** com `errors: ["muitas_tentativas"]` depois de 5 envios no mesmo minuto. Mostre "Muitos envios. Aguarde um minuto."
