define([

    "domready",

    "three",
    "orbitcontrols",
    "maskpass",
    "renderpass",
    "shaderpass",

    "nurbssurface",
    "nurbscurve",
    "nurbsutils",

    "tween",

    "detector",

    "datgui",

    "rstats",

    "text!vert",

    "text!frag"

    /*"require"*/

], function(

    domReady,

    THREE,
    OrbitControls,
    MaskPass,
    RenderPass,
    ShaderPass,

    NURBSCurve,
    NURBSSurface,
    NURBSUtils,

    TWEEN,

    Detector,

    GUI,

    rStats,

    vert,

    frag

    /*, require*/
) {

    "use strict";

    function EscherDroste() {


    }

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
    };

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
    };

    var delta, now,
        then = Date.now(),
        fps = 60,
        fr = 1000 / fps;

    var time;

    var geometry, renderer, material, mesh, scene, loader, camera, controls, composer, shaders,

        tween,

        delta_clock, clock, stats,

        lights = [],

        lights_helper = [],

        render_fx, film_fx,

        texture_size = 512,

        /*"http://spleennooname.github.io/escher-droste-three/assets*/

        texture_url_base = "http://spleennooname.github.io/escher-droste-three/assets/",

        texture_url = "textures/grey_one_1024x1024.jpg",

        texture_shader, texture_shader_norm, texture_shader_spec,
        texture_loader, texture_loader_norm, texture_loader_spec,

        rstats, rstats_obj, ui,

        container_dom,

        t0, t1;


    var ready = function() {

            container_dom = document.getElementById("webgl-demo");

            if (Detector.webgl) {

                renderer = new THREE.WebGLRenderer({
                    antialias: false, // to get smoother output
                    preserveDrawingBuffer: false // to allow screenshot
                });
                renderer.setClearColor(new THREE.Color(0x000000), 1);
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.gammaInput = true;
                renderer.gammaOutput = true;
                renderer.setSize(container_dom.clientWidth, window.innerHeight);

            } else {
                Detector.addGetWebGLMessage();
                return true;
            }

            clock = new THREE.Clock();

            // rstats
            //stats = new rStats(rstats_obj);

            // three init
            container_dom.appendChild(renderer.domElement);

            // scene
            scene = new THREE.Scene();

            //camera
            camera = new THREE.PerspectiveCamera(45, container_dom.clientWidth / window.innerHeight, 0.01, 200);
            scene.add(camera);

            // controls
            controls = new OrbitControls(camera, renderer.domElement);
            controls.target.set(0, 0, 0);
            controls.enableDamping = true;
            controls.dampingFactor = 0.55;
            controls.update();
            controls.momentumDampingFactor = 0.8;
            controls.momentumScalingFactor = 0.005;

            // lights
            lights[0] = new THREE.AmbientLight(0x000000);
            lights[1] = new THREE.HemisphereLight(0xffffff, 0x000000, 1)
            lights[2] = new THREE.DirectionalLight(0xffffff, .55);

            scene.add(lights[0]);
            scene.add(lights[1]);
            scene.add(lights[2]);

            loader = new THREE.LoadingManager(onload);

            texture_loader = new THREE.TextureLoader(loader);
            texture_loader.crossOrigin = "anonymous";

            texture_shader = texture_loader.load(texture_url_base + texture_url)

        },

        onload = function() {

            texture_shader.wrapS = THREE.RepeatWrapping;
            texture_shader.wrapT = THREE.RepeatWrapping;
            texture_shader.format = THREE.RGBFormat;
            texture_shader.mapping = THREE.SphericalReflectionMapping;

            texture_shader.minFilter = THREE.LinearMipMapLinearFilter;
            texture_shader.magFilter = THREE.LinearFilter;
            texture_shader.anisotropy = renderer.getMaxAnisotropy();

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

            material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vert,
                fragmentShader: frag,
                side: THREE.FrontSide,
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




            geometry = new THREE.ParametricGeometry( function(u, v){return nurbsSurface.getPoint(u, v)}, 40, 40 );
            geometry.uvsNeedUpdate = true;
            geometry.buffersNeedUpdate = true;

            // mesh = geom + material
            mesh = new THREE.Mesh(geometry, material);
            mesh.scale.multiplyScalar(1);

            scene.add(mesh);

            //post

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
            folder.addColor(ui_controller, "albedoColor").name("albedo color").onChange(update_ui);
            folder.addColor(ui_controller, "specularColor").name("specular color").onChange(update_ui);
            folder.add(ui_controller, 'roughness', 0, 1).name("roughness").onChange(update_ui);
            folder.add(ui_controller, 'albedo', 0, 1).name("albedo").onChange(update_ui);
            folder.add(ui_controller, 'shininess', 0, 1.5).name("shininess").onChange(update_ui);
            folder.open();

            //events

            camera.position.set(0, 0, 50);

            lights[1].position.set(20.0, 30.0, 100.0); //dir
            lights[2].position.set(-10.0, -30.0, 0.0); //point

            //tween intro

            t1 = new TWEEN.Tween({ x: -10, y: -10, z: 200, rx: 0, ry: 0, rz: 0 })
                .to({ x: -18.0, y: -8.0, z: 11.0, rz: -Math.PI / 2, rx: -Math.PI / 6, ry: -Math.PI / 6 }, 5000)
                .easing(TWEEN.Easing.Exponential.InOut)
                .onUpdate(function() {
                    camera.position.set(this.x, this.y, this.z);
                    camera.rotation.set(this.rx - Math.PI / 4, this.ry, this.rz);
                    mesh.rotation.set(this.rx - 2 * Math.PI, this.ry + 2 * Math.PI, this.rz);
                });

            t1.start();

            window.addEventListener('resize', resize, false);

            then = Date.now();
            render();

        },


        update_ui = function(obj) {

            material.uniforms.p2.value = ui_controller.p2;
            material.uniforms.p1.value = ui_controller.p1;

            material.uniforms.u_roughness.value = ui_controller.roughness;
            material.uniforms.u_albedo.value = ui_controller.albedo;
            material.uniforms.u_shinyness.value = ui_controller.shininess;

            material.uniforms.u_albedoColor.value = new THREE.Color(ui_controller.albedoColor);
            material.uniforms.u_specularColor.value = new THREE.Color(ui_controller.specularColor);

            material.needsUpdate = true;

        },

        resize = function() {

            var w = window.innerWidth,
                h = window.innerHeight//(3 / 4) * w;

            camera.aspect = w / h;
            camera.updateProjectionMatrix();

            renderer.setSize(w, h);
            renderer.setViewport(0, 0, w, h);

            composer.render(delta_clock);
        },

        render = function() {

            /*stats('frame').start();
            stats('rAF').tick();
            stats('FPS').frame();*/

            requestAnimationFrame(render);

            //frame control
            now = Date.now();
            delta = now - then;

            if (delta > fr) {

                then = now - (delta % fr);

                controls.update();
                camera.lookAt(scene.position);

                //time pitch
                time += Date.now() * 0.025;

                // delta clock
                delta_clock = clock.getDelta();
                //material
                material.uniforms.time.value += delta_clock  * .25;
                //post
                film_fx.uniforms.time.value += delta_clock  * .65;

                composer.render(delta_clock);

                TWEEN.update();
            }

            /*stats('frame').end();
            stats().update();*/
        }

    domReady(ready);

    return EscherDroste;

});
