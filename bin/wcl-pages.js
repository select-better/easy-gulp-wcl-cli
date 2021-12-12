#!/usr/bin/env node
// 将根目录的路径修改
process.argv.push('--cwd')
process.argv.push(process.cwd())
// 将gulpfile的路径修改
process.argv.push('--gulpfile')
process.argv.push(require.resolve('..'))

require('gulp/bin/gulp')