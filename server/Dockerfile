FROM node:24-alpine
LABEL org.opencontainers.image.source=https://github.com/ELEC50009-InfoProc-Team1/pc-server
WORKDIR /usr/local/pc

COPY . .
RUN ls
RUN rm -rf server/public
RUN mkdir server/public

WORKDIR /usr/local/pc/client
RUN npm ci
RUN npm run build

WORKDIR /usr/local/pc/server
RUN npm ci
RUN npm run build

EXPOSE 3000

WORKDIR /usr/local/pc
RUN cp -r client/build/client/* server/public/
RUN mv server/public/index.html server/index.html

WORKDIR /usr/local/pc/server
RUN chmod 444 build
RUN chmod 444 public

RUN addgroup -S appgroup && adduser -D -S app -G appgroup
USER app

CMD ["npm", "run", "start"]
