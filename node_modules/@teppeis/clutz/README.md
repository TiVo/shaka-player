# clutz-npm

npm package for [clutz](https://github.com/angular/clutz) (Closure to TypeScript `.d.ts` generator)

[![npm version][npm-image]][npm-url]
![Node.js Version Support][node-version]
[![build status][circleci-image]][circleci-url]
[![dependency status][deps-image]][deps-url]
![License][license]

## Usage

```console
$ npm i -g @teppeis/clutz
$ clutz foo.js bar.js
$ gents foo.js bar.js
```

or

```console
$ npx clutz foo.js bar.js
$ npx -p @teppeis/clutz gents foo.js bar.js
```

## How to contribute

Set up for developers

```console
$ git clone git@github.com:teppeis/clutz-npm.git
$ cd clutz-npm
$ git submodule update --init
$ npm install
$ npm run build     # make clutz-all.jar with gradle wrapper
$ npm test
```

## License

MIT License: Teppei Sato &lt;teppeis@gmail.com&gt;

[npm-image]: https://img.shields.io/npm/v/@teppeis/clutz.svg
[npm-url]: https://npmjs.org/package/@teppeis/clutz
[npm-downloads-image]: https://img.shields.io/npm/dm/@teppeis/clutz.svg
[deps-image]: https://img.shields.io/david/teppeis/clutz-npm.svg
[deps-url]: https://david-dm.org/teppeis/clutz-npm
[node-version]: https://img.shields.io/badge/Node.js%20support-v10+-brightgreen.svg
[license]: https://img.shields.io/npm/l/@teppeis/clutz.svg
[circleci-image]: https://circleci.com/gh/teppeis/clutz-npm.svg?style=shield
[circleci-url]: https://circleci.com/gh/teppeis/clutz-npm
