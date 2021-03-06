//The MIT License (MIT)
//
//Copyright (c) 2015 Satoshi Fujiwara
//
//Permission is hereby granted, free of charge, to any person obtaining a copy
//of this software and associated documentation files (the "Software"), to deal
//in the Software without restriction, including without limitation the rights
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//copies of the Software, and to permit persons to whom the Software is
//furnished to do so, subject to the following conditions:
//
//The above copyright notice and this permission notice shall be included in
//all copies or substantial portions of the Software.
//
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//THE SOFTWARE.

// リリース時にはコメントアウトすること

"use strict";

import MiniMasonry from './minimasonry.js';

// window.twttr = (() => {
//   const s = 'script', d = document, id = 'twitter-wjs';
//   var js, fjs = d.getElementsByTagName(s)[0];
//   var t = window.twttr || {};
//   if (d.getElementById(id)) return t;
//   js = d.createElement(s);
//   js.id = id;
//   js.src = "https://platform.twitter.com/widgets.js";
//   fjs.parentNode.insertBefore(js, fjs);
//   t._e = [];
//   t.ready = function (f) {
//     t._e.push(f);
//   };

//   return t;
// })();

let ct = 0;

const masonry = new MiniMasonry({
  container: '.contents',
  minimize: false,
  gutter: 4,
  baseWidth: 460
});

// twttr.ready(() => {
//   // twttr.events.bind('rendered', (e) => {
//   //   ++ct;
//   //   if(ct >= 200){
//   //     const contents = document.querySelector('#contents');
//   //     const tweets = document.querySelectorAll('twitter-widget');
//   //     tweets.forEach(t => {
//   //       t.style.position = 'absolute';
//   //     });
//   //     contents.setAttribute('rendersubtree', '')
//   //   }
//   //   //masonry.layout();
//   // });
// });


  window.addEventListener('load', () => {
    document.getElementById('loading').remove();
    masonry.layout();
    contents.setAttribute('rendersubtree', '');
    //masonry.layout();
    //twttr.events.bind('rendered',masonry.layout.bind(masonry));

  });



