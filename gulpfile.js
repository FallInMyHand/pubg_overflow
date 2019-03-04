const gulp = require('gulp');
const less = require('gulp-less');

const lessConfig = {
    plugins: []
};

gulp.task('less', function() {
    return gulp.src([
            'src/less/**/*.less'
        ])
        .pipe(less(lessConfig))
        .on('error', function (err) {
            console.log(err.toString());
            this.emit('end');
        })
        .pipe(gulp.dest('src/css'));
});
