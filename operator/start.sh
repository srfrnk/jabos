#! /bin/sh

if [ "true" = "${IS_PRODUCTION}" ]; then
  npx nodemon index.ts
else
  npx nodemon --exec "node --inspect=0.0.0.0:${DEBUG_PORT} --require ts-node/register index.ts"
fi
