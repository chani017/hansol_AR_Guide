import * as THREE from 'three';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { ARButton } from './jsm/webxr/ARButton.js';

    let container;
    let camera, scene, renderer;
    let controller;
    let arButton
    
    let reticle;

    let hitTestSource = null;
    let hitTestSourceRequested = false;

    init();
    animate();

    function init() { //스크립트 실행 시작

        container = document.createElement( 'div' );
        document.body.appendChild( container );

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20 );
        
        const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
        hemiLight.position.set( 0, 20, 0 );
        scene.add( hemiLight );

        const dirLight = new THREE.DirectionalLight( 0xffffff );
        dirLight.position.set( - 3, 10, 10 );
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 2;
        dirLight.shadow.camera.bottom = - 2;
        dirLight.shadow.camera.left = - 2;
        dirLight.shadow.camera.right = 2;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 40;
        scene.add( dirLight );

        //

        renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.shadowMap.enabled = true;
        renderer.xr.enabled = true;
        container.appendChild( renderer.domElement );

        //

        arButton = ARButton.createButton(renderer, { 
            requiredFeatures: ['hit-test'],
            optionalFeatures: ['dom-overlay'],
            domOverlay: { root: document.getElementById('arOverlay') } 
        })
        document.body.appendChild(arButton);

        //

        const gltfLoader = new GLTFLoader();
        const url = './assets/models/portal.gltf';
        var model = new THREE.Object3D();

        gltfLoader.load( url, ( gltf ) => {
                model = gltf.scene;
                model.name = "model";
            }
        );

        function onSelect() {
            
            if ( reticle.visible ) {
                reticle.matrix.decompose( model.position, model.quaternion, model.scale );
                model.rotation.y = 1.6; //portal: 1.6
                model.scale.set(1, 1, 1);
                model.receiveShadow = true;
                scene.add(model);
            }
        }

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

        window.addEventListener( 'resize', onWindowResize );

    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }
 
    //

    function animate() { //애니메이션 루프 시작

        renderer.setAnimationLoop( render );

    }

    function render( timestamp, frame ) { // GPU에 그리기 명령 실행

        if ( frame ) {

            const referenceSpace = renderer.xr.getReferenceSpace();
            const session = renderer.xr.getSession();

            if ( hitTestSourceRequested === false ) {

                session.requestReferenceSpace( 'viewer' ).then( function ( referenceSpace ) {

                    session.requestHitTestSource( { space: referenceSpace } ).then( function ( source ) {

                        hitTestSource = source;

                    } );

                } );

                session.addEventListener( 'end', function () {

                    hitTestSourceRequested = false;
                    hitTestSource = null;

                } );

                hitTestSourceRequested = true;

            }

            if ( hitTestSource ) {

                const hitTestResults = frame.getHitTestResults( hitTestSource );

                if ( hitTestResults.length ) {

                    const hit = hitTestResults[ 0 ];

                    Cursor.visible = true;
                    Cursor.matrix.fromArray( hit.getPose( referenceSpace ).transform.matrix );

                } else {

                    Cursor.visible = false;

                }

            }

        }

        renderer.render( scene, camera );

    }