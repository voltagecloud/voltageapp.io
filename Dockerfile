FROM node:alpine

WORKDIR /app

ADD . ./

RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++ \
    && yarn \
    && apk del .gyp

CMD ["yarn", "dev"]