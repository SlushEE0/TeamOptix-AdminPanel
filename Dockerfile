FROM oven/bun:1
COPY . /adminpanel

WORKDIR /adminpanel

RUN bun install
RUN bun run build

CMD [ "bun", "run", "start" ]

EXPOSE 443 80 4000