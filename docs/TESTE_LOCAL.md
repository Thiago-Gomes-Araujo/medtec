# Teste local do front

Guia para rodar o site e o Painel Gestor apontando para uma API Rails já em execução. Este repositório não sobe o backend.

## 1. Configure o ambiente

```bash
cp .env.example .env.local
```

Preencha os valores na sua cópia. O `.env.example` lista só os nomes.

| Variável | Para que serve |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL da API, no formato `http://<host>:<porta>/api/v1`. Vale para o navegador, o login e as rotas do servidor. |
| `BACKEND_API_URL` | Opcional. Usada só no servidor e só se `NEXT_PUBLIC_API_URL` não estiver definida. |
| `ADMIN_SESSION_SECRET` | Assina o cookie de sessão do painel. Em produção, precisa ter pelo menos 32 caracteres. |
| `ADMIN_USER`, `ADMIN_PASSWORD` | Login local do painel. Em produção, são obrigatórias. |
| `BACKEND_ADMIN_CPF`, `BACKEND_ADMIN_PASSWORD` | Conta usada pelas rotas `/api/data` e `/api/admin/users`. Sem elas, essas chamadas à API falham com erro explícito. |

Defina `NEXT_PUBLIC_API_URL` uma única vez. Se a chave estiver duplicada, vale a última.

## 2. Suba o front

```bash
npm ci
npm run dev
```

Para conferir em modo de produção:

```bash
npm run build
npm start
```

O valor de `NEXT_PUBLIC_API_URL` é fixado no JavaScript durante o build. Depois de trocar a URL, faça um novo build ou reinicie o `npm run dev`.

## 3. Entre no painel

Use um **CPF cadastrado na API configurada**. Esse login devolve o token que o painel envia à API.

O login por `ADMIN_USER` abre o painel, mas não gera token. Com ele, as chamadas à API respondem 401 e a tela mostra "Você precisa estar autenticado".

## 4. Confira o CORS

A API precisa liberar a origem do front, por exemplo `http://localhost:3000`, na variável `ALLOWED_ORIGINS` do backend. Sem isso, o painel mostra "API inacessível". A mesma mensagem aparece em falhas de rede e com URL incorreta, porque o navegador não permite diferenciar esses casos.

## 5. Build com Docker

`.env` não entra na imagem, então a URL da API precisa ser informada no build:

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=http://<host>:<porta>/api/v1 -t medtec-web .
```

Sem o argumento, o build para com uma mensagem de erro.

Com o compose, a URL vem do `.env` na raiz do projeto, junto com as credenciais do painel. Se alguma variável obrigatória faltar, o compose avisa qual é:

```bash
docker compose up --build
```

Ao trocar a URL, reconstrua a imagem.
