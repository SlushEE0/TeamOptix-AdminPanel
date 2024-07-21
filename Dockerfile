FROM node:22-bookworm-slim 

RUN apt-get -y update && \
  apt-get install
RUN npm install -g bun

WORKDIR /adminpanel

COPY package.json bun.lockb ./
RUN bun install

COPY . .

RUN bun run build

CMD [ "npm", "run", "start" ]

EXPOSE 3000