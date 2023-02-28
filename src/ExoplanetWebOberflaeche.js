import * as THREE from "three";
import "./style.css";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {element, func} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";
import * as events from "events";
import {publishReplay} from "rxjs";

let camera, renderer, scene, jsonFile, mesh, data, databool = false;
let stats = document.getElementsByClassName('statsBox');
let Json = {  "planet" : {
        "id" : 1,
        "name": "exoplanet1",
        "width": 5,
        "height": 5
    },
    "planetFields": [
        {
            "x": 0,
            "y": 0,
            "ground": "",
            "temperature": 21,
            "roboter": []
        },
        {
            "x": 1,
            "y": 0,
            "ground": "sand",
            "temperature": 21,
            "roboter": [],
        },
        {
            "x": 2,
            "y": 0,
            "ground": "sand",
            "temperature": 21,
            "roboter": [
                {
                    "id": 2,
                    "pid": 2,
                    "x": 2,
                    "y": 0,
                    "name": "Luca",
                    "temperature": 36,
                    "energy": 100,
                    "direction": "west",
                    "status": "very good"
                }
            ]
        },
        {
            "x": 3,
            "y": 0,
            "ground": "sand",
            "temperature": 21,
            "roboter": [],
        },
        {
            "x": 4,
            "y": 0,
            "ground": "",
            "temperature": 21,
            "roboter": []
        },
        {
            "x": 0,
            "y": 1,
            "ground": "sand",
            "temperature": 21,
            "roboter": []
        },
        {
            "x": 1,
            "y": 1,
            "ground": "sand",
            "temperature": 21,
            "roboter": []
        },
        {
            "x": 2,
            "y": 1,
            "ground": "wasser",
            "temperature": 21,
            "roboter": []
        },
        {
            "x": 3,
            "y": 1,
            "ground": "sand",
            "temperature": 21,
            "roboter": []
        },
        {
            "x": 4,
            "y": 1,
            "ground": "sand",
            "temperature": 21,
            "roboter": []
        },{
            "x": 0,
            "y": 2,
            "ground": "sand",
            "temperature": 21,
            "roboter": []
        },
        {
            "x": 1,
            "y": 2,
            "ground": "wasser",
            "temperature": 21,
            "roboter": []
        },
        {
            "x": 2,
            "y": 2,
            "ground": "wasser",
            "temperature": 21,
            "roboter": []
        },
        {
            "x": 3,
            "y": 2,
            "ground": "wasser",
            "temperature": 21,
            "roboter": []
        },
        {
            "x": 4,
            "y": 2,
            "ground": "sand",
            "temperature": 21,
            "roboter": []
        },{
            "x": 0,
            "y": 3,
            "ground": "sand",
            "temperature": 21,
            "roboter": []
        },
        {
            "x": 1,
            "y": 3,
            "ground": "sand",
            "temperature": 21,
            "roboter": [
                {
                    "id": 1,
                    "pid": 1,
                    "x": 1,
                    "y": 3,
                    "name": "Julian",
                    "temperature": 20,
                    "energy": 10,
                    "direction": "north",
                    "status": "good"
                }
            ]
        },
        {
            "x": 2,
            "y": 3,
            "ground": "wasser",
            "temperature": 21,
            "roboter": []
        },
        {
            "x": 3,
            "y": 3,
            "ground": "sand",
            "temperature": 21,
            "roboter": [
                {
                    "id": 2,
                    "pid": 2,
                    "x": 3,
                    "y": 3,
                    "name": "Felix",
                    "temperature": 25,
                    "energy": 80,
                    "direction": "south",
                    "status": "very good"
                }
            ]
        },
        {
            "x": 4,
            "y": 3,
            "ground": "start",
            "temperature": 21,
            "roboter": []
        },{
            "x": 0,
            "y": 4,
            "ground": "",
            "temperature": 22,
            "roboter": []
        },
        {
            "x": 1,
            "y": 4,
            "ground": "sand",
            "temperature": 21,
            "roboter": [],
        },
        {
            "x": 2,
            "y": 4,
            "ground": "sand",
            "temperature": 21,
            "roboter": [
                {
                    "id": 2,
                    "pid": 2,
                    "x": 2,
                    "y": 4,
                    "name": "Frank",
                    "temperature": 25,
                    "energy": 80,
                    "direction": "east",
                    "status": "very good"
                }
            ]
        },
        {
            "x": 3,
            "y": 4,
            "ground": "sand",
            "temperature": 21,
            "roboter": [],
        },
        {
            "x": 4,
            "y": 4,
            "ground": "",
            "temperature": 21,
            "roboter": [],
        }
    ]
}

//let planet, planet1, planet2;

//let raycaster = new THREE.Raycaster();
//let mouse = new THREE.Vector2()
let mixer;



document.getElementById("startButton").onclick = function() {
    document.getElementById('startMenu').style.visibility = 'hidden';
    document.getElementById("triangleLeft").style.visibility = "visible";
    document.getElementById("triangleRight").style.visibility = "visible";
    main();
};

async function main() {
    let planetenNavi = 0;
    let running = true;
    const windowWith = window.innerWidth, windowHeight = window.innerHeight;
    let planetWidth = 0, planetHeight = 0, x = 0, y = 0, groundpng, roundArray, planeten, planet;
    const step = 1;

    const textureLoader = new THREE.TextureLoader();

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias: true});

    renderer.setSize(windowWith, windowHeight);

    camera = new THREE.PerspectiveCamera(
        75,
        windowWith / windowHeight,
        0.1,
        1000
    );

    document.body.appendChild(renderer.domElement);
    scene.add(camera);

    //Json aufrufen
        planeten = await apiRequestPlaneten();
        console.log(planeten);
        planet = await apiRequestPlanetenDetails(planeten[0].id);


    for(let i = 0; i > 10; i++){
        console.log(databool)
        if(databool){
            console.log(data);
        }
    }


    document.getElementById("triangleLeft").onclick = async function() {
        planetenNavi -= 1;
        if(planetenNavi <= planeten.length && planetenNavi > 0){
            for (let i = 0; i < 10; i++){
                let elemente = document.getElementsByClassName('robotStatsBox');
                clearall(elemente);
            }
            planet = await apiRequestPlanetenDetails(planeten[planetenNavi].id);
            fillStats(planet);
            addLight();
            openPlanet(roundArray, textureLoader, planet);
            addGrid(planetWidth, planetHeight, step);
        }else if(planetenNavi < 0){
            planetenNavi = planeten.length - 1;
            for (let i = 0; i < 10; i++){
                let elemente = document.getElementsByClassName('robotStatsBox');
                clearall(elemente);
            }
            planet = await apiRequestPlanetenDetails(planeten[planetenNavi].id);
            fillStats(planet);
            addLight();
            openPlanet(roundArray, textureLoader, planet);
            addGrid(planetWidth, planetHeight, step);
        }else if(planetenNavi === 0){
            for (let i = 0; i < 10; i++){
                let elemente = document.getElementsByClassName('robotStatsBox');
                clearall(elemente);
            }
            planet = await apiRequestPlanetenDetails(planeten[planetenNavi].id);
            fillStats(planet);
            addLight();
            openPlanet(roundArray, textureLoader, planet);
            addGrid(planetWidth, planetHeight, step);
        }
    };

    document.getElementById("triangleRight").onclick = async function() {
        planetenNavi += 1;
        if(planetenNavi < planeten.length){
            for (let i = 0; i < 10; i++){
                let elemente = document.getElementsByClassName('robotStatsBox');
                clearall(elemente);
            }
            planet = await apiRequestPlanetenDetails(planeten[planetenNavi].id);
            fillStats(planet);
            addLight();
            openPlanet(roundArray, textureLoader, planet);
            addGrid(planetWidth, planetHeight, step);
        }else if(planetenNavi === 9){
            planetenNavi = 0;
            for (let i = 0; i < 10; i++){
                let elemente = document.getElementsByClassName('robotStatsBox');
                clearall(elemente);
            }
            planet = await apiRequestPlanetenDetails(planeten[planetenNavi].id);
            fillStats(planet);
            addLight();
            openPlanet(roundArray, textureLoader, planet);
            addGrid(planetWidth, planetHeight, step);
        }
    };

    //Restapi auf Updates prüfen
/*    while(running){
        setTimeout(async function () {
            console.log('Hallo')
            let planeten1 = await apiRequestPlaneten();
            let planet1 = await apiRequestPlanetenDetails(planeten[0].id);
            if(planeten1 !== planeten){
                planeten = planeten1;
            }
            if(planet1 !== planet){
                planet = planet1;
                planetHeight = planet.planet.height;
                planetWidth = planet.planet.width;

                fillStats(planet);
                addLight();
                openPlanet(roundArray, textureLoader, planet);
                addGrid(planetWidth, planetHeight, step);
            }
        }, 4000);
    }
*/

    // readJSON("/api/v1/planeten")
    //     .then(data => {
    //         console.log(data);
    //     })
    //     .catch(error => {
    //         console.error(error);
    //     });


   // addMenu();

    //Planet zuordnen
    planetHeight = planet.planet.height;
    planetWidth = planet.planet.width;

    fillStats(planet);
    addLight();
    openPlanet(roundArray, textureLoader, planet);
    addGrid(planetWidth, planetHeight, step);

    scene.background = textureLoader.load('space.png');
    //Zum testen Orbit controll
    // const orbit = new OrbitControls(camera, renderer.domElement);
    // orbit.update();


    // let intersects = raycaster.intersectObject(scene, true);
    //
    // if (intersects.length > 0) {
    //
    //     let object = intersects[0].object;
    //
    //     object.material.color.set( Math.random() * 0xffffff );
    //
    // }

    function animate() {
        //Spiel Rendern
        renderer.render(scene, camera);
        if(mixer){
            mixer.update(1 / 60);
        }
    }

    renderer.setAnimationLoop(animate);
}


// window.addEventListener('resize',function () {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// })


// function readJSON(file) {
//     return new Promise((resolve, reject) => {
//         const xhr = new XMLHttpRequest();
//         xhr.open("GET", file);
//         xhr.onreadystatechange = () => {
//             if (xhr.readyState === 4) {
//                 if (xhr.status === 200) {
//                     resolve(JSON.parse(xhr.responseText));
//                 } else {
//                     reject(xhr.statusText);
//                 }
//             }
//         };
//         xhr.send();
//     });
// }


// async function loadJson(file){
//     await fetch(file).then(function (response) {
//         return response.json();
//     })
//         .then(function (data) {
//             jsonFile =  data;
//     });
//     console.log(jsonFile);
//     return jsonFile;
// }
function fillStats(planet){
    let planetName = planet.planet.name;
    for (let x = 0; x < stats.length; x++) {
        stats[x].style.visibility = "visible";
    }
    document.getElementById('planetName').innerHTML = planetName;

    document.getElementById('planetName').style.visibility= 'visible';


    let tempMax = 0, tempMin = 0, tempAvg = 0, robotNumb = 0, robotStatsBoxArray;


    for(let i = 0; i < planet.planetFields.length; i++) {
         if(tempMax < planet.planetFields[i].temperature){
                tempMax = planet.planetFields[i].temperature;
         }

         tempAvg += planet.planetFields[i].temperature;

         if(planet.planetFields.length - i === 1){
             tempAvg = tempAvg / planet.planetFields.length;
         }

         if(i === 0 || tempMin > planet.planetFields[i].temperature){
             tempMin = planet.planetFields[i].temperature;
         }

        for(let x = 0; x <  planet.planetFields[i].roboter.length; x++){
            robotNumb += 1;
            // Erstelle das äußere div-Element mit der Klasse "robotStatsBox"
            const robotStatsBox = document.createElement("div");
            robotStatsBox.classList.add("robotStatsBox");

            // Erstelle das div-Element mit der Klasse "robotName" und setze den Text auf den Roboter-Namen
            const robotName = document.createElement("div");
            robotName.classList.add("robotName");
            robotName.textContent = planet.planetFields[i].roboter[x].name;
            robotStatsBox.appendChild(robotName);

            // Erstelle das div-Element mit der Klasse "coordinates" und füge die X- und Y-Koordinaten hinzu
            const coordinates = document.createElement("div");
            coordinates.classList.add("coordinates");

            const xCoordinate = document.createElement("div");
            xCoordinate.classList.add("coordinateX");
            xCoordinate.setAttribute("id", "x");
            xCoordinate.textContent = "X: " + planet.planetFields[i].roboter[x].x;

            const yCoordinate = document.createElement("div");
            yCoordinate.classList.add("coordinateY");
            yCoordinate.setAttribute("id", "y");
            yCoordinate.textContent = "Y: " + planet.planetFields[i].roboter[x].y;

            coordinates.appendChild(yCoordinate);
            coordinates.appendChild(xCoordinate);
            robotStatsBox.appendChild(coordinates);

            // Erstelle das div-Element mit der Klasse "robotText" und füge die Temperatur hinzu
            const robotTemp = document.createElement("div");
            robotTemp.classList.add("robotTemp");
            robotTemp.setAttribute("id", "robotTemp");
            robotTemp.textContent = "TEMPERATURE: " + planet.planetFields[i].roboter[x].temperature;

            const robotTempText = document.createElement("div");
            robotTempText.classList.add("robotText");
            robotTempText.appendChild(robotTemp);
            robotStatsBox.appendChild(robotTempText);

            // Erstelle das div-Element mit der Klasse "robotText" und füge die Energie hinzu
            const robotEnergy = document.createElement("div");
            robotEnergy.classList.add("robotEnergy");
            robotEnergy.setAttribute("id", "robotEnergy");
            robotEnergy.textContent = "ENERGY: " + planet.planetFields[i].roboter[x].energy;

            const robotEnergyText = document.createElement("div");
            robotEnergyText.classList.add("robotText");
            robotEnergyText.appendChild(robotEnergy);
            robotStatsBox.appendChild(robotEnergyText);

            // Erstelle das div-Element mit der Klasse "robotText" und füge die Richtung hinzu
            const robotDirection = document.createElement("div");
            robotDirection.classList.add("robotDirection");
            robotDirection.setAttribute("id", "robotDirection");
            robotDirection.textContent = "DIRECTION: " + planet.planetFields[i].roboter[x].direction;

            const robotDirectionText = document.createElement("div");
            robotDirectionText.classList.add("robotText");
            robotDirectionText.appendChild(robotDirection);
            robotStatsBox.appendChild(robotDirectionText);

            // Erstelle das div-Element mit der Klasse "robotText" und füge den Status hinzu
            const robotStatus = document.createElement("div");
            robotStatus.classList.add("robotStatus");
            robotStatus.setAttribute("id", "robotStatus");
            robotStatus.textContent = "STATUS: " + planet.planetFields[i].roboter[x].status;

            const robotStatusText = document.createElement("div");
            robotStatusText.classList.add("robotText");
            robotStatusText.appendChild(robotStatus);
            robotStatsBox.appendChild(robotStatusText);

            // Füge das gesamte Element der Seite hinzu
            document.body.appendChild(robotStatsBox);

            //Roboterboxen Ausrichten
            if(robotNumb === 1){
            } else if(robotNumb === 2){
                robotStatsBox.style.right = '300px';
            } else if(robotNumb === 3){
                robotStatsBox.style.top = '210px';
            }else if(robotNumb === 4){
                robotStatsBox.style.top = '210px';
                robotStatsBox.style.right = '300px';
            }else if(robotNumb === 5){
                robotStatsBox.style.top = '390px';
            }else if(robotNumb === 6){
                robotStatsBox.style.top = '390px';
                robotStatsBox.style.right = '300px';
            }else if(robotNumb === 7){
                robotStatsBox.style.top = '570px';
            }else if(robotNumb === 8){
                robotStatsBox.style.top = '570px';
                robotStatsBox.style.right = '300px';
            }else if(robotNumb === 9){
                robotStatsBox.style.top = '750px';
            }else if(robotNumb === 10){
                robotStatsBox.style.top = '750px';
                robotStatsBox.style.right = '300px';
            }
            if(planet.planetFields[i].roboter[x].status === "CRASHED"){
                robotStatsBox.style.background = "rgba(207, 0, 15, 0.5)";
                loadGlb(planet.planetFields[i].roboter[x].x, planet.planetFields[i].roboter[x].y,  planet.planetFields[i].roboter[x].direction, true);
            }else{
                loadGlb(planet.planetFields[i].roboter[x].x, planet.planetFields[i].roboter[x].y,  planet.planetFields[i].roboter[x].direction, false);
            }
        }
    }

    document.getElementById('tempMax').innerHTML = tempMax?.toFixed(2);;
    document.getElementById(('tempAvg')).innerHTML = tempAvg?.toFixed(2);;
    document.getElementById(('tempMin')).innerHTML = tempMin?.toFixed(2);;
    document.getElementById(('robotNumb')).innerHTML = robotNumb;
}



function loadGlb(x, y, direction, crashed) {
    const loader = new GLTFLoader();

    loader.load(
        'RobotExpressive.glb',
        (gltf) => {
            mesh = gltf.scene;
            mesh.traverse(function (child) {
                if(child.type === 'Mesh') {
                    let m = child;
                    m.castShadow = true;
                    m.frustumCulled = false;
                }
                scene.add(mesh);
            });
            if(direction === "SOUTH"){
                mesh.rotation.set(1.5, 0, 0);
            }else if(direction === "NORTH"){
                mesh.rotation.set(1.5, 3.1, 0);
            }else if(direction === "EAST"){
                mesh.rotation.set(1.5, 1.5, 0);
            }else if(direction === "WEST"){
                mesh.rotation.set(1.5, -1.5, 0);
            }
            mesh.scale.set(0.3, 0.3, 0.3);
                mesh.position.set(x + 0.5,-y - 0.5, 0);
        });
}


function addLight() {
    let light = new THREE.DirectionalLight(0xFFFFFF, 4.0);
    light.position.set(0, 0, 100);
    scene.add(light);
}


function openPlanet( groundArray, textureLoader, planet) {
    for(let i = 0; i < planet.planetFields.length; i++) {
        console.log()
        if(planet.planetFields[i].x > planet.planet.width || planet.planetFields[i].y > planet.planet.height || planet.planetFields[i].x < 0 || planet.planetFields[i].y < 0){
        }else{
            if (planet.planetFields[i].ground === "SAND" || planet.planetFields[i].ground === "WASSER" || planet.planetFields[i].ground === "LAVA" || planet.planetFields[i].ground === "PFLANZEN" || planet.planetFields[i].ground === "GEROELL" || planet.planetFields[i].ground === "FELS" || planet.planetFields[i].ground === "MORAST") {
                let groundpng = textureLoader.load(planet.planetFields[i].ground + ".png");
                const ground = new THREE.Mesh(
                    new THREE.BoxGeometry(1, 1),
                    new THREE.MeshBasicMaterial({
                        side: THREE.DoubleSide,
                        map: groundpng
                    })
                );
                ground.position.set(planet.planetFields[i].x + 0.5,-planet.planetFields[i].y - 0.5, -0.5);
                scene.add(ground);
                //groundArray.push(ground);
            }
        }
    }
}


function addGrid(planetWidth, planetHeight, step){
    camera.position.set(planetWidth / 2, -planetHeight * 2, (planetHeight + planetWidth) / 2);
    camera.rotation.set(1,0,0);
    //camera.position.set(planetWidth / 2, -planetHeight / 1.5, (planetHeight + planetWidth) / 2);
    let material = new THREE.LineBasicMaterial({color: 'white'});


    let geometry = new THREE.BufferGeometry();
    const points = []
    for (let i = 0; i  <= planetHeight; i += step){

        points.push(new THREE.Vector3(0, -i, 0));
        points.push(new THREE.Vector3(planetWidth, -i, 0));
    }
    for (var i = 0; i <= planetWidth; i += step) {

        points.push(new THREE.Vector3(i, 0, 0))
        points.push(new THREE.Vector3(i , -planetHeight, 0))
    }
    geometry.setFromPoints( points );

    var line = new THREE.LineSegments(geometry, material);
    scene.add(line);
}


function addMenu(domEvents){
    camera.position.set(0, 0, 10);
    const geometry = new THREE.SphereGeometry(1);
    const material = new THREE.MeshBasicMaterial({wireframe: true});
    planet = new THREE.Mesh(geometry, material)
    scene.add(planet)
    planet1 = new THREE.Mesh(geometry, material)
    planet1.position.y = 4;
    scene.add(planet1)
    planet2 = new THREE.Mesh(geometry, material)
    planet2.position.y = -4;
    scene.add(planet2)
    renderer.domElement.addEventListener("mousedown", onMouseDown => {
        console.log('Hallo');
    }, false);

}


function render() {

    renderer.render(scene, camera);

}

function apiRequestPlaneten() {
    return new Promise( function (resolve){
        let xhr = new XMLHttpRequest();
        xhr.onload = function () {

        if (this.readyState === 4) {
            if (this.status === 200) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch (e) {
                    console.error("Fehler beim Parsen der JSON-Antwort:", e);
                }
            } else {
                console.error("Fehler beim Abrufen der Daten. Statuscode:", this.status);
            }
        }
    };
    xhr.open("GET", "http://localhost:12345/api/v1/planeten");
    xhr.send()
    });
}

function apiRequestPlanetenDetails(planetenId) {
    return new Promise( function (resolve){
        let xhr = new XMLHttpRequest();
        xhr.onload = function () {

            if (this.readyState === 4) {
                if (this.status === 200) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch (e) {
                        console.error("Fehler beim Parsen der JSON-Antwort:", e);
                    }
                } else {
                    console.error("Fehler beim Abrufen der Daten. Statuscode:", this.status);
                }
            }
        };
        xhr.open("GET", 'http://localhost:12345/api/v1/planeten/' + planetenId + '/details');
        xhr.send()
    });
}


function clearall(elemente) {
    for (let i = scene.children.length - 1; i >= 0; i--) {
        let obj = scene.children[i];
        scene.remove(obj);
    }

    for (let x = 0; x < stats.length; x++) {
        stats[x].style.visibility = "hidden";
    }

    for (let i = 0; i < elemente.length; i++){
        elemente[i].remove();
    }

    document.getElementById('planetName').style.visibility= 'hidden';

}
