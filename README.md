# Sistema de Reserva de Salas — SENAC GDF

[![Banner](https://via.placeholder.com/1200x400/0A2540/00D4FF?text=Sistema+de+Reserva+de+Salas+SENAC+GDF)](https://github.com/Starkbr264/reserva-de-sala)

Uma aplicação web completa para gerenciar a reserva e ocupação de salas nas unidades do **SENAC Distrito Federal**.

Desenvolvido como projeto final do curso **Técnico em Desenvolvimento de Sistemas** no Senac.

---

## ✨ Funcionalidades Principais

- **Múltiplos perfis de usuário**: Administrador, Coordenador, Instrutor e Recepção
- Mapa de salas em tempo real com status colorido (🟢 Livre / 🔴 Ocupada / 🟡 Em breve)
- Cadastro de salas, turmas, reservas recorrentes e chaves físicas
- Detecção automática de conflitos de reserva
- Fluxo de solicitações de sala com aprovação
- Pesquisa avançada + filtros em todas as telas
- Tema claro/escuro (preferência salva automaticamente)
- Funciona 100% offline com `localStorage`

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** + **CSS3** (Flexbox, Grid, variáveis CSS)
- **JavaScript Vanilla** (sem frameworks)
- `localStorage` para persistência de dados
- Sistema de Seed com dados reais de 10 unidades do SENAC-DF

---

## 🚀 Como Executar o Projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/Starkbr264/reserva-de-sala.git
