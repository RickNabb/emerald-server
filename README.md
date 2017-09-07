# Emerald Engine Server

This project is the server portion of a custom JavaScript networking engine built off of WebSockets.

#### Author - Nick Rabb <nick.rabb2@gmail.com>

## Table of Contents

* [Introduction](#introduction)
* [How to Build](#how-to-build)
* [How to Run](#how-to-run)
* [Contribution](#contribution)
* [License](#license)

## Introduction

TBD

## How to Build

### Dependencies

Please ensure you have NodeJS, NPM, and Grunt installed before building this project.

Install Node JS & NPM: http://blog.teamtreehouse.com/install-node-js-npm-linux

Install Grunt:

```bash
npm install -g grunt-cli
```

### Building the Project

```bash
npm init
grunt
```

## How to Run

### Start MySQL

You need to have MySQL running in order for the engine to work properly.

```bash
mysqld_safe &
```

### Run the Project

The project is designed to be imported, as a TypeScript class, into your project, and run from your main Node JS process. For example:

```js
import EmeraldServer from './emerald-server/src/Server'

const emeraldServer = new EmeraldServer()
emeraldServer.init()
```

## Contribution

TBD

## License

MIT License

Copyright (c) 2017 Nick Rabb

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.