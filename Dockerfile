FROM node:alpine
WORKDIR /btp-5
COPY package.json /btp-5
RUN yarn
COPY . /btp-5
EXPOSE 3000
CMD ["npm","start"]
