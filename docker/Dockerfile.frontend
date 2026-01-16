# Estágio de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY src ./src
COPY public ./public
COPY index.html ./

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM nginx:alpine AS production

# Copiar build do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]