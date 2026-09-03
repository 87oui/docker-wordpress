import defaultConfig from '@wordpress/scripts/config/webpack.config.js'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

export default {
  ...defaultConfig,
  entry: () => ({
    ...defaultConfig.entry(),
    editor: './src/editor/index.ts',
  }),
  resolve: {
    ...defaultConfig.resolve,
    plugins: [
      ...(defaultConfig.resolve.plugins ?? []),
      new TsconfigPathsPlugin({
        configFile: './src/blocks/tsconfig.json',
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      }),
    ],
  },
}
