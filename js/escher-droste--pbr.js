 var ui_controller = {

        lx: .0,
        ly: .80,
        lz: .81,

        p1:-2,
        p2:-1,

        
        roughness: .65,
        albedo: .82,
        shininess: .13
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

        geometry, renderer, material, mesh, scene, loader, camera, controls, composer,

        tween,

        lights = [], lights_helper=[], 

        render_fx, film_fx,

        texture_size = 1024,
        texture_url_base = "https://dl.dropboxusercontent.com/u/1358781/lab/webgl/escher-droste/",
        texture_url = "textures/grey_one_1024x1024.jpg",
      
        texture_shader, texture_shader_norm, texture_shader_spec,
        texture_loader, texture_loader_norm, texture_loader_spec,

        rstats, rstats_obj, ui,

        container_dom ,

        t0, t1;

    //init

    function init() {

        // init renderer

         container_dom = document.getElementById("webgl-demo");


        if (Detector.webgl) {

            renderer = new THREE.WebGLRenderer({
                antialias: false, // to get smoother output
                preserveDrawingBuffer: true // to allow screenshot
            });            
            renderer.setClearColor( new THREE.Color(0x000000), 1);
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.gammaInput = true;
            renderer.gammaOutput = true;
           // renderer.shadowMap.type = THREE.BasicShadowMap;
            //renderer.shadowMap.enabled= true;

            renderer.setSize( container_dom.clientWidth, window.innerHeight );
            //renderer.sortObjects = true

            var gl = renderer.domElement.getContext('webgl') || renderer.domElement.getContext('experimental-webgl');
            var ext = gl.getExtension('OES_standard_derivatives')
                if (!ext){
                  Detector.addGetWebGLMessage();
              }


        } 
        else 
        {
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
        //scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

        //camera
        camera = new THREE.PerspectiveCamera(45, container_dom.clientWidth / window.innerHeight, 0.01, 200);
       
      
        scene.add( camera );

        // controls (module)
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set( 0, 0, 0 );
        controls.enableDamping = true;
		controls.dampingFactor = 0.55;
        controls.update();

        controls.momentumDampingFactor = 0.8;
        controls.momentumScalingFactor = 0.005;

        // lights (module)

        

        lights[0] = new THREE.AmbientLight(0x000000);

        lights[1] = new THREE.DirectionalLight(0xffffff, .65);        

        lights[2] = new THREE.PointLight(0xff0000, .25, 0);
        lights[3] = new THREE.PointLight(0xff0000, .25, 0);

   
        scene.add( lights[0] )
        scene.add( lights[1] );
        scene.add( lights[2] );
        //scene.add( lights[3] );

        //load: texture
        loader = new THREE.LoadingManager( onload );

        texture_loader = new THREE.TextureLoader(loader);
        texture_loader.crossOrigin = "anonymous";       
       
        texture_shader = texture_loader.load(texture_url_base+texture_url) ;
    }

      //loaded: material + fragment/vertex
    function onload() {

    // material
        //texture_shader = set_texture( texture_shader);
        //console.log("***", THREE.UniformsLib['lights'] )

        texture_shader.wrapS = THREE.RepeatWrapping;
        texture_shader.wrapT = THREE.RepeatWrapping;
        //texture_shader.format = THREE.RGBFormat;

        texture_shader.minFilter = THREE.NearestFilter;
        texture_shader.magFilter = THREE.NearestFilter;
        texture_shader.anisotropy = 16;          
    
        texture_size = 1024;
      
        var u_escher =  {
                            time: {type: "f", value: 0.0 },
                            size: {type: "v2", value: new THREE.Vector2(texture_size, texture_size) }, 
                            p1: {type: "f", value: -2.0 }, 
                            p2: {type: "f", value: -2.0 }, 
                            texture: {type: "t", value: texture_shader } 
                        }

        var u_pbr =  {
             u_fresnel: {type: "f", value: .47 },
             u_roughness: {type: "f", value: .65 },
             u_shinyness: {type: "f", value: .35 },
             u_albedo: {type: "f", value: .82 },
             u_alpha: {type: "f", value: .8 }
        }

        var uniforms = THREE.UniformsUtils.merge([
            //THREE.UniformsLib.shadowmap,
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
        console.info( shader_n.vertexShader )*/

        material2 = new THREE.MeshPhongMaterial({
            color: 0xff0000, specular: 0xffffff, shininess: 30, shading: THREE.SmoothShading
        });
        material2.needsUpdate = true;
        material2.map = texture_shader;

        material = new THREE.ShaderMaterial({
                uniforms:  uniforms ,
                vertexShader: document.getElementById('droste-vert').textContent,
                fragmentShader: document.getElementById('droste-frag').textContent,
                side: THREE.FrontSide,
                shading : THREE.SmoothShading,
                fog: false,
                lights: true                
        });      
        material.uniforms.texture.value = texture_shader;
        material.uniforms.texture.needsUpdate = true;
        material.needsUpdate = true;

        material.uniforms.u_roughness = u_pbr.u_roughness;
        material.uniforms.u_albedo =  u_pbr.u_albedo;
        material.uniforms.u_shinyness =  u_pbr.u_shinyness;
        
        geometry = new THREE.SphereGeometry(10, 32, 32);
        //geometry = new THREE.PlaneGeometry(10, 32, 32);
        //geometry = new THREE.TorusKnotGeometry( 10, 3, 100, 16 )
        geometry.uvsNeedUpdate = true;
        geometry.buffersNeedUpdate = true;

        // mesh = geom + material

        mesh = new THREE.Mesh(geometry, material);

        scene.add( mesh);

        render_fx = new THREE.RenderPass(scene, camera); 

        film_fx = new THREE.ShaderPass(THREE.FilmShader);
        film_fx.uniforms.nIntensity.value = 0.35;
        film_fx.uniforms.sIntensity.value = 0.35;
        film_fx.uniforms.sCount.value = 512;
        film_fx.uniforms.grayscale.value = 0;

        film_fx.renderToScreen = true;

        composer = new THREE.EffectComposer( renderer );
        composer.addPass( render_fx ); 
        composer.addPass( film_fx );

        //ui (module)

        ui = new dat.GUI();

        var folder = ui.addFolder('escher-droste');
        folder.add(ui_controller, 'p1', -2, 2).onChange(update_ui);
        folder.add(ui_controller, 'p2', -2, 2).onChange(update_ui);
        folder.open();

        var folder = ui.addFolder('material');
        folder.add(ui_controller, 'roughness', 0, 1).onChange(update_ui);
        folder.add(ui_controller, 'albedo', 0, 1).onChange(update_ui);
        folder.add(ui_controller, 'shininess', 0, 1).onChange(update_ui);
        folder.open();

       /*light1.colval = [light1.color.r * 255, light1.color.g * 255, light1.color.b * 255];
        var light1ColCon = lightsFolder.addColor(light1, 'colval').name('Light 1 color');*/

    /**light1ColCon.onChange(function(value){
      light1.changeColor(value);
    });
    lightsFolder.add(light2, 'intensity', 0, 1).step(0.1).name('Light 2 intensity');
    light2.colval = [light2.color.r * 255, light2.color.g * 255, light2.color.b * 255];
    var light2ColCon = lightsFolder.addColor(light2, 'colval').name('Light 2 color'*/

        /*var folder = ui.addFolder('Directional Light position');
        folder.add( ui_controller, 'lx', 0, 2).name("x").onChange( update_ui);
        folder.add( ui_controller, 'ly', 0, 2).name("y").onChange( update_ui);
        folder.add( ui_controller, 'lz', 0, 2).name("z").onChange( update_ui);
        folder.open();*/

        //events
        /*document.addEventListener( 'mousedown', on_mouse_dw, false );
        document.addEventListener( 'touchstart', on_touch_start, false );
        document.addEventListener( 'touchmove', on_touch_move, false );*/
        window.addEventListener('resize', resize, false);


        camera.position.set(0, 0, 50);
        lights[1].position.set( -10.0, -10.0, -100.0 );//dir
        lights[2].position.set( 0.0, 30.0, -80.0);
        //lights[3].position.set( -30.0, 0.0, -30.0);

        
        t0 = new TWEEN.Tween({ x : -10, y: -10, z:200, rx: 0 , ry:0} )
                            .to( { x : 0.0, y: 0.0, z: 60.0,  ry:0, rx: 0}, 5000)
                            .easing( TWEEN.Easing.Exponential.InOut )
                            .onUpdate(function(){
                                     //.rotation.y =  this.y ;
                                     //mesh.rotation.x =  this.x ;
                                     lights[1].position.set(this.x, this.y, this.z);
                                     lights[1].rotation.set(this.rx, this.ry, this.z);
                            });

        t1 = new TWEEN.Tween({ x : -10, y: -10, z:200, rx: 0 , ry:0} )
                            .to( { x : 0.0, y: 0.0, z: 100.0,  ry:Math.PI/4, rx: -Math.PI/4}, 5000)
                            .easing( TWEEN.Easing.Exponential.InOut )
                            .onUpdate(function(){
                                     camera.position.set(this.x, this.y, this.z);
                            });

        t0.start();
            t1.start();


  

        //helpers

        scene.add( new THREE.AxisHelper( 50 ) );
        scene.add( new THREE.DirectionalLightHelper( lights[1], 20 ));
        scene.add( new THREE.PointLightHelper( lights[2], 10 ))
        //scene.add( new THREE.PointLightHelper( lights[3], 10 ))

      
        console.info(uniforms)

        requestAnimationFrame(render);       
    }

    function render() {

        stats('frame').start();
        stats('rAF').tick();
        stats('FPS').frame();

        //http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
        requestAnimationFrame( render );

        // update camera controls
        controls.update();
       
        camera.lookAt( mesh.position );

        //time increase by Math.PI
        time += Date.now() * 0.025;

        // measure time, delta        
        delta = clock.getDelta();      

        //material
        material.uniforms.time.value += delta * .25;
        //post
        film_fx.uniforms.time.value += delta * .65;


        // animate DirectionalLight
        scene
            .traverse(function(obj_3d, i) {
                if (obj_3d instanceof THREE.PointLight === true ){
                    //var ang = 0.0010 * time * (i % 2 ? 1 : -1);
                    
                    //obj_3d.position.set(Math.sin(ang), Math.cos(ang), 2*Math.pi*Math.sin(ang )).normalize();

                    //obj_3d.position.set(  Math.cos( time ) * 2,   0, 0 );

                    //nsole.log("xxx")
                    
                }
                else
                if(  obj_3d instanceof THREE.DirectionalLight === true ) {
                      //obj_3d.position.set( ui_controller.lx, ui_controller.ly, ui_controller.lz );
                }
            });
       
              composer.render(delta);
        //renderer.render(scene, camera);

        stats('frame').end();
        stats().update();
        
        TWEEN.update();
        
    }

    function resize() {

        var h = window.innerHeight,
            w = container_dom.clientWidth;

        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        renderer.setSize(w, h);
        renderer.setViewport(0, 0, w, h);

        composer.render(delta);
    }
 

    function update_ui( obj ){
         material.uniforms.p2.value = ui_controller.p2;
         material.uniforms.p1.value = ui_controller.p1;

         material.uniforms.u_roughness.value = ui_controller.roughness;
         material.uniforms.u_albedo.value = ui_controller.albedo;
         material.uniforms.u_shinyness.value = ui_controller.shininess;

         material.needsUpdate=true;

    }
    //events

    /**function on_mouse_dw(){

    }

    function on_touch_start(){
    	
    }

    function on_touch_move(){
    	
    }*/

    //start

    window.addEventListener("contextmenu", function(e) { 
        e.preventDefault(); 
    });

    window.addEventListener('load', function() {
        init();
    })
