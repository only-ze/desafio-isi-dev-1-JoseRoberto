# Passe — mercado de jogadores

Estudo de caso **SENAI/PE – CÓD. 237 DESENVOLVEDOR I (FULLSTACK)**.

Aplicação web fullstack que simula o mercado de jogadores de uma liga de futebol fictícia: cadastro e valor de mercado dos jogadores, clubes com caixa e patrimônio, compra com contrato de fidelidade, venda com multa e comissão, histórico de transações com exportação em CSV, escalação dos titulares, partidas calculadas por duelos e classificação.

- **Backend:** Python + FastAPI + SQLAlchemy + Alembic, banco PostgreSQL 16.
- **Frontend:** React 19 + TypeScript, criado com Vite, estilizado com Tailwind CSS e shadcn/ui.

| Serviço | Endereço |
| --- | --- |
| Origem da API (o script da banca acrescenta `/api/v1`) | `http://localhost:8000` |
| Documentação interativa da API (Swagger) | `http://localhost:8000/docs` |
| Interface (frontend) | `http://localhost:5173` |

---

## 1. Pré-requisitos

| Ferramenta | Versão |
| --- | --- |
| Node.js (com npm) | 22 LTS (testado com Node.js 22.17 e npm 10.9) |
| Python (com pip) | 3.12 ou superior (testado com 3.12 e 3.13; no Ubuntu 24.04, o Python 3.12 do sistema) |
| Docker Engine com Docker Compose v2 | testado com Docker 28 e Compose 2.34 |
| PostgreSQL | 16, iniciado em contêiner pelo Docker Compose (imagem pública `postgres:16-alpine`); não precisa ser instalado |

---

## 2. Banco de dados

O banco roda em um contêiner do Docker Compose, e as tabelas são criadas por **migrations do Alembic** versionadas em `backend/migrations`. O banco criado começa vazio, sem jogadores, clubes, transações nem partidas.

### Criar o banco

Os passos estão no item 3, na ordem certa: criar o `.env` da raiz, subir o contêiner (`docker compose up -d --wait db`), criar o `.env` do backend, instalar as dependências e aplicar as migrations (`.venv/bin/alembic upgrade head`). Na aplicação inteira pelo Docker Compose (item 3.4), a API aplica as migrations sozinha ao iniciar.

### Recriar o banco do zero

Apaga todas as tabelas e as cria de novo, vazias. A API pode continuar rodando.

```bash
# Na pasta backend
cd backend
.venv/bin/alembic downgrade base
.venv/bin/alembic upgrade head
```

Com a aplicação inteira no Docker Compose (item 3.4), os mesmos comandos rodam dentro do contêiner da API:

```bash
# Na raiz do repositório
docker compose exec api alembic downgrade base
docker compose exec api alembic upgrade head
```

---

## 3. Instalar e executar (Ubuntu 24.04)

Há duas formas de executar: o passo a passo (itens 3.1 a 3.3), com a API e o frontend rodando direto na máquina, ou a aplicação inteira com um único comando do Docker Compose (item 3.4). As duas usam as mesmas portas (5432, 8000 e 5173) e o mesmo banco (contêiner `passe-db`), então use uma de cada vez.

No passo a passo, execute os comandos na ordem, um por linha. O comando que inicia a API fica em execução; o frontend roda em **outro terminal**.

### 3.1 Banco de dados (na raiz do repositório)

```bash
cp .env.example .env
docker compose up -d --wait db
```

### 3.2 Backend (na pasta backend)

```bash
cd backend
cp .env.example .env
sudo apt-get update
sudo apt-get install -y python3-venv
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --port 8000 --no-access-log
```

- API em **`http://localhost:8000`** (o script da banca acrescenta `/api/v1`).
- Swagger em **`http://localhost:8000/docs`**.
- A opção `--no-access-log` desliga o log de acesso padrão do Uvicorn, para que cada requisição gere uma única linha de log, a da própria aplicação (ver item 9).

### 3.3 Frontend (em outro terminal, a partir da raiz do repositório)

```bash
cd frontend
cp .env.example .env
npm ci
npm run dev
```

- Interface em **`http://localhost:5173`**. Abra exatamente esse endereço: o CORS da API libera só essa origem.

### 3.4 Alternativa: aplicação inteira com Docker Compose (um comando)

```bash
# Na raiz do repositório
docker compose up -d --build --wait
```

- Sobe três contêineres: `passe-db` (PostgreSQL), `passe-api` (aplica as migrations e inicia a API) e `passe-web` (frontend compilado, servido pelo nginx).
- Os endereços são os mesmos do passo a passo: interface em **`http://localhost:5173`**, API em **`http://localhost:8000`** e Swagger em **`http://localhost:8000/docs`**.
- As variáveis vêm do `.env` da raiz (copiado de `.env.example` no item 3.1). Sem esse arquivo, o Compose usa os mesmos valores do exemplo, então o comando também funciona num clone recém-baixado.
- Logs da API: `docker compose logs -f api`.
- Para parar: `docker compose down` (mantém os dados) ou `docker compose down -v` (apaga também o banco).

### 3.5 Testes, lint e formatação

```bash
# Na pasta backend, depois do item 3.2
.venv/bin/pip install -r requirements-dev.txt
.venv/bin/python -m pytest
.venv/bin/ruff check .
.venv/bin/ruff format --check .
```

```bash
# Na pasta frontend, depois do npm ci
npm test
npm run lint
npm run format:check
```

- Os testes terminam sozinhos, sem modo de observação, e não precisam do banco nem da API no ar.
- `ruff format --check .` e `npm run format:check` só verificam a formatação, sem alterar arquivos. Para formatar: `.venv/bin/ruff format .` e `npm run format`.

---

## 4. Variáveis de ambiente

Há três `.env.example` versionados (raiz, backend e frontend); o passo a passo copia cada um para `.env`.

**`.env.example`** (raiz, lido pelo Docker Compose)

| Variável | Exemplo | Uso |
| --- | --- | --- |
| `POSTGRES_USER` | `postgres` | Usuário criado no contêiner do PostgreSQL |
| `POSTGRES_PASSWORD` | `postgres` | Senha desse usuário (só para o banco local) |
| `POSTGRES_DB` | `passe` | Nome do banco |
| `CORS_ORIGIN` | `http://localhost:5173` | Origem liberada no CORS da API do contêiner (item 3.4) |
| `VITE_API_URL` | `http://localhost:8000/api/v1` | Endereço da API gravado no build do frontend do contêiner (item 3.4) |

- No contêiner, a API monta o `DATABASE_URL` com essas credenciais e o host `db` (o serviço do banco na rede do Compose) no lugar de `localhost`.
- Se mudar usuário, senha ou banco, ajuste também o `DATABASE_URL` de `backend/.env`, usado no passo a passo. As credenciais só valem quando o banco é criado: com o volume já existente, a mudança exige `docker compose down -v`, que apaga os dados.

**`backend/.env.example`** (lido pela API e pelo Alembic)

| Variável | Exemplo | Uso |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql+psycopg://postgres:postgres@localhost:5432/passe` | Conexão da API e do Alembic com o banco |
| `CORS_ORIGIN` | `http://localhost:5173` | Única origem liberada no CORS (a do frontend) |

**`frontend/.env.example`**

| Variável | Exemplo | Uso |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:8000/api/v1` | Endereço da API usado pelo frontend; se faltar, esse mesmo valor é o padrão |
---

## 5. Estrutura de pastas e bibliotecas

```text
.
├── .env.example                # Variáveis do Docker Compose (banco, CORS e endereço da API)
├── docker-compose.yml          # Banco, API e frontend (o passo a passo sobe só o banco)
├── backend/
│   ├── Dockerfile              # Imagem da API: aplica as migrations e inicia o Uvicorn
│   ├── alembic.ini
│   ├── migrations/             # Migrations do Alembic (criação das 7 tabelas)
│   ├── requirements.txt        # Dependências com versões travadas (exportadas do uv.lock)
│   ├── requirements-dev.txt    # pytest e Ruff, também exportados do uv.lock
│   ├── pyproject.toml, uv.lock # Dependências e configuração do pytest e do Ruff
│   ├── tests/                  # Testes das regras puras (pytest)
│   └── app/
│       ├── main.py             # Criação da aplicação, CORS, rotas, logs e tratamento de erros
│       ├── api/routers/        # Rotas por módulo: players, clubs, market, league
│       ├── schemas/            # Modelos Pydantic de entrada e saída e validadores reutilizáveis
│       ├── services/           # Casos de uso (orquestram regras, repositórios e transações)
│       ├── domain/             # Regras puras: multa, taxa, comissão, motor da partida, classificação
│       ├── repositories/       # Acesso ao banco via SQLAlchemy
│       ├── models/             # Mapeamento ORM das tabelas
│       ├── core/               # Configuração, relógio, erros centralizados e logs
│       ├── db/                 # Engine e sessão do banco
│       └── utils/              # Valor de mercado, overall, texto e Location
└── frontend/
    ├── Dockerfile, nginx.conf  # Build do Vite e nginx servindo a SPA (rotas caem no index.html)
    ├── package.json, package-lock.json
    ├── eslint.config.js, .prettierrc.json
    └── src/
        ├── api/                # Camada de acesso à API (fetch centralizado em http.ts)
        ├── components/         # Componentes compartilhados (estados de lista, avisos, formulários, layout)
        │   └── ui/             # Componentes do shadcn/ui
        ├── hooks/              # useFetch, useAction (envio sem clique duplo) e useClubs
        ├── pages/              # Telas: players, clubs, matches, standings
        ├── test/               # Configuração dos testes (jest-dom e limpeza entre testes)
        ├── types/              # Tipos das respostas da API
        └── utils/              # Formatação (moeda, data em Brasília), rótulos, formações
```

Os testes do frontend ficam ao lado do código que testam (`*.test.ts` e `*.test.tsx`).

### Bibliotecas do backend

| Biblioteca | Motivo |
| --- | --- |
| `fastapi[standard]` | Framework da API REST: rotas, validação com Pydantic e documentação Swagger em `/docs`. Traz o `pydantic-settings`, usado para ler o `.env` |
| `uvicorn[standard]` | Servidor ASGI que executa a API |
| `sqlalchemy` | ORM e consultas parametrizadas ao PostgreSQL |
| `alembic` | Migrations versionadas para criar e recriar o banco |
| `psycopg[binary]` | Driver do PostgreSQL usado pelo SQLAlchemy |
| `pytest` | Testes automatizados (dependência de desenvolvimento) |
| `ruff` | Lint e formatação do código Python (dependência de desenvolvimento) |

### Bibliotecas do frontend

| Biblioteca | Motivo |
| --- | --- |
| `react`, `react-dom` | Biblioteca de interface (stack obrigatória) |
| `react-router-dom` | Rotas entre as telas, no modo biblioteca |
| `tailwindcss`, `@tailwindcss/vite` | Estilos utilitários e integração com o Vite |
| `shadcn`, `radix-ui` | Componentes do shadcn/ui (diálogos, selects, abas, menus, tabelas) sobre primitivas acessíveis do Radix |
| `class-variance-authority`, `cn` | Variantes de estilo dos componentes e junção de classes do Tailwind |
| `tw-animate-css` | Animações usadas pelos componentes do shadcn/ui |
| `lucide-react` | Ícones |
| `sonner` | Mensagens de sucesso e erro (toasts) |
| `@fontsource-variable/inter` | Fonte Inter servida localmente |
| `typescript`, `vite`, `@vitejs/plugin-react` | Tipagem, servidor de desenvolvimento e build (dependências de desenvolvimento) |
| `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals` | Lint do código do frontend (`npm run lint`) |
| `prettier` | Formatação do código do frontend (`npm run format` e `npm run format:check`) |
| `vitest`, `jsdom` | Execução dos testes (`npm test`) em um DOM simulado |
| `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom` | Renderização dos componentes nos testes e verificações sobre o DOM |

---

## 6. Decisões e premissas

**Backend**

- **Ordem das validações:** primeiro o formato do pedido (400), depois a existência dos recursos (404) e por fim as regras de negócio (409). Na compra, a janela do fim da fidelidade (futura e até 1.095 dias) é conferida junto com o formato, antes de buscar jogador e clube.
- **Mensagens de erro** em português, sempre no campo `message`, montadas por um tratador central (`app/core/errors.py`). Erros de validação indicam o campo (ex.: `agility: com 35 anos ou mais, o máximo é 85`).
- **Datas** gravadas como `timestamptz` (instante absoluto) e devolvidas no horário de Brasília (`-03:00`). Os dias restantes usam o instante exato do servidor e arredondam para cima.
- **Valores em moedas** são `NUMERIC` no banco e `Decimal` no código, arredondados uma única vez com meio para longe do zero.
- **Listagem de jogadores:** a busca no banco aplica os filtros simples (posição, condição, clube, livres e idade); o valor de mercado, que é calculado e não é coluna, é filtrado e ordenado na aplicação, antes da paginação. O volume da liga (até 20 clubes de até 12 jogadores, mais os livres) torna isso adequado.
- **Nome único do clube:** índice único em `lower(nome)`, que diferencia acentos (“Águias FC” e “Aguias FC” são diferentes) e ignora maiúsculas.
- **Concorrência:** compra, venda, escalação e partida bloqueiam as linhas envolvidas (`SELECT ... FOR UPDATE`) e gravam tudo em uma única transação.
- **Rota `GET /`** devolve uma mensagem de boas-vindas, só para conferir que a API está no ar.

**Frontend**

- **Datas e horas** são exibidas no horário de Brasília (`America/Sao_Paulo`), e o fim da fidelidade é digitado em dois campos (data e hora), enviados como `AAAA-MM-DDTHH:MM-03:00`.
- **Filtros de jogadores:** com um clube filtrado, a aba “Livres” fica indisponível, e com “Livres” selecionada o filtro de clube fica desabilitado (a API recusa essa combinação).
- **Recusas previsíveis impedidas na tela:** de `DOENTE` direto para `APTO` (opção desabilitada), mudança de posição de jogador com clube (campo bloqueado) e idade menor que a atual (validação do formulário). As demais recusas são enviadas à API, e a tela mostra o `message` devolvido.
- **Escalação:** cada vaga lista só os jogadores do elenco da posição dela e sem `DOENTE`; a tela mostra uma prévia no campo e avisa quando a escalação salva está incompleta.
- **Valores calculados** (valor de mercado, taxas, multa, lucro, patrimônio, placar, duelos e classificação) são sempre os devolvidos pela API. A única conta na tela é o custo total da compra (valor + taxa), permitida pelo enunciado.
- O layout segue o mockup do Figma; partes opcionais do mockup (contadores no menu lateral e tela inicial) não foram feitas.

**Testes, qualidade e Docker**

- **Testes do backend** cobrem as regras puras (`app/domain` e `app/utils`) com os exemplos numéricos do enunciado: valor de mercado e overall, taxa, limite de caixa, dias restantes e multa, comissão, sigla, formação, a partida Águias FC × Delta FC e a classificação de 6 clubes. Não usam banco, por isso rodam em menos de um segundo; o comportamento HTTP da API foi conferido à parte, com a API no ar.
- **Testes do frontend** cobrem as funções de formatação e de montagem das telas (vagas da escalação, times da partida) e os componentes compartilhados (estados de lista, botão de envio, tabela de transações).
- **Ruff e Prettier** usam 120 colunas. Os componentes gerados pelo shadcn/ui (`src/components/ui`) ficam fora do Prettier, como saíram do gerador, mas passam pelo ESLint.
- **Docker Compose:** a API só inicia depois que o banco responde (healthcheck) e aplica as migrations antes de subir. O frontend é compilado na imagem e servido pelo nginx, que devolve o `index.html` para as rotas da SPA (ex.: abrir `/clubs/1` direto).

---

## 7. Funcionalidades não implementadas

Nenhuma das funcionalidades obrigatórias ficou de fora, e todos os diferenciais do enunciado (técnicos do backend e de interface do frontend) foram feitos. O item 9 mostra como verificar cada um.

---

## 8. Uso de inteligência artificial

**Ferramentas:** Claude (assistente de IA da Anthropic, no Claude Code) com o MCP do Figma (`figma-developer-mcp`), que permite ao Claude ler os frames do mockup.

**Onde:**

- **Frontend, desenvolvimento e prototipação das telas** a partir do mockup: telas de Clubes (lista, criação, página do clube, elenco, escalação com o campo e histórico de transações com filtros, totais e exportação), diálogos de compra e venda, telas da Liga (partidas, detalhe da partida com os duelos e classificação) e os estados de carregamento, lista vazia e erro. Também os componentes compartilhados criados para essas telas (`DataState`, `Notice`, `ResultList`, `SubmitButton`, `PlayerAvatar`, `PitchPlayer` e outros) e as funções de acesso à API correspondentes.
- **Diferenciais técnicos:** configuração dos testes (pytest no backend, Vitest com Testing Library no frontend) e escrita dos casos, configuração do lint e da formatação (Ruff e Prettier) e os Dockerfiles e o Docker Compose da aplicação inteira.
- **Revisão final** do backend e do frontend contra o enunciado e o barema, e redação deste README.

**Como e por quê:**

- O MCP do Figma foi usado para ler cada seção do mockup e prototipar as telas seguindo a disposição e os textos dele, o que acelerou a parte visual.
- O trabalho foi feito em etapas (clubes, compra, venda, histórico, liga e estados). Cada etapa foi revisada, testada no navegador contra a API e commitada separadamente.
- Na revisão final, um script de verificação percorreu os itens do roteiro da API (B01 a B22) em um banco separado e apontou três falhas, que foram corrigidas: a ordenação de jogadores com `sort` diferente do padrão respondia 500; o histórico e a exportação respondiam 200, em vez de 404, para clube inexistente; e o filtro `player_id` respondia 200, em vez de 404, para jogador inexistente ou excluído. A revisão também removeu código e arquivos sem uso, padronizou nomes de módulos em inglês e estendeu o lint do frontend a todo o código.
- Os casos de teste do backend partem dos exemplos numéricos do enunciado, e cada valor esperado foi conferido contra o texto. O Docker Compose foi testado subindo uma cópia isolada da aplicação (outro nome de projeto e outras portas), com a interface consumindo a API do contêiner. A conferência de responsividade com 375 px apontou rolagem horizontal na classificação, corrigida.

**O que foi aceito, alterado ou descartado:**

- Aceitei a estrutura de componentes e da camada de API sugerida, que segue o padrão já usado na tela de jogadores.
- Pedi ajustes quando a tela gerada ficou diferente do mockup: diálogo de novo clube, aba de escalação (cartões de formação com o mini campo e a prévia em campo) e largura dos diálogos de compra.
- Todas as telas foram conferidas no navegador antes de cada commit.

---

## 9. Diferenciais e como verificá-los

**Backend**

| Diferencial | Como verificar |
| --- | --- |
| Testes automatizados | Na pasta backend: `.venv/bin/python -m pytest` (item 3.5). O cálculo do valor de mercado (RN02 a RN05) está em `tests/test_player_value.py` |
| Docker e Docker Compose | Na raiz do repositório: `docker compose up -d --build --wait` sobe interface, API e banco (item 3.4) |
| Documentação interativa (Swagger/OpenAPI) | Com a API no ar, abrir `http://localhost:8000/docs` (todos os endpoints do enunciado) |
| Registro de logs | No terminal da API (ou em `docker compose logs -f api`), cada requisição gera uma linha com data e hora, método, caminho e status, pelo módulo `logging` da biblioteca padrão, ex.: `2026-10-22 11:06:09,205 INFO app.http POST /api/v1/clubs 409` |
| Lint e formatação | Na pasta backend: `.venv/bin/ruff check .` e `.venv/bin/ruff format --check .` (só verifica, sem alterar arquivos) |

**Frontend**

| Diferencial | Como verificar |
| --- | --- |
| Responsividade | Abrir as telas de jogadores, do clube e do histórico com 375 px de largura (ex.: modo de dispositivo do navegador). A página não rola na horizontal; as tabelas rolam dentro do próprio quadro |
| Testes | Na pasta frontend: `npm test` (Vitest, termina sozinho) |
| Lint e formatação | Na pasta frontend: `npm run lint` e `npm run format:check` (só verifica, sem alterar arquivos) |
