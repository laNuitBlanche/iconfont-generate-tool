const path = require("path")
const gulp = require("gulp")
const clean = require("gulp-clean")
const plumber = require("gulp-plumber")

const notify = require("gulp-notify")
const ts = require("gulp-typescript")

const ENTRY_PATH = "./src/**/";
const OUTPUT_PATH = "./dist/";
const CLEAN = [`${OUTPUT_PATH}*`, `!${OUTPUT_PATH}$node_modules`, `!${OUTPUT_PATH}node_modules`]
const TS = [`${ENTRY_PATH}*.ts`]
const NJK_TPL = [`${ENTRY_PATH}*.njk`];

const onError = function (err) {
  notify.onError({
    title: 'iconFont',
    subtitle: '构建失败',
    message: "错误:<%= error.message %>",
    sound: "Beep"
  })(err);
  this.emit('end');
}

const tsProject = ts.createProject('./tsconfig.json');

const tsTask = done => {
  gulp.src(TS, { since: gulp.lastRun(tsTask) })
    .pipe(plumber({ errorHandler: onError }))
    .pipe(tsProject())
    .pipe(gulp.dest(OUTPUT_PATH))
  done()
}

gulp.task('ts', tsTask)

const njkTask = done => {
  gulp.src(NJK_TPL, { since: gulp.lastRun(njkTask) })
    .pipe(plumber({ errorHandler: onError }))
    .pipe(gulp.dest(OUTPUT_PATH))
  done()
}

gulp.task('njk', njkTask)


gulp.task('clean', done => {
  gulp.src(CLEAN, { read: false, allowEmpty: true }).pipe(clean())
  done()
})

gulp.task('build', gulp.series('clean', 'ts', 'njk'));



