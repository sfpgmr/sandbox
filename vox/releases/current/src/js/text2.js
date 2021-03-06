'use strict';

// ビットのMSBとLSBを入れ替えるメソッド
function rev(x) {
  x = x & 0xff;
  // 0bitと1bit、2bitと3bit、4bitと5bit、6bitと7ビットの反転
  x = ((x & 0x55) << 1) | ((x >>> 1) & 0x55);
  // 0-1bitと2-3bit、4-5bitと6-7bitの反転
  x = ((x & 0x33) << 2) | ((x >>> 2) & 0x33);
  // 0-3bit、4-7bitの反転
  x = ((x & 0x0F) << 4) | ((x >>> 4) & 0x0F);
  return x;
}

const vs =
  `#version 300 es
precision highp int;
precision highp float;


in vec2 position;
in vec2 texcoord;
out vec2 vtexcoord;

void main()	{
  gl_Position = vec4( position, 0.0,1.0 );
  vtexcoord = texcoord;
}
`;

const fs =
  `#version 300 es
precision highp int;
precision highp float;
precision highp usampler2D;

uniform bool blink;
uniform usampler2D textBuffer;
uniform usampler2D font;
uniform usampler2D pallet;
uniform float vwidth;
uniform float vheight;

in vec2 vtexcoord;
out vec4 out_color;

// 文字表示
vec4 textPlane(void){
  // キャラクタコードを読み出し
  ivec2 bpos = ivec2(gl_FragCoord.xy);//ivec2(int(vtexcoord.x * vwidth),int(vtexcoord.y * vheight));
  ivec2 cpos = ivec2(bpos.x >> 3,bpos.y >> 3);

  uint data = texelFetch(textBuffer,cpos,0).r;
  // char codeの内容
  // blink col bg-col alpha code point
  // bccc 0bbb aaaa aaaa pppp pppp pppp pppp  
  uint cc = data & 0xffffu;
  uint attr = data & 0xffff0000u;

  // 表示対象の文字のビット位置を求める
  uint x = 0x80u >> uint( bpos.x & 7);

  // 表示対象の文字のY位置を求める
  int y = bpos.y & 7;
  
  // 文字色
  // uint ccolor = (attr & 0x70u) >> 4u;
  uint ccolor = texelFetch(pallet,ivec2(int((attr & 0x70000000u) >> 28u),0),0).r;
  //uint ccolor = 0x7u;
 
  float ccg = float((ccolor & 0x4u) >> 2u) ;// bit 6
  float ccr = float((ccolor & 0x2u) >> 1u);// bit 5
  float ccb = float((ccolor & 0x1u));// bit 4

  // ブリンク
  bool attr_blink = (attr & 0x80000000u) > 0u;// bit 3
  
  // 背景色
  uint bgcolor = texelFetch(pallet,ivec2(int((attr & 0x7000000u) >> 24u),0),0).r;

  float bgg = float((bgcolor & 0x4u) >> 2u);// bit 6
  float bgr = float((bgcolor & 0x2u) >> 1u);// bit 5
  float bgb = float((bgcolor & 0x1u));// bit 4

  // フォント読み出し位置
  ivec2 fontpos = ivec2(int(cc & 0xffu),y + int((cc & 0xff00u) >> 5u));
  //vec2 fontpos = vec2(float(cc & 0xffu) / 256.0,float(y + int((cc >> 8u) & 0xffu)) / 2048.0);

  // フォントデータの読み出し
  uint pixByte = texelFetch(font,fontpos,0).r;
  //uint pixByte = texture(font,fontpos).r & 0xffu;
  
  // 指定位置のビットが立っているかチェック
  bool pixBit = (pixByte & x) != 0u;

  // blinkの処理
  if(attr_blink && blink) return vec4(0.0);

  if(pixBit){
    // ビットが立っているときは、文字色を設定
    float alpha = float((attr & 0xff0000u) >> 16u) / 255.0;
    return vec4(ccr,ccg,ccb,alpha);
  }

  // ビットが立っていないときは背景色を設定
  float alpha = (bgg + bgr + bgb) == 0.0 ? 0.0 : float((attr & 0xff0000u) >> 16u) / 255.0;
  if(alpha == 0.0) discard;
  return vec4(bgr,bgg,bgb,alpha);
  return vec4(0.0);
}

void main(){
  out_color = textPlane();
}
 
`;

/// テキストプレーン
export default class TextPlane {
  constructor(gl2, vwidth = 320, vheight = 200,textBitmap) {

    this.gl2 = gl2;
    const gl = this.gl = gl2.gl;

    this.charSize = 8;/* 文字サイズ pixel */

    this.vwidth = vwidth;
    this.vheight = vheight;

    this.twidth = vwidth / this.charSize;// テキストの横の文字数
    this.theight = vheight / this.charSize;// テキストの縦の文字数

    this.blinkCount = 0;// ブリンク制御用
    this.blink = false;// ブリンク制御用

    this.textBuffer = new Uint32Array(this.twidth * this.theight);// テキスト/アトリビュートVRAM
    // テスト用
    // const s = '０１２３４５６７８９０美咲フォントで表示してみた！ABCDEFGHIJKLMNOPQRSTUVWXYZ!ＡＢＣＤＥＦ漢字もそれなりに表示できる.';
    // let si = 0;

    // for(let i = 0,e =this.textBuffer.length;i < e;++i){
    //   const c = ((i & 7) << 28) + ((7 - (i & 7)) << 24) /*+ (((i + (i / this.twidth)) & 1) << 31)*/ + (((i + 0x50) & 0xff ) << 16) ;
    //   this.textBuffer[i] = s.codePointAt(si++) | c;
    //   if(si >= s.length){
    //     si = 0;
    //   }
    // }

    class TextTexture {
      constructor({ location, unitNo = 0, cpubuffer, width, height, internalFormat = gl.R8UI, format = gl.RED_INTEGER, type = gl.UNSIGNED_BYTE, sampler = null }) {
        this.location = location;
        this.unitNo = unitNo;
        this.width = width;
        this.height = height;
        this.cpubuffer = cpubuffer;
        this.texture = gl.createTexture();
        this.internalFormat = internalFormat;
        this.format = format;
        this.type = type;
        this.sampler = sampler || (() => {
          const s = gl.createSampler();
          gl.samplerParameteri(s, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          gl.samplerParameteri(s, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          return s;
        })();

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, cpubuffer);
        gl.bindTexture(gl.TEXTURE_2D, null);
      }

      bind() {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
      }

      unbind() {
        gl.bindTexture(gl.TEXTURE_2D, null);
      }

      update() {
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.width, this.height, this.format, this.type, this.cpubuffer, 0);
      }

      activate() {
        gl.activeTexture(gl.TEXTURE0 + this.unitNo);
        this.bind();
        gl.bindSampler(this.unitNo, this.sampler);
        gl.uniform1i(this.location, this.unitNo);
      }

    }

    // シェーダーのセットアップ

    // this.programInfo = twgl.createProgramInfo(gl,[vs,fs]);
    const program = this.program = gl2.createProgram(vs, fs);
    gl.useProgram(program);

    this.positionLocation = gl.getAttribLocation(program, 'position');
    this.texcoordLocation = gl.getAttribLocation(program, 'texcoord');

    // VAOのセットアップ
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    // Text用ジオメトリのセットアップ //
    // インターリーブ形式
    this.bufferData = new Float32Array([
      // pos  texcoord
      -1.0, 1.0, 0.0, 1.0,
      1.0, 1.0, 1.0, 1.0,
      -1.0, -1.0, 0.0, 0.0,
      1.0, -1.0, 1.0, 0.0
    ]);

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.bufferData, gl.STATIC_DRAW);
    const positionSize = this.positionSize = 2;
    const texcoordSize = this.texcoordSize = 2;
    const stride = this.stride = this.bufferData.BYTES_PER_ELEMENT * (positionSize + texcoordSize);
    const positionOffset = this.positionOffset = 0;
    const texcoordOffset = this.texcoordOffset = positionSize * this.bufferData.BYTES_PER_ELEMENT;

    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, positionSize, gl.FLOAT, true, stride, positionOffset);

    gl.enableVertexAttribArray(this.texcoordLocation);
    gl.vertexAttribPointer(this.texcoordLocation, texcoordSize, gl.FLOAT, true, stride, texcoordOffset);

    this.ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 2, 1, 2, 3, 1]), gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    // Uniform変数

    this.blinkLocation = gl.getUniformLocation(program, 'blink');
    this.textBufferLocation = gl.getUniformLocation(program, 'textBuffer');
    this.fontLocation = gl.getUniformLocation(program, 'font');
    this.palletLocation = gl.getUniformLocation(program, 'pallet');
    this.vwidthLocation = gl.getUniformLocation(program, 'vwidth');
    this.vheightLocation = gl.getUniformLocation(program, 'vheight');

    // GPUにテキスト用VRAMを渡すためのテクスチャを作る
    this.textBufferTexture = new TextTexture({
       location: this.textBufferLocation,
       unitNo: 0, 
       cpubuffer: this.textBuffer, 
       width: this.twidth, 
       height: this.theight,
       internalFormat:gl.R32UI, 
       format:gl.RED_INTEGER, 
       type:gl.UNSIGNED_INT

    });

    // フォントのセットアップ
    this.fontTexWidth = 256;//256 * 8
    this.fontTexHeight = textBitmap.length / 256 | 0;
    this.fontBuffer = textBitmap;

    // フォント用テクスチャの生成

    this.textFontTexture = new TextTexture({ location: this.fontLocation, unitNo: 2, cpubuffer: this.fontBuffer, width: this.fontTexWidth, height: this.fontTexHeight });

    // パレットのセットアップ
    this.pallet = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);

    this.palletTexture = new TextTexture({ location: this.palletLocation, unitNo: 3, cpubuffer: this.pallet, width: this.pallet.length, height: 1 });

    this.sy = 0;//描画開始スタート位置

    //this.cls();
  }

  /// 画面消去
  cls() {
    this.textBuffer.fill(0);
    this.needsUpdate = true;
  }

  // print(x, y, str, blink = false, color = 7, bgcolor = 0) {

  //   let { chars, attrs } = this.convertStr(str);

  //   if (x == this.CENTER) {
  //     // センタリング
  //     x = ((this.twidth - chars.length) / 2 + .5) | 0;
  //   } else if (x == this.LEFT) {
  //     // 左寄せ
  //     x = 0;
  //   } else if (x == this.RIGHT) {
  //     // 右寄せ
  //     x = this.twidth - chars.length;
  //   }

  //   let offset = x + y * this.twidth;
  //   const attr = color << 4 | bgcolor | (blink ? 0x8 : 0);


  //   for (let i = 0, e = chars.length; i < e; ++i) {

  //     let code = chars[i];
  //     if (code == 0xa) {
  //       y = this.addY(y);
  //       offset = y * this.twidth;
  //     }

  //     this.textBuffer[offset] = chars[i];
  //     this.attrBuffer[offset] = attr | attrs[i];

  //     ++offset;
  //     ++x;
  //     if (x == this.twidth) {
  //       x = 0;
  //       y = this.addY(y);
  //       offset = x + y * this.twidth;
  //     }
  //   }

  //   this.needsUpdate = true;


  // }

  // addY(y) {
  //   ++y;
  //   if (y == this.theight) {
  //     this.scroll();
  //     y = this.theight - 1;
  //   }
  //   return y;
  // }

  // scroll() {
  //   for (let y = (this.theight - 1) * this.twidth, ey = this.twidth; y > ey; ey += this.twidth) {
  //     const desty = y - this.twidth;
  //     for (let x = 0, ex = this.twidth; x < ex; ++x) {
  //       this.textBuffer[x + desty] = this.textBuffer[x + y];
  //       this.attrBuffer[x + desty] = this.attrBuffer[x + y];
  //     }
  //   }
  // }

  // fillText(x, y, w, h, str, blink = false, color = 7, bgcolor = 0, fillSpace = true) {

  //   let { chars, attrs } = this.convertStr(str);

  //   let end = w * h;

  //   const attr = color << 4 | bgcolor | (blink ? 0x8 : 0);

  //   if (fillSpace && chars.length < end) {
  //     while (chars.length <= end) {
  //       chars.push(0x00);
  //       attrs.push(attr);
  //     }
  //   }

  //   let spos = 0;
  //   end = chars.length;

  //   let cx = x, cy = y;
  //   let o = cy * this.twidth;
  //   while (spos <= end) {
  //     let code = chars[spos];
  //     if (code == 0xa) {
  //       ++cy;
  //       o = cy * this.twidth;
  //     } else {
  //       this.textBuffer[cx + o] = chars[spos];
  //       this.attrBuffer[cx + o] = attr | attrs[spos];
  //     }
  //     ++cx;
  //     if (cx > (x + w)) {
  //       cx = x;
  //       ++cy;
  //       o = cy * this.twidth;
  //     }
  //     ++spos;
  //   }

  //   this.needsUpdate = true;

  // }

  /// テキストデータをもとにテクスチャーに描画する
  render() {
    const gl = this.gl;
    // const ctx = this.ctx;
    this.blinkCount = (this.blinkCount + 1) & 0xf;
    if (!this.blinkCount) {
      this.blink = !this.blink;
      for(let i = 0;i < 8;++i){
        this.pallet[i] =  (this.pallet[i] + 1) & 7;
      }
      this.needsUpdate = true;
    }
    //this.uniforms.blink = this.blink;
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    if (this.needsUpdate) {
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      this.textBufferTexture.bind();
      this.textBufferTexture.update();
      // this.textAttrTexture.bind();
      // this.textAttrTexture.update();
      this.palletTexture.bind();
      this.palletTexture.update();
      this.textFontTexture.bind();
      this.textFontTexture.update();
      this.palletTexture.unbind();
    }


    gl.uniform1f(this.blinkLocation, this.blink);
    gl.uniform1f(this.vwidthLocation, this.vwidth);
    gl.uniform1f(this.vheightLocation, this.vheight);

    this.textBufferTexture.activate();
//    this.textAttrTexture.activate();
    this.textFontTexture.activate();
    this.palletTexture.activate();

    // twgl.setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo);
    // twgl.setUniforms(this.programInfo, this.uniforms);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
    this.needsUpdate = false;

  }
}

TextPlane.prototype.CENTER = Symbol('Center');
TextPlane.prototype.LEFT = Symbol('LEFT');
TextPlane.prototype.RIGHT = Symbol('RIGHT');

