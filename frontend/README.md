# Passe — frontend

Interface em React 19 + TypeScript, criada com Vite. Pré-requisitos, variáveis de ambiente, bibliotecas e decisões estão no [README da raiz](../README.md).

```bash
cp .env.example .env
npm ci
npm run dev
```

Interface em `http://localhost:5173`, consumindo a API definida em `VITE_API_URL` (padrão: `http://localhost:8000/api/v1`).

| Comando                | O que faz                                             |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento                           |
| `npm run build`        | Checagem de tipos e build de produção                 |
| `npm test`             | Testes com Vitest e Testing Library (termina sozinho) |
| `npm run lint`         | Lint com ESLint                                       |
| `npm run format:check` | Verifica a formatação com Prettier, sem alterar       |
| `npm run format`       | Formata o código com Prettier                         |
