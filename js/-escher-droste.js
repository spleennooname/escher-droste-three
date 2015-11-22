
var gui, scene, camera, render, container, orbit, mesh, material;

var composer;

var clock;

var texture_url = "https://dl.dropboxusercontent.com/u/1358781/lab/grey_one_1024x1024.jpg",
    url_texture_normal ="https://dl.dropboxusercontent.com/u/1358781/lab/normal.jpg";

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var lights = [];
var controls;


var  data = {
        p1: -2,
        p2: -2,
    };

var render_fx, film_fx, bloom_fx, copy_fx, vrtilt_fx, hrtilt_fx, vignette_fx, film_fx, escher_fx;

var time, delta;


/* */

function init() {

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();

    }

    gui = new dat.GUI();

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.position.set(0,0,100);
    camera.lookAt(scene.position);

    scene.add(camera);

    clock = new THREE.Clock();

    container = document.getElementById("container");

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
   // renderer.gammaInput = true;
    //renderer.gammaOutput = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000);

    document.getElementById("canvas").appendChild(renderer.domElement);

     var loader_texture = new THREE.TextureLoader();
    loader_texture.crossOrigin = "anonymous";

    /* lights */

    var ambient_light = new THREE.AmbientLight(0x333333);
    scene.add(ambient_light);

    lights[0] = new THREE.DirectionalLight(0xffFFFF, .95);
    lights[1] = new THREE.DirectionalLight(0xff0000, .1);
    lights[2] = new THREE.DirectionalLight(0xFFFFFF, .65);

    lights[0].position.set( 0, -0.1, 1 ).normalize();
    lights[1].position.set(0, -560, 700);

    lights[2].position.set(0, 0, 1000);

    scene.add(lights[0]);
    scene.add(lights[1]);
    scene.add(lights[2]);

    /*controls *

    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = .8;
    controls.panSpeed = 0.8;

    controls.noZoom = false;
    controls.noPan = false;
    //controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    //controls.addEventListener( 'change', render )
    */


    stats = new rStats({
        values: {
            frame: {
                caption: 'Total frame time (ms)',
                over: 16
            },
            raf: {
                caption: 'Time since last rAF (ms)'
            },
            fps: {
                caption: 'Framerate (FPS)',
                below: 30
            }
        }
    });

    /* ui */

    var folder = gui.addFolder('Escher-Droste Controls');
    //folder.add(data, 'rx', 0, 2 * Math.PI).step(.1).onChange(update_escher);
    //folder.add(data, 'ry', 0, 2 * Math.PI).step(.1).onChange(update_escher);
    folder.add(data, 'p1', -2, 2).step(1).onChange(update_escher);
    folder.add(data, 'p2', -2, 2).step(1).onChange(update_escher);
    folder.open();

    /* material */

    /* mesh */

    loader_texture.load(
        texture_url,
        function(texture) {

            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.magFilter = THREE.NearestFilter;
            texture.anisotropy = renderer.getMaxAnisotropy();
            //texture.needsUpdate = true;

              var material2 = new THREE.MeshPhongMaterial( { 
                color: 0xffffff,
                map: texture,
                side: THREE.FrontSide
            } );

            /*var escher_uniforms = {
                        time: {
                            type: "f",
                            value: 0.0
                        },
                        p1: {
                            type: "f",
                            value: -2.0
                        },
                        p2: {
                            type: "f",
                            value: -2.0
                        },
                        texture: {
                            type: "t",
                            value: texture
                        },
                        Falloff:{
                            type: "v3",
                            value: new THREE.Vector3(.4, 3.0, 20.0)
                        },
                        normalMap: {
                            type: "t",
                            value: THREE.ImageUtils.loadTexture( url_texture_normal )
                        },
                        size: {
                            type: "v2",
                            value: new THREE.Vector2(1024, 1024)
                        }
                    }

            /* mesh_phong = new THREE.Mesh(
                 new THREE.Geometry(),
                 new THREE.MeshPhongMaterial({
                 	map : texture,
                     color: 0xffffff,
                     emissive: 0x072534,
                     side: THREE.DoubleSide,
                     shading: THREE.SmoothShading
                 })
             );*/
			
            /*THREE.UniformsUtils.merge([
                    THREE.UniformsLib['lights'], {
                        time: {
                            type: "f",
                            value: 0.0
                        },
                        p1: {
                            type: "f",
                            value: -2.0
                        },
                        p2: {
                            type: "f",
                            value: -2.0
                        },
                        texture: {
                            type: "t",
                            value: texture
                        },
                        size: {
                            type: "v2",
                            value: new THREE.Vector2(1024, 1024)
                        }
                    }
                ])*/

        
            /*var shaderUniforms = THREE.UniformsUtils.clone( THREE.EscherDrosteShader.uniforms );
            shaderUniforms[ "map" ].value = texture;
            shaderUniforms[ "p1" ].value = 1.0
            shaderUniforms[ "p2" ].value = -1.0
            shaderUniforms[ "size" ].value = new THREE.Vector2(1024,1024);*/


            //var defines = {};
            //defines[ "USE_MAP" ] = "";

            escher_shader_material = new THREE.ShaderMaterial({
               //name:"EscherDrosteTexture",
                //defines : defines,
                uniforms: THREE.UniformsUtils.merge([
                    THREE.UniformsLib['lights'], {
                        time: {
                            type: "f",
                            value: 0.0
                        },
                        p1: {
                            type: "f",
                            value: -2.0
                        },
                        p2: {
                            type: "f",
                            value: -1.0
                        },
                        map: {
                            type: "t",
                            value: texture
                        },
                        size: {
                            type: "v2",
                            value: new THREE.Vector2(1024, 1024)
                        }
                    }
                ]),
                vertexShader: document.getElementById('vertexshader').textContent,
                fragmentShader: document.getElementById('fragmentshader').textContent,
                //vertexShader: THREE.EscherDrosteShader.vertexShader,
                //fragmentShader: THREE.EscherDrosteShader.fragmentShader,
                lights: true
            });
    
            var phong_material = new THREE.MeshPhongMaterial({
                    map : texture,
                     color: 0xffffff,
                     emissive: 0x072534
                 })

            mesh = new THREE.Mesh( new THREE.PlaneGeometry( 200, 200, 32, 32),  escher_shader_material );

            scene.add(mesh);

            /* post */

            render_fx = new THREE.RenderPass(scene, camera);            
          
            /*escher_fx = new THREE.ShaderPass(THREE.EscherDrosteShader);
            escher_fx.uniforms.p1.value = -1.0;
            escher_fx.uniforms.p2.value = -1.0;
            escher_fx.uniforms.size.value = new THREE.Vector2( 1024, 1024 );
            escher_fx.renderToScreen = false;*/
            
            hrtilt_fx = new THREE.ShaderPass(THREE.HorizontalTiltShiftShader);
            hrtilt_fx.uniforms.r.value = .25;
            hrtilt_fx.uniforms.h.value = 1 / window.innerHeight

            vrtilt_fx = new THREE.ShaderPass(THREE.VerticalTiltShiftShader);
            vrtilt_fx.uniforms.r.value = .25;
            vrtilt_fx.uniforms.v.value = 1 / window.innerWidth;

            film_fx = new THREE.ShaderPass(THREE.FilmShader);
            film_fx.uniforms.nIntensity.value = 0.25;
            film_fx.uniforms.sIntensity.value = 0.25;
            film_fx.uniforms.sCount.value = 256;
            film_fx.uniforms.grayscale.value = 0;
      
            vignette_fx = new THREE.ShaderPass(THREE.VignetteShader);
            vignette_fx.uniforms.offset.value = 1.5;
            vignette_fx.uniforms.darkness.value = .98;
            vignette_fx.renderToScreen = true;

            composer = new THREE.EffectComposer( renderer );
            composer.addPass( render_fx );            
            //composer.addPass( escher_fx );
            composer.addPass( vrtilt_fx );
            composer.addPass( hrtilt_fx );
            composer.addPass( film_fx );
            composer.addPass( vignette_fx );
           
            //mesh.position.set(0, 0, 0);
            mesh.rotation.set(-.25, 0, 0);			
            camera.position.set(0, -50, 100);

            //go
            render();

        },
        // Function called when download progresses
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // Function called when download errors
        function(xhr) {
            console.log('An error happened');
        });

    /*document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );*/

    window.addEventListener('resize', onWindowResize, false);
}

function update_escher() {
    escher_shader_material.uniforms.p2.value = data.p2;
    escher_shader_material.uniforms.p1.value = data.p1;
}

/* render */

function render() {

 	requestAnimationFrame(render);

    time = Date.now() * 0.001;
    delta = clock.getDelta();

    escher_shader_material.uniforms.time.value += delta * .35;
    film_fx.uniforms.time.value += delta * .35;

 	/*lights[0].position.x = Math.sin(time ) * 50;
    lights[0].position.y = Math.cos(time ) * 50;
    lights[0].position.z = Math.cos(time ) * 50;*/

    //lights[1].position.x = Math.sin(time * 0.2) * 50;
    //lights[1].position.y = Math.cos(time * 0.2) * 50;
    //lights[1].position.z = Math.sin(time * 0.3) * 20;

 	/*lights[2].position.x = Math.cos(time * 0.7) * 50;
    lights[2].position.y = Math.sin(time * 0.5) * 50;
    lights[2].position.z = Math.sin(time * 0.3) * 50;*/

    //lights[0].target.position.x = Math.sin(delta) * 100
    //horizontal rotation   	

    //document.getElementById("debug").textContent =mesh.rotation.y

    //material_escher.uniforms.p1 = 1.0
    //7material_escher.uniforms.p2 = 1.0
    ///if( !options.fixed ) {
    //mesh.rotation.x += 0.005;
    //mesh.rotation.y += 0.005;
    //}

    //renderer.render(scene, camera);
    //renderer.clear();

    stats('frame').start();
    stats('rAF').tick();
    stats('FPS').frame();

    //controls.update(delta);
    composer.render(delta);  
    
    stats('frame').end();
    stats().update();

};


window.addEventListener('load', function() {
    init();
})

/*
    function onDocumentMouseDown( event ) {
 
                event.preventDefault();
         
                document.addEventListener( 'mousemove', onDocumentMouseMove, false );
                document.addEventListener( 'mouseup', onDocumentMouseUp, false );
                document.addEventListener( 'mouseout', onDocumentMouseOut, false );
         
                mouseXOnMouseDown = event.clientX - windowHalfX;
                targetRotationOnMouseDownX = targetRotationX;
         
                mouseYOnMouseDown = event.clientY - windowHalfY;
                targetRotationOnMouseDownY = targetRotationY;
 
        }
         
        function onDocumentMouseMove( event ) {
         
                mouseX = event.clientX - windowHalfX;
                mouseY = event.clientY - windowHalfY;
         
                targetRotationY = targetRotationOnMouseDownY + (mouseY - mouseYOnMouseDown) * 0.02;
                targetRotationX = targetRotationOnMouseDownX + (mouseX - mouseXOnMouseDown) * 0.02;
         
        }
         
        function onDocumentMouseUp( event ) {
         
                document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
                document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
                document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
         
        }
         
        function onDocumentMouseOut( event ) {
         
                document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
                document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
                document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
         
        }
         
        function onDocumentTouchStart( event ) {
         
                if ( event.touches.length == 1 ) {
         
                        event.preventDefault();
         
                        mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
                        targetRotationOnMouseDownX = targetRotationX;
         
                        mouseYOnMouseDown = event.touches[ 0 ].pageY - windowHalfY;
                        targetRotationOnMouseDownY = targetRotationY;
         
                }
         
        }

        function onDocumentTouchMove( event ) {

            if ( event.touches.length == 1 ) {

                    event.preventDefault();

                    mouseX = event.touches[ 0 ].pageX - windowHalfX;
                    targetRotationX = targetRotationOnMouseDownX + ( mouseX - mouseXOnMouseDown ) * 0.05;

                    mouseY = event.touches[ 0 ].pageY - windowHalfY;
                    targetRotationY = targetRotationOnMouseDownY + (mouseY - mouseYOnMouseDown) * 0.05;

            }

        }
*/

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    vrtilt_fx.uniforms.v.value = 1 / window.innerWidth;
    hrtilt_fx.uniforms.h.value = 1 / window.innerHeight;

    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.reset();
}
