# Anúncios Tuga

Aplicação de anúncios com frontend React/Vite e API Express/SQLite.

## Arquitetura MVC

- `Projecto_2S_Front_End/src/models/` contém os clientes e operações de acesso à API.
- `Projecto_2S_Front_End/src/controllers/` contém hooks e controladores que ligam modelos ao estado e às ações da interface.
- `Projecto_2S_Front_End/src/views/` contém páginas, componentes e recursos visuais React. As views comunicam com controllers; não importam models diretamente.
- `Projecto_2S_Back_End/routes/` declara endpoints; `controllers/` valida pedidos e prepara respostas; `models/` contém acesso SQL e regras de persistência.
- `middleware/` trata autenticação e uploads. `database.js` é infraestrutura para SQLite, schema e carga inicial; `app.js` compõe a API e `server.js` inicia-a.

Frontend e backend mantêm os seus `package.json` e comandos próprios. Consulte os README de cada aplicação para instruções de execução.