const gulp = require("gulp")
const esbuild = require("gulp-esbuild")
const del = require("del")
const fs = require('fs/promises')

function cleanDist() {
  return del(["dist/**/*"])
}

function build() {
  return gulp
    .src("src/**/*.ts")
    .pipe(
      esbuild({
        sourcemap: "inline",
        format: "cjs",
        target: "node12",
        loader: {
          ".ts": "ts",
        },
      })
    )
    .pipe(gulp.dest("dist"))
}

async function prestart() {


  return Promise.all(
    [
    fs.mkdir("./data/enmap", {recursive: true}),
    fs.mkdir("./data/enmap/prefixes", {recursive: true}),
    fs.mkdir("./data/enmap/datasets", {recursive: true}),
    fs.mkdir("./data/enmap/links", {recursive: true}),
    fs.mkdir("./data/enmap/autoTalk", {recursive: true}),
    fs.mkdir("./data/enmap/guildMentions", {recursive: true}),
    fs.mkdir('./data/enmap/userVerif', {recursive: true}),


    fs.mkdir("./data/datasets", {recursive: true})
  ])
}

exports.build = gulp.series(cleanDist, build, prestart)