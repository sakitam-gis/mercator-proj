// bili.config.ts
import { Config } from 'bili';
import { RollupConfig } from 'bili/types/types';
import * as fs from 'fs-extra';
import { resolve } from 'path';

const json = fs.readJsonSync(resolve(__dirname, './package.json'));

const generateBanner = (json: any): string => {
  const time = new Date();
  const year = time.getFullYear();
  const banner = `/*!\n * author: ${json.author}
 * ${json.name} v${json.version}
 * build-time: ${year}-${time.getMonth() + 1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}
 * LICENSE: ${json.license}
 * (c) 2020-${year} ${json.homepage}\n */`;
  return banner;
};

const fileName = 'mercator-proj';

const env = process.env.NODE_ENV;

const config: Config = {
  babel: undefined,
  input: 'src/index.ts',
  output: {
    format: env === 'development' ? ['umd'] : ['cjs', 'umd', 'umd-min', 'esm'],
    moduleName: json.namespace,
    sourceMap: true,
  },
  extendConfig(config, { format }) {
    if (format.startsWith('umd')) {
      config.output.fileName = `${fileName}[min].js`;
    }
    if (format === 'esm') {
      config.output.fileName = `${fileName}.esm.js`;
    }
    if (format === 'cjs') {
      config.output.fileName = `${fileName}.cjs.js`;
    }

    config.externals = []; // 默认 bili 会排除外部依赖

    return config;
  },
  extendRollupConfig: (config: RollupConfig) => {
    if (config.outputConfig.format === 'umd') {
      /** Disable warning for default imports */
      // config.outputConfig.exports = 'named'
      // // it seems the umd bundle can not satisfies our demand
      // config.outputConfig.footer = `if(typeof window !== "undefined" && window.${json.namespace}) {
      //   window.${json.namespace} = window.${json.namespace}.default;
      // }`;
    }
    return config;
  },
  banner: generateBanner(json),
  plugins: {
    glslify: {},
    'typescript2': {
      clean: true,
      check: false,
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        sourceMap: true,
      },
    },
    analyzer: {
      summaryOnly: true,
      limit: 20
    }
  },
  globals: {},
  externals: []
};

export default config;
