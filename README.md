# Portal Institucional e CMS MEDTEC Rondônia (SEDUC-RO)

Portal Institucional e Sistema de Gestão de Conteúdo (CMS) desenvolvido com **Next.js 16**, **React 19**, **TypeScript 5** e **Tailwind CSS 4**, dedicado ao programa **Ensino Médio com Mediação Tecnológica (MEDTEC)** da Secretaria de Estado da Educação do Governo de Rondônia (SEDUC-RO), instituído pela **Lei Estadual nº 3.846/2016** e regulamentado pela **Portaria nº 928/2025**.

---

## 🚀 Tecnologias e Versões

- **Framework Web:** [Next.js 16.4.0](https://nextjs.org/) (App Router, Turbopack, Cache Components e Partial Prerendering)
- **Biblioteca de Interface:** [React 19.3.0](https://react.dev/)
- **Linguagem:** [TypeScript 5](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Ícones:** [Lucide React](https://lucide.dev/) (v1.55.0)
- **Segurança de Sessão:** `node:crypto` nativo (HMAC-SHA256 e `timingSafeEqual`)

---

## 📋 Pré-requisitos e Instalação

### Pré-requisitos
- **Node.js:** versão 20.x ou superior (LTS recomendada)
- **npm:** versão 10.x ou superior

### Passo a Passo de Instalação

```bash
# 1. Clone ou acesse o repositório do projeto
git clone <url-do-repositorio>
cd medtec

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
```

---

## 🔐 Configuração de Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto com base no arquivo [.env.example](file:///.env.example):

| Variável | Obrigatória | Descrição | Exemplo |
| :--- | :---: | :--- | :--- |
| `ADMIN_USER` | Sim | Nome de usuário para acesso ao painel do CMS | `admin` |
| `ADMIN_PASSWORD` | Sim | Senha forte de acesso do administrador | *(Defina uma senha segura)* |
| `ADMIN_SESSION_SECRET` | Sim (Produção) | Chave secreta de no mínimo 32 caracteres para assinatura HMAC-SHA256 | *(Gerada via openssl)* |

> **Dica para gerar uma chave segura:**
> ```bash
> openssl rand -hex 32
> ```
> Em ambiente de desenvolvimento local, caso a chave não seja definida, o sistema utiliza um fallback temporário exclusivo de desenvolvimento e emite um alerta no terminal. Em produção (`NODE_ENV=production`), a ausência de uma chave segura com no mínimo 32 caracteres impede a inicialização das rotas protegidas por segurança.

---

## 💻 Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento local |
| `npm run build` | Compila o projeto para produção utilizando Turbopack |
| `npm run start` | Inicia o servidor Node.js em modo de produção |
| `npm run lint` | Executa a verificação global de qualidade via ESLint |
| `npx tsc --noEmit` | Executa a verificação estrita de tipagem TypeScript |

---

## 🏛️ Arquitetura do Sistema e Estrutura de Pastas

O projeto adota a arquitetura App Router do Next.js 16, priorizando **Server Components** por padrão e isolando a interatividade do cliente em componentes específicos ("ilhas de interatividade").

```
src/
├── app/
│   ├── admin/
│   │   ├── login/page.tsx      # Tela de login do gestor (Client Component)
│   │   └── page.tsx            # Painel do CMS com abas editoriais (Client Component)
│   ├── alunos/page.tsx         # Histórias e conquistas de estudantes (Client Component)
│   ├── api/
│   │   ├── auth/route.ts       # Login, verificação e logout com cookies HttpOnly
│   │   ├── data/route.ts       # Leitura pública e gravação autenticada do banco CMS
│   │   ├── news/view/route.ts  # Endpoint de incremento de métricas de visualização
│   │   └── upload/route.ts     # Upload autenticado com validação de magic bytes
│   ├── faq/page.tsx            # Perguntas frequentes e base legal (Server Component)
│   ├── galeria/page.tsx        # Acervo fotográfico oficial do CMS (Server Component)
│   ├── globals.css             # Design tokens e folhas de estilo Tailwind 4
│   ├── layout.tsx              # Root Layout, metadados globais e fontes
│   ├── mapa/page.tsx           # Mapa de escolas conectadas em Rondônia (Server Component)
│   ├── noticias/
│   │   ├── page.tsx            # Listagem de notícias do CMS (Server Component)
│   │   └── [id]/page.tsx       # Detalhes da matéria com validação 404 (Server Component)
│   ├── page.tsx                # Landing Page oficial com dossiê e seções (Client Component)
│   ├── professores/page.tsx    # Perfis de professores ministrantes e mediadores
│   ├── redes/page.tsx          # Canais de transmissão e redes sociais (Server Component)
│   └── transparencia/page.tsx  # Indicadores educacionais e prestação de contas (Server Component)
├── components/
│   ├── Announcements.tsx       # Mural de comunicados oficiais (Server Component)
│   ├── EditorialKanban.tsx     # Quadro Kanban editorial do painel administrativo
│   ├── FaqSection.tsx          # Acordeões interativos de dúvidas frequentes
│   ├── GallerySection.tsx      # Galeria com filtros de categoria e modal Lightbox
│   ├── ImageModal.tsx          # Visualizador ampliado de imagens com tecla Escape
│   ├── Methodology.tsx         # Linha do tempo dos 5 passos pedagógicos (Server Component)
│   ├── NewsGrid.tsx            # Grid interativo com busca e filtros de notícias
│   ├── NewsModal.tsx           # Modal de leitura rápida de matérias
│   ├── NewsSection.tsx         # Seção de notícias da landing page inicial
│   ├── NewsViewTracker.tsx     # Rastreador assíncrono de visualizações de matérias
│   ├── PageHeader.tsx          # Cabeçalho padrão de páginas internas (Server Component)
│   ├── PresentationPitchModal.tsx # Modal interativo do Dossiê MEDTEC
│   ├── SchoolMap.tsx           # Mapa de presença por município e tipo de localidade
│   ├── SiteFooter.tsx          # Rodapé institucional oficial da SEDUC-RO (Server Component)
│   ├── SiteHeader.tsx          # Barra governamental fixa com navegação mobile
│   ├── SitePhotosManager.tsx   # Gerenciador de fotos, banners e capas do CMS
│   ├── SocialIcons.tsx         # Ícones vetoriais oficiais das redes sociais
│   ├── SocialSection.tsx       # Grade oficial de canais do YouTube, Instagram, etc.
│   ├── StudentStories.tsx      # Histórias de estudantes em conformidade com LGPD
│   ├── TeacherProfiles.tsx     # Cards de docentes com modal de biografia
│   ├── TechAdvantages.tsx      # Pilares da mediação tecnológica (Server Component)
│   └── TransparencySection.tsx # Indicadores e contratos auditados pelo TCE-RO/LAI
├── data/
│   ├── db.json                 # Banco de dados JSON ativo e persistente
│   ├── initialData.json        # Snapshot de dados padrão e fallback de inicialização
│   └── medtecData.ts           # Dados de domínio: escolas, municípios, professores e alunos
├── lib/
│   ├── auth.ts                 # Utilitários criptográficos HMAC-SHA256, cookies e CSRF
│   └── db.ts                   # Camada de persistência em disco (getDatabase / saveDatabase)
├── proxy.ts                    # Interceptador oficial de rotas (/admin/:path*) do Next.js 16
└── types/
    └── index.ts                # Contratos TypeScript unificados (NewsItem, DatabaseSchema, etc.)
```

---

## 🛡️ Autenticação e Segurança (Etapa 1)

O sistema conta com proteção de nível de servidor independente de cliente:

1. **Proxy de Rotas (`src/proxy.ts`):**
   - Convenção oficial do Next.js 16 para interceptação de requisições.
   - Protege qualquer acesso a `/admin` ou sub-rotas, redirecionando requisições sem sessão válida para `/admin/login?redirect=...`.
2. **Sessão Criptografada HMAC-SHA256 (`src/lib/auth.ts`):**
   - Sessões emitidas em cookies `HttpOnly`, `SameSite=Lax`, com tempo de expiração definido e assinatura criptográfica com segredo do servidor.
   - Validação com comparação em tempo constante (`timingSafeEqual`) contra ataques de temporização (*timing attacks*).
   - Validação de cabeçalhos de origem e host para proteção efetiva contra CSRF.
3. **Proteção nos Endpoints de Mutação:**
   - `PUT /api/data`: exige sessão administrativa ativa, validação CSRF e validação estrutural estrita do payload JSON antes de gravar em disco.
   - `POST /api/upload`: exige sessão administrativa, limita o tamanho a 5MB, rejeita formatos inseguros (como SVGs executáveis), sanitiza nomes de arquivo contra *path traversal* e valida a integridade do arquivo através de *magic bytes* (assinatura binária) antes da gravação com flag exclusiva `wx`.

---

## 📰 Sistema Unificado de Notícias e CMS (Etapa 2)

O portal utiliza uma única fonte de dados oficial gerenciada pelo CMS:

- **Contrato Único (`NewsItem`):** Todos os dados de matérias (título, slug, conteúdo, capa, autor, categoria, folder editorial, data de publicação e status de publicação) são padronizados no arquivo `src/types/index.ts`.
- **Listagem e Detalhes:** A rota `/noticias` e a rota individual `/noticias/[id]` consomem os dados do CMS via Server Components.
- **Controle de Publicação:** Notícias marcadas com `published: false` são ocultadas automaticamente da listagem pública e retornam código HTTP `404 (Not Found)` caso alguém tente acessar o link direto.
- **Acervo Integrado:** As matérias históricas foram migradas para o banco persistente, garantindo 9 itens de notícia ativos com paginação e busca por categorias.

---

## ⚡ Server Components e Otimização (Etapa 3)

A renderização foi otimizada para diminuir o envio de JavaScript desnecessário para o cliente:

- **Rotas Convertidas para Server Components:** `/transparencia`, `/faq`, `/mapa`, `/galeria` e `/redes`.
- **Componentes Apresentacionais Convertidos:** `TechAdvantages`, `Methodology` e `Announcements`.
- **Ilhas de Interatividade Preservadas:** Apenas componentes que manipulam estado local (`useState`), efeitos ou eventos de janela mantêm a diretiva `'use client'`, preservando o comportamento dos acordeões, seletores de município e modais.

---

## 💾 Persistência de Dados e Observações de Implantação

- **Armazenamento Atual:** O sistema utiliza persistência local em arquivo JSON no caminho `src/data/db.json` e armazenamento de mídia em `public/uploads/`.
- **Gravação Segura:** A função `saveDatabase()` realiza a escrita síncrona do payload completo validado.
- **Ambientes de Hospedagem (Deploy):**
  - **Servidor Virtual / VPS (Node.js runtime / Docker):** Deve-se mapear um volume persistente para os diretórios `src/data` e `public/uploads` para garantir que as alterações realizadas no painel do CMS e os uploads de fotos persistam entre reinicializações de contêineres.
  - **Ambientes Serverless (Vercel / AWS Lambda):** Nesses ambientes, o sistema de arquivos local é efêmero por design. Para produção em infraestrutura serverless, recomenda-se configurar um provedor de banco de dados compatível e um bucket de armazenamento S3/Blob para a pasta de uploads.

---

## 📄 Base Legal e Expediente

- **Governo do Estado de Rondônia**
- **Secretaria de Estado da Educação (SEDUC-RO)**
- **Coordenadoria de Mídias Educacionais**
- **Fundamentação Legal:** Lei Estadual nº 3.846/2016 e Portaria SEDUC nº 928/2025.
