FROM node AS build

RUN npm i -g typescript
COPY package.json /app/
COPY package-lock.json /app/

WORKDIR /app
RUN npm i

COPY tsconfig.json /app/
COPY definitions/ /app/definitions
COPY sketch/ /app/sketch

RUN tsc

FROM nginx

COPY lib/ /usr/share/nginx/html/lib
COPY data/ /usr/share/nginx/html/data
COPY img/ /usr/share/nginx/html/img
COPY index.html /usr/share/nginx/html/
COPY about.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/

COPY --from=build /app/build /usr/share/nginx/html/build

CMD ["nginx", "-g", "daemon off;"]
