const {createJestConfig} = require('@weiran.zsd/tsdx/dist/createJestConfig');
const {paths} = require('@weiran.zsd/tsdx/dist/constants');

process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';

const config = createJestConfig(undefined, paths.appRoot);
module.exports = {...config, testEnvironment: 'jsdom',}
