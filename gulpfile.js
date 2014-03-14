var config = require('./package.json').config,
    pkg = require('./package.json'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    gutil = require('gulp-util'),
    rimraf = require('gulp-rimraf'),
    gif = require('gulp-if'),
    multinject = require('gulp-multinject'),
    browsersync = require('browser-sync'),
    changed = require('gulp-changed'),
    template = require('gulp-template'),
    minifyHTML = require('gulp-minify-html'),    
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    refresh = require('gulp-livereload'),
    plumber = require('gulp-plumber'),
    lrserver = require('tiny-lr')(),
    express = require('express'),
    livereload = require('connect-livereload')
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    karma = require('gulp-karma'),
    streamqueue = require('streamqueue'),
    size = require('gulp-size'),
    app = express(),
    sitemap = require('gulp-sitemap'),
    debug = require('gulp-debug'),
    bump = require('gulp-bump'),
    livereloadport = 35729,
    serverport = 5000,
    live = gutil.env.live;

var templateopts = { 
    name: pkg.name,
    author: pkg.author,
    description: pkg.description,
}

var htmlopts = {
    empty: true,
    quotes: true,
    conditionals: true,
    spare: true
}

app.use(livereload({
    port: livereloadport 
}));

app.use(express.static(config.dest));

gulp.task('default', ['clean'], function() {
    gulp.start('watch');
});

gulp.task('watch', ['serve'], function() {
    gulp.watch(config.path + '/scss/*.scss', ['styles']);
    gulp.watch(config.path + '/js/*.js', ['scripts', 'lint']);
    gulp.watch(config.path + '/index.*', ['inject']);
    gulp.watch([
        config.path + '/**/*.html',
        '!' + config.path + '/index.*',
        config.path + '/**/*.php'
    ], ['html']);

    gutil.log(gutil.colors.bgGreen('Watching...'));    

});

gulp.task('browser-sync', ['build'], function() {
    if (live) {
        gutil.log(gutil.colors.bgRed('browser-sync only in dev mode!'));    

    } else if(config.sync) {
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

        gutil.log(gutil.colors.bgGreen('browser-sync running!'));    
        
    };
});


gulp.task('serve', ['browser-sync'], function() {
    var server = app.listen(serverport);
    server.listen(serverport);
    lrserver.listen(livereloadport);

    gutil.log(gutil.colors.bgGreen('Server running on port ' + serverport + ' and listening on ' + livereloadport));    
});

gulp.task('build', [
            'inject', // - > html
            'styles',
            'scripts',
            'images',
            'files',
            'fonts',
            'sitemap'
], function() {       
    gutil.log(gutil.colors.bgGreen('Built!'));    
});

// html/php
gulp.task('html', function(){

    gulp.src([
        config.path + '/**/*.html',
        '!' + config.path + '/index.*',
        config.path + '/**/*.php'
    ])
    .pipe(changed(config.dest))
    .pipe(gif(live, minifyHTML(htmlopts)))
    .pipe(gulp.dest(config.dest))
    .pipe(refresh(lrserver));

    gutil.log(gutil.colors.bgGreen('HTML/PHP done!'));    
});

gulp.task('inject', ['html'], function(){

    if (live) {

        gulp.src(config.path + '/index.*')
            .pipe(multinject(['scripts.js'], 'scripts', { 
                urlPrefix: '' 
            }))
            .pipe(template(templateopts))
            .pipe(gif(live, minifyHTML(htmlopts)))          
            .pipe(gulp.dest(config.dest))
            .pipe(refresh(lrserver));        

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
            .pipe(gif(live, minifyHTML(htmlopts)))            
            .pipe(gulp.dest(config.dest))
            .pipe(refresh(lrserver));
    }


    gutil.log(gutil.colors.bgGreen('Inject done!'));    
});

// files
gulp.task('files', function(){
  gulp.src(config.files)
    .pipe(gulp.dest(config.dest))
    .pipe(refresh(lrserver));

    gutil.log(gutil.colors.bgGreen('Files done!'));
});

// fonts
gulp.task('fonts', function(){
  gulp.src(config.fonts)
    .pipe(gulp.dest(config.dest + '/fonts'))
    .pipe(size({ showFiles: config.report }));

    gutil.log(gutil.colors.bgGreen('Fonts done!'));

});

gulp.task('styles', function(){
    return streamqueue({ objectMode: true },
        gulp.src(config.css),
        gulp.src(config.sass)
            .pipe(sass({
                includePaths: ['./app/scss']
            })))
            .pipe(gif(live, (autoprefixer(
                'last 2 version', 
                'safari 5', 
                'ie 8', 
                'ie 9', 
                'opera 12.1', 
                'ios 6', 
                'android 4'
            ))))      
            .pipe(size({ showFiles: config.report }))
            .pipe(concat('style.css'))
            .pipe(gif(live, minifycss({ 
                keepSpecialComments: 0
            })))  
            .pipe(size({ showFiles: config.report }))
            .pipe(gulp.dest(config.dest))
            .pipe(refresh(lrserver));

    gutil.log(gutil.colors.bgGreen('Styles done!'));

});

gulp.task('scripts', function(){

    if (live) {

        return streamqueue({ objectMode: true },
            gulp.src(config.jslibs),
            gulp.src(config.jsapp)
        )
        .pipe(concat('scripts.js'))
        .pipe(uglify())
        .pipe(gulp.dest(config.dest))  
        .pipe(refresh(lrserver));

        gutil.log(gutil.colors.bgGreen('Live scripts done!'));
      
    } else {

        gulp.src(config.jslibs)
            .pipe(changed(config.dest))
            .pipe(concat('libs.js'))         
            .pipe(size({ showFiles: config.report }))
            .pipe(gulp.dest(config.dest));

        gulp.src(config.jsapp)
            .pipe(changed(config.dest))             
            .pipe(gulp.dest(config.dest))
            .pipe(refresh(lrserver));

        gutil.log(gutil.colors.bgGreen('Dev scripts done!'));
    };
});

// images
gulp.task('images', function() {
    gulp.src(config.path + '/images/**/*')
        .pipe(changed(config.dest))
        .pipe(imagemin({ 
            optimizationLevel: 3,
            progressive: true, 
            interlaced: true }))
        .pipe(size({ showFiles: config.report }))
        .pipe(gulp.dest(config.dest + '/images'));

        gutil.log(gutil.colors.bgGreen('Images done!'));

});

gulp.task('sitemap', function () {
    gulp.src([
            config.dest + '/**/*.html',
            config.dest + '/**/index.php'
        ], {
        read: false
    }).pipe(sitemap())
        .pipe(gulp.dest(config.dest + '/'));

    gutil.log(gutil.colors.bgGreen('Sitemap done!'));    

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
        }))
});


// lint js
gulp.task('lint', function() {
    gulp.src(config.path + '/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// delete 
gulp.task('clean', function() {
    gulp.src(config.dest + '/**/*', { read: false })
        .pipe(rimraf({ force: true }));

    gutil.log(gutil.colors.bgGreen('Cleaned!'));

});

// Update bower, component, npm at once:
gulp.task('bump', function() {
    gulp.src(['./bower.json', './package.json'])
        .pipe(bump({ 
            // type: 'minor',
            version: 'patch'
        }))
    .pipe(gulp.dest('./'));
});