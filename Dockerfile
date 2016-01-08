FROM node:0.10

RUN npm install -g -q protractor

WORKDIR /usr/src/app

COPY package.json bower.json .bowerrc .npmrc ./

RUN npm install

COPY . ./

ENV PORT 8000

EXPOSE 8000

CMD [ "npm", "start" ]
