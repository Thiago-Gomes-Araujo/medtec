---
name: medtec-architecture
description: Preserva a arquitetura, os padrões de implementação e a reutilização de código do projeto MEDTEC. Use antes de criar ou alterar páginas, componentes, APIs, dados, autenticação, estilos ou funcionalidades do projeto.
---

# Skill de Arquitetura e Manutenção do MEDTEC

## Objetivo

Implementar mudanças no MEDTEC sem quebrar sua estrutura, duplicar funcionalidades ou introduzir inconsistências. Antes de editar, entenda o fluxo existente e reaproveite os componentes, tipos, serviços e convenções já adotados.

Esta Skill registra o que foi identificado na análise do projeto. Ela não substitui a inspeção do código atual: arquivos, dependências e padrões podem mudar. Sempre confirme a situação real do repositório antes de agir.

## Contexto técnico identificado

- Next.js 16 com App Router.
- React 19.
- TypeScript 5.
- Tailwind CSS 4.
- Estrutura principal em `src/app`, `src/components`, `src/data`, `src/lib` e `src/types`.
- O projeto combina páginas institucionais, rotas de API e um CMS administrativo.
- A análise encontrou duas fontes de dados de notícias: o banco JSON/CMS (`src/data/db.json`, `src/lib/db.ts`, `src/types/index.ts`) e dados estáticos/mockados (`src/data/medtecData.ts`).
- A análise também identificou componentes possivelmente legados, uso amplo de `'use client'`, endpoints de mutação que precisam de proteção e problemas de lint. Verifique cada ponto no estado atual antes de tomar decisões.

## Regras obrigatórias antes de implementar

1. **Inspecione antes de editar.**
   - Leia a página, os componentes utilizados, os tipos e a camada de dados envolvidos.
   - Procure implementações semelhantes no projeto e reutilize-as quando apropriado.
   - Consulte `package.json`, `README.md` e configurações relevantes se a mudança afetar dependências, comandos ou arquitetura.
   - Verifique `git status` antes de alterar arquivos. Nunca descarte mudanças locais do usuário.

2. **Faça mudanças focadas.**
   - Implemente apenas o necessário para atender ao pedido.
   - Não reescreva páginas, não reorganize diretórios e não faça refatorações amplas sem necessidade ou autorização.
   - Preserve comportamento existente não relacionado à solicitação.
   - Não crie um novo componente, hook, utilitário ou tipo se já houver uma solução adequada reutilizável.

3. **Mantenha a organização do projeto.**
   - Rotas e páginas pertencem a `src/app`, respeitando o App Router.
   - Componentes compartilhados pertencem a `src/components`, salvo se o projeto já adotar um padrão mais específico para a funcionalidade.
   - Serviços de infraestrutura e acesso a dados ficam na camada apropriada, como `src/lib`.
   - Tipos e contratos compartilhados devem ser centralizados conforme os padrões existentes, incluindo `src/types`.
   - Dados estáticos e mocks devem permanecer claramente identificados e não devem ser tratados como fonte oficial de produção sem confirmação.

4. **Respeite os Server Components e Client Components.**
   - No App Router, prefira Server Components por padrão.
   - Use `'use client'` apenas nos componentes que realmente precisam de estado React, efeitos, handlers de eventos ou APIs do navegador.
   - Isole a interatividade em componentes menores em vez de tornar toda a página cliente sem necessidade.
   - Antes de mover leitura de dados para o servidor, confirme que a API, o ambiente de execução e a persistência permitem essa operação.
   - Não remova `'use client'` mecanicamente: verifique hooks, eventos, dependências e limites entre servidor e cliente.

5. **Não misture fontes de dados incompatíveis.**
   - Antes de criar ou alterar uma listagem, detalhe ou formulário, identifique a fonte oficial utilizada pelo fluxo correspondente.
   - Confirme os contratos e formatos existentes. Não misture silenciosamente propriedades como `titulo`, `img` e `data` com `title`, `coverImage` e `publishedAt`.
   - Para notícias, a análise encontrou uma divergência entre `medtecData.ts` e os dados gerenciados pelo CMS em `db.json`. Não amplie essa divergência: determine a fonte pretendida e alinhe listagem, detalhe e edição de forma consistente quando isso fizer parte do escopo.
   - Não migre, apague ou transforme dados sem avaliar compatibilidade e preservar os registros existentes.

6. **Segurança é requisito, não melhoria opcional.**
   - Toda rota de API que altere dados ou receba uploads deve validar autenticação e autorização no servidor.
   - Nunca confie apenas em esconder botões ou bloquear páginas no frontend.
   - Valide o formato e o conteúdo dos payloads no servidor; rejeite entradas inválidas.
   - Para uploads, valide tipo permitido, tamanho, nome/caminho e condições de armazenamento.
   - Não introduza tokens estáticos, segredos no cliente ou credenciais hardcoded.
   - Antes de alterar autenticação, cookies ou proteção de rotas, compreenda o fluxo existente e implemente validação real no servidor.
   - Não afirme que uma rota está segura sem verificar os handlers e o mecanismo de autenticação efetivamente utilizado.

7. **Persistência e integridade dos dados.**
   - Antes de modificar `src/lib/db.ts` ou `src/data/db.json`, entenda como leitura, gravação e concorrência funcionam.
   - Evite sobrescrever o banco inteiro a partir de dados parciais ou não validados.
   - Considere concorrência, falhas durante a escrita, backups e o ambiente de deploy.
   - Não presuma que arquivos locais são persistentes em ambientes serverless ou contêineres.
   - Se a tarefa envolver persistência, explique limitações e proponha uma solução compatível com o ambiente, sem migrar de banco por iniciativa própria.
   - Estado mantido apenas em `useState` não é persistência. Se a funcionalidade precisar sobreviver a recarregamentos, identifique e implemente uma fonte persistente adequada ao escopo.

8. **Reutilização de componentes e consistência visual.**
   - Pesquise componentes existentes antes de criar novos, especialmente cabeçalho, rodapé, títulos de página, cards, modais, formulários e elementos de navegação.
   - A análise identificou `SiteHeader.tsx` e `SiteFooter.tsx` como componentes usados, enquanto `Header.tsx`, `Footer.tsx`, `Hero.tsx`, `AboutSection.tsx` e `StudentTeacherPortals.tsx` pareciam não ter referências. Confirme as referências e usos indiretos antes de reutilizar, substituir ou excluir qualquer um deles.
   - Preserve a identidade visual, responsividade, espaçamentos e padrões de Tailwind já usados.
   - Não adicione bibliotecas para resolver algo que possa ser feito com as dependências existentes, salvo justificativa clara.

9. **TypeScript e qualidade.**
   - Preserve tipagem explícita e contratos consistentes.
   - Evite `any`; prefira tipos existentes, `unknown` com validação ou tipos específicos.
   - Trate estados de carregamento, erro, vazio e sucesso quando forem pertinentes.
   - Não silencie erros de lint com comentários, desativações ou casts sem justificativa.
   - Siga as versões e convenções já presentes no projeto; não atualize dependências como efeito colateral de uma alteração funcional.

## Fluxo de trabalho para cada solicitação

1. **Entender:** resuma o resultado esperado e identifique as rotas, componentes, APIs, tipos e dados envolvidos.
2. **Inspecionar:** leia os arquivos relevantes e procure padrões semelhantes e possíveis efeitos colaterais.
3. **Planejar:** apresente um plano curto quando houver várias partes, mudanças estruturais, riscos de segurança ou alteração de dados. Para tarefas pequenas, siga diretamente com escopo controlado.
4. **Implementar:** edite o menor conjunto de arquivos capaz de resolver o pedido, reutilizando as abstrações existentes.
5. **Verificar:** execute os comandos disponíveis e relevantes, priorizando lint, verificação de tipos e build. Confira também o fluxo funcional afetado.
6. **Relatar:** informe arquivos alterados, comportamento implementado, testes executados e resultados. Declare explicitamente qualquer verificação que não foi possível realizar.

## Verificações e comandos

Primeiro consulte `package.json` para confirmar quais scripts existem. A análise anterior executou `npm run lint`, `npx eslint src/ --quiet` e `npm run build`, mas isso não garante que todos continuem configurados ou passem no estado atual.

Quando disponíveis, use os comandos do próprio projeto, por exemplo:

- `npm run lint`
- `npx tsc --noEmit` (somente se compatível com a configuração do projeto)
- `npm run build`

Não declare que os testes passaram sem executá-los. Se um comando falhar por problemas preexistentes, diferencie-os dos erros introduzidos pela mudança.

## Restrições de escopo

- Não excluir arquivos apenas porque uma busca simples não encontrou referências; verifique imports indiretos, uso dinâmico, rotas, scripts e documentação.
- Não corrigir automaticamente todos os problemas listados no relatório durante uma solicitação não relacionada.
- Não alterar o esquema de dados, autenticação, persistência, dependências ou estrutura de diretórios sem necessidade e avaliação de impacto.
- Não substituir conteúdo real por mocks para facilitar a implementação.
- Não inventar endpoints, tipos, funções ou componentes sem conferir o código.
- Não considerar a análise anterior como prova de que um problema ainda existe; confirme no código atual.
- Se houver ambiguidade que afete arquitetura, segurança ou integridade dos dados, faça uma pergunta objetiva antes de tomar uma decisão arriscada.

## Formato esperado da resposta ao concluir

Apresente de forma objetiva:

- **O que foi feito:** resumo funcional.
- **Arquivos alterados:** caminho e motivo de cada alteração.
- **Reutilização:** componentes, hooks, serviços ou tipos reaproveitados.
- **Validação:** comandos executados e resultados reais.
- **Pontos de atenção:** limitações, riscos restantes ou decisões que dependem do usuário.

O objetivo final é evoluir o MEDTEC de forma incremental, consistente, segura e sustentável, preservando a arquitetura útil e corrigindo problemas identificados sem criar novas duplicações.