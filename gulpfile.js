/**
 * Created by jeff on 2017/3/20.
 */
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var browserSync = require('browser-sync').create();
var runSequence = require('run-sequence');
var isCompress = false;

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./dist",
            index: "./register.html"
        },
        port: 3879
    });
});

//压缩合并js和css并替换
gulp.task('useref', function(){
    return gulp.src(['src/*.html'])
        .pipe($.useref())
        .pipe($.if('*.js', $.babel({presets: ['es2015']}))) // Convert ES6 to ES5
        .pipe($.if('*.js', $.rev())) // append hash to the packed js file
        .pipe($.if(isCompress, $.if('*.js', $.uglify()))) // Uglifies Javascript files
        .pipe($.if('*.css', $.less()))
        .pipe($.if('*.css', $.rev())) // append hash to the packed js file
        .pipe($.if(isCompress, $.if('*.css', $.cleanCss())))
        .pipe($.revReplace())
        .pipe(gulp.dest('dist/'));
});

//拷贝图片
gulp.task('copy-images', function () {
    return gulp.src(['src/image/**/*.*'])
        .pipe(gulp.dest('dist/image'));
});

//拷贝字体
gulp.task('copy-fonts', function () {
    return gulp.src(['src/font/**/*.*'])
        .pipe(gulp.dest('dist/font'));
});

//清除dist目录
gulp.task('clean', function () {
    return del(['dist/*']);
});

gulp.task('watch', function () {
    gulp.watch(["src/js/*.js", 'src/css/*.css', 'src/css/*.less', 'src/*.html']).on('change', ()=>{
        runSequence('useref', browserSync.reload);
    });
    gulp.watch(['src/image/**/*.*']).on('change', ()=>{
        runSequence('copy-images', browserSync.reload);
    });
});

// dev run
gulp.task('dev', function (callback) {
    isCompress = false;
    runSequence('clean', 'copy-images', 'copy-fonts', 'useref', 'browser-sync', 'watch', callback);
});

// prod run
gulp.task('prod', function (callback) {
    isCompress = true;
    runSequence('clean', 'copy-images', 'copy-fonts', 'useref', 'browser-sync', 'watch', callback);
});