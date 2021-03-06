'use strict';
import { Node } from './scene.js';
import { mat4, mat3,vec3, vec4 } from './gl-matrix/gl-matrix.js';
import vox from './vox.js';


const vertexShader = `#version 300 es
precision highp float;
precision highp int;

#define d(b,x,y,z) \
if((face & b) > 0u){ \
vec3 f = u_rotate * vec3(x,y,z); \
float e = dot(f,u_eye); \
if(e >  eye_dot){ \
  eye_dot = e; \
  diffuse = dot(f,u_light); \
} \
}

/**********************************************

Vox オブジェクトの表示
(なんちゃって3D)

**********************************************/


// 座標 X,Y,Z
layout(location = 0) in vec3 position;
// カラーと面情報
layout(location = 1) in uint point_attrib;

// フラグメント・シェーダーに渡す変数
flat out uint v_color_index;// 色 インデックス
flat out uint v_pallete_index;
flat out float v_diffuse;//  
flat out vec3 v_ambient;
flat out float v_alpha;

#define root2 1.414213562373095

uniform uint u_attrib;
uniform float u_scale;
uniform mat3 u_rotate;
uniform vec3 u_obj_position;
uniform mat4 u_worldViewProjection; // 変換行列
uniform vec3 u_eye;
uniform vec3 u_light;
uniform vec3 u_ambient;


void main() {
  
  uint face = (point_attrib & 0xffff0000u) >> 16u;

  // 表示位置の計算
  vec4 pos = u_worldViewProjection * vec4( u_rotate * position * u_scale + u_obj_position ,1.0) ;
  //vec4 pos = u_worldViewProjection * vec4(  position  ,1.0) ;
  
  // ライティング用のベクトルを作る
  float diffuse;
  float eye_dot;
  
  d(0x1u,-1.,0.,0.);
  d(0x2u,1.,0.,0.);
  d(0x4u,0.,-1.,0.);
  d(0x8u,0.,1.,0.);
  d(0x10u,0.,0.,-1.);
  d(0x20u,0.,0.,1.);

  v_diffuse = clamp(diffuse * ((512. - pos.z) / 256.0), 0.0, 1.0);
 
  v_color_index  = point_attrib & 0xffu;
  v_pallete_index = u_attrib & 0x1ffu;
 
  v_ambient = u_ambient;
  v_alpha = float((u_attrib & 0x3fc00u) >> 10u) / 255.0;

  gl_Position = pos;
  // セルサイズの計算（今のところかなりいい加減。。）
  gl_PointSize = clamp((256.0 / pos.z) * u_scale * root2,0.0,128.0);
}
`;

const fragmentShader = `#version 300 es
precision highp float;
precision highp int;


// 頂点シェーダーからの情報
flat in uint v_color_index;// 色
flat in uint v_pallete_index;// 色
flat in float v_diffuse;
flat in vec3 v_ambient;
flat in float v_alpha;

uniform sampler2D u_pallete; 

#define root2 1.414213562

// 出力色
out vec4 fcolor;

void main() {
  vec4 color = texelFetch(u_pallete,ivec2(int(v_color_index),int(v_pallete_index)),0) ;
  color = vec4(color.rgb * v_diffuse,color.a);
  color = clamp(color + vec4(v_ambient,0.),0.0,1.0);
  fcolor = vec4(color.rgb, color.a * v_alpha);
}
`;

// プログラムを使いまわすためのキャッシュ
let programCache;

// エンディアンを調べる関数
function checkEndian(buffer = new ArrayBuffer(2)) {

  if (buffer.byteLength == 1) return false;

  const ua = new Uint16Array(buffer);
  const v = new DataView(buffer);
  v.setUint16(0, 1);
  // ArrayBufferとDataViewの読み出し結果が異なればリトル・エンディアンである
  if (ua[0] != v.getUint16()) {
    ua[0] = 0;
    return true;
  }
  ua[0] = 0;
  // ビッグ・エンディアン
  return false;
}

// const voxCharacters = [];

function sign(x){
  return x == 0 ? 0 : ( x > 0 ? 1 : -1);
}

const faces = [
  {x:-1,y:0,z:0,face:1},
  {x:1,y:0,z:0,face:2},
  {x:0,y:-1,z:0,face:4},
  {x:0,y:1,z:0,face:8},
  {x:0,y:0,z:-1,face:16},
  {x:0,y:0,z:1,face:32}
];


export class VoxelModel {
  constructor(voxelData){
   
    const points = [];
    const voxelMap = new Map();
    voxelData.voxels.forEach(d=>{
      let p = vec3.create();
      p[0] = d.x - (voxelData.size.x >> 1);
      p[1] = d.y - (voxelData.size.y >> 1);
      p[2] = d.z - (voxelData.size.z >> 1);
      
      let s = vec3.clone(p);
      vec3.set(s,sign(s[0]),sign(s[1]),sign(s[2]));
      voxelMap.set('x' + p[0] + 'y' + p[1] + 'z' + p[2] , true );
      points.push({point:p,sign:s,color: d.colorIndex});
    });

    this.points = [];

    for(const p of points){
     const openFaces = faces.filter(d=>{
        return !voxelMap.get('x' + (p.point[0] + d.x) + 'y' + (p.point[1] + d.y) + 'z' + (p.point[2] + d.z));
      });

      // 見えないボクセルはスキップする
      if(openFaces.length == 0){
        continue;
      }
      // 
      let openFlag = openFaces.reduce((a,v)=>a|v.face,0);
      p.openFlag = openFlag;
      p.openFaces = openFaces;
      this.points.push(p);
    }

    const colorPallete = [];

    for(const color of voxelData.palette)
    {
      colorPallete.push(color.r);
      colorPallete.push(color.g);
      colorPallete.push(color.b);
      colorPallete.push(color.a);
    }
    // colorPallete[0] = 0;
    // colorPallete[1] = 0;
    // colorPallete[2] = 0;
    // colorPallete[3] = 0;

    this.colorPallete = new Uint8Array(colorPallete);
    this.voxCount = this.points.length;
    this.voxByteCount = this.voxCount * this.POINT_DATA_SIZE;
    this.endian = checkEndian();
  }

  setBuffer(offset,dv)
  {
    for(const p of this.points){
      dv.setFloat32(offset,p.point[0] ,this.endian);
      dv.setFloat32(offset + 4, p.point[1],this.endian);
      dv.setFloat32(offset + 8, p.point[2],this.endian);
      dv.setUint32(offset + 12,p.color | (p.openFlag << 16),this.endian);
      offset += 16;
    }
    return offset;
  }

  static async loadFromUrls(voxelUrls){
    const voxelModels = {};
    const parser = new vox.Parser();
    const models = [];
    let bufferLength = 0;
    for(const url of voxelUrls){
      const data = await parser.parse(url);
      const voxelModel = new VoxelModel(data);
      models.push(voxelModel);
      bufferLength += voxelModel.voxByteCount;
    }

    const buffer = new ArrayBuffer(bufferLength);
    const dv = new DataView(buffer);
    const palletes = new Uint8Array(256 /* pallete */ * 4 /* rgba */ * models.length );
    let offset = 0,poffset = 0,vindex = 0;

    voxelModels.modelInfos = [];
    voxelModels.palletes = palletes;
    voxelModels.buffer = buffer;


    for(let i = 0;i < models.length;++i){
      const data = models[i];
      voxelModels.modelInfos.push(
        {
          index:i,
          vindex:vindex,
          count:data.voxCount
        }
      );
      offset = data.setBuffer(offset,dv);
      vindex += data.voxCount;
      for(let pi = 0;pi < data.colorPallete.length;++pi){
        palletes[poffset++] = data.colorPallete[pi];
      }
    }
    return voxelModels;
  }
}

VoxelModel.prototype.POINT_DATA_SIZE = 4 * 4;

const SIZE_PARAM = 4;
const VOX_OBJ_POS = 0;
const VOX_OBJ_POS_SIZE = 3 * SIZE_PARAM; // vec3
const VOX_OBJ_SCALE = VOX_OBJ_POS + VOX_OBJ_POS_SIZE;
const VOX_OBJ_SCALE_SIZE = SIZE_PARAM; // float
const VOX_OBJ_AXIS = VOX_OBJ_SCALE + VOX_OBJ_SCALE_SIZE;
const VOX_OBJ_AXIS_SIZE = SIZE_PARAM * 3; // vec3
const VOX_OBJ_ANGLE = VOX_OBJ_AXIS + VOX_OBJ_AXIS_SIZE;
const VOX_OBJ_ANGLE_SIZE = SIZE_PARAM * 1; // float
const VOX_OBJ_ATTRIB = VOX_OBJ_ANGLE+ VOX_OBJ_ANGLE_SIZE;
const VOX_OBJ_ATTRIB_SIZE = SIZE_PARAM; // uint
// アトリビュートのビット構成
// v00n nnnn nnnn 00aa aaaa aadc cccc cccc
// v: 1 ... 表示 0 ... 非表示
// n: object No (0-511)
// a: alpha (0-255)
// c: color pallet index (0-511)
// d: use default pallet;
const VOX_MEMORY_STRIDE =  (VOX_OBJ_POS_SIZE + VOX_OBJ_SCALE_SIZE + VOX_OBJ_AXIS_SIZE + VOX_OBJ_ANGLE_SIZE + VOX_OBJ_ATTRIB_SIZE);
const VOX_OBJ_MAX = 256;

const parser = new vox.Parser();
export async function loadVox(path){
  const models = await parser.parse(path);
  return models;
}

function setRotate(mat3 ,angle,  axis){

  const s = Math.sin(angle);
  const c = Math.cos(angle);
  const r = 1.0 - c;

  mat3[0] = axis[0] * axis[0] * r + c; 
  mat3[1] = axis[1] * axis[0] * r + axis[2] * s;
  mat3[2] = axis[2] * axis[0] * r - axis[1] * s;
  mat3[3] = axis[0] * axis[1] * r - axis[2] * s;
  mat3[4] = axis[1] * axis[1] * r + c;
  mat3[5] = axis[2] * axis[1] * r + axis[0] * s;
  mat3[6] = axis[0] * axis[2] * r + axis[1] * s;
  mat3[7] = axis[1] * axis[2] * r - axis[0] * s;
  mat3[8] = axis[2] * axis[2] * r + c;
  return mat3;
}


export class Vox extends Node {
  constructor({ gl2, voxelModels,visible = true,memory,offset}) {
    super();
    // webgl コンテキストの保存
    const gl = this.gl = gl2.gl;
    this.gl2 = gl2;

    //let points = new DataView(new ArrayBuffer(4 * 4 * data.voxels.length));
    this.endian = checkEndian();
    this.voxScreenMemory = new DataView(memory,offset,this.MEMORY_SIZE_NEEDED);
    //his.voxScreenBuffer = new Uint8Array(memory,offset,this.MEMORY_SIZE_NEEDED);
    this.voxelModels = voxelModels;
    this.voxelBuffer = this.voxelModels.buffer;
      
    // スプライト面の表示・非表示
    this.visible = visible;


    // プログラムの生成
    if (!programCache) {
      programCache = gl2.createProgram(vertexShader, fragmentShader);
    }
    const program = this.program = programCache;

    // アトリビュート
    // VAOの生成とバインド
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    // VBOの生成
    this.buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    // VBOにスプライトバッファの内容を転送
    gl.bufferData(gl.ARRAY_BUFFER, this.voxelBuffer, gl.DYNAMIC_DRAW);

    // 属性ロケーションIDの取得と保存
    this.positionLocation = 0;
    this.pointAttribLocation = 1;

    this.stride = 16;

    // 属性の有効化とシェーダー属性とバッファ位置の結び付け
    // 位置
    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, true, this.stride, 0);
    
    // 属性
    gl.enableVertexAttribArray(this.pointAttribLocation);
    gl.vertexAttribIPointer(this.pointAttribLocation, 1, gl.UNSIGNED_INT, this.stride, 12);

    gl.bindVertexArray(null);

    // uniform変数の位置の取得と保存

    // UBO
    // this.objAttrLocation = gl.getUniformBlockIndex(program,'obj_attributes');
    // gl.uniformBlockBinding(program,this.objAttrLocation,0);
    // this.objAttrBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.UNIFORM_BUFFER, this.objAttrBuffer);
    // gl.bufferData(gl.UNIFORM_BUFFER,VOX_MEMORY_STRIDE,gl.DYNAMIC_DRAW);
    // //gl.bufferData(gl.UNIFORM_BUFFER, this.voxScreenMemory.buffer, gl.DYNAMIC_DRAW,0,VOX_MEMORY_STRIDE);
    // gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    // gl.bindBufferBase(gl.UNIFORM_BUFFER,0,this.objAttrBuffer);

    // 
    this.attribLocation = gl.getUniformLocation(program,'u_attrib');
    this.scaleLocation = gl.getUniformLocation(program,'u_scale');
    this.rotateLocation = gl.getUniformLocation(program,'u_rotate');
    this.rotate = mat3.create();
    this.objPositionLocation = gl.getUniformLocation(program,'u_obj_position');


    // ワールド・ビュー変換行列
    this.viewProjectionLocation = gl.getUniformLocation(program,'u_worldViewProjection');
    this.viewProjection = mat4.create();
    this.eyeLocation = gl.getUniformLocation(program,'u_eye');
    this.eye = vec3.create();
    vec3.set(this.eye,0,0,1);
    

    // 平行光源の方向ベクトル
    
    this.lightLocation = gl.getUniformLocation(program,'u_light');
    this.lightDirection = vec3.create();
    vec3.set(this.lightDirection,0,0,1);

    // 環境光
    this.ambient = vec3.create();
    this.ambientLocation = gl.getUniformLocation(program,'u_ambient');
    vec3.set(this.ambient,0.2,0.2,0.2);

    // カラーパレット
    this.palleteTexture = gl.createTexture();
    this.palleteLocation = gl.getUniformLocation(program,'u_pallete');
    
    //gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.bindTexture(gl.TEXTURE_2D, this.palleteTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, this.voxelModels.modelInfos.length, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.voxelModels.palletes);
    gl.bindTexture(gl.TEXTURE_2D, null);

    this.sampler = gl.createSampler();
    gl.samplerParameteri(this.sampler, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.samplerParameteri(this.sampler, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    this.count = 0;
    const vmemory = this.voxScreenMemory;
//    let px = -70,count=1;

//     for(let offset = 0,eo = vmemory.byteLength;offset < eo;offset += VOX_MEMORY_STRIDE){
// //      vmemory.setUint32(offset + VOX_OBJ_ATTRIB,0x8003fc00 | count++ | ((count & 0x3) << 20),this.endian);
//       vmemory.setUint32(offset + VOX_OBJ_ATTRIB,0x8003fc00 | count++ | (0),this.endian);
//       vmemory.setFloat32(offset + VOX_OBJ_SCALE,Math.random() * 1.5,this.endian);
//       vmemory.setFloat32(offset + VOX_OBJ_POS,Math.random() * 192 - 192 / 2,this.endian);
//       vmemory.setFloat32(offset + VOX_OBJ_POS + SIZE_PARAM,Math.random() * 256 - 128,this.endian);
//       vmemory.setFloat32(offset + VOX_OBJ_POS + SIZE_PARAM * 2,Math.random() * 192 ,this.endian);
//       vmemory.setFloat32(offset + VOX_OBJ_ANGLE,count,this.endian);
//     }

 
      
  }

  // スプライトを描画
  render(screen) {
    const gl = this.gl;

    // プログラムの指定
    gl.useProgram(this.program);

    // VoxBufferの内容を更新
    //gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
    //gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.voxBuffer);

    // VAOをバインド
    gl.bindVertexArray(this.vao);
    const memory = this.voxScreenMemory;
    const endian = this.endian;

    // カラーパレットをバインド
    gl.activeTexture(this.gl.TEXTURE0);
    gl.bindTexture(this.gl.TEXTURE_2D,this.palleteTexture);
    gl.bindSampler(0,this.sampler);
    gl.uniform1i(this.palleteLocation,0);

    mat4.multiply(this.viewProjection, screen.uniforms.viewProjection, this.worldMatrix);
    gl.uniformMatrix4fv(this.viewProjectionLocation, false,this.viewProjection);
    gl.uniform3fv(this.eyeLocation, this.eye);
    gl.uniform3fv(this.lightLocation, this.lightDirection);
    gl.uniform3fv(this.ambientLocation, this.ambient);
    

    for(let offset = 0,eo = memory.byteLength;offset < eo;offset += VOX_MEMORY_STRIDE){

      // 表示ビットが立っていたら表示    
      let attribute = memory.getUint32(offset + VOX_OBJ_ATTRIB,this.endian);  
      if( attribute & 0x80000000){

        // uniform変数を更新
        let axis = new Float32Array(memory.buffer,memory.byteOffset + offset + VOX_OBJ_AXIS,3);
        vec3.set(axis,1,-1,-1);
        vec3.normalize(axis,axis);
        let c = memory.getFloat32(offset + VOX_OBJ_ANGLE,endian) + 0.04;
        memory.setFloat32(offset + VOX_OBJ_ANGLE,c,endian);
        setRotate(this.rotate,memory.getFloat32(offset + VOX_OBJ_ANGLE,endian),axis);

        gl.uniform1f(this.scaleLocation,memory.getFloat32(offset + VOX_OBJ_SCALE,endian));
        gl.uniformMatrix3fv(this.rotateLocation,false,this.rotate);
        gl.uniform3fv(this.objPositionLocation,new Float32Array(memory.buffer,memory.byteOffset + offset + VOX_OBJ_POS,3));

        // UBO
        // gl.bindBuffer(gl.UNIFORM_BUFFER,this.objAttrBuffer);
        // gl.bufferSubData(gl.UNIFORM_BUFFER,0,this.voxScreenBuffer,offset,VOX_MEMORY_STRIDE);
        // gl.bindBuffer(gl.UNIFORM_BUFFER,null);

        const objInfo = this.voxelModels.modelInfos[(attribute & 0x1ff00000) >> 20];
        if(attribute & 0x20000){
          // use default pallet
          attribute = (attribute & 0b11111111111111111111111000000000) | objInfo.index;
          memory.setUint32(offset + VOX_OBJ_ATTRIB,attribute,endian);
        }

        gl.uniform1ui(this.attribLocation,memory.getUint32(offset + VOX_OBJ_ATTRIB,endian));

    
        // 描画命令の発行
        gl.drawArrays(gl.POINTS, objInfo.vindex,objInfo.count);

      }

    }
    this.count += 0.04;
  }

}

Vox.prototype.MEMORY_SIZE_NEEDED = VOX_MEMORY_STRIDE * VOX_OBJ_MAX;
Vox.prototype.SIZE_PARAM = SIZE_PARAM;
Vox.prototype.VOX_OBJ_POS = VOX_OBJ_POS;
Vox.prototype.VOX_OBJ_POS_SIZE = VOX_OBJ_POS_SIZE; // vec3
Vox.prototype.VOX_OBJ_SCALE = VOX_OBJ_SCALE;
Vox.prototype.VOX_OBJ_SCALE_SIZE = VOX_OBJ_SCALE_SIZE; // float
Vox.prototype.VOX_OBJ_AXIS = VOX_OBJ_AXIS;
Vox.prototype.VOX_OBJ_AXIS_SIZE = VOX_OBJ_AXIS_SIZE; // vec3
Vox.prototype.VOX_OBJ_ANGLE = VOX_OBJ_ANGLE;
Vox.prototype.VOX_OBJ_ANGLE_SIZE = VOX_OBJ_ANGLE_SIZE; // float
Vox.prototype.VOX_OBJ_ATTRIB = VOX_OBJ_ATTRIB;
Vox.prototype.VOX_OBJ_ATTRIB_SIZE = VOX_OBJ_ATTRIB_SIZE; // uint
// アトリビュートのビット構成
// v00n nnnn nnnn 00aa aaaa aadc cccc cccc
// v: 1 ... 表示 0 ... 非表示
// n: object No (0-511)
// a: alpha (0-255)
// c: color pallet index (0-511)
// d: use default pallet;
Vox.prototype.VOX_MEMORY_STRIDE =  VOX_MEMORY_STRIDE;
Vox.prototype.VOX_OBJ_MAX = VOX_OBJ_MAX;

