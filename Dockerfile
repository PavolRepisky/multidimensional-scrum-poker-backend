FROM node:18

WORKDIR /usr/src/app

COPY ["package*.json", ".env", "./"]
RUN npm install

COPY prisma/schema.prisma ./prisma/
RUN npx prisma generate

COPY . .

RUN npm run build

CMD [ "npm", "start" ]