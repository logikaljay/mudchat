#FROM    centos:centos6
FROM node:latest

# Enable EPEL for Node.js
#RUN     rpm -Uvh http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm
# Install Node.js and npm
#RUN     yum install -y npm

EXPOSE 4050
COPY . /src
CMD node /src/test/server.js
