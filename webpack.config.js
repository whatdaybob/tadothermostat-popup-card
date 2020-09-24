// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: './src_popup/tadothermostatpopup-card.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        include: [path.resolve(__dirname, 'src')],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    publicPath: 'dist',
    filename: 'tadothermostatpopup-card.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
