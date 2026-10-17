# OpsFlow Web — Multi-Tenant Service Desk & SLA Control Center

Frontend B2B de alta densidade inspirado em **Linear / Vercel / Raycast**, projetado como vitrine interativa para o ecossistema **OpsFlow** (Spring Boot 4.1 + Java 21 + PostgreSQL 17).

## ✨ Destaques Arquiteturais Demonstrados na UI

1. **Isolamento Multi-Tenant (`company_id`) & Proteção Anti-IDOR / BOLA (`T-01` / `RN-003`):**
   - Alterne em tempo real entre empresas (`Acme Cloud Solutions` e `Globex FinTech S.A.`) na barra **Architecture Lab** no rodapé.
   - Simule um ataque Cross-Tenant (`GET /api/v1/tickets/{id}` de outra empresa) e veja o retorno estrito **HTTP 404 Not Found** (`application/problem+json`).
2. **Máquina de Estados Formal (`RN-012` a `RN-016`):**
   - Transições estritas (`OPEN` → `IN_PROGRESS` → `WAITING_USER` → `RESOLVED` → `CLOSED` / `CANCELLED`).
   - Exigência de técnico atribuído antes de `IN_PROGRESS` (`RN-014` — HTTP 422).
   - Exigência de `resolution_summary` ao transitar para `RESOLVED` (`RN-015` — HTTP 422).
   - Imutabilidade de estados terminais (`CLOSED` e `CANCELLED` — `RN-013`).
3. **Concorrência Otimista (`@Version` / HTTP 409 Conflict):**
   - Teste na tela de detalhe do chamado o botão **"⚡ Simular Edição Concorrente (@Version +1)"** e tente salvar uma alteração com versão defasada para inspecionar o payload RFC 9457 de conflito otimista.
4. **SLA Dinâmico & Preservação de Prazo Original (`DEC-06` / `RN-018`):**
   - Ao alterar a prioridade de um chamado, `due_at` é recalculado a partir de `created_at` mantendo `original_due_at` intacto para auditoria.
5. **Notas Internas Restritas (`RN-020`):**
   - Comentários marcados com `internal = true` aparecem destacados em âmbar para `TECHNICIAN` e `ADMIN`, mas jamais são serializados quando a persona ativa é `EMPLOYEE`.
6. **Índice Único Parcial & Soft Delete (`DEC-02` / `RN-010`) + Anonimização LGPD (`DEC-03`) + Reuso de Refresh Token (`T-04`):**
   - Crie categorias com mesmo nome de categorias deletadas (`WHERE deleted_at IS NULL`), anonimize usuários preservando FKs históricas e simule roubo/reuso de Refresh Token rotacionado revogando toda a `family_id`.

## 🚀 Como Executar

```bash
npm install
npm run dev
```

