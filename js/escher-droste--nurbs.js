/**
// Configure Require.js
var require_obj = {

    baseUrl: 'js/app',

    shim: {

        'detector': {
            exports: 'Detector'
        },

        'tween': {
            exports: "TWEEN",
            deps: ['threejs']
        },

        'stats': {
            exports: 'stats',
            deps: ['../rStats']
        },

        'ui': {
            exports: "ui",
            deps: ['../dat.gui.min']
        },

        'threejs': {
            exports: 'THREE'
        },

        'OrbitControls': {
            deps: ['threejs'],
            exports: 'THREE'
        }

    },

    // Third party code lives in js/lib
    paths: {

        'three': 'three',
        
        'threejs': 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r74/three.min',
        'OrbitControls': '../three/OrbitControls',

        'detector': '../Detector',
        'raf': '../raf',
        'tween': '../Tween',

        'text': '../require/text',
        'shader': '../require/shaders'
    }

};

require
    .config(require_obj);

require(['app'],
    function(app) {
        app.init();
    })*/


var ui_controller = {

    lx: .0,
    ly: .80,
    lz: .81,

    p1: -2,
    p2: -1,

    albedoColor: "#000000",
    specularColor: "#ffffff",
    roughness: .65,
    albedo: .82,
    shininess: 1.5
}

var rstats_obj = {
    values: {
        frame: {
            caption: 'Total frame time (ms)',
            over: 16.67
        },
        raf: {
            caption: 'Time since last rAF (ms)'
        },
        fps: {
            caption: 'Framerate (FPS)',
            below: 30
        }
    }
}

var last_time, now_time, delta, time, clock,

    geometry, renderer, material, mesh, scene, loader, camera, controls, composer, shaders,

    tween,

    lights = [],
    lights_helper = [],

    render_fx, film_fx,

    texture_size = 1024,
    texture_url_base = "https://dl.dropboxusercontent.com/u/1358781/lab/webgl/escher-droste/",
    texture_url = "textures/grey_one_1024x1024.jpg",

    texture_shader, texture_shader_norm, texture_shader_spec,
    texture_loader, texture_loader_norm, texture_loader_spec,

    rstats, rstats_obj, ui,

    container_dom,

    t0, t1;

//init

function init() {

    // init renderer

    container_dom = document.getElementById("webgl-demo");

    if (Detector.webgl) {

        renderer = new THREE.WebGLRenderer({
            antialias: false, // to get smoother output
            preserveDrawingBuffer: false // to allow screenshot
        });
        //renderer.setClearColor(new THREE.Color(0x000000), 1);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.setSize(container_dom.clientWidth, window.innerHeight);

        /*var gl = renderer.domElement.getContext('webgl') || renderer.domElement.getContext('experimental-webgl');
        var ext = gl.getExtension('OES_standard_derivatives')
            if (!ext){
              Detector.addGetWebGLMessage();
          }*/
    } else {
        Detector.addGetWebGLMessage();
        return true;
    }

    clock = new THREE.Clock();

    // rstats

    stats = new rStats(rstats_obj);

    // three init

    container_dom.appendChild(renderer.domElement);

    // scene         
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0xffffff, 0.0025 );

    //camera
    camera = new THREE.PerspectiveCamera(45, container_dom.clientWidth / window.innerHeight, 0.01, 200);

    scene.add(camera);

    // controls (module)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    //controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.35;
    controls.update();
    controls.momentumDampingFactor = 0.8;
    controls.momentumScalingFactor = 0.005;
    controls.addEventListener("change", function() {
        // console.info(camera.position.x, camera.position.y, camera.position.z,"|", camera.rotation.x, camera.rotation.y, camera.rotation.z)
    });

    /* loading */

    load_files(['shaders/vert.glsl', 'shaders/frag.glsl'], onload_shaders, onload_shaders_error);

}


function onload_shaders_error(url) {


}

function onload_shaders(shader_obj) {

    shaders = shader_obj;
    //console.info(  shaders )

    loader = new THREE.LoadingManager(onload_material);
    texture_loader = new THREE.TextureLoader(loader);
    texture_loader.crossOrigin = "anonymous";

    texture_shader = texture_loader.load(texture_url_base + texture_url);
}

function onload_material() {

    texture_shader.wrapS = THREE.RepeatWrapping;
    texture_shader.wrapT = THREE.RepeatWrapping;
    texture_shader.format = THREE.RGBFormat;
    texture_shader.mapping = THREE.SphericalReflectionMapping;
    texture_shader.minFilter = THREE.LinearMipMapLinearFilter;
    texture_shader.magFilter = THREE.LinearFilter;
    texture_shader.anisotropy = renderer.getMaxAnisotropy();

    texture_size = 1024;

    var u_escher = {
        time: { type: "f", value: 0.0 },
        size: { type: "v2", value: new THREE.Vector2(texture_size, texture_size) },
        p1: { type: "f", value: -2.0 },
        p2: { type: "f", value: -2.0 },
        texture: { type: "t", value: texture_shader }
    }

    var u_pbr = {
        u_fresnel: { type: "f", value: .47 },
        u_roughness: { type: "f", value: .65 },
        u_shinyness: { type: "f", value: 1.5 },
        u_albedoColor: { type: "c", value: new THREE.Color(0x000000) },
        u_specularColor: { type: "c", value: new THREE.Color(0xffffff) },
        u_albedo: { type: "f", value: .82 },
        u_alpha: { type: "f", value: .8 }
    }

    var uniforms = THREE.UniformsUtils.merge([
        THREE.UniformsLib.lights,
        u_escher,
        u_pbr
    ]);

    //simple lambert
    /**ar shader_n = THREE.ShaderLib["phong"];
    material_n = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone( shader_n.uniforms ), 
        vertexShader: shader_n.vertexShader,
        fragmentShader: shader_n.fragmentShader,
        lights: true
    });
    console.info( shader_n.vertexShader )

    material2 = new THREE.MeshPhongMaterial({
       specular: 0xffffff, shininess: 30, side: THREE.DoubleSide
    });
    material2.map = texture_shader
    material2.needsUpdate = true;
    */

    material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: shaders[0],
        fragmentShader: shaders[1],
        side: THREE.DoubleSide,
        shading: THREE.SmoothShading,
        fog: false,
        lights: true
    });
    material.uniforms.texture.value = texture_shader;
    material.uniforms.texture.needsUpdate = true;
    material.needsUpdate = true;
    material.uniforms.u_roughness = u_pbr.u_roughness;
    material.uniforms.u_albedo = u_pbr.u_albedo;
    material.uniforms.u_albedoColor = u_pbr.u_albedoColor;
    material.uniforms.u_shinyness = u_pbr.u_shinyness;

    //geometry =  srf.toThreeGeometry()
    //geometry = new THREE.PlaneGeometry(10, 32, 32);
    //geometry = new THREE.TorusKnotGeometry( 10, 3, 100, 16 )*/

    // NURBS surface
    var nsControlPoints = [
        [
            new THREE.Vector4(-200, -200, 100, 1),
            new THREE.Vector4(-200, -100, -200, 1),
            new THREE.Vector4(-200, 300, 250, 1),
            new THREE.Vector4(-200, 200, -100, 1)
        ],
        [
            new THREE.Vector4(0, -200, 0, 1),
            new THREE.Vector4(0, -100, -100, 5),
            new THREE.Vector4(0, 100, 150, 5),
            new THREE.Vector4(0, 200, 0, 1)
        ],
        [
            new THREE.Vector4(200, -200, -100, 1),
            new THREE.Vector4(200, -100, 200, 1),
            new THREE.Vector4(200, 300, -250, 1),
            new THREE.Vector4(200, 200, 100, 1)
        ]
    ];

    var degree1 = 2;
    var degree2 = 3;
    var knots1 = [0, 0, 0, 1, 1, 1];
    var knots2 = [0, 0, 0, 0, 1, 1, 1, 1];
    var nurbsSurface = new THREE.NURBSSurface(degree1, degree2, knots1, knots2, nsControlPoints);


    getSurfacePoint = function(u, v) {
        return nurbsSurface.getPoint(u, v);
    };

    geometry = new THREE.ParametricGeometry( getSurfacePoint, 40, 40 );
    //geometry = new THREE.SphereGeometry(10, 32, 32);
    geometry.uvsNeedUpdate = true;
    geometry.buffersNeedUpdate = true;

    // mesh = geom + material

    mesh = new THREE.Mesh(geometry, material);
    mesh.scale.multiplyScalar(1);

    scene.add(mesh);

    render_fx = new THREE.RenderPass(scene, camera);
    film_fx = new THREE.ShaderPass(THREE.FilmShader);
    film_fx.uniforms.nIntensity.value = 0.35;
    film_fx.uniforms.sIntensity.value = 0.35;
    film_fx.uniforms.sCount.value = 512;
    film_fx.uniforms.grayscale.value = 0;

    film_fx.renderToScreen = true;

    composer = new THREE.EffectComposer(renderer);
    composer.addPass(render_fx);
    composer.addPass(film_fx);

    //ui 

    ui = new dat.GUI();

    var folder = ui.addFolder('controls');
    //folder.add(ui_controller, 'p1', -2, 2).onChange(update_ui);
    //folder.add(ui_controller, 'p2', -2, 2).onChange(update_ui);
    folder.addColor(ui_controller, "albedoColor").name("albedo color").onChange(update_ui);
    folder.addColor(ui_controller, "specularColor").name("specular color").onChange(update_ui);
    folder.add(ui_controller, 'roughness', 0, 1).name("roughness").onChange(update_ui);
    folder.add(ui_controller, 'albedo', 0, 1).name("albedo").onChange(update_ui);
    folder.add(ui_controller, 'shininess', 0, 1.5).name("shininess").onChange(update_ui);
    folder.open();

    //events

    /*document.addEventListener( 'mousedown', on_mouse_dw, false );
    document.addEventListener( 'touchstart', on_touch_start, false );
    document.addEventListener( 'touchmove', on_touch_move, false );*/
    window.addEventListener('resize', resize, false);

  
    //lights[3].position.set( -30.0, 0.0, -30.0);

    /*t0 = new TWEEN.Tween({ x: 0, y: 30, z: -500, rx: 0, ry: 0 })
        .to({ x: 0.0, y: 0.0, z: 100.0, ry: 0, rx: 0 }, 5000)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate(function() {
            //.rotation.y =  this.y ;
            //mesh.rotation.x =  this.x ;
            //lights[1].position.set(this.x, this.y, this.z);
            //lights[1].rotation.set(this.rx, this.ry, this.z);
        });*/

    // lights   

    lights[0] = new THREE.AmbientLight(0x000000);    
    lights[1] = new THREE.HemisphereLight(0xffffff, 0x000000, 1)
    lights[2] = new THREE.DirectionalLight(0xffffff, .55);

    lights[1].position.set(0.0, 0.0, 10); //hemi


    lights[2].position.set(0.0, 0.0, 60.0); //dir
     lights[2].rotation.set(-.25, 0.0, 0); //dir
  

    scene.add(lights[0])
    scene.add(lights[1]);
    scene.add(lights[2]);

    //camera - max 200

    camera.position.set(0,0,80);

    //mesh

    mesh.position.set(0.0, 0.0, 0.0);

    //set scene
    
    t1 = new TWEEN.Tween({ x: 0, y: 0, zoom: 0, rx: 0, ry: 0, rz: 0 })
        .to({ zoom:30, x: 0.0, y: -32.0, z: 60.0, rx: .5, ry:.25 }, 5000)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate(function() {
            //camera.position.set(0,0,this.zoom);
            //camera.rotation.set(this.rx - Math.PI / 4, this.ry, this.rz);
           // mesh.position.set(this.x, this.y, 0.0);
            mesh.rotation.set(this.rx, this.ry, 0.0);
        });

   // t0.start();
    t1.start();

    //scene.add( new THREE.DirectionalLightHelper( lights[1], 20 ));
    scene.add( new THREE.DirectionalLightHelper( lights[2], 20 ));
    //scene.add( new THREE.AxisHelper( 50 ) );       
   //scene.add( new THREE.PointLightHelper( lights[3], 10 ))     
    //console.log(uniforms.directionalLights)

    requestAnimationFrame(render);
}

function render() {

    stats('frame').start();
    stats('rAF').tick();
    stats('FPS').frame();

    //http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    requestAnimationFrame(render);

    // update camera controls
    controls.update();

    //camera.lookAt(mesh.position);

    //time increase by Math.PI
    time += Date.now() * 0.025;

    // measure time, delta        
    delta = clock.getDelta();

    //material
    material.uniforms.time.value += delta * .25;

    //post
    film_fx.uniforms.time.value += delta * .65;


    //mesh.rotation.x = .02 * Math.sin(time)

    composer.render(delta);

    stats('frame').end();
    stats().update();

    TWEEN.update();

}

/* */

function load_file(url, data, cb_fn, err_cb_fn) {
    var req = new XMLHttpRequest();
    req.type = "text";
    req.open('GET', url, true);
    req.onreadystatechange = function() {
        if (req.readyState === 4) {
            if (req.status === 200) {
                cb_fn(req.responseText, data)
            } else {
                err_cb_fn(url);
            }
        }
    };
    req.send(null);
}

function load_files(urls, cb_fn, err_cb_fn) {

    var numUrls = urls.length;
    numComplete = 0,
        result = [],

        // cbb
        partial_cb = function(text, urlIndex) {
            result[urlIndex] = text;
            numComplete++;
            if (numComplete == numUrls) {
                cb_fn(result);
            }
        }

    for (var i = 0; i < numUrls; i++) {
        load_file(urls[i], i, partial_cb, err_cb_fn);
    }
}

function resize() {


      //https://en.wikipedia.org/wiki/Aspect_ratio_(image)
    var aspect = 1.77; //w/h

    var c = document.getElementById("webgl-demo");

    var h = .90 * window.innerHeight;
    var w = window.innerWidth < h * 1.77 ? window.innerWidth : h * 1.77;

    var mr = (window.innerHeight - h) / 2;
    c.style.height = h + "px";
    c.style.width = w + "px";

    c.style.marginTop = mr + "px"
    c.style.marginBottom = mr + "px"

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    renderer.setSize(w, h);
    renderer.setViewport(0, 0, w, h);
    composer.render(delta);
}


function update_ui(obj) {
    material.uniforms.p2.value = ui_controller.p2;
    material.uniforms.p1.value = ui_controller.p1;

    material.uniforms.u_roughness.value = ui_controller.roughness;
    material.uniforms.u_albedo.value = ui_controller.albedo;
    material.uniforms.u_shinyness.value = ui_controller.shininess;

    material.uniforms.u_albedoColor.value = new THREE.Color(ui_controller.albedoColor);
    material.uniforms.u_specularColor.value = new THREE.Color(ui_controller.specularColor);

    material.needsUpdate = true;

}

//start

/*window.addEventListener("contextmenu", function(e) {
    e.preventDefault();
});*/

window.addEventListener('load', function() {
    init();
})
