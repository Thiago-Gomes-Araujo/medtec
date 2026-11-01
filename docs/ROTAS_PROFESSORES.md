# Rotas novas: professores e relatos de alunos

Rotas adicionadas na branch `feature/professores`. O guia completo, com autenticação, erros e o restante das rotas, está em [ROTAS_FRONT.md](ROTAS_FRONT.md).

- **URL base:** `http://localhost:3000/api/v1` (todas as rotas abaixo partem dela).
- **Rotas do CMS:** precisam do header `Authorization: Bearer <token>` e da permissão no perfil (hoje **Gestor** e **Administrador**).
- **Rotas `/publico/...`:** são do site e **não levam token**.

**Como funciona:** o Gestor cadastra os professores no CMS. No site, o aluno lê o portfólio e pode deixar um relato sobre um professor, **sem cadastro**: o relato fica ligado ao professor da URL. O relato entra como **aguardando** e só aparece no site depois que o Gestor publica. O e-mail e o telefone do aluno só aparecem no CMS, nunca no site.

---

## Resumo

| Método | Rota | Login | O que faz |
|---|---|---|---|
| GET | `/escolas` | sim | Escolas para o select do formulário |
| GET | `/p_disciplinas` | sim | Listar disciplinas |
| GET | `/p_disciplinas/:id` | sim | Ver uma disciplina |
| POST | `/p_disciplinas` | sim | Criar disciplina |
| PATCH | `/p_disciplinas/:id` | sim | Editar disciplina |
| DELETE | `/p_disciplinas/:id` | sim | Excluir disciplina |
| GET | `/p_professores` | sim | Listar professores |
| GET | `/p_professores/:id` | sim | Ver um professor |
| POST | `/p_professores` | sim | Criar professor |
| PATCH | `/p_professores/:id` | sim | Editar professor |
| DELETE | `/p_professores/:id` | sim | Excluir professor |
| GET | `/p_relatos` | sim | Listar relatos dos alunos |
| GET | `/p_relatos/:id` | sim | Ver um relato |
| PATCH | `/p_relatos/:id/publicar` | sim | Publicar relato |
| PATCH | `/p_relatos/:id/reprovar` | sim | Reprovar relato |
| PATCH | `/p_relatos/:id/despublicar` | sim | Tirar relato do site |
| DELETE | `/p_relatos/:id` | sim | Excluir relato |
| GET | `/publico/p_professores` | não | Portfólio de professores |
| GET | `/publico/p_professores/:id` | não | Página do professor, com relatos publicados |
| GET | `/publico/p_disciplinas` | não | Disciplinas para o filtro do site |
| POST | `/publico/p_professores/:id/p_relatos` | não | Aluno envia relato |

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
- Filtros do CMS: `q[campo_predicado]=valor` (ex.: `q[nome_cont]=ana`).

**Ver, criar, editar, publicar, reprovar e despublicar** no CMS devolvem o **objeto direto**, sem envelope. **Excluir** devolve **204** sem corpo.

**Erros** vêm sempre no formato padrão:

```json
{
  "success": false,
  "message": "Erro de validação",
  "errors": ["P disciplinas precisa ter ao menos uma"],
  "timestamp": "..."
}
```

| Status | Quando |
|---|---|
| 401 | Rota do CMS sem token ou com token vencido |
| 403 | O perfil não tem a permissão (`errors: ["sem_permissao"]`) |
| 404 | Registro não existe (ou professor inativo, nas rotas do site) |
| 422 | Dados inválidos (as mensagens vêm em `errors`) |
| 429 | Muitos envios em pouco tempo (`errors: ["muitas_tentativas"]`) |

---

## 1. CMS (com login)

### `GET /escolas`: select de escola

Só listagem. As escolas vêm de outro sistema e não são cadastradas por esta API. Use `page=all` para o select e `q[nome_cont]=bolívar` para buscar.

```json
{ "id": 1, "nome": "EEEFM JOAO BATISTA", "inep": "11000101", "g_cidade_id": 4388, "cidade_nome": "Porto Velho" }
```

### Disciplinas: `/p_disciplinas`

Opções do select "Disciplinas" do professor. A listagem vem em ordem alfabética.

**Corpo de criar/editar**

```json
{
  "p_disciplina": {
    "nome": "Biologia",
    "slug": "biologia",
    "ativo": true
  }
}
```

| Campo | Obrigatório | Regras |
|---|---|---|
| `nome` | sim | |
| `slug` | não | gerado a partir do nome se não for enviado; não pode repetir |
| `ativo` | não | padrão `true`; disciplina inativa some do filtro e dos cards do site |

**Objeto disciplina**

```json
{
  "id": 1,
  "nome": "Biologia",
  "slug": "biologia",
  "ativo": true,
  "created_by": "1",
  "updated_by": "1",
  "created_at": "...",
  "updated_at": "..."
}
```

**Excluir:** não dá para excluir disciplina ligada a um professor, mesmo que ele esteja inativo. Volta **422** com `"message": "Não foi possível excluir"` e `errors: ["Disciplina vinculada a professor não pode ser excluída"]`. Para tirar do site, desative com `"ativo": false`. Professores já excluídos não bloqueiam a exclusão.

### Professores: `/p_professores`

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /p_professores` | Listar (ordem alfabética) | 200 envelope paginado |
| `GET /p_professores/:id` | Ver um | 200 objeto |
| `POST /p_professores` | Criar | 201 objeto |
| `PATCH /p_professores/:id` | Editar | 200 objeto |
| `DELETE /p_professores/:id` | Excluir (os relatos do professor saem junto) | 204 |

Filtros da listagem:

- `q[nome_cont]=ana`
- `q[escola_id_eq]=1`
- `q[escola_g_cidade_id_eq]=4388` (cidade da escola)
- `q[p_disciplinas_id_eq]=1`
- `q[ativo_true]=1`

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
| `escola_id` | sim | escola existente; a cidade do professor vem dela |
| `pratica_pedagogica` | sim | prévia sobre o professor, mostrada no card do site ("Prática pedagógica") |
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
  "escola_nome": "EEEFM JOAO BATISTA",
  "cidade_nome": "Porto Velho",
  "p_disciplina_ids": [1],
  "disciplinas": [{ "id": 1, "nome": "Biologia" }],
  "created_by": "1",
  "updated_by": "1",
  "created_at": "...",
  "updated_at": "..."
}
```

Use `p_disciplina_ids` para marcar as opções no select ao abrir a edição.

### Relatos dos alunos: `/p_relatos`

Os relatos chegam pelo site como **aguardando**. Não existe criar pelo CMS.

| Rota | Descrição | Sucesso |
|---|---|---|
| `GET /p_relatos` | Listar (mais recentes primeiro) | 200 envelope paginado |
| `GET /p_relatos/:id` | Ver um | 200 objeto |
| `PATCH /p_relatos/:id/publicar` | Publicar: aparece no site (grava quem avaliou) | 200 objeto |
| `PATCH /p_relatos/:id/reprovar` | Reprovar: não aparece no site (grava quem avaliou) | 200 objeto |
| `PATCH /p_relatos/:id/despublicar` | Tirar do site (volta para aguardando) | 200 objeto |
| `DELETE /p_relatos/:id` | Excluir | 204 |

Filtros da listagem:

- `q[n_status_noticia_slug_eq]=aguardando` (fila de aprovação)
- `q[p_professor_id_eq]=1` (relatos de um professor)

As rotas publicar, reprovar e despublicar não levam corpo.

**Objeto relato** (aqui a equipe vê o contato do aluno)

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

- `status` vale `aguardando`, `reprovada` ou `publicada`. Use esse campo para decidir quais botões mostrar.
- `telefone` vem só com números (DDD + número).

---

## 2. Site público (sem login)

Só aparecem professores **ativos** e relatos **publicados**.

**Objeto professor público** (card do portfólio)

```json
{
  "id": 1,
  "nome": "Ana Beatriz Moura",
  "pratica_pedagogica": "Transforma o bioma amazônico em laboratório vivo.",
  "escola_nome": "EEEFM JOAO BATISTA",
  "cidade_nome": "Porto Velho",
  "disciplinas": [{ "nome": "Biologia", "slug": "biologia" }]
}
```

- As iniciais do card (ex.: "AM") o front monta a partir do `nome`.
- `disciplinas` traz só as ativas.

### `GET /publico/p_professores`: portfólio

Paginado (`page`, `per_page`; `page=all` traz todos), em ordem alfabética.

| Parâmetro | Descrição |
|---|---|
| `disciplina` | slug da disciplina (ex.: `biologia`) |
| `cidade` | id da cidade da escola |
| `busca` | procura no nome, na disciplina, na escola e no município (a caixa "Buscar por nome, disciplina, escola ou município...") |

```
GET /publico/p_professores?page=1&per_page=12
GET /publico/p_professores?disciplina=biologia
GET /publico/p_professores?busca=porto velho
```

### `GET /publico/p_professores/:id`: página do professor

**200** no envelope, com o card do professor mais os relatos publicados (mais recentes primeiro). Professor inativo ou excluído dá **404**.

```json
{
  "success": true,
  "message": "Professor encontrado",
  "data": {
    "id": 1,
    "nome": "Ana Beatriz Moura",
    "pratica_pedagogica": "Transforma o bioma amazônico em laboratório vivo.",
    "escola_nome": "EEEFM JOAO BATISTA",
    "cidade_nome": "Porto Velho",
    "disciplinas": [{ "nome": "Biologia", "slug": "biologia" }],
    "relatos": [
      { "nome": "João", "texto": "A professora Ana mudou meu jeito de estudar.", "created_at": "..." }
    ]
  },
  "timestamp": "..."
}
```

Sem relatos publicados, `relatos` vem `[]`.

### `GET /publico/p_disciplinas`: filtro do site

Só as disciplinas **ativas**, em ordem alfabética. Não é paginada.

```json
{
  "success": true,
  "message": "Disciplinas encontradas",
  "data": [
    { "nome": "Biologia", "slug": "biologia" },
    { "nome": "Matemática", "slug": "matematica" }
  ]
}
```

### `POST /publico/p_professores/:id/p_relatos`: relato do aluno

O aluno não tem cadastro: o relato fica ligado ao professor do `:id` da URL.

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
| `email` | sim | formato de e-mail; **um relato por e-mail para cada professor**; não aparece no site |
| `telefone` | sim | com DDD, 10 ou 11 dígitos; pode ir com ou sem máscara; não aparece no site |
| `texto` | sim | o relato |

**Respostas**

- **201**, para mostrar ao aluno:

  ```json
  {
    "success": true,
    "message": "Relato enviado. Ele aparece no site depois de aprovado.",
    "data": null,
    "timestamp": "..."
  }
  ```

- **404** se o professor não existe ou está inativo.
- **422** com as mensagens de validação em `errors`. Exemplos: `"Email já enviou um relato para este professor"` e `"Telefone deve ter DDD e 10 ou 11 dígitos"`.
- **429** com `errors: ["muitas_tentativas"]` depois de 5 envios no mesmo minuto. Mostre "Muitos envios. Aguarde um minuto."
