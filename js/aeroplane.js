var scene = new THREE.Scene(); // creating a scene with THREE library
var camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 
    1000); // perspective camera, for the scene viewer (adjustable as preferred)
var renderer = new THREE.WebGLRenderer(); // Three.js uses WebGl at the core, a renderer required to render scene
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // plain js to adjust the rendered model

window.addEventListener('resize', function(){
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
}) // generic event handler for resizing the content window

controls = new THREE.OrbitControls(camera, renderer.domElement); // orbit controls helps to move around the scene
// initial position of the camera (adjustable as preferred)
camera.position.x = 0; 
camera.position.y = 4;
camera.position.z = -12;
camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

var loader = new THREE.ObjectLoader(); // crucial loader, loading the scene with ObjectLoader lib
var loaders = new THREE.OBJLoader();


// SOUNDS
var crash_audio = document.createElement('audio');
var source = document.createElement('source');
source.src = '/sounds/crash.mp3';
crash_audio.appendChild(source);

var fly_audio = document.createElement('audio');
var source = document.createElement('source');
source.src = '/sounds/fly.mp3';
fly_audio.appendChild(source);

var touch_audio = document.createElement('audio');
var source = document.createElement('source');
source.src = '/sounds/touch.mp3';
touch_audio.appendChild(source);

var diam_audio = document.createElement('audio');
var source = document.createElement('source');
source.src = '/sounds/diamond.mp3';
diam_audio.appendChild(source);

var miss_audio = document.createElement('audio');
var source = document.createElement('source');
source.src = '/sounds/missile.wav';
miss_audio.appendChild(source);




// <ACTUAL LOGIC STARTS FROM HERE>


// defining all loaded objects as variable here
var aero, ufo, diam, miss, rocket, ok_shoot=1, precision=0.001, max_miss_z=150, speed=1, same_level = -3, zig_zag=0, move_flag=0, x_max=10, destroyed=1, new_diamond = 1, x_diff, rocket_z=400,score=0,health=100;


// rocket
loader.load('/models/rocket.json', function(object){
    rocket = object

    object.rotation.x = (-3.14/2)

    object.scale.x = 0.25, object.scale.y = 0.25, object.scale.z = 0.25

    object.position.x = 0, object.position.y = same_level +0.5, object.position.z = rocket_z
    scene.add(object);
});


// using the loader in a call back to load the model which is json here(Load the fighter plane)
loader.load('/models/aeroplane.json', function(object){
    aero = object

    object.scale.x = 0.5, object.scale.y = 0.5, object.scale.z = 0.5
    object.rotation.y = 3.14
    object.position.x = 5
    object.position.y = same_level 
    object.position.z = 2

    // movement - please calibrate these values
    var xSpeed = speed;
    var zSpeed = speed;
    document.addEventListener("keydown", onDocumentKeyDown, false);
    function onDocumentKeyDown(event) {
        var keyCode = event.which;
        if (keyCode == 87) {
            aero.position.z += zSpeed;
        } else if (keyCode == 83) {
            aero.position.z -= zSpeed;
        } else if (keyCode == 65) {
            aero.position.x += xSpeed;
        } else if (keyCode == 68) {
            aero.position.x -= xSpeed;
        } 
    };   

    scene.add(object);
});

// loading missile
loader.load('/models/missile.json', function(object){
    miss = object

    object.scale.x = 3, object.scale.y = 3, object.scale.z = 3

    object.position.x = aero.position.x, object.position.y = same_level, object.position.z = aero.position.z
    scene.add(object);
});



// loading enemy
loader.load('/models/fighter.json', function(object){
    ufo = object

    object.scale.x = 0.5, object.scale.y = 0.5, object.scale.z = 0.5

    object.position.x = 0, object.position.y = same_level, object.position.z = max_miss_z
    scene.add(object);
});


// // loading coin
loader.load('/models/diamond.json', function(object){
    diam = object

    object.scale.x = 0.75, object.scale.y = 0.75, object.scale.z = 0.75

    object.position.x = 10, object.position.y = same_level, object.position.z = 5
    scene.add(object);
});

var update = function() {
    // missile handling
    document.addEventListener("keydown", onDocumentKeyDown, false);
    function onDocumentKeyDown(event) {
        var keyCode = event.which;
        if (keyCode == 32){
            if(move_flag == 0){
                move_flag = 1
                miss_audio.play();
            }
        }
    }; 
    if(move_flag == 0){
        miss.position.x = aero.position.x, miss.position.y = same_level, miss.position.z = aero.position.z
    }

    // generate new-ufo as older one got destroyed
    if(destroyed == 1){
        destroyed = 0
        ufo.position.z = max_miss_z
        ufo.position.x = -x_max + x_max*zig_zag
        zig_zag = (zig_zag+1)%3
    }

    // generate new diamond
    if(new_diamond == 1){
        new_diamond = 0
        diam.position.z = max_miss_z
        diam.position.x = -x_max + x_max*zig_zag
        zig_zag = (zig_zag+1)%3
    }

    // missile reaching end
    diff = miss.position.z - max_miss_z
    if(diff < 0){
        diff *= -1
    }
    if(precision > diff){
        move_flag = 0
    } 
    else if(move_flag == 1){
        miss.position.z += speed
    }
    
    // ufo-aero collision
    diff = ufo.position.z - aero.position.z
    if(diff < 0){
        diff *= -1
    }
    if(diff < 2.5){
        x_diff = aero.position.x - ufo.position.x
        if(x_diff < 0){
        x_diff *= -1
        }
        // taking close enough 8
        if(x_diff < 6){
            crash_audio.play();
            health = 0
        }
        else{
           destroyed = 1
        }
    } 
    else{
        ufo.position.z -= speed
    }

    // diamond-aero collision
    diff = diam.position.z - aero.position.z
    if(diff < 0){
        diff *= -1
    }
    if(diff < 1.5){
        x_diff = aero.position.x - diam.position.x
        if(x_diff < 0){
        x_diff *= -1
        }
        // taking close enough 5
        if(x_diff < 3){
            diam_audio.play();
            score+=10
            health+=5
            if(health>100){
                health=100
            }
        }
        new_diamond = 1
    } 
    else{
        diam.position.z -= speed
    }
    
    // missile collision
    diff = ufo.position.z - miss.position.z
    if(diff < 0){
        diff *= -1
    }
    // taking close enough 0.3
    if(diff<2){  
        x_diff = miss.position.x - ufo.position.x
        if(x_diff < 0){
        x_diff *= -1
        }
        // taking till close enough 1
        if(x_diff<2)
        {
            move_flag = 0
            destroyed = 1
            score+=15
            health+=10
            if(health>100){
                health=100
            }
        }
    }

    // rocket movement
    rocket.position.z -= (2*speed)

    // rocket-aero collision
    diff = rocket.position.z - aero.position.z
    if(diff < 0){
        diff *= -1
    }
    if(diff < 2){
        x_diff = aero.position.x - rocket.position.x
        if(x_diff < 0){
        x_diff *= -1
        }
        // taking close enough 3
        if(x_diff < 3){
            health-=20
            if(health<0){
                health=0
            }
            score-=25
            if(score<0){
                score=0
            }
            touch_audio.play();
        }
        rocket.position.z = rocket_z
        rocket.position.x = -x_max + x_max*zig_zag
        zig_zag = (zig_zag+1)%3
    } 
}

var show_score = function() {
    var text1 = document.createElement('div');
    text1.style.position = 'absolute';
    text1.style.backgroundColor = "cyan";
    text1.innerHTML = "Health: " + health.toString();
    text1.style.top = 30 + 'px';
    text1.style.right = 20 + 'px';
    document.body.appendChild(text1); 

    var text2 = document.createElement('div');
    text2.style.position = 'absolute';
    text2.style.backgroundColor = "yellow";
    text2.innerHTML = "Score: " + score.toString();
    text2.style.top = 30 + 'px';
    text2.style.left = 20 + 'px';
    document.body.appendChild(text2); 
}; 


var render = function() {
    renderer.render(scene, camera);
};

var GameLoop = function() {
    if(health == 0)
    {
        alert('Game Over')
    }
    fly_audio.play();
    requestAnimationFrame(GameLoop);
    update();
    render();
    show_score();
}

GameLoop();
