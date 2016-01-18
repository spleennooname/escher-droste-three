
module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-collection');

    grunt.initConfig({

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
                        "js/shaders/CopyShader.js",
                        "js/shaders/FilmShader.js",
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

    grunt.registerTask('default', ['uglify:all']);

};
