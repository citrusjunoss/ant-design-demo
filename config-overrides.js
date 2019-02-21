const {
  override,
  fixBabelImports,
  addLessLoader,
  addPostcssPlugins,
  addBabelPlugins
} = require('customize-cra');

// const postcssPxtorem = require('postcss-pxtorem');

// const addMyPlugin = config => {
//   config.plugins.push(new postcssPxtorem()); // eslint-disable-line
//   return config;
// };

module.exports = override(
  ...addBabelPlugins(['@babel/plugin-proposal-decorators', { legacy: true }]),
  fixBabelImports('import', {
    libraryName: 'antd-mobile',
    libraryDirectory: 'es',
    style: true
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: { '@primary-color': '#1DA57A', '@hd': '2px' }
  }),
  // addMyPlugin
  addPostcssPlugins([require('postcss-px2rem')({ remUnit: 100 })]) // eslint-disable-line
);
