# OPSFLOW — Gestão de Operações & SLA em Escala

Frontend corporativo multi-tenant para gestão de chamados, ativos de TI, triagem operacional e monitoramento de Acordos de Nível de Serviço (**SLA**), construído sobre uma arquitetura **Modular Frontend + Monorepo + Feature-Sliced Design (FSD)** e o sistema visual **Atelier Monolith**.

---

## 🏛️ Arquitetura: Modular Frontend + Monorepo + FSD

O projeto combina **NPM Workspaces** (`packages/*`) para isolamento de pacotes compartilhados com a metodologia **Feature-Sliced Design (FSD)** (`src/*`) para governança estrita de dependências unidirecionais:

```text
opsflow-web/
├── packages/
│   ├── domain/                      # @opsflow/domain — Regras de negócio puras (Zero React)
│   │   └── src/
│   │       ├── types/               # Entidades (Ticket, User, Category, Company, SLA)
│   │       ├── constants/           # Máquina de estados, janelas de SLA e rótulos
│   │       ├── utils/               # Cálculo de SLA (evaluateTicketSla) e datas
│   │       └── services/            # Serviços puros (ticket, category, user)
│   │
│   └── ui/                          # @opsflow/ui — Design System Atelier Monolith
│       └── src/                     # Button, DropdownSelect, Modal, OpsFlowLogo
│
└── src/                             # Aplicação Host — Feature-Sliced Design (FSD)
    ├── app/                         # 1. Inicialização, Providers, Roteamento e CSS global
    ├── pages/                       # 2. Telas completas (login, dashboard, ticket-list,
    │                                #    ticket-detail, categories, team-members, activity-log)
    ├── widgets/                     # 3. Blocos autônomos (app-shell, ticket-table,
    │                                #    ticket-action-panel, ticket-conversation)
    ├── features/                    # 4. Ações do usuário (create-ticket, resolve-ticket,
    │                                #    filter-tickets, switch-profile)
    ├── entities/                    # 5. Entidades visuais e sessão (ticket, user, session)
    ├── shared/                      # 6. Cliente HTTP (Single-Flight JWT), Seed e SEO dinâmico
    └── __tests__/                   # Suítes de Integração, Performance Budgets e Auditoria SEO
```

### Regra de Dependência Unidirecional (FSD)
Cada camada só pode importar de camadas estritamente inferiores através de suas **Public APIs (`index.ts`)**:
$$\texttt{app} \rightarrow \texttt{pages} \rightarrow \texttt{widgets} \rightarrow \texttt{features} \rightarrow \texttt{entities} \rightarrow \texttt{shared} \rightarrow \texttt{@opsflow/ui} \rightarrow \texttt{@opsflow/domain}$$

---

## 🎨 Design System: Atelier Monolith

- **Superfícies Carbono Fosco (`Zero Blur Stacking Traps`):**
  - Canvas base `#131313`, containers `#0e0e0e` / `#171717` e popovers `#1b1b1b` com bordas arquitetônicas de `1px` (`rgba(68, 71, 72, 0.45)`).
  - Eliminação deliberada de `backdrop-filter: blur()` em painéis intermediários para evitar a criação acidental de contextos de empilhamento (*stacking contexts*) que ocultavam menus suspensos e para garantir pintura de GPU a **60fps**.
- **Semântica Cromática Confortável (Matte Pastel):**
  - **Sucesso / Resolvido / No Prazo:** `#6ee7b7` sobre `#12261e`
  - **Triagem / Aberto / Info:** `#7dd3fc` sobre `#14222e`
  - **Em Atendimento:** `#a5b4fc` sobre `#191c33`
  - **Alerta / Aguardando / Alta Prioridade:** `#fcd34d` sobre `#292112`
  - **Crítico / SLA Vencido:** `#fda4af` sobre `#291518`
- **Tipografia Técnica:**
  - **Display & Wordmark (`OPSFLOW`):** `Space Grotesk`
  - **Corpo de Interface & Leitura:** `Geist`
  - **Códigos (`#00101`), Timestamps, Badges e Métricas:** `Geist Mono` / `JetBrains Mono`

---

## ⚙️ Funcionalidades & Regras de Domínio

1. **Autenticação & Troca Rápida de Persona Multi-Tenant (`login` / `switch-profile`):**
   - Acesso via credenciais corporativas ou seletores rápidos de perfil (`ADMIN`, `TÉCNICO`, `COLABORADOR`) e alternância dinâmica entre organizações (*tenants* `Acme Cloud Solutions` e `Globex FinTech S.A.`) com isolamento estrito por `companyId`.
2. **Dashboard Operacional & Fila de Triagem (`dashboard`):**
   - KPIs em tempo real (Pendentes, Resolvidos, Fila de Triagem e Taxa de Conformidade de SLA).
   - Gráfico de barras de volume semanal e gráfico de rosca (*SVG Donut*) de distribuição por status.
   - Ação rápida **Assumir** que atribui o chamado ao operador logado e já inicia o atendimento (`IN_PROGRESS`).
3. **Gestão de Chamados & Máquina de Estados (`ticket-list` / `ticket-detail`):**
   - Filtros combinados por escopo (`ALL`, `ASSIGNED_TO_ME`, `CREATED_BY_ME`, `SLA_ATTENTION`), status, prioridade e busca textual por código/título.
   - Transições formais (`OPEN` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `WAITING_USER` $\rightarrow$ `RESOLVED` $\rightarrow$ `CLOSED` / `CANCELLED`) com validação de responsável obrigatório antes do início do atendimento e resumo de solução obrigatório ao resolver.
   - Recálculo dinâmico de `dueAt` ao alterar prioridade preservando `originalDueAt` para auditoria.
   - Conversação em tempo real com suporte a **Notas Internas** (`internal = true`), visíveis apenas para `ADMIN` e `TECHNICIAN`.
4. **Catálogo de Categorias, Equipe e Auditoria (`categories` / `team-members` / `activity-log`):**
   - Criação, pausa/reativação e arquivamento lógico (*soft delete*) de categorias.
   - Gestão de membros da equipe com múltiplos perfis RBAC (`EMPLOYEE`, `TECHNICIAN`, `ADMIN`).
   - Trilha de auditoria cronológica por organização.
5. **Perfil do Usuário, Segurança & Motor de Personalização Visual (`profile`):**
   - **Avatar com Blur-Up & Preloading:** Transição suave com crossfade de placeholder SVG em baixa resolução para foto de alta definição com fallback de iniciais tipográficas.
   - **Segurança & Medidor NIST 800-63B:** Validação em tempo real de entropia e força de credenciais (8+ caracteres, maiúsculas, minúsculas, numerais e símbolos) com feedback visual de 4 níveis.
   - **Dados Cadastrais & Optimistic UI:** Edição instantânea de nome, setor e organização ativa (*tenant*) com feedback otimista e selo SSO corporativo.
   - **Motor de Dynamic-Theming & Sandbox Pattern:**
     - 5 presets arquitetônicos (*Atelier Carbon*, *Obsidian Slate*, *Midnight Sky*, *Cyber Amber*, *Emerald Matrix*), 7 acentos semânticos e 3 densidades de interface (`compact`, `comfortable`, `spacious`).
     - **Multi-Layer Background Stacking:** Comutação interativa de camadas de profundidade (*Base Solid*, *Blueprint Grid*, *Ambient Glow*, *Film Noise Texture*).
     - **Adaptive Glassmorphism & Luminância Relativa ($L$):** Sliders de translucidez de vidro (0 a 40%) com cálculo matemático de luminância relativa WCAG ($L = 0.2126R + 0.7152G + 0.0722B$) e taxa de contraste WCAG AAA.
     - **Edge-Bleed Scaling:** Banner de capa com zoom interativo, máscara degradê e grid arquitetônico responsivo.
     - **Draft State / Sandbox Pattern:** Ambiente isolado de pré-visualização em tempo real de cards e formulários antes de aplicar ou descartar as alterações para as variáveis CSS globais do sistema.

---

## ⚡ Desempenho (Performance) & SEO

- **Code Splitting Manual (`vite.config.ts`):** Separação automática do build em chunks independentes e cacheáveis (`vendor-react`, `vendor-icons`, `opsflow-domain`, `opsflow-ui` e `index`), reduzindo o bundle da aplicação para **`18.77 kB` gzip**.
- **Otimização de LCP & Zero CLS:** Imagem hero na tela de Login renderizada via `<img>` nativa com `fetchPriority="high"`, `decoding="async"` e dimensões intrínsecas (`1200x720`).
- **SEO Estático & Dinâmico:**
  - Meta tags completas, **Open Graph**, **Twitter Cards**, **Schema.org (`JSON-LD` `SoftwareApplication`)**, `robots.txt` e `site.webmanifest`.
  - Sincronização dinâmica de `document.title`, `meta[name="description"]` e `og:title` a cada transição de rota via [`updateDocumentMeta`](src/shared/lib/seo.ts).

---

## 🧪 Testes Automatizados

O projeto conta com **3 suítes e 13 testes de integração, performance, SEO e Sandbox de temas** (Vitest + React Testing Library):

- `src/__tests__/app.integration.test.tsx`: Fluxo de login, navegação sem quebras na Sidebar, elevação de camada `z-50` nos dropdowns de Status/Prioridade e restrições RBAC por perfil.
- `src/__tests__/performance-seo.test.tsx`: Sincronização de metadados SEO por rota, auditoria de atributos LCP/landmarks HTML5, **Performance Budgets** (`< 50ms` para filtragem, `< 100ms` para transição de rota) e validação estática de `index.html`, `robots.txt` e `site.webmanifest`.
- `src/__tests__/profile.integration.test.tsx`: Navegação até "Meu Perfil", renderização de cabeçalho Edge-Bleed e Avatar Blur-Up, atualizações otimistas (Optimistic UI) de cadastro, cálculo de entropia de senha NIST 800-63B e Draft State / Sandbox de temas com injeção de tokens CSS e cálculo WCAG de luminância relativa.

---

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento (http://localhost:5173)
npm run dev

# Executar suítes de testes automatizados (Integração + Performance + SEO)
npm run test

# Gerar build de produção com checagem estrita de tipos
npm run build
```
