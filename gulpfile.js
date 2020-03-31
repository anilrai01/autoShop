"use strict";

/* Path to source code (src), path to production (build), Path to file which need watch (watch) */
var path = {
  build: {
    html: "assets/build/",
    js: "assets/build/js/",
    bootstrapjs: "./node_modules/bootstrap/js/",
    css: "assets/build/css/",
    img: "assets/build/img/"
  },
  src: {
    html: "assets/src/*.html",
    js: "assets/src/js/main.js",
    bootstrapjs: "./node_modules/bootstrap/js/bootstrap.min.js",
    style: "assets/src/style/main.scss",
    img: "assets/src/img/**/*.*"
  },
  watch: {
    html: "assets/src/**/*.html",
    js: "assets/src/js/**/*.js",
    css: "assets/src/style/**/*.scss",
    img: "assets/src/img/**/*.*"
  },
  clean: "./assets/build/*"
};

/* Server Setting */
var config = {
  server: {
    baseDir: "./assets/build"
  },
  notify: false
};

/* Include gulp and plugins */
const gulp = require("gulp");
const { series } = require("gulp");
const { parallel } = require("gulp");
const webserver = require("browser-sync"), //  server for working and automatic page refresh
  plumber = require("gulp-plumber"), // error tracking module
  rigger = require("gulp-rigger"), // module for importing the contents of one file into another
  sourcemaps = require("gulp-sourcemaps"), //  module for generating a map of source files
  sass = require("gulp-sass"), // module for compiling SASS (SCSS) in CSS
  clip = require("gulp-clip-empty-files"),
  autoprefixer = require("gulp-autoprefixer"), // module for automatic installation of auto prefixes
  cleanCSS = require("gulp-clean-css"), // plugin to minimize CSS
  // uglify = require('gulp-uglify'), // module to minimize JavaScript
  cache = require("gulp-cache"), // module for caching
  imagemin = require("gulp-imagemin"), // plugin for compressing PNG, JPEG, GIF and SVG images
  jpegrecompress = require("imagemin-jpeg-recompress"), // plugin for jpeg compression
  pngquant = require("imagemin-pngquant"), // plugin to compress png
  rimraf = require("gulp-rimraf"), // plugin to delete files and directories
  rename = require("gulp-rename");

/* tasks */

// Server start
function webservers() {
  webserver(config);
}

// Clear cache
function cclean() {
  cache.clearAll();
}

// BUILD PROJECT
function clean() {
  // body omitted
  return gulp.src(path.clean, { read: false }).pipe(rimraf());
}

function html() {
  return gulp
    .src(path.src.html) // selection of all html files in the specified path
    .pipe(plumber()) // bug tracking
    .pipe(rigger()) // import attachments
    .pipe(clip())
    .pipe(gulp.dest(path.build.html)) // uploading finished files
    .pipe(webserver.reload({ stream: true })); // server reboot
}

function css() {
  return gulp
    .src(path.src.style) // got main.scss
    .pipe(plumber()) // bug tracking
    .pipe(sourcemaps.init()) // sourcemap
    .pipe(sass()) // scss -> css
    .pipe(autoprefixer()) // add autoprefix
    .pipe(gulp.dest(path.build.css)) // uploading finished files
    .pipe(rename({ suffix: ".min" }))
    .pipe(cleanCSS()) // minify CSS
    .pipe(sourcemaps.write("./")) //  write sourcemap
    .pipe(clip())
    .pipe(gulp.dest(path.build.css)) // upload to build
    .pipe(webserver.reload({ stream: true })); // reload server
}

function javascript() {
  return (
    gulp
      .src(path.src.js) // Got main.js
      .pipe(plumber()) // bug tracking
      .pipe(rigger())
      .pipe(gulp.dest(path.build.js))
      .pipe(rename({ suffix: ".min" }))
      .pipe(sourcemaps.init()) // sourcemap
      // .pipe(uglify()) // minify js
      .pipe(sourcemaps.write("./")) // write sourcemap
      .pipe(clip())
      .pipe(gulp.dest(path.build.js)) // upload to build
      .pipe(webserver.reload({ stream: true }))
  ); // reload
}

function images() {
  return gulp
    .src(path.src.img)
    .pipe(
      cache(
        imagemin([
          imagemin.gifsicle({ interlaced: true }),
          jpegrecompress({
            progressive: true,
            max: 90,
            min: 80
          }),
          pngquant(),
          imagemin.svgo({ plugins: [{ removeViewBox: false }] })
        ])
      )
    )
    .pipe(clip())
    .pipe(gulp.dest(path.build.img))
    .pipe(webserver.reload({ stream: true }));
}

function watch() {
  webserver.init(config);
  gulp.watch(path.watch.html, gulp.series(html));
  gulp.watch(path.watch.css, gulp.series(css));
  gulp.watch(path.watch.js, gulp.series(javascript));
  gulp.watch(path.watch.img, gulp.series(images));
}
exports.watch = watch;
exports.cclean = cclean;
exports.clean = clean;
exports.images = images;
exports.javascript = javascript;
exports.css = css;
exports.html = html;
exports.webservers = webservers;
const build = series(clean, parallel(html, css, javascript, images));
exports.build = build;

// WATCH PROJECT

// DEFAULT
const defaultTasks = gulp.series(build, parallel(webservers, watch));

exports.default = defaultTasks;
