'use strict';

/* Path to source code (src), path to production (build), Path to file which need watch (watch) */
var path = {
    build: {
        html: 'assets/build/',
        js: 'assets/build/js/',
        css: 'assets/build/css/',
        img: 'assets/build/img/',
        fonts: 'assets/build/fonts/',
        icons: 'assets/build/webfonts/'
    },
    src: {
        html: 'assets/src/*.html',
        js: 'assets/src/js/main.js',
        style: 'assets/src/style/main.scss',
        img: 'assets/src/img/**/*.*',
        fonts: 'assets/src/fonts/**/*.*',
        icons: 'assets/src/webfonts/**/*.*'
    },
    watch: {
        html: 'assets/src/**/*.html',
        js: 'assets/src/js/**/*.js',
        css: 'assets/src/style/**/*.scss',
        img: 'assets/src/img/**/*.*',
        fonts: 'assets/srs/fonts/**/*.*',
        icons: 'assets/src/webfonts/**/*.*'
    },
    clean: './assets/build/*'
};

/* Server Setting */
var config = {
    server: {
        baseDir: './assets/build'
    },
    notify: false
};

/* Include gulp and plugins */
var gulp = require('gulp'),  //  Gulp
    webserver = require('browser-sync'), //  server for working and automatic page refresh
    plumber = require('gulp-plumber'), // error tracking module
    rigger = require('gulp-rigger'), // module for importing the contents of one file into another
    sourcemaps = require('gulp-sourcemaps'), //  module for generating a map of source files
    sass = require('gulp-sass'), // module for compiling SASS (SCSS) in CSS
    autoprefixer = require('gulp-autoprefixer'), // module for automatic installation of auto prefixes
    cleanCSS = require('gulp-clean-css'), // plugin to minimize CSS
    // uglify = require('gulp-uglify'), // module to minimize JavaScript
    cache = require('gulp-cache'), // module for caching
    imagemin = require('gulp-imagemin'), // plugin for compressing PNG, JPEG, GIF and SVG images
    jpegrecompress = require('imagemin-jpeg-recompress'), // plugin for jpeg compression
    pngquant = require('imagemin-pngquant'), // plugin to compress png
    rimraf = require('gulp-rimraf'), // plugin to delete files and directories
    rename = require('gulp-rename');

/* tasks */

// Server start
gulp.task('webserver', function () {
    webserver(config);
});

// html collection
gulp.task('html:build', function () {
    return gulp.src(path.src.html) // selection of all html files in the specified path
        .pipe(plumber()) // bug tracking
        .pipe(rigger()) // import attachments
        .pipe(gulp.dest(path.build.html)) // uploading finished files
        .pipe(webserver.reload({ stream: true })); // server reboot
});

// collection of styles
gulp.task('css:build', function () {
    return gulp.src(path.src.style) // got main.scss
        .pipe(plumber()) // bug tracking
        .pipe(sourcemaps.init()) // sourcemap
        .pipe(sass()) // scss -> css
        .pipe(autoprefixer()) // add autoprefix
        .pipe(gulp.dest(path.build.css))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cleanCSS()) // minify CSS
        .pipe(sourcemaps.write('./')) //  write sourcemap
        .pipe(gulp.dest(path.build.css)) // upload to build
        .pipe(webserver.reload({ stream: true })); // reload server
});

// сбор js
gulp.task('js:build', function () {
    return gulp.src(path.src.js) // Got main.js
        .pipe(plumber()) // bug tracking
        .pipe(rigger()) // import all files to main.js
        .pipe(gulp.dest(path.build.js))
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.init()) // sourcemap
        // .pipe(uglify()) // minify js
        .pipe(sourcemaps.write('./')) // write sourcemap
        .pipe(gulp.dest(path.build.js)) // upload to build
        .pipe(webserver.reload({ stream: true })); // reload
});

// Fonts build
gulp.task('fonts:build', function () {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});
//font awesome
gulp.task('icons:build', function() {
    return gulp.src(path.src.icons)
        .pipe(gulp.dest(path.build.icons));
});

// IMAGES
gulp.task('image:build', function () {
    return gulp.src(path.src.img)
        .pipe(cache(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            jpegrecompress({
                progressive: true,
                max: 90,
                min: 80
            }),
            pngquant(),
            imagemin.svgo({ plugins: [{ removeViewBox: false }] })
        ])))
        .pipe(gulp.dest(path.build.img));
});

// Remove build
gulp.task('clean:build', function () {
    return gulp.src(path.clean, { read: false })
        .pipe(rimraf());
});

// Clear cache
gulp.task('cache:clear', function () {
    cache.clearAll();
});

// BUILD PROJECT
gulp.task('build',
    gulp.series('clean:build',
        gulp.parallel(
            'html:build',
            'css:build',
            'js:build',
            'fonts:build',
            'image:build',
            'icons:build'
        )
    )
);

// WATCH PROJECT
gulp.task('watch', function () {
    gulp.watch(path.watch.html, gulp.series('html:build'));
    gulp.watch(path.watch.css, gulp.series('css:build'));
    gulp.watch(path.watch.js, gulp.series('js:build'));
    gulp.watch(path.watch.img, gulp.series('image:build'));
    gulp.watch(path.watch.fonts, gulp.series('fonts:build'));
    gulp.watch(path.watch.fonts, gulp.series('icons:build'));
});

// DEFAULT
gulp.task('default', gulp.series(
    'build',
    gulp.parallel('webserver','watch')      
));

