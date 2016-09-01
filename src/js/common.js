requirejs.config({

    baseUrl: './src/js', //!!! relative to html

    text: {
        useXhr: function(url, protocol, hostname, port) {
            // allow cross-domain requests
            // remote server allows CORS
            return true;
        }
    },

    shim: {

        'tween': { 
            exports: 'Tween' 
        },

        'rstats': { 
            exports: 'rStats'
        },

        'detector':{
            exports: 'Detector'
        },

        'datgui':{
            exports:"GUI"
        },

        'three': { 
            exports: 'THREE',
            deps:["raf"],
            init: function(raf) {
                //Using a function allows you to call noConflict for
                //libraries that support it, and do other cleanup.
                //However, plugins for those libraries may still want
                //a global. "this" for the function will be the global
                //object. The dependencies will be passed in as
                //function arguments. If this function returns a value,
                //then that value is used as the module export value
                //instead of the object found via the 'exports' string.
                //return this.Foo.noConflict();
            }
        },

        "orbitcontrols":{
        	deps:["three"],
            exports :"THREE.OrbitControls"
        },

        "filmshader":{
        	deps:["three"]
        },

        "copyshader":{
        	deps:["three"], 
            exports : "THREE.CopyShader"
        },

        "composer":{
        	deps:["three", "filmshader", "copyshader" ]
        },

        "shaderpass":{
        	deps:["three","composer"],
            exports : "THREE.ShaderPass"
        },

        "maskpass":{
        	deps:["three","composer"],
            exports : "THREE.MaskPass"
        },

        "renderpass":{
        	deps:["three","composer"],
            exports : "THREE.RenderPass"
        },

        "nurbssurface":{
            deps:["three"],
            exports : "THREE.NURBSSurface"
        },

        "nurbsutils":{
            deps:["three"],
            exports : "THREE.NURBSUtils"
        },

        "nurbscurve":{
            deps:["three"],
            exports : "THREE.NURBSCurve"
        }


    },

    paths: {

    	"vert" :"shaders/vert.glsl",
    	"frag" :"shaders/frag.glsl",

        "domready": "lib/require/domReady",  
        "text": "lib/require/text",       
        
        "requireLib" :"lib/require/require.min",
        
        "three" : "lib/three/three.min",
        "orbitcontrols" : "lib/three/controls/OrbitControls",
        "filmshader" : "lib/three/shaders/FilmShader",
        "copyshader" :"lib/three/shaders/CopyShader",
        "composer" : "lib/three/postprocessing/EffectComposer",
        "maskpass" : "lib/three/postprocessing/MaskPass",
        "shaderpass" : "lib/three/postprocessing/ShaderPass",
        "renderpass" : "lib/three/postprocessing/RenderPass",

        "nurbscurve" : 'lib/three/curves/NURBSCurve',
        "nurbssurface" : 'lib/three/curves/NURBSSurface',
        "nurbsutils" : 'lib/three/curves/NURBSUtils',

        "datgui": "lib/dat.gui.min",
        "tween": "lib/Tween",
        "rstats": "lib/rStats",
        "detector": "lib/Detector",	
        "raf": "lib/raf"
    }

});
