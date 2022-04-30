const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
hemiLight.position.set( 0, 20, 0 );
scene.add( hemiLight );

const dirLight = new THREE.DirectionalLight( 0xffffff );
dirLight.position.set( - 3, 10, - 10 );
dirLight.castShadow = true;
dirLight.shadow.camera.top = 2;
dirLight.shadow.camera.bottom = - 2;
dirLight.shadow.camera.left = - 2;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 40;
scene.add( dirLight );


const AudioListener = new THREE.AudioListener();
camera.add(AudioListener);

const Audio = new THREE.PositionalAudio( AudioListener );

const AudioLoader = new THREE.AudioLoader();
const AudioUrl = './assets/sounds/jazz.mp3';

AudioLoader.load( AudioUrl,
    function( buffer ) {
        Audio.setBuffer( buffer );
        Audio.setLoop( true );
        Audio.setVolume( 1.0 );
        Audio.play();
        }
    )