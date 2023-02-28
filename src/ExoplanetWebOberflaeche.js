import * as THREE from "three";
import "./style.css";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {element, func} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";
import * as events from "events";
import {publishReplay} from "rxjs";

let camera, renderer, scene, jsonFile, mesh, data, databool = false;
let stats = document.getElementsByClassName('statsBox');
let mixer, twoD = false;



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
            fillStats(planet, twoD);
            addLight();
            openPlanet(roundArray, textureLoader, planet);
            addGrid(planetWidth, planetHeight, step, twoD);
        }else if(planetenNavi < 0){
            planetenNavi = planeten.length - 1;
            for (let i = 0; i < 10; i++){
                let elemente = document.getElementsByClassName('robotStatsBox');
                clearall(elemente);
            }
            planet = await apiRequestPlanetenDetails(planeten[planetenNavi].id);
            fillStats(planet, twoD);
            addLight();
            openPlanet(roundArray, textureLoader, planet);
            addGrid(planetWidth, planetHeight, step, twoD);
        }else if(planetenNavi === 0){
            for (let i = 0; i < 10; i++){
                let elemente = document.getElementsByClassName('robotStatsBox');
                clearall(elemente);
            }
            planet = await apiRequestPlanetenDetails(planeten[planetenNavi].id);
            fillStats(planet, twoD);
            addLight();
            openPlanet(roundArray, textureLoader, planet);
            addGrid(planetWidth, planetHeight, step, twoD);
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
            fillStats(planet, twoD);
            addLight();
            openPlanet(roundArray, textureLoader, planet);
            addGrid(planetWidth, planetHeight, step, twoD);
        }else if(planetenNavi === 9){
            planetenNavi = 0;
            for (let i = 0; i < 10; i++){
                let elemente = document.getElementsByClassName('robotStatsBox');
                clearall(elemente);
            }
            planet = await apiRequestPlanetenDetails(planeten[planetenNavi].id);
            fillStats(planet, twoD);
            addLight();
            openPlanet(roundArray, textureLoader, planet);
            addGrid(planetWidth, planetHeight, step, twoD);
        }
    };

    //Planet zuordnen
    planetHeight = planet.planet.height;
    planetWidth = planet.planet.width;

    fillStats(planet, twoD);
    addLight();
    openPlanet(roundArray, textureLoader, planet);
    addGrid(planetWidth, planetHeight, step, twoD);


    scene.background = textureLoader.load('space.png');
    //Zum testen Orbit controll
    // const orbit = new OrbitControls(camera, renderer.domElement);
    // orbit.update();

    // Render PlanetMap etc..
    async function animate() {
        //Spiel Rendern
        renderer.render(scene, camera);

        // call api every frame to get an update
        await checkForApiUpdate(planeten, planetHeight, planetWidth, planet, textureLoader, roundArray, step, planetenNavi)

    }


    renderer.setAnimationLoop(animate);
    // Clearall test
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
function fillStats(planet, twoD){
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

    if(tempMax){
        document.getElementById('tempMax').innerHTML = tempMax.toFixed(2);
    }else{
        document.getElementById('tempMax').innerHTML = 0;
    }

    if(tempAvg){
        document.getElementById(('tempAvg')).innerHTML = tempAvg.toFixed(2);
    }else{
        document.getElementById(('tempAvg')).innerHTML = 0;
    }

    if(tempMin){
        document.getElementById(('tempMin')).innerHTML = tempMin.toFixed(2);
    }else{
        document.getElementById(('tempMin')).innerHTML = 0;
    }
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


function addGrid(planetWidth, planetHeight, step, twoD){
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

// Clear the hole screen
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

// Just clear the planetMap
function clearallWithOutElements() {
    for (let i = scene.children.length; i >= 0; i--) {
        let obj = scene.children[i];
        scene.remove(obj);
    }
}




//Check if Api is updateted
async function checkForApiUpdate(planeten, planetHeight, planetWidth, planet, textureLoader, roundArray, step, planetenNavi) {
    let planeten1 = await apiRequestPlaneten();
    let planet1 = await apiRequestPlanetenDetails(planeten[planetenNavi].id);
    if (JSON.stringify(planeten1) !== JSON.stringify(planeten)) {
        planeten = planeten1;
    }
    if (JSON.stringify(planet1) !== JSON.stringify(planet)) {
        planet = planet1;
        planetHeight = planet.planet.height;
        planetWidth = planet.planet.width;

        for (let i = 0; i < 10; i++){
            let elemente = document.getElementsByClassName('robotStatsBox');
            clearall(elemente);
        }
        fillStats(planet, twoD);
        addLight();
        openPlanet(roundArray, textureLoader, planet);
        addGrid(planetWidth, planetHeight, step, twoD);
    }
    //clearallWithOutElements()
}
