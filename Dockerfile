FROM node:0.10

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
RUN npm install

# Minify + concat
# RUN ./node_modules/.bin/grunt requirejs

ENV PORT 8000

EXPOSE 8000

CMD [ "npm", "start" ]
