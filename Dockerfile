FROM node:22-alpine

RUN apk add --no-cache python3 py3-pip openjdk17-jre-headless openjdk17-jdk

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

CMD ["sh", "-c", "npx prisma db push --accept-data-loss 2>/dev/null; npx prisma migrate resolve --rolled-back 20260308040000_add_practice_testcases 2>/dev/null; npx prisma migrate deploy || echo 'Migration warning: deploy returned non-zero'; npm start"]
