FROM node:latest

EXPOSE 4050
COPY . /src
CMD node --harmony /src/test/server.js
