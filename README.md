### 简单的学习gulp的封装脚本
未来发包后就是   `npm i wcl-pages -D`

`wcl-pages clean` 清除文件
`wcl-pages build` 打包文件
`wcl-pages develop` 开发文件

需要在根目录下创建 pages.config.js 进行文件的配置

```
module.exports = {
  data: {

  },
  build: {
    src:'src',
    public:'public
    ...
  }
}
```