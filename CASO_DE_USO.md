# Caso de Uso — Sistema de Reserva de Salas SENAC-GDF

## 1. Visão Geral do Sistema

O **Sistema de Reserva de Salas SENAC-GDF** é uma aplicação web front-end (HTML + CSS + JavaScript puro) que gerencia a ocupação de salas nas 10 unidades do SENAC no Distrito Federal. Todo o armazenamento é feito via `localStorage` do navegador, sem necessidade de servidor ou banco de dados. A versão v2 inclui dados seed completos para todas as entidades, além de pesquisa e filtros em todas as telas.

---

## 2. Atores

| Ator | Descrição |
|---|---|
| **Administrador** | Usuário fixo (`Senac_GDF@Hotmail.com` / `Senac.DF2007`). Gerencia usuários, unidades e tem visão global de salas, turmas, reservas e chaves de todas as unidades. |
| **Coordenador** | Um por unidade. Cadastra salas, turmas, reservas e atribui instrutores. Senha padrão: `Coord@123`. |
| **Instrutor** | Um por unidade. Visualiza suas turmas, solicita salas e controla retirada/devolução de chaves. Senha padrão: `Inst@123`. |
| **Recepção** | Uma por unidade. Gerencia chaves (criação, controle de retirada) e visualiza o mapa de ocupação das salas. Senha padrão: `Recep@123`. |

---

## 3. Dados Seed (pré-cadastrados no primeiro acesso)

O sistema carrega automaticamente os seguintes dados ao ser aberto pela primeira vez:

- **10 Unidades**: Asa Norte, Asa Sul, Taguatinga, Ceilândia, Gama, Sobradinho, Planaltina, Samambaia, Santa Maria, Águas Claras — todas com endereço e CEP reais do DF.
- **10 Coordenadores** (1 por unidade)
- **10 Instrutores** (1 por unidade)
- **10 Recepcionistas** (1 por unidade)
- **30 Salas** (3 por unidade) — laboratórios de informática, gastronomia, estética, enfermagem, ciências, salas comuns, auditórios, salas de reunião e videoconferência.
- **30 Turmas** (3 por unidade) — cursos técnicos e livres com datas relativas à data atual (ativas, iminentes e posteriores).
- **30 Reservas** (1 por turma) — reservas recorrentes com dias da semana variados.
- **20 Chaves** (2 por unidade) — metade disponível, metade já retirada por instrutores.

---

## 4. Casos de Uso por Ator

### UC-01 — Login
- **Atores**: Todos
- **Fluxo**: O usuário acessa `index.html`, informa e-mail e senha e clica em "Entrar". O sistema valida as credenciais no `localStorage` (ou contra o admin fixo), registra a sessão e redireciona para a tela correspondente ao perfil.
- **Fluxo alternativo**: Se as credenciais estiverem incorretas, exibe mensagem de erro sem redirecionar.

---

### UC-02 — Gerenciar Unidades *(Administrador)*
- **Tela**: `admin.html` → aba Unidades / CPS
- **Funcionalidades**: Criar, editar e excluir unidades (nome, endereço, CEP, cidade).
- **Restrição**: Não é possível excluir uma unidade que tenha usuários vinculados.
- **Pesquisa**: Campo de busca por nome, cidade ou CEP.

---

### UC-03 — Gerenciar Usuários *(Administrador)*
- **Tela**: `admin.html` → aba Usuários
- **Funcionalidades**: Criar, editar, redefinir senha e excluir usuários (coordenadores, instrutores, recepcionistas).
- **Filtros disponíveis**:
  - Filtrar por **perfil** (coordenador / instrutor / recepção)
  - Filtrar por **unidade**
  - Busca textual por nome ou e-mail
- **Restrição**: E-mails devem ser únicos no sistema.

---

### UC-04 — Visão Global *(Administrador)*
- **Tela**: `admin.html` → abas Salas, Turmas, Reservas, Chaves
- **Descrição**: O administrador pode visualizar e pesquisar todos os registros de todas as unidades em uma única tela, sem capacidade de edição (somente leitura).
- **Filtros por aba**:
  - **Salas**: busca textual, filtro por unidade e por tipo de sala
  - **Turmas**: busca textual, filtro por unidade, turno e status (ativa/iminente/posterior/encerrada)
  - **Reservas**: busca textual, filtro por unidade, turno e status
  - **Chaves**: busca textual, filtro por unidade e status (disponível/retirada)

---

### UC-05 — Gerenciar Salas *(Coordenador)*
- **Tela**: `coordenador.html` → aba Salas
- **Funcionalidades**: Criar, editar e excluir salas da própria unidade.
- **Dados da sala**: nome/número, capacidade, tipo, turnos disponíveis (Matutino / Vespertino / Noturno — múltipla escolha).
- **Pesquisa e filtros**: busca por nome ou tipo, filtro por tipo de sala.
- **Restrição**: Não é possível excluir sala com reservas ativas vinculadas.

---

### UC-06 — Gerenciar Turmas *(Coordenador)*
- **Tela**: `coordenador.html` → aba Turmas
- **Funcionalidades**: Criar, editar e excluir turmas.
- **Dados da turma**: código, curso, turno, data de início, data de fim, instrutor responsável.
- **Status calculado automaticamente**: Ativa (já iniciou e não encerrou), Iminente (inicia em até 30 dias), Posterior (início distante) ou Encerrada (data fim no passado).
- **Pesquisa e filtros**: busca por código/curso/instrutor, filtro por turno e status.
- **Restrição**: Ao excluir, as reservas vinculadas também são removidas.

---

### UC-07 — Criar Reserva Recorrente *(Coordenador)*
- **Tela**: `coordenador.html` → aba Reservas
- **Descrição**: Vincula uma sala a uma turma para dias da semana recorrentes dentro de um período definido.
- **Dados da reserva**: sala, turma, turno, dias da semana (seg/ter/qua/qui/sex/sáb — múltipla escolha), data de início e data de fim (não pode ultrapassar a data fim da turma).
- **Validações**:
  - O turno da reserva deve estar disponível na sala selecionada.
  - A data fim não pode ultrapassar a data fim da turma.
  - O sistema detecta **conflitos** de reserva: mesma sala, mesmo turno, dias sobrepostos e períodos que se cruzam.
- **Pesquisa e filtros**: busca por sala/turma, filtro por turno.

---

### UC-08 — Atribuir Instrutor a Turma *(Coordenador)*
- **Tela**: `coordenador.html` → aba Instrutores
- **Descrição**: O coordenador seleciona um instrutor da sua unidade e atribui uma turma a ele.
- **Pesquisa**: busca de instrutor por nome ou e-mail.

---

### UC-09 — Mapa de Ocupação *(Coordenador e Recepção)*
- **Telas**: `coordenador.html` e `recepcao.html` → aba Mapa de Salas
- **Descrição**: Exibe visualmente todas as salas da unidade com status colorido em tempo real:
  - 🟢 **Livre** — sem reserva ativa no dia atual para o dia da semana atual
  - 🔴 **Ocupada** — turma ativa reservada para hoje
  - 🟡 **Em breve** — turma iminente reservada para hoje
- Inclui tabela com reservas dos próximos 14 dias.

---

### UC-10 — Gerenciar Chaves *(Recepção)*
- **Tela**: `recepcao.html` → aba Chaves
- **Descrição**: A recepção cadastra as chaves físicas de cada sala (código, andar) e controla quem as retirou.
- **Funcionalidades**: criar, editar, excluir chaves; registrar retirada (vincula instrutor + horário) e devolução.
- **Pesquisa e filtros**: busca por código/sala/andar/nome do instrutor, filtro por status (disponível/retirada).

---

### UC-11 — Retirar/Devolver Chave *(Instrutor)*
- **Tela**: `instrutor.html` → aba Chaves
- **Descrição**: O instrutor sinaliza que retirou ou devolveu uma chave. O sistema registra o horário e notifica a recepção.

---

### UC-12 — Solicitar Sala *(Instrutor)*
- **Tela**: `instrutor.html` → aba Solicitar Sala
- **Descrição**: O instrutor visualiza as salas disponíveis na unidade e envia uma solicitação de uso avulso ao coordenador (data, turno e motivo).
- **Fluxo**: a solicitação fica pendente até o coordenador aprovar ou recusar, e o instrutor recebe notificação do resultado.

---

### UC-13 — Visualizar Minhas Turmas *(Instrutor)*
- **Tela**: `instrutor.html` → aba Minhas Turmas
- **Descrição**: O instrutor visualiza todas as turmas atribuídas a ele, com sala reservada, status e período.
- **Pesquisa e filtros**: busca por código/curso, filtro por status.

---

### UC-14 — Responder Solicitações *(Coordenador)*
- **Tela**: `coordenador.html` → aba Solicitações
- **Descrição**: O coordenador visualiza as solicitações de sala pendentes de instrutores e as aprova ou recusa. O instrutor recebe notificação automática.

---

### UC-15 — Verificar Disponibilidade *(Coordenador)*
- **Tela**: `dashboard.html` → seção Disponibilidade (painel antigo) ou `coordenador.html` → Mapa
- **Descrição**: Permite selecionar uma sala, turno e data para verificar se há conflito com reservas existentes.

---

## 5. Funcionalidade de Pesquisa e Filtros — Resumo Geral

| Tela / Aba | Busca Textual | Filtros Disponíveis |
|---|---|---|
| Admin → Usuários | Nome, e-mail | Perfil, Unidade |
| Admin → Unidades | Nome, cidade, CEP | — |
| Admin → Salas | Nome, tipo | Unidade, Tipo de sala |
| Admin → Turmas | Código, curso | Unidade, Turno, Status |
| Admin → Reservas | Sala, turma, turno | Unidade, Turno, Status |
| Admin → Chaves | Código, sala, andar | Unidade, Status |
| Coordenador → Salas | Nome, tipo | Tipo de sala |
| Coordenador → Turmas | Código, curso, instrutor | Turno, Status |
| Coordenador → Reservas | Sala, turma | Turno |
| Coordenador → Instrutores | Nome, e-mail | — |
| Recepção → Chaves | Código, sala, andar | Status |
| Instrutor → Turmas | Código, curso | Status |
| Dashboard → Salas | Nome, tipo | Tipo, Turno disponível |
| Dashboard → Turmas | Código, curso | Turno, Status |
| Dashboard → Reservas | Sala, turma, turno | Turno, Status |

Todas as barras incluem botão "Limpar filtros" e contador de resultados em tempo real.

---

## 6. Estrutura de Arquivos

```
Reserva_de_salas_v2/
├── index.html          — Tela de login (roteamento por perfil)
├── admin.html          — Painel do administrador
├── coordenador.html    — Painel do coordenador
├── recepcao.html       — Painel da recepção
├── instrutor.html      — Painel do instrutor
├── dashboard.html      — Painel antigo (salas/turmas/reservas/disponibilidade)
├── login.html          — Alias de login
├── css/
│   ├── style.css       — Estilos principais
│   ├── index.css       — Estilos da tela de login
│   └── search.css      — Estilos das barras de pesquisa e filtros (novo)
├── js/
│   ├── storage.js      — Camada de dados + seed completo (novo)
│   ├── auth.js         — Autenticação e controle de sessão
│   ├── search.js       — Motor de pesquisa e gerador de filtros (novo)
│   ├── admin_page.js   — Lógica do painel admin (com busca)
│   ├── coordenador_page.js — Lógica do painel coordenador (com busca)
│   ├── recepcao_page.js    — Lógica do painel recepção (com busca)
│   ├── instrutor_page.js   — Lógica do painel instrutor (com busca)
│   ├── dashboard_page.js   — Inicialização do dashboard antigo
│   ├── salas.js        — CRUD de salas + busca (dashboard)
│   ├── turmas.js       — CRUD de turmas + busca (dashboard)
│   ├── reservas.js     — CRUD de reservas + busca + conflito
│   └── disponibilidade.js  — Verificação de disponibilidade
└── img/
    └── senac-logo-sem-fundo.webp
```

---

## 7. Fluxo Completo de Uso Típico

1. **Admin** faz login → verifica o dashboard com os contadores → pode pesquisar qualquer usuário/sala/turma/chave por nome em segundos.
2. **Coordenador** (ex: Ana Paula da Asa Norte) faz login → vê o dashboard da unidade → cadastra uma nova sala → cria uma turma → cria a reserva recorrente (o sistema bloqueia conflitos automaticamente) → atribui um instrutor.
3. **Recepção** (ex: Úrsula da Asa Norte) faz login → vê o mapa colorido das salas → cria uma chave nova para o Lab 01 → registra que o instrutor Katia retirou a chave.
4. **Instrutor** (ex: Katia) faz login → vê suas turmas filtradas por "ativas" → confirma a retirada da chave → solicita uma sala avulsa para um dia específico.
5. **Coordenador** recebe notificação da solicitação → aprova → instrutor recebe notificação de aprovação.

---

## 8. Logins de Teste

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | Senac_GDF@Hotmail.com | Senac.DF2007 |
| Coordenador (Asa Norte) | coord.asanorte@senacdf.com | Coord@123 |
| Instrutor (Asa Norte) | katia.barros@senacdf.com | Inst@123 |
| Recepção (Asa Norte) | recep.asanorte@senacdf.com | Recep@123 |
| Coordenador (Taguatinga) | coord.taguatinga@senacdf.com | Coord@123 |
| Instrutor (Ceilândia) | natan.ferreira@senacdf.com | Inst@123 |

> Para resetar todos os dados ao estado inicial, faça login como Administrador e clique em "⚠️ Resetar dados" na barra lateral.
