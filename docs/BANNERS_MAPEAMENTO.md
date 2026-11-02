# Banners da home: mapeamento do front para a API

Contrato: [ROTAS_BANNERS.md](ROTAS_BANNERS.md). Regra de escopo: o que o front tem e a API não tem sai do painel e do site, e o que a API tem e o front não tem é implementado.

**Ação:** `manter` usa o campo com o nome da API, `remover` tira o campo e `criar` adiciona o que não existia.

## Banner

| Campo do front (`BannerItem`) | Campo da API | Ação |
|---|---|---|
| `id` (texto) | `id` (número) | manter |
| `imageUrl` | `imagem` (URL completa) e `imagem_url` (link externo) | manter |
| `title` | sem campo; o texto vem desenhado na arte | remover |
| `linkUrl` (link de clique) | sem campo | remover |
| Posição na lista (subir e descer) | sem campo; a ordem é a do cadastro | remover |
| Ocultar banner | sem campo; apagar é a única forma de tirar do site | remover |
| sem campo | `b_banner[imagem]` em multipart | criar |
| sem campo | `b_banner[imagem_url]` em JSON | criar |
| sem campo | `created_by`, `updated_by`, `created_at`, `updated_at` | manter só no tipo; o painel não mostra |

**Atenção:** `imagem` já vem como URL completa. Ao contrário de conquistas e projetos, não passa por `getMediaUrl`.

## Painel

| Item do front | Na API | Ação |
|---|---|---|
| `SitePhotosManager` (consulta com edição bloqueada) | `GET`, `POST`, `PATCH` e `DELETE /b_banners` | remover e substituir por `BannersPanel` |
| Prévia local por `prepareLocalBannerPreview` | sem rota; o envio é direto | remover |
| Leitura em `/api/data` (`readAdminBanners`) | `GET /b_banners?page=all` | remover |
| Capas de notícias no gerenciador (`readBannerNews`) | sem vínculo com banners | remover |
| Fotos da galeria no gerenciador (`readBannerGallery`) | sem vínculo com banners | remover |
| "Foto do estúdio" (`siteInfo.studioImage`) | sem campo | remover |
| `getLegacyBannersHref` (sem uso; o redirecionamento está em `admin-aliases`) | não se aplica | remover |
| Renderizador `banner` do `AdminLiveSimulator` | sem título nem link para simular | remover |
| Indicador "Indisponível — sem integração oficial" no Início | `GET /b_banners` | manter, com o total da API |
| sem tela | Trocar imagem (`PATCH /b_banners/:id`) | criar |
| sem tela | Excluir (`DELETE /b_banners/:id`) | criar |

## Site

| Item do front | Na API | Ação |
|---|---|---|
| Nenhum carrossel no site | `GET /publico/b_banners` | criar `HomeBannerCarousel` |
| Hero da home (título, chamadas e métricas) | sem campo; não é banner | manter |

## Mocks e dados locais

| Item | Ação |
|---|---|
| `BannerItem` e `banners` em `DatabaseSchema` | remover |
| `banners` em `db.json` e `initialData.json` | remover |
| `normalizeBanners` em `src/lib/db.ts` | remover |
| Validação e preservação de `banners` em `/api/data` | remover |
| `siteInfo.heroImage` e `siteInfo.studioImage` (só o gerenciador lia) | remover |
| `public/banners/aulas.svg` e `public/banners/territorio.svg` | remover |

## Limitações do contrato

- **Descrição da imagem:** não há campo. O texto alternativo é genérico ("Banner 1 de 3"), então quem usa leitor de tela não recebe o texto desenhado na arte.
- **Proporção da arte:** o contrato só pede "artes largas". O carrossel mostra a arte inteira numa faixa 16:5, sem cortar o texto.
