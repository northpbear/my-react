import { getBaseRollupPlugins, getPackageJSON, resolvePkgPath } from './utils';
import generatePackageJson from 'rollup-plugin-generate-package-json';

const { name, module } = getPackageJSON('react');

const packagePath = resolvePkgPath(name);
const packageDistPath = resolvePkgPath(name, true);

export default [
    // react
    {
        input: `${packagePath}/${module}`,
        output: {
            file: `${packageDistPath}/index.js`,
            name: 'index.js',
            format: 'umd'
        },
        plugins: [
            ...getBaseRollupPlugins(),
            generatePackageJson({
                inputFolder: packagePath,
                outputFolder: packageDistPath,
                baseContents: ({ name, version }) => {
                    return {
                        name,
                        version,
                        main: 'index.js'
                    };
                }
            })
        ]
    },
    // jsx-runtime
    {
        input: `${packagePath}/src/jsx.ts`,
        output: [
            {
                file: `${packageDistPath}/jsx-runtime.js`,
                name: 'jsx-runtime.js',
                format: 'umd'
            },
            {
                file: `${packageDistPath}/jsx-dev-runtime.js`,
                name: 'jsx-dev-runtime.js',
                format: 'umd'
            }
        ],
        plugins: getBaseRollupPlugins()
    }
];
