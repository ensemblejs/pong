'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var del = require('del');
var flatten = require('gulp-flatten');
var browserify = require('browserify');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var transform = require('vinyl-transform');
var fs = require('fs');
var getRepoInfo = require('git-repo-info');
var mergeJson = require('gulp-merge-json-sets');
var mkdirp = require('mkdirp');

var paths = {
  assets: ['game/assets/**'],
  src: ['game/js/**'],
  seeds: ['game/seeds/**'],
  build: ['build/**', 'dist/**'],
  genCss: './dist/css',
  genJs: './dist/js/client',
  genLocales: './dist/locales',
  js: ['game/**/*.js'],
  locales: ['./game/locales/*.json'],
  modes: ['./build/*.js'],
  scss: ['game/**/*.scss'],
  tests: ['tests/**/*.js']
};

var onError = function (error) {
    console.log(error);
    this.emit('end');
    throw error;
};

gulp.task('delete-dist', function (done) {
    del(paths.build, done);
});
gulp.task('clean', ['delete-dist']);

gulp.task('test', ['clean'], function () {
    gulp.src(paths.tests)
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('make-folders', ['clean'], function () {
  mkdirp('build/');
  mkdirp('dist/');
  mkdirp('dist/js/client/');
});

gulp.task('prep', ['make-folders']);

function generateEntrypointFile (mode, done) {
  var filename = ['build/', mode, '.js'].join('');

  var fromFile = fs.createReadStream('node_modules/ensemblejs/default.entrypoint.js');
  var toFile = fs.createWriteStream(filename);

  fromFile.pipe(toFile, { end: false });
  fromFile.on('end', function() {
      toFile.write('\n');
      toFile.write('entryPoint.set("GameMode", "' + mode + '");');
      toFile.write('entryPoint.set("Commit", "' + getRepoInfo().sha + '");');
      toFile.write('\n');
      toFile.end('entryPoint.run();');
      done();
  });
}

gulp.task('copy-single-entry-point', ['prep'], function (done) {
    fs.exists('game/js/modes.json', function (exists) {
        if (exists) {
            return done();
        }

        generateEntrypointFile('game', done);
    });
});

gulp.task('copy-multi-entry-points', ['prep'], function (done) {
    fs.exists('game/js/modes.json', function (exists) {
        if (!exists) {
            return done();
        }

        var arr = require('./game/js/modes.json');
        var copyCount = 0;

        function copied () {
            copyCount += 1;
            if (copyCount === arr.length) {
                done();
            }
        }

        var i;
        for(i = 0; i < arr.length; i += 1) {
            generateEntrypointFile(arr[i], copied);
        }
    });
});

gulp.task('generate-entrypoints', ['copy-multi-entry-points', 'copy-single-entry-point']);

gulp.task('build-code', ['prep', 'generate-entrypoints'], function() {
    var browserified = transform(function(filename) {
        var b = browserify(filename);
        return b.bundle();
    });

    fs.writeFileSync('dist/js/client/common.min.js', '');

    return gulp.src(paths.modes)
        .pipe(plumber({errorHandler: onError}))
        .pipe(browserified)
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.genJs));
});

gulp.task('build-styles', ['prep'], function() {
    return gulp.src(paths.scss)
        .pipe(plumber({errorHandler: onError}))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(sass({ style: 'expanded', sourcemapPath: 'public/css', bundleExec: true }))
        .pipe(rename({suffix: '.min'}))
        .pipe(flatten())
        .pipe(gulp.dest(paths.genCss));
});

gulp.task('merge-locales', ['prep'], function () {
  return gulp.src(paths.locales)
    .pipe(mergeJson(__dirname + '/node_modules/ensemblejs/locales/'))
    .pipe(gulp.dest(paths.genLocales));
});

gulp.task('copy-source', ['prep'], function () {
  return gulp.src(paths.src)
    .pipe(gulp.dest('dist/js'));
});

gulp.task('copy-seeds', ['prep'], function () {
  return gulp.src(paths.seeds)
    .pipe(gulp.dest('dist/seeds'));
});

gulp.task('copy-assets', ['prep'], function () {
  return gulp.src(paths.assets)
    .pipe(gulp.dest('dist/assets'));
});

gulp.task('copy-files', ['copy-source', 'copy-seeds', 'copy-assets']);

gulp.task('build', ['build-styles', 'build-code', 'merge-locales', 'copy-files']);

gulp.task('watch', function () {
  gulp.watch(paths.scss, ['build-styles']);
});

gulp.task('default', ['test', 'build']);
gulp.task('quick', ['clean', 'build']);