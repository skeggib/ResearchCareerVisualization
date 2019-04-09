FROM node

RUN apt update -y
RUN apt install -y nginx

RUN npm i -g typescript
COPY package.json /app/
COPY package-lock.json /app/

WORKDIR /app
RUN npm i

COPY data/ /app/data
COPY tsconfig.json /app/
COPY definitions/ /app/definitions
COPY index.html /app/
COPY sketch/ /app/sketch

RUN tsc

RUN cp index.html /var/www/html/
RUN cp -r build /var/www/html/
RUN cp -r data /var/www/html/

CMD ["nginx", "-g", "daemon off;"]
