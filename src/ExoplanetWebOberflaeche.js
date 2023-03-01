import * as THREE from "three";
import "./style.css";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {FontLoader} from "three/examples/jsm/loaders/FontLoader";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";




let camera, renderer, scene, jsonFile, mesh, data, databool = false;
let stats = document.getElementsByClassName('statsBox');

document.getElementById("startButton").onclick = function() {
    document.getElementById('startMenu').style.visibility = 'hidden';
    document.getElementById("triangleLeft").style.visibility = "visible";
    document.getElementById("triangleRight").style.visibility = "visible";
    document.getElementById("twoToggle").style.visibility = "visible";
    document.getElementById("gridColorToggle").style.visibility = "visible";
    main();
};

async function main() {
    let twoD = true, colorGrid = false;
    let planetenNavi = 0;
    const windowWith = window.innerWidth, windowHeight = window.innerHeight;
    let planetWidth = 0, planetHeight = 0, roundArray, planeten, planet;
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
    planet = await apiRequestPlanetenDetails(planeten[0].id);


    document.getElementById("twoToggle").onclick = function() {
        twoD = !twoD;
        for (let i = 0; i < 10; i++){
            let elemente = document.getElementsByClassName('robotStatsBox');
            clearall(elemente);
        }
        fillStats(planet);
        addLight();
        openPlanet(roundArray, textureLoader, planet, colorGrid, twoD);
        addGrid(planetWidth, planetHeight, step, twoD, colorGrid);
    }

    document.getElementById("gridColorToggle").onclick = function() {
        colorGrid = !colorGrid;
        for (let i = 0; i < 10; i++){
            let elemente = document.getElementsByClassName('robotStatsBox');
            clearall(elemente);
        }
        fillStats(planet);
        addLight();
        openPlanet(roundArray, textureLoader, planet, colorGrid, twoD);
        addGrid(planetWidth, planetHeight, step, twoD, colorGrid);
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
            openPlanet(roundArray, textureLoader, planet, colorGrid, twoD);
            addGrid(planetWidth, planetHeight, step, twoD, colorGrid);
        }else if(planetenNavi < 0){
            planetenNavi = planeten.length - 1;
            for (let i = 0; i < 10; i++){
                let elemente = document.getElementsByClassName('robotStatsBox');
                clearall(elemente);
            }
            //Planet zuordnen
            planet = await apiRequestPlanetenDetails(planeten[planetenNavi].id);
            fillStats(planet);
            addLight();
            openPlanet(roundArray, textureLoader, planet, colorGrid, twoD);
            planetHeight = planet.planet.height;
            planetWidth = planet.planet.width;
            addGrid(planetWidth, planetHeight, step, twoD, colorGrid);
        }else if(planetenNavi === 0){
            for (let i = 0; i < 10; i++){
                let elemente = document.getElementsByClassName('robotStatsBox');
                clearall(elemente);
            }
            //Planet zuordnen
            planet = await apiRequestPlanetenDetails(planeten[planetenNavi].id);
            fillStats(planet);
            addLight();
            openPlanet(roundArray, textureLoader, planet, colorGrid, twoD);
            planetHeight = planet.planet.height;
            planetWidth = planet.planet.width;
            addGrid(planetWidth, planetHeight, step, twoD, colorGrid);
        }
    };

    document.getElementById("triangleRight").onclick = async function() {
        planetenNavi += 1;
        if(planetenNavi < planeten.length){
            for (let i = 0; i < 10; i++){
                let elemente = document.getElementsByClassName('robotStatsBox');
                clearall(elemente);
            }
            //Planet zuordnen
            planet = await apiRequestPlanetenDetails(planeten[planetenNavi].id);
            fillStats(planet);
            addLight();
            openPlanet(roundArray, textureLoader, planet, colorGrid, twoD);
            planetHeight = planet.planet.height;
            planetWidth = planet.planet.width;
            addGrid(planetWidth, planetHeight, step, twoD, colorGrid);
        }else if(planetenNavi === 9){
            planetenNavi = 0;
            for (let i = 0; i < 10; i++){
                let elemente = document.getElementsByClassName('robotStatsBox');
                clearall(elemente);
            }
            //Planet zuordnen
            planet = await apiRequestPlanetenDetails(planeten[planetenNavi].id);
            fillStats(planet);
            addLight();
            openPlanet(roundArray, textureLoader, planet, colorGrid, twoD);
            planetHeight = planet.planet.height;
            planetWidth = planet.planet.width;
            addGrid(planetWidth, planetHeight, step, twoD, colorGrid);
        }
    };


    //Planet zuordnen
    planetHeight = planet.planet.height;
    planetWidth = planet.planet.width;

    fillStats(planet);
    addLight();
    openPlanet(roundArray, textureLoader, planet, colorGrid, twoD);
    addGrid(planetWidth, planetHeight, step, twoD), colorGrid;


    scene.background = textureLoader.load('space.png');
    //Zum testen Orbit controll
    //const orbit = new OrbitControls(camera, renderer.domElement);
    //orbit.update();

    // call api every 5 second to get an update
    setInterval(async function() {await checkForApiUpdate(planeten, planetHeight, planetWidth, planet, textureLoader, roundArray, step, planetenNavi, twoD, colorGrid); }, 5000);

    // Render PlanetMap etc..
    async function animate() {
        //Spiel Rendern
        renderer.render(scene, camera);
    }


    renderer.setAnimationLoop(animate);
    // Clearall test
}


// window.addEventListener('resize',function () {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// })


function fillStats(planet){
    let planetName = planet.planet.name;
    let scannedFields = 0;
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

        if(planet.planetFields[i].ground === ""){
        }else{
            scannedFields += 1;
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

    document.getElementById(('fields')).innerHTML = planet.planet.height * planet.planet.width;
    document.getElementById(('fieldScan')).innerHTML = scannedFields;
}



function loadGlb(x, y, direction, crashed) {
    const loader = new GLTFLoader();

    if(crashed){
        loader.load(
            'trash_bag.glb',
            (gltf) => {
                mesh = gltf.scene;
                mesh.traverse(function (child) {
                    if (child.type === 'Mesh') {
                        let m = child;
                        m.castShadow = true;
                        m.frustumCulled = false;
                    }
                    scene.add(mesh);
                });
                if (direction === "SOUTH") {
                    mesh.rotation.set(1.5, 0, 0);
                } else if (direction === "NORTH") {
                    mesh.rotation.set(1.5, 3.1, 0);
                } else if (direction === "EAST") {
                    mesh.rotation.set(1.5, 1.5, 0);
                } else if (direction === "WEST") {
                    mesh.rotation.set(1.5, -1.5, 0);
                }
                mesh.scale.set(1.5,1.5,1.5);
                mesh.position.set(x + 0.5, -y - 0.5, 0);
            });

    }else {
        loader.load(
            'RobotExpressive.glb',
            (gltf) => {
                mesh = gltf.scene;
                mesh.traverse(function (child) {
                    if (child.type === 'Mesh') {
                        let m = child;
                        m.castShadow = true;
                        m.frustumCulled = false;
                    }
                    scene.add(mesh);
                });
                if (direction === "SOUTH") {
                    mesh.rotation.set(1.5, 0, 0);
                } else if (direction === "NORTH") {
                    mesh.rotation.set(1.5, 3.1, 0);
                } else if (direction === "EAST") {
                    mesh.rotation.set(1.5, 1.5, 0);
                } else if (direction === "WEST") {
                    mesh.rotation.set(1.5, -1.5, 0);
                }
                mesh.scale.set(0.3, 0.3, 0.3);
                mesh.position.set(x + 0.5, -y - 0.5, 0);
            });
    }
}


function addLight() {
    let light = new THREE.DirectionalLight(0xFFFFFF, 4.0);
    light.position.set(0, 0, 100);
    scene.add(light);
}


function openPlanet( groundArray, textureLoader, planet, colorGrid, twoD) {
    if(colorGrid){
        for (let i = 0; i < planet.planetFields.length; i++) {
            if (planet.planetFields[i].x > planet.planet.width || planet.planetFields[i].y > planet.planet.height || planet.planetFields[i].x < 0 || planet.planetFields[i].y < 0) {
            } else {
                if(twoD){
                    var fontLoader = new FontLoader();
                    fontLoader.load('gentilis_bold.typeface.json', function(font) {
                        var textGeometry = new TextGeometry('TEMP: ' + planet.planetFields[i].temperature, {
                            font: font,
                            size: 0.1,
                            height: 0.01
                        });

                        var material = new THREE.MeshStandardMaterial({ color: 0xffffff });
                        var mesh = new THREE.Mesh(textGeometry, material);

                        mesh.position.set(planet.planetFields[i].x + 0.5, -planet.planetFields[i].y - 0.5, 0.5);

                        scene.add(mesh);
                    });
                }
                const ground = new THREE.Mesh(
                    new THREE.PlaneGeometry(1, 1),
                    new THREE.MeshBasicMaterial({
                        side: THREE.DoubleSide,
                    })
                );
                if (planet.planetFields[i].ground === "SAND") {
                    ground.material.color.setHex( 0xffff00 );
                }else if(planet.planetFields[i].ground === "WASSER"){
                    ground.material.color.setHex( 0x0000ff );
                }else if(planet.planetFields[i].ground === "LAVA") {
                    ground.material.color.setHex( 0xffa500 );
                }else if(planet.planetFields[i].ground === "PFLANZEN") {
                    ground.material.color.setHex( 0x00cd00 );
                }else if(planet.planetFields[i].ground === "GEROELL") {
                    ground.material.color.setHex( 0xbebebe );
                }else if(planet.planetFields[i].ground === "FELS") {
                    ground.material.color.setHex( 0x2f4f4f );
                }else if(planet.planetFields[i].ground === "MORAST") {
                    ground.material.color.setHex( 0x8b4513 );
                }else {
                    ground.material.color.setHex( 0xffffafa );
                    }

                ground.position.set(planet.planetFields[i].x + 0.5 , -planet.planetFields[i].y - 0.5);
                scene.add(ground);
            }
        }
    }else {
        for (let i = 0; i < planet.planetFields.length; i++) {
            if (planet.planetFields[i].x > planet.planet.width || planet.planetFields[i].y > planet.planet.height || planet.planetFields[i].x < 0 || planet.planetFields[i].y < 0) {
            } else {
                if (planet.planetFields[i].ground === "SAND" || planet.planetFields[i].ground === "WASSER" || planet.planetFields[i].ground === "LAVA" || planet.planetFields[i].ground === "PFLANZEN" || planet.planetFields[i].ground === "GEROELL" || planet.planetFields[i].ground === "FELS" || planet.planetFields[i].ground === "MORAST") {
                    let groundpng = textureLoader.load(planet.planetFields[i].ground + ".png");
                    const ground = new THREE.Mesh(
                        new THREE.BoxGeometry(1, 1),
                        new THREE.MeshBasicMaterial({
                            side: THREE.DoubleSide,
                            map: groundpng
                        })
                    );
                    ground.position.set(planet.planetFields[i].x + 0.5, -planet.planetFields[i].y - 0.5, -0.5);
                    scene.add(ground);
                    //groundArray.push(ground);
                }
            }
        }
    }
}


function addGrid(planetWidth, planetHeight, step, twoD, colorGrid){
    let material;
    if(twoD){
        camera.position.set(planetWidth / 2, -planetHeight / 2, (planetHeight + planetWidth) / 1.5);

    }else{
        camera.position.set(planetWidth / 2, -planetHeight * 2, (planetHeight + planetWidth) / 2);
        camera.rotation.set(1,0,0);
    }

    if(colorGrid){
        material = new THREE.LineBasicMaterial({color: 'black'});
    }else{
        material = new THREE.LineBasicMaterial({color: 'white'});
    }

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
async function checkForApiUpdate(planeten, planetHeight, planetWidth, planet, textureLoader, roundArray, step, planetenNavi, twoD, colorGrid) {
    let planeten1 = await apiRequestPlaneten();
    let planet1 = await apiRequestPlanetenDetails(planeten[planetenNavi].id);
    if (JSON.stringify(planeten1) !== JSON.stringify(planeten)) {
        planeten = JSON.parse(JSON.stringify(planet1));
    }
    if (JSON.stringify(planet1) !== JSON.stringify(planet)) {
        planet = JSON.parse(JSON.stringify(planet1));
        planetHeight = planet.planet.height;
        planetWidth = planet.planet.width;

        for (let i = 0; i < 10; i++){
            let elemente = document.getElementsByClassName('robotStatsBox');
            clearall(elemente);
        }
        fillStats(planet);
        addLight();
        openPlanet(roundArray, textureLoader, planet, colorGrid, twoD);
        addGrid(planetWidth, planetHeight, step, twoD, colorGrid);
    }
    //clearallWithOutElements();
}
