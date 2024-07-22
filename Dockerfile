FROM node:22-bookworm-slim 
# FROM oven/bun:latest

RUN apt-get -y update && \
  apt-get install
RUN npm install -g bun

WORKDIR /app

COPY package*.json ./
RUN bun install

COPY . .

RUN bun run build

CMD [ "npm", "run", "start" ]

EXPOSE 3000