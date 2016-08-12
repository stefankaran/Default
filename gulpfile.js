// /////////////////////////////////////////////////
// Required
// /////////////////////////////////////////////////
var gulp = require("gulp"),
imageResize = require('gulp-image-resize'),
uglify = require("gulp-uglify"),
uglifycss = require('gulp-uglifycss'),
uncss = require('gulp-uncss'),
rename = require("gulp-rename"),
concat = require('gulp-concat'),
order = require('gulp-order'),
sass = require("gulp-sass"),
sourcemaps = require('gulp-sourcemaps'),
del = require('del'),
htmlmin = require('gulp-htmlmin'),
imagemin = require('gulp-imagemin'),
jshint = require('gulp-jshint'),
cleanCSS = require('gulp-clean-css'),
plumber = require("gulp-plumber"),
browserSync = require("browser-sync"),
sprite = require('gulp-sprite-generator'),
spritesmith = require('gulp.spritesmith'),
responsive = require('gulp-responsive'),
reload = browserSync.reload;

// /////////////////////////////////////////////////
// Scripts Task
// /////////////////////////////////////////////////
gulp.task("scripts", function() {
  gulp.src("app/js/*.js")
  .pipe(sourcemaps.init())
  .pipe(jshint())
  .pipe(order([
      "app/js/jquery.min.js",
  ]))
  .pipe(concat('main.js'))
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(uglify())
  .pipe(jshint.reporter("default"))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('app/assets/js/'))
  .pipe(reload({
    stream: true
  }));
});

// /////////////////////////////////////////////////
// Styles Task
// /////////////////////////////////////////////////
gulp.task("styles", function() {
  gulp.src("app/scss/main.scss")
  .pipe(sourcemaps.init())
  .pipe(plumber())
  .pipe(sass({
    style: "compressed"
  }))
  // .pipe(cleanCSS({compatibility: 'ie8'})) // Minify css
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(uglifycss({
    // "maxLineLen": 80,
    "uglyComments": true
  }))
  .pipe(uncss({
    html: ['app/*.html']
  }))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest("app/assets/css/"))
  .pipe(reload({
    stream: true
  }));
});

// /////////////////////////////////////////////////
// HTML Task
// /////////////////////////////////////////////////
gulp.task("html", function() {
  gulp.src("app/**/*.html")
  .pipe(reload({
    stream: true
  }));
});

// /////////////////////////////////////////////////
// Image Minify
// /////////////////////////////////////////////////
// gulp.task('imagemin', ['build:copy'], () =>
// 	gulp.src('app/assets/images/*')
// 		.pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
// 		.pipe(gulp.dest('build/assets/images/'))
// );

// /////////////////////////////////////////////////
// HTML Minify
// /////////////////////////////////////////////////
gulp.task('htmlmin', ['build:copy'], function() {
  return gulp.src('app/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build/'))
});

// /////////////////////////////////////////////////
// Browser-Sync Task
// /////////////////////////////////////////////////
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "./app/"
    }
  })
});

// /////////////////////////////////////////////////
// Watch Task
// /////////////////////////////////////////////////
gulp.task("watch", function() {
  gulp.watch("app/js/*.js", ['scripts']);
  gulp.watch("app/scss/**/*.scss", ['styles']);
  gulp.watch("app/**/*.html", ['html']);
});

// /////////////////////////////////////////////////
// Rename images -- Sprite
// /////////////////////////////////////////////////
gulp.task("sprite-image--rename", function(cb) {
  return gulp.src('app/imageSprite_example/*.*')
  .pipe(rename({
    suffix: '-2x'
  }))
  .pipe(gulp.dest('app/spriteOutputImages/'), cb);
});

// /////////////////////////////////////////////////
// Image Responsvie Task -- Sprite
// /////////////////////////////////////////////////
gulp.task('sprite-image--responsive', ['sprite-image--rename'], function() {
  return gulp.src('app/imageSprite_example/*.*')
  .pipe(responsive({
    '*': {
      width: '50%', // Resize all images to 50% of original pixels wide
    },
  }, {
    // Global configuration for all images
    quality: 70, // The output quality for JPEG, WebP and TIFF output formats
    progressive: true, // Use progressive (interlace) scan for JPEG and PNG output
    compressionLevel: 6, // Zlib compression level of PNG output format
    withMetadata: false, // Strip all metadata
  }))
  .pipe(gulp.dest('app/spriteOutputImages/'));
});
// More about image responsive on:
// https://github.com/mahnunchik/gulp-responsive/blob/master/examples/simple.md
// http://www.tuicode.com/article/5691f852e104967c56a661c4

// /////////////////////////////////////////////////
// Sprite Retina Task -- Sprite
// /////////////////////////////////////////////////
gulp.task('sprite-image--retina', ['sprite-image--responsive'], function generateSpritesheets(cb) {
  var spriteData = gulp.src('app/spriteOutputImages/*.*') // Use all normal and `-2x` (retina) images as `src`
  .pipe(spritesmith({
    retinaSrcFilter: 'app/spriteOutputImages/*-2x.*', // Filter out `-2x` (retina) images to separate spritesheet
    imgName: 'icons.png', // Generate a normal and a `-2x` (retina) spritesheet
    retinaImgName: 'icons-2x.png',
    cssName: '_icons.scss', // Generate SCSS variables/mixins for both spritesheets
    algorithm: 'binary-tree' // More about algorithms on https://github.com/twolfson/gulp.spritesmith#algorithms
  }), cb);
  spriteData.img.pipe(gulp.dest('app/spriteFinal')); // Deliver spritesheets to `dist/` folder as they are completed
  spriteData.css.pipe(gulp.dest('app/spriteFinal')); // Deliver CSS to `./` to be imported by `index.scss`
});
// More about image sprite and image sprite retina on:
// https://www.npmjs.com/package/gulp.spritesmith
// https://github.com/twolfson/gulp.spritesmith

// /////////////////////////////////////////////////
// Sprite Task -- Sprite
// /////////////////////////////////////////////////
// gulp.task('sprite-image', function () {
//  var spriteData = gulp.src('path/*.*')
// 		.pipe(spritesmith({
// 			imgName: 'icons.png',
// 			cssName: '_icons.scss',
// 			algorithm: 'binary-tree'
// 		}));
//  spriteData.img.pipe(gulp.dest('path'));
//  spriteData.css.pipe(gulp.dest('path'));
// });

// /////////////////////////////////////////////////
// BUILD Task *************************************
// /////////////////////////////////////////////////
// Browser-Sync Task/Build
gulp.task('build:server', function() {
  browserSync({
    server: {
      baseDir: "./build/"
    }
  })
});

// clear out all files and folders from build folder
gulp.task('build:cleanfolder', function(cb) {
  return del([
    'build/**'
  ], cb);
});

//task to create build directory for all files
gulp.task('build:copy', ['build:cleanfolder'], function() {
  return gulp.src('app/**/*/')
  .pipe(gulp.dest('build/'));
});

//task to remove unwanted build files
//list all files and directories here that don't wont to include
gulp.task('build:remove', ['build:copy'], function(cb) {
  del([
     'build/scss/',
     'build/js/',
     'build/imageSprite_example/',
     'build/templates/',
  ], cb);
});

// /////////////////////////////////////////////////
// Default Task
// /////////////////////////////////////////////////
gulp.task("default", ['styles', 'scripts', 'watch', 'browser-sync']);
// gulp.task('build', ['build:copy', 'build:remove', 'build:server', 'htmlmin', 'imagemin');
gulp.task('build', ['build:copy', 'build:remove', 'build:server', 'htmlmin']);
gulp.task("sprite", ['sprite-image--rename', 'sprite-image--responsive', 'sprite-image--retina']);