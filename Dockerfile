FROM oven/bun:1

RUN apt-get -y update && \
  apt-get install

COPY . /adminpanel
WORKDIR /adminpanel

RUN bun install
RUN bun run build

CMD [ "bun", "run", "start" ]

EXPOSE 443 80 3000