FROM node

RUN apt update -y
RUN apt install -y nginx

RUN npm i -g typescript
COPY package.json /app/
COPY package-lock.json /app/

WORKDIR /app
RUN npm i

COPY lib/ /var/www/html/lib
COPY data/ /var/www/html/data
COPY index.html /var/www/html/

COPY tsconfig.json /app/
COPY definitions/ /app/definitions
COPY sketch/ /app/sketch

RUN tsc

RUN cp -r build /var/www/html/

CMD ["nginx", "-g", "daemon off;"]
