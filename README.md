<div align="center" id="top">
   <a href="https://vcnafacul.com.br" target="_blank"><img src="src/assets/vcnafacul.png" alt="Logo"></a>
</div>

<h1 align="center">Você na Facul — Frontend (client-vcnafacul)</h1>

<p align="center">
   <img alt="Linguagem principal" src="https://img.shields.io/github/languages/top/vcnafacul/client-vcnafacul">
   <img alt="Linguagens" src="https://img.shields.io/github/languages/count/vcnafacul/client-vcnafacul">
   <img alt="Tamanho do repositório" src="https://img.shields.io/github/repo-size/vcnafacul/client-vcnafacul?color=blue">
   <img alt="Licença" src="https://img.shields.io/github/license/vcnafacul/client-vcnafacul?color=inactive">
   <a href="https://github.com/vcnafacul/client-vcnafacul/issues"><img alt="Issues" src="https://img.shields.io/github/issues/vcnafacul/client-vcnafacul" /></a>
   <a href="https://github.com/vcnafacul/client-vcnafacul/pulls"><img alt="Pull requests" src="https://img.shields.io/github/issues-pr/vcnafacul/client-vcnafacul" /></a>
</p>

## Descrição

SPA da plataforma **Você na Facul** — organização sem fins lucrativos que trabalha para democratizar o acesso ao ensino superior no Brasil.

Este frontend consome **apenas** a `api-vcnafacul`. Nunca fala diretamente com microsserviços.

---

## Arquitetura

```
client-vcnafacul  →  api-vcnafacul  →  ms-simulado       (motor de provas)
  (React SPA)       (NestJS gateway)   (NestJS + MongoDB)
                         ↓
                    vcnafacul-form    (construtor de formulários)
                    (NestJS + MongoDB)
```

| Serviço | Stack | Banco | Porta |
|---------|-------|-------|-------|
| **client-vcnafacul** (este) | React 19 + Vite 6 | — | `5173` |
| api-vcnafacul | NestJS 10 + TypeORM | MySQL 8+ | `3333` |
| ms-simulado | NestJS 10 + Mongoose | MongoDB | `3000` |
| vcnafacul-form | NestJS 11 + Mongoose | MongoDB | `3001` |

---

## Principais tecnologias

- **React 19** + **TypeScript**
- **Vite 6** (dev server + build)
- **Tailwind CSS 3.4** + **MUI 6** + **Radix UI** + **shadcn/ui**
- **Zustand** (estado global)
- **React Router v7**
- **React Hook Form** + **Yup** / **Zod**
- **TipTap** (editor rich text, armazenamento em Markdown)
- **Atomic design**: `atoms`, `molecules`, `organisms`, `templates`
- Camada de serviços em `src/services/*.ts` via `fetchWrapper.ts` (auth, refresh token, erros)
- Path alias: `@/*` → `src/*`

---

## Desenvolvimento

Pré-requisitos: Node.js 20+, Yarn.

```bash
# 1. Instalar dependências
yarn

# 2. Garantir .env.development na raiz (ver .env.example)
#    Principal variável: VITE_BASE_URL (default http://localhost:3333)

# 3. Rodar dev server
yarn dev

# 4. Abrir http://localhost:5173
```

Para fluxos que dependem de login/API, subir também a `api-vcnafacul` localmente.

---

## Homologação local (Docker)

Para rodar o conjunto de serviços em ambiente de homologação local:

1. Garantir `.env.qa` na raiz (criar a partir de `.env.qa.example`)
2. Executar `./run_qa.sh` (no Windows, rodar via `git bash`)
3. O script baixa imagens do Docker Hub e sobe `client-vcnafacul`, `api-vcnafacul` e `ms-simulado`
4. Ao final, acessar `http://localhost:5173`

---

## Scripts

```bash
yarn dev                   # Dev server Vite (5173)
yarn build                 # Build de produção
yarn build:development     # Build dev
yarn build:homologation    # Build QA
yarn lint                  # ESLint (zero warnings)
yarn preview               # Preview do build
```

---

## CI/CD

- `ci-homol.yml` — deploy em homologação ao mergear PR em `develop`
- `ci-prod.yml` — deploy em produção ao publicar tag `v*`

---

## Contribuição

Sinta-se à vontade para abrir uma issue ou pull request. Toda ajuda é bem-vinda.

## Contato

Site oficial: [Você na Facul](https://vcnafacul.com.br).
