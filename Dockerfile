FROM node:22-alpine

RUN apk add --no-cache python3 py3-pip openjdk17-jre-headless openjdk17-jdk g++ go rust cargo

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

CMD ["sh", "-c", "npx prisma migrate resolve --applied 20260308040000_add_practice_testcases 2>/dev/null; npx prisma migrate resolve --applied 20260310100000_gamification_and_schools 2>/dev/null; npx prisma migrate resolve --applied 20260320000000_add_razorpay_and_launch_offer 2>/dev/null; npx prisma migrate deploy || echo 'Migration warning: deploy returned non-zero'; node server.js"]
