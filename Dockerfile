FROM node:12.9.1-buster-slim

ENV DEBUG                       true
ENV PORT                        4020
#ENV https_proxy                 http://ssl-proxy.cs.kadaster.nl:8080

EXPOSE 4020

WORKDIR /myapp
COPY comunica-api/src /myapp/src/
ADD comunica-api/package.json /myapp/
ADD comunica-api/tsconfig.json /myapp/
ADD start_server.sh /myapp/

RUN sed -i -e 's/\r$//' /myapp/start_server.sh #windoze line-endings
RUN chmod +x /myapp/start_server.sh
RUN npm install
CMD ./start_server.sh
