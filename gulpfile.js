'use strict';

var config = require('./package.json').config,
    pkg = require('./package.json'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    gutil = require('gulp-util'),
    rimraf = require('gulp-rimraf'),
    cond = require('gulp-cond'),
    multinject = require('gulp-multinject'),
    browsersync = require('browser-sync'),
    changed = require('gulp-changed'),
    template = require('gulp-template'),
    minifyHTML = require('gulp-minify-html'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    refresh = require('gulp-livereload'),
    lrserver = require('tiny-lr')(),
    express = require('express'),
    livereload = require('connect-livereload'),
    autoprefixer = require('gulp-autoprefixer'),
    csso = require('gulp-csso'),
    uncss = require('gulp-uncss'),
    karma = require('gulp-karma'),
    streamqueue = require('streamqueue'),
    size = require('gulp-size'),
    app = express(),
    sitemap = require('gulp-sitemap'),
    glob = require('glob'),
    livereloadport = 35729,
    serverport = 5000,
    live = gutil.env.live,
    env = live ? 'live' : 'dev';

var templateopts = {
    name: pkg.name,
    author: pkg.author,
    description: pkg.description,
};

var htmlopts = {
    empty: true,
    quotes: true,
    conditionals: true,
    spare: true
};

app.use(livereload({
    port: livereloadport
}));

app.use(express.static(config.dest));

gulp.task('clean', function() {
    return gulp.src(config.dest, { read: false })
        .pipe(rimraf({ force: true }));
});

gulp.task('default', ['clean'], function() {
    if (live) {
        gulp.start('live');
    } else {
        gulp.start('watch');
    }
});

gulp.task('watch', ['serve'], function() {
    gulp.watch(config.path + '/scss/*.scss', ['styles']);
    gulp.watch(config.path + '/js/*.js', ['scripts']);
    gulp.watch(config.path + '/index.*', ['inject']);
    gulp.watch([
        config.path + '/**/*.html',
        '!' + config.path + '/index.*',
        config.path + '/**/*.php'
    ], ['html']);
});

gulp.task('serve', ['browser-sync'], function() {
    var server = app.listen(serverport);
    server.listen(serverport);
    lrserver.listen(livereloadport);

    gutil.log(gutil.colors.bgGreen('Server running on port ' + serverport + ' and listening on ' + livereloadport));
});

gulp.task('browser-sync', ['build'], function() {
    if (!live) {

        if (config.bsync) {

            browsersync.init([
                    config.dest + '/**/*.css',
                    config.dest + '/**/*.js',
                    config.dest + '/**/*.html',
                    config.dest + '/**/*.php',
                ], {
                server: {
                    baseDir: config.dest
                },
                debugInfo: true
            });

            gutil.log(gutil.colors.bgGreen(env + 'mode: browser-sync enabled in package.json!'));

        } else {

            gutil.log(gutil.colors.bgRed(env + 'mode: browser-sync disabled in package.json'));
        }
    }
});

gulp.task('build', [
        'images',
        'fonts',
        'files',
        'styles',
        'scripts'
    ], function() {
});

gulp.task('live', [
        'images',
        'fonts',
        'files',
        'styles',
        'scripts',
        'sitemap'
    ], function() {
});

gulp.task('html', function () {

    gulp.src([
        config.path + '/**/*.html',
        '!' + config.path + '/index.*',
        config.path + '/**/*.php'
    ])
    .pipe(cond(!live, changed(config.dest)))
    .pipe(gulp.dest(config.dest))
    .pipe(refresh(lrserver));
});

gulp.task('inject', ['html'], function () {

    if (live) {

        gulp.src(config.path + '/index.*')
            .pipe(multinject(['scripts.js'], 'scripts', {
                urlPrefix: ''
            }))
            .pipe(template(templateopts))
            .pipe(minifyHTML(htmlopts))
            .pipe(gulp.dest(config.dest));

    } else {

        gulp.src(config.path + '/index.*')
            .pipe(changed(config.dest))
            .pipe(multinject(['libs.js'], 'jslibs', {
                urlPrefix: ''
            }))
            .pipe(multinject(config.jsapp, 'jsapp', {
                urlPrefix: '',
                base: config.path + '/js'
            }))
            .pipe(template(templateopts))
            .pipe(gulp.dest(config.dest))
            .pipe(refresh(lrserver));
    }

});

gulp.task('files', function () {
  gulp.src(config.files)
    .pipe(gulp.dest(config.dest))
    .pipe(refresh(lrserver));
});

gulp.task('fonts', function () {
  gulp.src(config.fonts)
    .pipe(gulp.dest(config.dest + '/fonts'))
    .pipe(cond(live, size({ showFiles: true })));
});

gulp.task('images', function() {
    gulp.src(config.path + '/images/**/*')
        .pipe(changed(config.dest))
        .pipe(cond(live, imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true })))
        .pipe(cond(live, size({ showFiles: true })))
        .pipe(gulp.dest(config.dest + '/images'));
});

gulp.task('styles', ['inject'], function () {

    return streamqueue({ objectMode: true },
        gulp.src(config.css),
        gulp.src(config.sass)
            .pipe(sass({
                includePaths: ['./app/scss']
            }))
    )
    .pipe(concat('style.css'))
    .pipe(cond(live, size({ showFiles: true })))
    .pipe(cond(live, autoprefixer(
        'last 2 version',
        'safari 5',
        'ie 8',
        'ie 9',
        'opera 12.1',
        'ios 6',
        'android 4'
    )))
    .pipe(cond(live, uncss({
        html: glob.sync(config.path + '/**/*.html'),
        ignore: [
            /:hover/,
            /:active/,
            /:visited/,
            /:focus/,
            /:checked/,
            /.active/
        ]
    })))
    .pipe(cond(live, csso({
        keepSpecialComments: 0
    })))
    .pipe(gulp.dest(config.dest + '/css'))
    .pipe(cond(live, size({ showFiles: true })))
    .pipe(cond(!live, refresh(lrserver)));
});

gulp.task('scripts', function () {

    if (live) {

        return streamqueue({ objectMode: true },
            gulp.src(config.jslibs),
            gulp.src(config.jsapp)
        )
        .pipe(concat('scripts.js'))
        .pipe(uglify())
        .pipe(cond(live, size({ showFiles: true })))
        .pipe(gulp.dest(config.dest));


    } else {

        gulp.src(config.jslibs)
            .pipe(changed(config.dest))
            .pipe(concat('libs.js'))
            .pipe(cond(live, size({ showFiles: true })))
            .pipe(gulp.dest(config.dest));

        gulp.src(config.jsapp)
            .pipe(changed(config.dest))
            .pipe(gulp.dest(config.dest))
            .pipe(refresh(lrserver));
    }
});

gulp.task('sitemap', function () {
    gulp.src([
            config.dest + '/**/*.html',
            config.dest + '/**/index.php'
        ], {
        read: false
    }).pipe(sitemap())
        .pipe(gulp.dest(config.dest + '/'));
});

gulp.task('lint', function() {
    gulp.src(config.path + '/js/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter(stylish));
});

gulp.task('karma', ['scripts'], function () {

    gulp.src([
        config.dest + '/libs.js',
        config.dest + '/app.js',
        './tests/**/*.js'
        ], { read: false })
        .pipe(karma({
            browsers: ['PhantomJS'],
            action: 'run',
            basePath: './',
            frameworks: ['jasmine'],
            reporters: ['dots'],
            port: 9876,
            colors: true,
            autoWatch: true,
            captureTimeout: 60000,
            singleRun: false
        }));
});