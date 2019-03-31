#!/bin/sh
":" //# ; exec /usr/bin/env node --experimental-modules "$0" "$@"
import fse from 'fs-extra';
import fs from 'fs';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import rollup from 'rollup';
import resolveHome from './resolveHome';
import path from 'path';
import { exec as exec_ } from 'child_process';
import util from 'util';

const exec = util.promisify(exec_);

const deployBaseDir = resolveHome('~/pj/www/html/contents/sandbox/');
const sandboxDir = resolveHome('~/pj/sandbox/');

let projectName, releaseName, srcPath, destPath, deploy;
const helpMessage =
  `
-p,--project-name プロジェクト名を指定（必須）
-h,--help ヘルプ
`;


function error(param, message = '必要なパラメータがありません。') {
  return new Error(`param:${param} ${message}`);
}

try {
  (async () => {
    const args = process.argv.slice(2);
    while (args.length) {
      const param = args.shift();
      switch (param) {
        case '-p':
        case '--project-name':
          {
            // projectName の指定
            if (args.length) {
              projectName = args.shift();
            } else {
              throw error(param);
            }
          }
          break;
        case '-r':
        case '--release':
          {
            // release 
            if (args.length && !args[0].match(/^-{1,2}/)) {
              releaseName = args.shift();
            } else {
              releaseName = '/current/';
            }
          }
          break;
        case '--deploy':
        case '-d':
          deploy = true;
          break;
        case '--help':
        case '-h':
          console.info(helpMessage);
          break;
        default:
          throw error(param, '不明なパラメータです。');
      }
    }

    if (!projectName) {
      throw new Error('プロジェクト名の指定がありません。');
    }

    console.info(`projectName:${projectName}をビルドします。`);

    // ビルド処理
    const projectPath = path.join(sandboxDir, projectName);
    const currentPath = path.join(projectPath, 'current');


    let releasePath;

    if (releaseName) {
      releasePath = path.join(projectPath, 'releases', releaseName);
      await fse.ensureDir(releasePath);
      fse.copy(currentPath, releasePath, { overwrite: true });
    }

    const currentBuildPath = path.join(currentPath, 'build');
    const currentSrcPath = path.join(currentPath, 'src');

    let config;
    try {
      config = await fse.readJSON(path.join(projectPath, 'build-config.json'));
    } catch (e) {
      if (e.code === 'ENOENT') {
        throw new Error('build-config.jsonファイルが見つかりません。');
      } else {
        throw e;
      }
    }
    console.log(config);

    // rollupによるバンドル
    if (config.rollup) {
      console.log('bundle処理実行中');
      const output = await exec(`rollup -c ${config.rollup}`, { cwd: projectPath, maxBuffer: 16384 });
      output.stderr && console.log(output.stderr);
    }

    // 成果物のコピー
    if (config.copyFiles) {
      for (const p of config.copyFiles) {
        const src = path.normalize(path.join(projectPath, p));
        const dest = path.normalize(path.join(currentBuildPath, path.basename(src)));
        console.info(src,'=>',dest);
        await fse.copy(src, dest);
      }
    }

    // リリースディレクトリへのコピー
    if (releasePath) {
      const releaseSrcPath = path.join(releasePath, 'src');
      await fse.ensureDir(releaseSrcPath);
      await fse.copy(currentBuildPath, releasePath, { preserveTimestamps: true });
      await fse.copy(currentSrcPath, releaseSrcPath, { preserveTimestamps: true });
    }

    // wwwレポジトリへのデプロイ
    if (deploy) {
      const deployDir = path.join(deployBaseDir, projectName, releaseName);
      await fse.ensureDir(deployDir);
      await fse.copy(releasePath, deployDir, { overwrite: true, preserveTimestamps: true });
      // TODO:解説用のmdをあれば自動生成したい
    }

  })();
} catch (e) {
  console.log(`Error:`, e);
  //process.abort();
}



