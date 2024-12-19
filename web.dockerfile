# Etapa 1: Build da aplicação usando Node.js
FROM node:20.17 as build

# Definir o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copiar o arquivo package.json e package-lock.json para o contêiner
COPY package.json ./
COPY yarn.lock ./

# Instalar dependências
RUN yarn

# Copiar o restante dos arquivos da aplicação
COPY . .


# Build da aplicação
RUN yarn build:development

# Etapa 2: Configurar o Nginx com os arquivos buildados
FROM nginx:1.27-alpine

# Copiar os arquivos da pasta buildada (dist) para a pasta padrão do nginx
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./default.conf /etc/nginx/conf.d

# Expor a porta 80 para acessar a aplicação via HTTP
EXPOSE 80

# Comando para rodar o nginx
CMD ["nginx", "-g", "daemon off;"]
