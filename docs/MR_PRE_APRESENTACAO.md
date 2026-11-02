# MR: ajustes para a apresentação de 05/11

**Branch de origem:** `ajustes/pre-apresentacao`
**Branch de destino:** `dev`

## Título

```text
Ajustes pré-apresentação: URL única da API, degradação do site, dúvidas de visitantes e performance
```

## Descrição

Reúne em um só MR quatro frentes já prontas, na ordem abaixo, com merge sem squash para manter os commits. Os merges não tiveram conflito.

**Antes de implantar:** configure as variáveis da seção [Variáveis de ambiente](#variáveis-de-ambiente). Sem elas, o build da imagem falha e as rotas administrativas do servidor deixam de funcionar.

### O que muda

#### 1. URL única da API e credenciais (`fix/origem-unica-api`)

- O servidor e o navegador passam a usar a mesma URL da API (`getApiBaseUrl`). Antes, o login podia emitir o token em uma API e o painel usá-lo em outra, o que gerava 401 ao criar notícia.
- Erros têm mensagens distintas: não autenticado, sem permissão e API inacessível (rede, CORS ou URL incorreta).
- Remove as credenciais padrão de `rails-backend.ts` e do `docker-compose.yml`. Se faltarem variáveis, a falha traz uma mensagem clara.
- O `Dockerfile` recebe `NEXT_PUBLIC_API_URL` no build, e o build falha se ela não for informada.
- Adiciona `docs/TESTE_LOCAL.md`.

#### 2. Degradação do site (`feature/degradacao-comunidade-publica`)

- A home, `/professores`, `/alunos` e `/professores/[id]` mostram "em breve" quando a API falha, em vez de erro técnico.
- `/professores/[id]` com erro de API não é indexada. Um id inválido continua dando 404.

#### 3. Dúvidas de visitantes (`fix/duvidas-visitante`)

- A lista de visitantes em `/admin/faq` atualiza pelo botão "Atualizar lista" e ao voltar para a aba do navegador.
- O FAQ passa a ser liberado para `Gestor` e `Administrador`, os perfis do seed Rails. `Operador de Conteúdo` perde o acesso.
- O total de dúvidas sem resposta aparece no menu e no Início.
- A Fila de Aprovação ganha o bloco "Dúvidas de visitantes", com a ação Responder.
- Uma dúvida respondida pode virar FAQ pelo botão "Transformar em FAQ". O formulário traz a pergunta e pede a categoria e a resposta.
- Copia o contrato para `docs/ROTAS_NOVAS_AVISOS_DUVIDAS.md`.

#### 4. Performance (`perf/navegacao`)

- Reduz o JS inicial, otimiza imagens e deixa de enviar `Content-Type` em requisições sem corpo, o que evita preflight de CORS.
- Adiciona `tsx` às dependências de desenvolvimento, para os testes rodarem com `npm test`.
- Resultados medidos antes da integração, com valores aproximados:

| Medida | Antes | Depois |
|---|---|---|
| LCP de `/` em 4G | 3088 ms | 1600 ms |
| Carregamento de `/noticias` em 4G | 2192 ms | 1835 ms |
| Bytes de `/` | 727 KB | 592 KB |
| JS de `/noticias` | 254 KB | 209 KB |

### Variáveis de ambiente

Exigidas no servidor. Os valores não fazem parte deste MR.

| Variável | Quando é lida | Obrigatória | Sem ela |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | No build (`build.args`) e na execução | Sim | O build da imagem falha. Trocar a URL exige novo build. |
| `ADMIN_SESSION_SECRET` | Na execução | Sim, com pelo menos 32 caracteres em produção | O `docker compose` não sobe, e o `docker-entrypoint.sh` impede o início do container. |
| `ADMIN_USER`, `ADMIN_PASSWORD` | Na execução | Sim | O `docker compose` não sobe, e o `docker-entrypoint.sh` impede o início do container. |
| `BACKEND_ADMIN_CPF`, `BACKEND_ADMIN_PASSWORD` | Na execução | Sim, para gerenciar usuários | `/api/data` devolve a lista de usuários vazia e registra o erro no log; `/api/admin/users` responde com erro. |
| `BACKEND_API_URL` | Na execução, só no servidor | Não | É usada apenas se `NEXT_PUBLIC_API_URL` não existir. |

No deploy pelo compose, todas vêm do `.env` do servidor, que o `docker-compose.yml` carrega com `env_file`. O `.env` não entra na imagem, por isso `NEXT_PUBLIC_API_URL` também é passada em `build.args`.

Defina `NEXT_PUBLIC_API_URL` uma única vez: com a chave duplicada no `.env`, vale a última.

### Como testar

Requisitos: acesso à rede da API (VPN, se for o caso) e `.env` configurado conforme `docs/TESTE_LOCAL.md`.

```bash
npm ci
npm test
npx tsc --noEmit
npx eslint .
npm run build
```

Depois, no navegador:

1. **Login e notícia:** entre com CPF cadastrado na API e crie uma notícia. Não deve aparecer "você precisa estar autenticado".
2. **Dúvida de visitante:** envie uma dúvida em `/faq`, com o painel aberto em outra aba em `/admin/faq`, na aba Visitantes. Ao voltar para a aba, o envio aparece e o contador do menu sobe.
3. **Responder:** como `Administrador`, abra `/admin/kanban` e clique em Responder no bloco "Dúvidas de visitantes". O item sai da lista e o contador desce.
4. **Transformar em FAQ:** clique em "Transformar em FAQ". O formulário abre com a pergunta, e a categoria e a resposta são obrigatórias. Ao salvar, confira a situação informada. Esse teste publica o FAQ no site: use um texto de teste e exclua o registro depois.
5. **Perfil `Gestor`:** acessa `/admin/faq`, mas recebe "Acesso Restrito" em `/admin/kanban`.
6. **Degradação:** com a API inacessível, a home, `/professores`, `/alunos` e `/professores/1` mostram "em breve".
7. **Docker:** rode `docker compose build` sem `NEXT_PUBLIC_API_URL` e confirme que falha. Depois, rode com a variável definida e confirme que a imagem sobe.

### Validação já feita

| Verificação | Resultado |
|---|---|
| Testes | 1021/1021 |
| `tsc` | sem erros |
| ESLint | 0 erros, 32 avisos |
| Build | OK, 54 páginas |
| Navegador, contra mock do contrato | dúvidas com `Administrador`, `Gestor` e `Jornalista` OK |

**Não testado:**

- A imagem Docker não foi construída.
- Os fluxos de dúvidas e de escrita não rodaram contra a API real com login por CPF. O login por CPF foi coberto só por teste automatizado.

### Riscos

- **Deploy pode falhar sem as variáveis:** é o efeito esperado da remoção dos valores padrão. Configure o servidor antes do merge.
- **Credenciais antigas continuam expostas:** os valores padrão saíram do código, mas seguem no histórico do git e ainda aparecem em `ROTAS_FRONT.md`, `docs/ROTAS_FRONT_FULL.md`, `docs/rotas_front.md` e `tests/api-client.test.ts`. Se foram usados em algum ambiente, precisam ser trocados.
- **FAQ publicado sem aprovação:** pelo contrato da API, `Gestor` e `Administrador` criam a dúvida já publicada. O formulário avisa antes de salvar, e o `Despublicar` continua disponível. Para passar pela aprovação, o backend precisa mudar.
- **`Operador de Conteúdo` perde o FAQ:** o perfil não existe no seed Rails, mas pode existir em contas locais antigas.
- **`Gestor` não exclui dúvida de visitante:** o seed não dá essa permissão. O botão continua visível e a API recusa, com mensagem de erro.
- **FAQ duplicado:** nada liga a dúvida do visitante ao FAQ criado, então a mesma dúvida pode ser transformada mais de uma vez.
- **Login por `ADMIN_USER`:** continua abrindo o painel sem token da API, e as operações nessa sessão recebem 401. Use login por CPF.
- **Pequenas regressões de performance:** em desktop, a medição mostrou o fim das chamadas à API de `/noticias` de 248 para 367 ms e de `/faq` de 239 para 359 ms. A navegação `/faq → /` foi de 104 para 147 ms. A causa não foi identificada.
- **Outras variáveis de build:** `NEXT_PUBLIC_SITE_URL` e `NEXT_PUBLIC_MAP_TILE_URL` também são fixadas no build e não passam por `build.args`. Na imagem, ficam sem o valor configurado.
- **`perf/navegacao` no remoto está desatualizada:** este MR usa a versão local, sem os skeletons de carregamento, que pioravam a navegação. Não faça merge de `origin/perf/navegacao`.

### Fora deste MR

- Integração de Projetos Pedagógicos (`feature/cms-projetos`), que será criada a partir da `dev` depois deste merge.
