import * as THREE from 'three';
import { ARButton } from './jsm/webxr/ARButton.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';

    let container;
    let camera, scene, renderer;
    let controller;

    let reticle;

    let hitTestSource = null;
    let hitTestSourceRequested = false;

    init();
    animate();

    function init() {

        container = document.createElement( 'div' );
        document.body.appendChild( container );

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20 );

        const light = new THREE.AmbientLight(0xffffff, 5);
        scene.add(light);

        //

        renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.xr.enabled = true;
        container.appendChild( renderer.domElement );

        //

        document.body.appendChild( ARButton.createButton( renderer ) );

        //

        const gltfLoader = new GLTFLoader();
        const url = './assets/models/scene.gltf';
        var model = new THREE.Object3D();

        gltfLoader.load( url, ( gltf ) => {
                model = gltf.scene;
                model.name = "model";
            }
        );

        function onSelect() {

            if ( reticle.visible ) {
                reticle.matrix.decompose( model.position, model.quaternion, model.scale );
                model.rotation.y = Math.PI / 2;
                model.scale.set(0.3, 0.3, 0.3);
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

        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener();
        camera.add( listener );
    
        // create a global audio source
        const sound = new THREE.Audio( listener );
    
        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( './sounds/jazz.mp3', function( buffer ) {
            sound.setBuffer( buffer );
            sound.setLoop( true );
            sound.setVolume( 0.5 );
            sound.play();
        });

    function animate() {

        renderer.setAnimationLoop( render );

    }

    function render( timestamp, frame ) {

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

                    reticle.visible = true;
                    reticle.matrix.fromArray( hit.getPose( referenceSpace ).transform.matrix );

                } else {

                    reticle.visible = false;

                }

            }

        }

        renderer.render( scene, camera );

    }

    function isSameAsLocation(uriString) {
        const uri = new URL(uriString);
    
        return (
            uri.origin === window.location.origin &&
            uri.pathname === window.location.pathname
        );
    }