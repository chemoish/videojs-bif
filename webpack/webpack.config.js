module.exports = {
  entry: {
    'videojs.bif': './src/videojs-bif',
  },

  output: {
    filename: '[name].js',
    libraryTarget: 'umd',
    path: 'dist',
  },

  module: {
    preloaders: [{
      exclude: /node_modules/,
      loader: 'eslint',
      test: /\.js$/,
    }],

    postLoaders: [{
      exclude: /node_modules/,
      loader: 'babel',
      test: /\.js$/,
    }],
  },

  externals: {
    'video.js': 'videojs',
  },
};
