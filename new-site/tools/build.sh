#!/bin/bash
pegjs  --trace --cache -f es ../src/parser/html-parser.pegjs -o ../src/js/html-parser.mjs 
# node ./build-css.mjs
# node ./build-pages.mjs $1
node ./parse-html.mjs ./test/test.html ./test/test.json
# node --inspect-brk ./render-html.mjs ./test/test.json ./test/test-out.html 
# node $1 ./render-html.mjs ./test/test.json ./test/test-out.html 
#node ./build-contents.mjs