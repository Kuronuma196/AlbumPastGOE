# Use Node.js LTS como imagem base
FROM node:18-alpine AS builder

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY src ./src

# Compilar TypeScript
RUN npm run build

# Estágio de produção
FROM node:18-alpine AS production

# Diretório de trabalho
WORKDIR /app

# Instalar dependências de produção
COPY package*.json ./
RUN npm ci --only=production

# Copiar arquivos compilados do estágio builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app

# Mudar para usuário não-root
USER nodejs

# Criar diretório de uploads
RUN mkdir -p uploads && chown nodejs:nodejs uploads

# Porta exposta
EXPOSE 5000

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=5000

# Comando de inicialização
CMD ["node", "dist/index.js"]