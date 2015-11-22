if (!Detector.webgl) 
    Detector.addGetWebGLMessage();

var statsEnabled = false;

var container, stats;

var camera, scene, renderer;

var mesh, zmesh, lightMesh, geometry;

var directionalLight, pointLight;

var mouseX = 0,
    mouseY = 0,
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;



init();
animate();




function init() {

    container = document.getElementById('three');
    //document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000);
    camera.position.z = 3200;

    scene = new THREE.Scene();

    /*
    var r = "textures/cube/Escher/";

    var urls = [ r + "px.jpg", r + "nx.jpg",
    			 r + "py.jpg", r + "ny.jpg",
    			 r + "pz.jpg", r + "nz.jpg" ];

    var textureCube = THREE.ImageUtils.loadTextureCube( urls );
   
   var r = "textures/cube/Escher/dds/";
    var urls = [r + "px.dds", r + "nx.dds",
        r + "py.dds", r + "ny.dds",
        r + "pz.dds", r + "nz.dds"
    ];

    var loader = new THREE.DDSLoader();
     */

    //var textureCube = loader.load(urls);

    var material = new THREE.MeshBasicMaterial({
        color: 0xff0000
        //envMap: textureCube
    });
    material.side = THREE.BackSide

    var geometry = new THREE.SphereGeometry(5000, 16, 16, Math.PI/2, Math.PI*2, 0, Math.PI);
   

    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.x = mesh.scale.y = mesh.scale.z = 32;
    scene.add(mesh);

    // Skybox

    /**var shader = THREE.ShaderLib["cube"];
    shader.uniforms["tCube"].value = textureCube;
    var material = new THREE.ShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            side: THREE.BackSide
    }),*/

    // mesh = new THREE.Mesh(new THREE.BoxGeometry(6000, 6000, 6000), material);
    //scene.add(mesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    /* if (statsEnabled) {

         stats = new Stats();
         stats.domElement.style.position = 'absolute';
         stats.domElement.style.top = '0px';
         stats.domElement.style.zIndex = 100;
         container.appendChild(stats.domElement);

     }*/

    //
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}

//

function animate() {
    requestAnimationFrame(animate);
    render();

    if (statsEnabled) 
        stats.update();
}

function render() {

    camera.position.x += (mouseX - camera.position.x) * .05;
    camera.position.y += (-mouseY - camera.position.y) * .05;

    camera.lookAt(scene.position);

    renderer.render(scene, camera);

}
