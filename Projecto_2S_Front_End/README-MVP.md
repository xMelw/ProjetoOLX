# Organização MVP do frontend

O frontend está organizado em três camadas dentro de `src/`:

- `views/`: páginas e componentes React responsáveis por apresentar a interface e encaminhar eventos do utilizador.
- `presenters/`: hooks `use*Presenter` que coordenam carregamento, estado de apresentação, navegação e ações usadas pelas views.
- `models/`: acesso à API e operações de domínio. `apiClient.js` centraliza a configuração HTTP; os restantes models agrupam operações por domínio.

Fluxo habitual: uma view chama um presenter; o presenter chama um model; o model usa `apiClient.js` para comunicar com o backend. Assim, as views não importam o cliente HTTP diretamente.

Para acrescentar uma funcionalidade, cria ou atualiza as operações no model correspondente, coordena estado e ações no presenter e mantém a marcação/estilos na view.
