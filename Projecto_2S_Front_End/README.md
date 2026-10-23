# Anúncios Tuga — frontend

Interface web da aplicação, construída com React 19 e Vite.

## Requisitos

Node.js e npm.

## Instalação

Instale as dependências de cada aplicação uma vez:

```powershell
cd Projecto_2S_Front_End
npm install
cd ..\Projecto_2S_Back_End
npm install
```

## Desenvolvimento integrado

A partir de `Projecto_2S_Front_End`, execute:

```powershell
npm run build
```

Este comando inicia o frontend Vite e a API backend em simultâneo. Para terminar os dois, prima `Ctrl+C`.

Para iniciar os serviços com um nome mais explícito, também pode executar `npm run start:all`.

## Build de produção

O comando que gera os ficheiros otimizados para produção continua disponível separadamente:

```powershell
npm run build:production
```

O código da aplicação está em `src/`, organizado em páginas (`Pages/`), componentes reutilizáveis (`components/`), blocos de interface (`parts/`), recursos gráficos (`assets/`) e serviços (`services/`). A API usada pela interface está configurada em `src/services/api.js`.