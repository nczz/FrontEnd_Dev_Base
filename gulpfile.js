var gulp = require('gulp');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var del = require('del');
var server = require('gulp-server-livereload');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

// 建立本機開發預覽環境
gulp.task('webserver', function() {
    gulp.src('build')
        .pipe(server({
            livereload: true,
            directoryListing: { enable: true, path: './build' },
            open: true,
        }));
});

// 編譯jade模板引擎
gulp.task('jade', function() {
    return gulp.src(['src/**/*.jade', '!src/include/*.jade', '!src/extends/*.jade']) //編譯 src 目錄下檔案，未包含 include,extends 資源引用檔
        .pipe(jade({ pretty: true })) // 顯示未壓縮架構
        .on('error', function(err) { console.log(err);
            this.emit('end'); }) // 顯示錯誤而不離開觀察模式
        .pipe(gulp.dest('build/')); // 將結果輸出至build目錄
});

// 編譯 sass 的樣式檔
gulp.task('sass', function() {
    return gulp.src(['src/css/**/*.scss', '!src/css/include/*.scss']) //編譯 src 目錄下檔案，未包含 include 資源引用檔
        .pipe(sourcemaps.init()) // 建立除錯 source map
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build/css/'));
});

gulp.task('copy_js', function() {
    return gulp.src(['src/js/**/*'])
        .pipe(gulp.dest('build/js/'));
});

gulp.task('copy_images', function() {
    return gulp.src(['src/images/**/*'])
        .pipe(imagemin({
            progressive: true, //for jpg
            optimizationLevel: 3, //for png, default value: 3
            interlaced: false, //for gif
            multipass: false, //for svg
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('build/images/'));
});

gulp.task('clean_all', function() {
    del.sync('build/*');
});

gulp.task('clean_html', function() {
    del.sync('build/*.html');
});

gulp.task('copy_resource', function() {
    // 僅複製 css 檔至 build 結果，未包含 scss 原始檔以及其資源引用檔
    gulp.src(['src/css/**/*', '!src/css/{include,include/**}', '!src/css/**/*.scss']).pipe(gulp.dest('build/css/'));
    gulp.src('src/js/**/*').pipe(gulp.dest('build/js/'));
    gulp.src('src/images/**/*').pipe(gulp.dest('build/images/'));
});

//觀察模式，對任何原始資源的改變更新至build目錄下追蹤
gulp.task('watch', function() {
    gulp.watch('src/**/*.jade', ['jade']);
    gulp.watch('src/css/**/*.scss', ['sass']);
    gulp.watch('src/js/**/*', ['copy_js']);
    gulp.watch('src/images/**/*', ['copy_images']);
});

// Gulp 自動化管控開發工具的進入點，啟動流程：清除編譯結果目錄 build -> 必須資源複製 -> 編譯 Jade -> 編譯 SASS -> 啟動觀看模式 -> 啟動本機開發預覽環境
gulp.task('default', ['clean_all', 'copy_resource', 'jade', 'sass', 'watch'],function(){
	gulp.start('webserver');
});

