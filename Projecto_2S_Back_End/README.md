## Organização MVC

- `routes/` declara os endpoints e liga-os aos controllers.
- `controllers/` trata pedidos HTTP, valida entradas e define respostas.
- `models/` concentra o acesso e as consultas à base de dados.
- `middleware/` contém autenticação e configuração de uploads.
- `utils/` contém utilitários partilhados, como o wrapper de erros assíncronos.
- `database.js` é a infraestrutura SQLite e inicializa o schema e os dados de demonstração.
- `app.js` configura a aplicação Express; `server.js` inicializa a base de dados e inicia o servidor.

O frontend segue as mesmas responsabilidades em `src/models`, `src/controllers` e `src/views`.