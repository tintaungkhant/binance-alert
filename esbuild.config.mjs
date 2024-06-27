import { getFilesSync } from "files-folder";
import esbuild from "esbuild";

(async () => {
    const args = process.argv.slice(2);

    const hasWatch = args.includes("--watch");

    /**
     * @type {import('esbuild').BuildOptions}
     */
    const options = {
        entryPoints: getFilesSync("src"),
        bundle: false,
        minify: false,
        sourcemap: true,
        target: "node18",
        packages: "external",
        platform: "node",
        format: "esm",
        allowOverwrite: true,
        outdir: "build",
    };

    if (hasWatch) {
        let ctx = await esbuild.context(options);
        await ctx.watch();
    } else {
        await esbuild.build(options);
    }
})();
