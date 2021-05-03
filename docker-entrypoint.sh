#!/bin/sh

nginx

export NODE_ENV=production

node /app/build/server.js
