/* xperiment */

module.exports = function(grunt) {

    var id = "spleennooname-escherdroste-",
        id_dev = '<%= grunt.template.today("yyyymmdd") %>' + id,
        dist = "dist/" + id_dev;

    grunt.loadNpmTasks('grunt-collection');

    grunt.initConfig({

        imagemin: {

            png: {
                options: {
                    optimizationLevel: 7
                },
                files: [{
                    // Set to true to enable the following options…
                    expand: true,
                    // cwd is 'current working directory'
                    cwd: './deploy/images/',
                    src: ['**/*.png'],
                    // Could also match cwd line above. i.e. project-directory/img/
                    dest: dist + '/images/',
                    ext: '.png'
                }]
            },

            css: {
                options: {
                    optimizationLevel: 7
                },
                files: [{
                    // Set to true to enable the following options…
                    expand: true,
                    // cwd is 'current working directory'
                    cwd: './deploy/css/',
                    src: ['**/*.png'],
                    // Could also match cwd line above. i.e. project-directory/img/
                    dest: dist + '/css/',
                    ext: '.png'
                }]
            },

            jpg: {
                options: {
                    progressive: true
                },
                files: [{
                    expand: true,
                    cwd: './deploy/images/',
                    src: ['**/*.jpg'],
                    dest: dist + '/images/',
                    ext: '.jpg'
                }]
            }
        },

        cssmin: {

            style: {
                src: [
                    "../src/css/normalize.css",
                    "../src/css/magnific-popup.css",
                    "../src/css/magnific-popup-fx.css",

                    "../src/css/style.css"
                ],
                dest: "./deploy/css/style.min.css"
            },

            landing: {
                src: [
                    "./deploy/css/landing.css"
                ],
                dest: dist + "/css/landing.min.css"
            },

            ie: {
                src: [
                    "./deploy/css/landing.ie.css"
                ],
                dest: dist + "/css/landing.ie.min.css"
            }
        },

        uglify: {

            options: {
                mangle: false,
                compress: {
                    drop_console: true
                }
            },

            three: {
                files: {
                    'js/scripts.min.js': [

                        "js/Tween.js",
                        'js/raf.js',
                        'js/rStats.js',
                        'js/dat.gui.min.js',
                        "js/detector.js",
                        "js/three.min.js",
                        
                        //"js/controls/TrackballControls.js",

                        "js/shaders/CopyShader.js",
                        "js/shaders/FilmShader.js",
                        "js/shaders/HorizontalTiltShiftShader.js",
                        "js/shaders/VerticalTiltShiftShader.js",
                        "js/shaders/ConvolutionShader.js",
                        "js/shaders/VignetteShader.js",

                        "js/postprocessing/EffectComposer.js",
                        "js/postprocessing/ShaderPass.js",
                        "js/postprocessing/MaskPass.js",
                        "js/postprocessing/RenderPass.js"                       

                        
                    ]
                }
            },

            all: {
                files: {
                    'js/escher-droste.min.js': [
                        
                       "js/Tween.js",
                        'js/raf.js',
                        'js/rStats.js',
                        'js/dat.gui.min.js',
                        "js/detector.js",
                        "js/three.min.js",
                        
                        //"js/controls/TrackballControls.js",

                        "js/shaders/CopyShader.js",
                        "js/shaders/FilmShader.js",
                        //"js/shaders/EscherDrosteShader.js",
                        "js/shaders/HorizontalTiltShiftShader.js",
                        "js/shaders/VerticalTiltShiftShader.js",
                        "js/shaders/ConvolutionShader.js",
                        "js/shaders/VignetteShader.js",

                        "js/postprocessing/EffectComposer.js",
                        "js/postprocessing/ShaderPass.js",
                        "js/postprocessing/MaskPass.js",
                        "js/postprocessing/RenderPass.js",
                        "js/escher-droste.js"
                    ]
                }
            }
        },

        watch: {
            style: {
                files: ['../src/css/style.css'],
                tasks: ['cssmin:style'],
                options: {
                    spawn: false,
                },
            },
        }

    });

    grunt.registerTask('preview', [
        'uglify:scripts',
        "cssmin:style"
    ]);

    grunt.registerTask('zip', [
        "compress:landing"
    ]);

    grunt.registerTask('delivery', [
        'uglify:scripts',
        "cssmin:style",
        "copy:scripts",
        "cssmin:ie",
        "uglify:landing",
        "cssmin:landing",
        'imagemin:jpg',
        "imagemin:png",
        "imagemin:css",
        "compress:landing"
    ]);

    grunt.registerTask('default', ['watch:style']);

};
