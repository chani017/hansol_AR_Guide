import * as THREE from 'three';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { ARButton } from './jsm/webxr/ARButton.js';

let container;
let camera, scene, renderer;
let spotLight;
let controller;

let reticle;

let hitTestSource = null;
let hitTestSourceRequested = false;

init();
animate();

function init() { //스크립트 실행 시작

    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    const PARAMS = {
        x: -3, 
        y: 1.7, 
        z: 5, 
        intensity: 1.5, 
        distance: 20, 
        angle: 0.2
    };

    const color = new THREE.Color("rgb(255, 0, 0");
    spotLight = new THREE.SpotLight(color, PARAMS.intensity, PARAMS.distance, PARAMS.angle);
    spotLight.position.set(PARAMS.x, PARAMS.y, PARAMS.z);
    scene.add(spotLight);

    //

    spotLight.castShadow = true;

    //

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    //

    let options = {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
    }

    options.domOverlay = { root: document.getElementById('content')};

    document.body.appendChild( ARButton.createButton(renderer, options));
    
    //
    
    const gltfLoader = new GLTFLoader();
    const url = './assets/models/scene.gltf';
    var model = new THREE.Object3D();

    gltfLoader.load(url, (gltf) => {
        model = gltf.scene;
        model.name = "model";
    }); 

    function click() {
        if (reticle.visible) {
            reticle.matrix.decompose(model.position, model.quaternion, model.scale);
            model.rotation.y = 1; //portal: 1.6
            model.scale.set(10, 10, 10);
            model.receiveShadow = true;
            scene.add(model);
        }
    }

<<<<<<< HEAD
    controller = renderer.xr.getController(0);
    controller.addEventListener('select', click);
    scene.add(controller);

    reticle = new THREE.Mesh(
        new THREE.RingGeometry(0.15, 0.2, 64).rotateX(- Math.PI / 2),
        new THREE.MeshBasicMaterial()
    );
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);
=======
        controller = renderer.xr.getController( 0 );
        controller.addEventListener( 'select', onSelect );
        scene.add( controller );
        
        reticle = new THREE.Mesh(
            new THREE.RingGeometry( 0.15, 0.2, 32 ).rotateX( - Math.PI / 2 ),
            new THREE.MeshBasicMaterial()
        );
        reticle.matrixAutoUpdate = false;
        reticle.visible = false;
        scene.add( reticle );
        
        //
>>>>>>> refs/remotes/origin/main

    //

    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function animate() {

    renderer.setAnimationLoop(render);

}

function render(timestamp, frame) {

    if (frame) {

        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();

        if (hitTestSourceRequested === false) {

            session.requestReferenceSpace('viewer').then(function (referenceSpace) {

                session.requestHitTestSource({ space: referenceSpace }).then(function (source) {

                    hitTestSource = source;

                });

            });

            session.addEventListener('end', function () {

                hitTestSourceRequested = false;
                hitTestSource = null;


				document.getElementById("place-button").style.display = "none";

            });

            hitTestSourceRequested = true;

        }

        if (hitTestSource) {

            const hitTestResults = frame.getHitTestResults(hitTestSource);

            if (hitTestResults.length) {

                const hit = hitTestResults[0];

                reticle.visible = true;
                reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);


				document.getElementById("place-button").style.display = "block";

            } else {

                reticle.visible = false;
                document.getElementById("place-button").style.display = "none";

            }

        }

    }

    renderer.render(scene, camera);

<<<<<<< HEAD
}
=======
    }
>>>>>>> refs/remotes/origin/main
