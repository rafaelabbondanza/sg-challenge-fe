var gulp = require('gulp');

var plugins = require('gulp-load-plugins')();
var Q = require('q');
var del = require('del');
var es = require('event-stream');

var paths = {
    scripts: ['app/common/*.module.js', 'app/common/*.js', 'app/*.config.js', 'app/*.module.js', 'app/**/*.js'], //'common/common.module.js', 'app/app.module.js',
    styles: 'styles/**/*.scss',
    assets: './assets/**/*',
    images: './assets/img',
    index: 'index.html',
    partials: ['app/**/*.tpl.html'], // handle common as well
    distDev: './dist.dev',
    distDevApp: './dist.dev/app',
    distDevAssets: './dist.dev/assets',
    scriptsDevServer: 'devServer/**/*.js',
    bowerFile: './bower.json'
};

var pipes = {};

pipes.orderVendorScripts = function() {
    return plugins.order([
        '**/before.js',
        '**/angular.*',
        '**/after.js',
        '**/angular-ui-router.*',
        '**/ui-bootstrap-tpls.*'
    ]);
};

pipes.buildDevJS = function() {
    // config?
    return es.merge(
        gulp.src(paths.scripts)
            .pipe(gulp.dest(paths.distDevApp)),
        gulp.src('app-config/DEV.config.js')
            .pipe(plugins.rename('app.config.js'))
            .pipe(gulp.dest(paths.distDevApp))
    ).pipe(plugins.order(['app.module.js', 'app.*.js']));
};

pipes.moveDevAssets = function() {
    return gulp.src(paths.assets)
        .pipe(gulp.dest(paths.distDevAssets));
};

pipes.buildDevCSS = function() {
    return gulp.src(paths.styles)
        .pipe(plugins.sassVariables({
            $env: 'development'
        }))
        .pipe(plugins.sass())
        .pipe(gulp.dest(paths.distDev))
};

pipes.buildDevBower = function() {
    return gulp.src(paths.bowerFile)
        .pipe(plugins.mainBowerFiles({env: 'development'}))
        .pipe(gulp.dest('dist.dev/bower_components'));
};


pipes.bundleDevPartials = function() {
    return gulp.src(paths.partials)
        .pipe(gulp.dest(paths.distDevApp));
};

pipes.validateIndex = function() {
    return gulp.src(paths.index);
};

pipes.buildIndexDev = function() {

    var vendorScripts = pipes.buildDevBower().pipe(pipes.orderVendorScripts());
    var appScripts = pipes.buildDevJS();
    var appStyles = pipes.buildDevCSS();

    return pipes.validateIndex()
        .pipe(gulp.dest(paths.distDev)) // write first to get relative path for inject
        .pipe(plugins.inject(vendorScripts, {relative: true, name: 'bower'}))
        .pipe(plugins.inject(appScripts, {relative: true}))
        .pipe(plugins.inject(appStyles, {relative: true}))
        .pipe(gulp.dest(paths.distDev));
};

pipes.buildAppDev = function() {
    return es.merge(pipes.buildIndexDev(), pipes.bundleDevPartials(), pipes.moveDevAssets());
};

gulp.task('build-app-local', pipes.buildAppDev);

gulp.task('watch-dev', ['build-app-local'], function() {

    // start nodemon to auto-reload the dev server
    plugins.nodemon({ script: 'server.js', ext: 'js', watch: ['dev-server/'], env: {NODE_ENV : 'development'} })
        .on('restart', function () {
            console.log('[nodemon] restarted dev server');
        })
        .on('crash', function() {
            console.log('[nodemon] crashed....');
        });

    // watch index
    gulp.watch(paths.index, function() {
        return pipes.buildIndexDev();
    });

    // watch app scripts
    gulp.watch(paths.scripts, function() {
        return pipes.buildDevJS();
    });

    // watch html partials
    gulp.watch(paths.partials, function() {
        return pipes.bundleDevPartials();
    });

    // watch styles
    gulp.watch(paths.styles, function() {
        return pipes.buildDevCSS();
    });

});

// gulp.task('build-dev', ['clean-dev', 'build-app-dev']);


