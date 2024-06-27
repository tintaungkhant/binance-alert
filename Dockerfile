FROM node:alpine

WORKDIR /app

RUN apk add --no-cache \
    bash \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont;

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package*.json ./

RUN npm install
RUN npm install pm2 -g

COPY . .

COPY .env.docker .env

CMD [ "sh", "run.sh" ]