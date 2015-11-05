FROM node:latest

EXPOSE 4050
COPY . /src
CMD node /src/test/server.js
