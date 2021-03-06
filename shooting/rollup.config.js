// rollup.config.js

import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default 
{
      input: './current/src/js/index.js',
      plugins: [
        nodeResolve({ jsnext: true }),
        commonjs()
      ],
      external:[
        'sharp','electron','events'
      ],
      output: {
        file: './current/build/index.js',
        format: 'iife'
      }
  
};
