/*
 *
 *
 *
 *
 */

// http://clubmate.fi/requirejs-part-2-optimizing-scripts-with-r-js/ 
// http://www.svlada.com/require-js-optimization-part2/

({

    //src: base codice
    baseUrl: "./src/js",

    // The module name, this uses only a single file,
    // there can be multiple different outputs also

    name: "main",

    //include:["requireLib"],

    // The destination file;
    
    out: "./build/js/antani.js",

    // If set to true, any files that were combined into a
    // build bundle will be removed from the output folder.
    removeCombined: true,

    // Finds require() dependencies inside a require() or define call. By default
    // this value is false, because those resources should be considered dynamic/runtime
    // calls. However, for some optimization scenarios, it is desirable to
    // include them in the build.
    findNestedDependencies: true,

    //config
    mainConfigFile: "./src/js/common.js",

    logLevel: 0,

    //closures
    wrap: {
        start: "(function() {",
        end: "}());"
    },

    shim: {

        'tween': { //il modulo(vedi paths)
            exports: 'Tween' //static js object
        },

        'rstats': { //il modulo(vedi paths)
            exports: 'rStats'
        },

        'rstats': { //il modulo(vedi paths)
            exports: 'rStats'
        },

        'detector':{
            exports:"Detector"
        }

        'three': { 
            exports: 'THREE',
            deps:["raf"]
        }

    },

    paths: {

        "domready": "lib/require/domReady",        
        "requireLib" :"lib/require/require.min",

        "datgui":"lib/dat.gui.min",
        "tween:" "lib/Tween",
        'rstats': 'lib/rStats',
        'detector': 'lib/Detector',
        "raf": "lib/raf"
       
})
