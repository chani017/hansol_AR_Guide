import { GLTFLoader } from './jsm/loaders/GLTFLoader.js'

const loader = new GLTFLoader()
loader.load('assets/seokga.glb', function(glb){
    console.log(glb)
}, function(xhr){
    console.log((xhr.loaded/xhr.total * 100) + "% loaded")
}, function(error){
    console.log('An error occurred')
})

function loadGLTF(){
    const self = this;
    const loader = new GLTFLoader().setPath('./assets/')

    loader.load(
        'seokga.glb',
        function(gltf){
            self.tower = gltf.scene;
            self.scene.add( gltf.scene );
            self.renderer.setAnimationLoop( self.render.bing(self) );
        },
        function(err){
            console.log( 'An error happened' );
        }
    )
}