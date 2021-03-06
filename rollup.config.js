import typescript from "rollup-plugin-typescript"
import resolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import builtins from "rollup-plugin-node-builtins"
import nodeGlobals from "rollup-plugin-node-globals"
import json from "@rollup/plugin-json"
import { string } from "rollup-plugin-string"
import fs from "fs"

const getBannerText = () => {
    const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"))
    const { version } = packageJson
    let bannerText = fs.readFileSync("./src/meta.js", "utf-8")
    bannerText = bannerText.replace("%VERSION%", version)
    return bannerText
}

const plugins = [
    typescript({
        target: "ES6",
        sourceMap: false,
        allowJs: true,
        lib: [
            "ES6",
            "dom"
        ],
    }),
    resolve({
        preferBuiltins: true,
        jsnext: true,
        extensions: [".js", ".ts"]
    }),
    commonjs({
        extensions: [".js", ".ts"]
    }),
    json(),
    string({
        include: "**/*.css",
    }),
    builtins(),
    nodeGlobals({
        dirname: false,
        filename: false,
        baseDir: false,
    }),
    {
        /**
         * remove tslib license comments
         * @param {string} code 
         * @param {string} id 
         */
        transform (code, id) {
            if (id.includes("tslib")) {
                code = code.split(/\r?\n/g).slice(15).join("\n")
            }
            return {
                code
            }
        }
    },
]

export default [
    {
        input: "src/worker.ts",
        output: {
            file: "dist/cache/worker.js",
            format: "iife",
            banner: "export const PDFWorker = function () { ",
            footer: "}\n",
            sourcemap: false,
        },
        plugins,
    },
    {
        input: "src/main.ts",
        output: {
            file: "dist/main.js",
            format: "iife",
            sourcemap: false,
            banner: getBannerText,
            intro: "// fix for Greasemonkey\nwindow.eval('(' + function () {",
            outro: "}.toString() + ')()')"
        },
        plugins,
    },
]
