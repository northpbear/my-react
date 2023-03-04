import { getBaseRollupPlugins, getPackageJSON, resolvePkgPath } from './utils';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import alias from '@rollup/plugin-alias';

const { name, module, peerDependencies } = getPackageJSON('react-dom');

const packagePath = resolvePkgPath(name);
const packageDistPath = resolvePkgPath(name, true);

export default [
    // react-dom
    {
        input: `${packagePath}/${module}`,
        output: [
            {
                file: `${packageDistPath}/index.js`,
                name: 'index.js',
                format: 'umd'
            },
            {
                file: `${packageDistPath}/client.js`,
                name: 'client.js',
                format: 'umd'
            }
        ],
        external: [...Object.keys(peerDependencies)],
        plugins: [
            ...getBaseRollupPlugins(),
            alias({
                entries: {
                    hostConfig: `${packagePath}/src/hostConfig.ts`
                }
            }),
            generatePackageJson({
                inputFolder: packagePath,
                outputFolder: packageDistPath,
                baseContents: ({ name, version }) => {
                    return {
                        name,
                        version,
                        peerDependencies: {
                            react: version
                        },
                        main: 'index.js'
                    };
                }
            })
        ]
    }
];
