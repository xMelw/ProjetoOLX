# Anúncios Tuga — API local

Backend novo para a aplicação React, feito com Express e SQLite (`node:sqlite`). Requer Node.js 22.13 ou superior. A base de dados é criada em `data/anuncios-tuga.sqlite` na primeira execução e recebe automaticamente categorias, distritos e dados fictícios de demonstração.

## Iniciar

```powershell
npm install
npm start
```

A API fica em `http://localhost:5000`; a interface Vite pode correr em `http://localhost:5173`. Copie `.env.example` para `.env` se quiser alterar as opções locais.

## Contas de demonstração

As contas ativas partilham a palavra-passe `AnunciosTuga123!`:

- Administração: `ana@example.pt`
- Utilizador: `miguel@example.pt`
- Utilizador: `ines@example.pt`
- Utilizador: `tiago@example.pt`

`carolina@example.pt` é uma conta de demonstração pendente de aprovação. Novos registos também ficam pendentes; o formulário pede nome, email, palavra-passe e telemóvel.

## Dados

O esquema está em `database.js`. Para começar de novo, pare o servidor e remova o ficheiro `data/anuncios-tuga.sqlite` (e os ficheiros `-wal`/`-shm`, se existirem); o servidor volta a criar e semear a base de dados no arranque seguinte. As imagens de demonstração estão em `uploads/`.

As rotas cobrem autenticação, categorias e anúncios, perfil, favoritos, histórico, conversas, feedback e os endpoints usados pelo dashboard administrativo. A sessão usa cookie httpOnly.
