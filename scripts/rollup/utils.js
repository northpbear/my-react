import path from 'path';
import fs from 'fs';
import cjs from '@rollup/plugin-commonjs';
import ts from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';

const pkgPath = path.resolve(__dirname, '../../packages');
const distPath = path.resolve(__dirname, '../../dist/node_modules');

export function resolvePkgPath(pkgName, isDist) {
    if (isDist) {
        return `${distPath}/${pkgName}`;
    }
    return `${pkgPath}/${pkgName}`;
}

export function getPackageJSON(pkgName) {
    const pkgJsonPath = `${resolvePkgPath(pkgName)}/package.json`;
    const str = fs.readFileSync(pkgJsonPath, {
        encoding: 'utf-8'
    });

    return JSON.parse(str);
}

export function getBaseRollupPlugins({
    typescript = {},
    alias = {
        __DEV__: true
    }
} = {}) {
    return [replace(alias), cjs(), ts(typescript)];
}
