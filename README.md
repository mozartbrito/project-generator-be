# Guia de Instalação do Backend do Generator Project

Este guia irá orientá-lo através do processo de configuração do componente backend do projeto Generator Project.

## Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (normalmente vem com o Node.js)
- Git
- SQLite (para a base de dados)

## Passos de Instalação

1. Clone o repositório do backend:
   ```
   git clone https://github.com/mozartbrito/project-generator-be.git
   cd project-generator-be
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Crie um ficheiro `.env` no diretório raiz do backend e adicione o seguinte:
   ```
   PORT=3001
   JWT_SECRET=sua_chave_secreta_jwt_aqui
   OPENAI_API_KEY=sua_chave_api_openai_aqui
   ```

   Substitua `sua_chave_secreta_jwt_aqui` por uma cadeia de caracteres aleatória segura e `sua_chave_api_openai_aqui` pela sua chave API real da OpenAI.

4. Configure a base de dados:
   ```
   npm run setup-db
   ```

   Este comando irá criar a base de dados SQLite e executar as migrações iniciais.

5. Inicie o servidor backend:
   ```
   npm start
   ```

   O backend deverá agora estar a funcionar em `http://localhost:3001`.

## Verificação da Instalação

1. Abra um navegador ou use uma ferramenta como o Postman.
2. Faça um pedido GET para `http://localhost:3001/api`.
3. Deverá receber uma resposta com o status 404 e uma mensagem `Cannot GET /api` indicando que o servidor está a funcionar.

## Resolução de Problemas

- Se encontrar erros relacionados com módulos em falta, execute `npm install` novamente.
- Certifique-se de que o ficheiro `.env` está configurado corretamente com todas as variáveis necessárias.
- Se ocorrerem erros relacionados com a base de dados, verifique se o SQLite está instalado corretamente no seu sistema.
- Para problemas com a API da OpenAI, verifique se a sua chave API é válida e está corretamente configurada no ficheiro `.env`.

Se continuar a experienciar problemas, por favor, verifique o rastreador de problemas do projeto no GitHub ou entre em contacto com os responsáveis pelo projeto para obter assistência.