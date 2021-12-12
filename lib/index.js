const { src: gulpSrc, dest, parallel, series, watch } = require('gulp')

const del = require('del')
const browserSync = require('browser-sync')

const loadPlugins = require('gulp-load-plugins')
var sass = require('gulp-sass')(require('sass'))

const plugins = loadPlugins()
const bs = browserSync.create()

let config = {
  // 默认配置
  build: {
    dist: 'dist',
    temp: 'temp',
    src: 'src',
    public: 'public',
    paths: {
      styles: 'assets/styles/*.scss',
      scripts: 'assets/scripts/*.js',
      html: '*.html',
      images: 'assets/images/**',
      fonts: 'assets/fonts/**',
    }
  }
};

try{
  // process.cwd() 外面执行目录的目录
  const outerConfig = require(`${process.cwd()}/pages.config.js`)
  config = Object.assign({}, config, outerConfig)
}catch(err){}


const { dist, temp, src , public, paths } = config.build

const clean = () => {
  return del([dist, temp])
}

const style = () => {
  return gulpSrc(paths.styles, { base: src, cwd: src })
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(dest(temp))
    .pipe(bs.reload({ stream: true }))
}

const script = () => {
  return gulpSrc(paths.scripts, { base: src, cwd: src })
     // ['@babel/preset-env'] 会报错，因为在外面的
    .pipe(plugins.babel({ presets: [require('@babel/preset-env')] }))
    .pipe(dest(temp))
    .pipe(bs.reload({ stream: true }))
}

const page = () => {
  return gulpSrc( paths.html, { base: src, cwd: src })
    .pipe(plugins.swig({ data: config.data, defaults: { cache: false } })) // 防止模板缓存导致页面不能及时更新
    .pipe(dest(temp))
    .pipe(bs.reload({ stream: true }))
}

const image = () => {
  return gulpSrc(paths.images, { base: src, cwd: src })
    .pipe(plugins.imagemin())
    .pipe(dest(dist))
}

const font = () => {
  return gulpSrc(paths.fonts, { base: src, cwd: src })
    .pipe(plugins.imagemin())
    .pipe(dest(dist))
}

const extra = () => {
  return gulpSrc('**', { base: public, cwd: public })
    .pipe(dest(dist))
}

const serve = () => {
  watch(paths.styles, { cwd: src }, style)
  watch(paths.scripts, { cwd: src }, script)
  watch(paths.html, { cwd: src }, page)
  // watch('src/assets/images/**', image)
  // watch('src/assets/fonts/**', font)
  // watch('public/**', extra)
  watch([
    paths.images, 
    paths.fonts,
  ], { cwd: src }, bs.reload)

  watch('**', { cwd: public }, bs.reload)

  bs.init({
    notify: false,
    port: 2080,
    // open: false,
    // files: 'dist/**',
    server: {
      baseDir: [temp, src, public],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}
// 文件引用的处理
const useref = () => {
  // 上面这个不能搞。具体原因待定
  // return gulpSrc(paths.html, { base: temp, cwd: temp })
  return gulpSrc(temp + '/' + paths.html, { base: temp })
    .pipe(plugins.useref({ searchPath: [temp, '.'] }))
    // 压缩html js css
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true
    })))
    .pipe(dest(dist))
}

const compile = parallel(style, script, page)

// 上线之前执行的任务
const build =  series(
  clean,
  parallel(
    series(compile, useref),
    image,
    font,
    extra
  )
)

const develop = series(compile, serve)

module.exports = {
  clean,
  build,
  develop
}
