# Portal Institucional MEDTEC Rondônia (SEDUC)

Portal Institucional e Gerenciável (CMS) desenvolvido em **Next.js 16**, **TypeScript** e **Tailwind CSS**, dedicado ao programa **Ensino Médio com Mediação Tecnológica (MEDTEC)** da Secretaria de Estado da Educação do Governo de Rondônia (SEDUC-RO), instituído pela **Lei Estadual nº 3.846/2016** e regulamentado pela **Portaria nº 928/2025**.

---

## 🌟 Funcionalidades Principais

### 1. Landing Page Institucional Oficial
- **Identidade Visual Governamental**: Padrão estético do Governo do Estado de Rondônia e SEDUC (Cores oficiais: verde esmeralda, azul celeste, amarelo dourado).
- **Banner Hero Interativo**: Slogan, apresentação do programa, contadores estatísticos em tempo real (+15.000 alunos formados, 320+ salas conectadas, 52 municípios, 1.800h de transmissões) e chamadas para ação.
- **Mural de Avisos e Comunicados**: Alertas coloridos por nível de prioridade (*Urgente*, *Aviso Importante*, *Informativo*) com links diretos e datas.
- **Seção "O Projeto"**: Histórico, fundamentação legal (Lei 3.846/2016), foco em equidade e atendimento a **comunidades ribeirinhas (Rios Madeira e Guaporé), terras indígenas, remanescentes quilombolas e áreas rurais**.
- **Como Funciona (Metodologia Inovadora)**: Explicação das aulas ao vivo geradas nos estúdios da Coordenadoria de Mídias Educacionais em Porto Velho com a mediação presencial do professor em sala de aula, além da matriz curricular integrada à BNCC e itinerários formativos (Projeto de Vida, NBAZ - Agroecologia e Zootecnia).
- **Central de Notícias**: Sistema completo de notícias com busca dinâmica em tempo real, filtros por categoria (*Pedagógico*, *Institucional*, *Tecnologia*, *Eventos*, etc.) e modal de leitura instantânea.
- **Páginas Individuais de Notícias (`/noticias/[id]`)**: Rota dedicada para cada notícia pronta para compartilhamento em redes sociais.
- **Galeria Multimídia de Fotos**: Registros reais de salas conectadas, estúdios televisivos e aulas de campo com visualizador ampliado (Lightbox).
- **Divulgação em Destaque das Redes Sociais & Canais de Transmissão**:
  - Canal do **YouTube** (aulas ao vivo e gravadas);
  - Perfil oficial do **Instagram**;
  - Página no **Facebook**;
  - Canal direto no **WhatsApp** para suporte a polos e professores;
  - Link direto para a página do projeto no portal da SEDUC Rondônia.
- **Espaço do Estudante e do Professor Mediador**: Links rápidos para calendários letivos, apostilas digitais e suporte técnico às antenas e receptores satelitais.

---

## 🛠️ Painel de Controle Gerenciável (CMS Admin)

Acesse pelo botão no cabeçalho ou diretamente na rota:
👉 **URL:** `/admin`  
👉 **Login:** `/admin/login`

### Credenciais Padrão:
- **Usuário:** `admin`
- **Senha:** `medtec2025`

### No Painel Administrativo você pode:
1. **Publicar e Editar Notícias**:
   - Título, Categoria, Autor, Data, Resumo e Texto Completo;
   - **Upload direto de fotos do seu computador** (salvas automaticamente em `/public/uploads`) ou link externo;
   - Marcar notícia como "Destaque" na página inicial;
   - Editar ou excluir notícias existentes.
2. **Gerenciar Avisos e Alertas**:
   - Criar comunicados com nível de urgência (Urgente, Aviso, Informativo);
   - Ativar ou ocultar avisos da página inicial com um clique;
   - Adicionar botões e links de ação.
3. **Gerenciar Galeria de Fotos**:
   - Fazer upload de novas fotos de eventos, estúdios ou turmas;
   - Inserir legenda, categoria e data;
   - Excluir imagens.
4. **Gerenciar Redes Sociais e Contatos**:
   - Alterar links do YouTube, Instagram, Facebook, WhatsApp, telefone e e-mail institucional.
5. **Atualizar Métricas e Textos Institucionais**:
   - Alterar os contadores de estudantes, salas conectadas e municípios atendidos.

---

## 🚀 Como Executar o Projeto

```bash
# Entrar na pasta do projeto
cd /home/thiago/medtec

# Rodar em modo de desenvolvimento
npm run dev

# Ou rodar em modo de produção otimizado
npm run build
npm run start
```

O projeto estará disponível em: `http://localhost:3000`

---

## 📁 Estrutura de Arquivos

```
src/
├── app/
│   ├── admin/
│   │   ├── login/page.tsx      # Tela de login do gestor
│   │   └── page.tsx            # Painel administrativo CMS completo
│   ├── api/
│   │   ├── auth/route.ts       # Autenticação administrativa
│   │   ├── data/route.ts       # API de leitura e gravação dos dados
│   │   └── upload/route.ts     # API de upload de fotos para /public/uploads
│   ├── noticias/
│   │   ├── page.tsx            # Listagem completa de notícias
│   │   └── [id]/page.tsx       # Leitura individual de notícia
│   ├── globals.css             # Estilos Tailwind e gradientes governamentais
│   ├── layout.tsx              # Metadados e estrutura HTML
│   └── page.tsx                # Landing Page institucional principal
├── components/
│   ├── Header.tsx              # Barra governamental e menu responsivo
│   ├── Hero.tsx                # Apresentação de impacto e métricas
│   ├── Announcements.tsx       # Mural de comunicados e avisos urgentes
│   ├── AboutSection.tsx        # Base legal e públicos prioritários
│   ├── Methodology.tsx         # Funcionamento da mediação tecnológica
│   ├── NewsSection.tsx         # Feed de notícias com busca e filtros
│   ├── NewsModal.tsx           # Modal de leitura rápida de matéria
│   ├── GallerySection.tsx      # Galeria de fotos com lightbox
│   ├── ImageModal.tsx          # Visualizador ampliado de fotos
│   ├── SocialSection.tsx       # Divulgação YouTube, Instagram, Facebook, WhatsApp
│   ├── SocialIcons.tsx         # Ícones SVG das redes sociais
│   ├── StudentTeacherPortals.tsx # Espaço para estudantes e professores
│   └── Footer.tsx              # Rodapé oficial da SEDUC-RO
├── data/
│   ├── initialData.json        # Dados de exemplo oficiais pré-carregados
│   └── db.json                 # Banco de dados local persistente
├── lib/
│   └── db.ts                   # Camada de leitura e persistência em disco
└── types/
    └── index.ts                # Tipos TypeScript das entidades
```

---

*Desenvolvido em conformidade com as diretrizes da Secretaria de Estado da Educação de Rondônia (SEDUC-RO).*
