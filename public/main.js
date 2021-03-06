const { Engine, Composite, Render, World, Bodies, Body, Detector, Constraint } = Matter;
let ground;
let ceiling;
let engine;
let leftWall;
let rightWall;
let steve;
let steveio;
let boxes = [];
let RIGHT = false;
let LEFT = false;
let DOWN = false;
let dagger;
let sword;
let axe;
let collidedBodies = [];
let gameMode = "load";
let victorDisplayed = false;
let victor;
let socket = io();
let id;
let username;
let lobbyChat = [];
let roomChat = [];
let roomPartner;
let roomName;
let inMultiplayerFight;
let fightTimer = 0;
let sounds = {};
let hats = {};
let currDifficulty;
let currHat;
let currOpponentHat = "";
var timeDisarmed;
if (localProxy.achievements === undefined) {
    localProxy.achievements = [];
}
if (localProxy.unlockedHats === undefined) {
    localProxy.unlockedHats = ["undefined", "witch"];
    localProxy.achievements.forEach((achievementName) => {
        const hatsUnlocked = achievementList.find(achievement => achievement.title === achievementName).hatsUnlocked;
        if (hatsUnlocked) {
            localProxy.unlockedHats = localProxy.unlockedHats.concat(hatsUnlocked);
        }
    })
}
if (localProxy.gamesInARow === undefined) {
    localProxy.gamesInARow = 0;
}
if (localProxy.hat === undefined) {
    localProxy.hat = "undefined";
}
if(localProxy.gamesPlayed === undefined){
	localProxy.gamesPlayed = 0;
}
if(localProxy.diffHatsTried === undefined){
	localProxy.diffHatsTried = [];
}

currHat = localProxy.hat;

function preload() {
    dagger = loadImage("dagger.png");
    sword = loadImage("sword.png");
    axe = loadImage("axe.png");
    hats.undefined = createImage(1, 1);
    hats.undefined.sourceFile = "undefined.png";
    hats.witch = loadImage("witchhat.png");
    hats.witch.sourceFile = "witchhat.png";
    hats.witch.xOffset = -30;
    hats.witch.yOffset = -50;
    hats.sunglasses = loadImage("sunglasses.png");
    hats.sunglasses.sourceFile = "sunglasses.png";
    hats.sunglasses.xOffset = -25;
    hats.sunglasses.yOffset = -32;
    hats.sunglasses.customWidth = 40;
    hats.cake = loadImage("cake.png");
    hats.cake.sourceFile = "cake.png";
    hats.cake.xOffset = -30;
    hats.cake.yOffset = -60;
    hats.voidhat = loadImage("voidhat.png");
    hats.voidhat.sourceFile = "voidhat.png";
    hats.voidhat.xOffset = -30;
    hats.voidhat.yOffset = -30;
    hats.axe = loadImage("axehat.png");
    hats.axe.sourceFile = "axehat.png";
    hats.axe.xOffset = -35;
    hats.axe.yOffset = -60;
    hats.cap = loadImage("cap.png");
    hats.cap.sourceFile = "cap.png";
    hats.cap.xOffset = -23;
    hats.cap.yOffset = -28;
    hats.cap.customHeight = 30;
    hats.head = loadImage("head.png");
    hats.head.sourceFile = "head.png";
    hats.head.xOffset = -20;
    hats.head.yOffset = -25 * 2;
    hats.head.customWidth = 40;
    hats.head.customHeight = 40;
    hats.ball = loadImage("bowlingball.png");
    hats.ball.sourceFile = "bowlingball.png";
    hats.ball.xOffset = -15;
    hats.ball.yOffset = -15;
    hats.ball.customWidth = 30;
    hats.ball.customHeight = 30;
    hats.hamilton = loadImage("hamilton.png");
    hats.hamilton.sourceFile = "hamilton.png";
    hats.hamilton.xOffset = -45;
    hats.hamilton.yOffset = -30;
    hats.hamilton.customWidth = 90;
    hats.ben = loadImage("benfranklin.png");
    hats.ben.sourceFile = "benfranklin.png";
    hats.ben.xOffset = -40;
    hats.ben.yOffset = -30;
    hats.ben.customWidth = 80;
    hats.techno = loadImage("technoblade.png");
    hats.techno.sourceFile = "technoblade.png";
    hats.techno.xOffset = -15;
    hats.techno.yOffset = -15;
    hats.techno.customWidth = 30;
    hats.techno.customHeight = 30;
    hats.potato = loadImage("potato.png");
    hats.potato.sourceFile = "potato.png";
    hats.potato.xOffset = -30; // how much the hat is x offset by
    hats.potato.yOffset = -30; // how much the hat is y offset by
    hats.tongue = loadImage("tongue.png");
    hats.tongue.sourceFile = "tongue.png";
    hats.tongue.xOffset = -15; // how much the hat is x offset by
    hats.tongue.yOffset = -15; // how much the hat is y offset by
    hats.tongue.customWidth = 30; // how much the hat is y offset by
    hats.tongue.customHeight = 30; // how much the hat is y offset by
    hats.bowtie = loadImage("bowtie.png");
    hats.bowtie.sourceFile = "bowtie.png";
    hats.bowtie.xOffset = -20; // how much the hat is x offset by
    hats.bowtie.yOffset = 0; // how much the hat is y offset by
    hats.bowtie.customWidth = 40; // how much the hat is y offset by
    hats.bowtie.customHeight = 40; // how much the hat is y offset by
    hats.cry = loadImage("cry.png");
    hats.cry.sourceFile = "cry.png";
    hats.cry.xOffset = -20; // how much the hat is x offset by
    hats.cry.yOffset = -20; // how much the hat is y offset by
    hats.cry.customWidth = 40; // how much the hat is y offset by
    hats.cry.customHeight = 40; // how much the hat is y offset by
}

function setup() {
    createCanvas(600, 600);
    sounds.clash = loadSound("swordclash.mp3");
    sounds.out = loadSound("swordout.mp3");
    sounds.swing = loadSound("swordswing.mp3");
    sounds.hit = loadSound("swordhit.mp3");
    sounds.death = loadSound("death.mp3");
    sounds.trumpet = loadSound("trumpet.mp3");
    sounds.drag = loadSound("sworddrag.mp3");
    sounds.thud = loadSound("thud.mp3");
    sounds.background = loadSound("background.mp3");
    engine = Engine.create();
    ground = Bodies.rectangle(width / 2, height + 25, width + 10, 100, {
        isStatic: true,
        collisionFilter: {
            category: 1
        },
        friction: 1
    });
    ceiling = Bodies.rectangle(width / 2, -25, width + 10, 100, {
        isStatic: true,
        collisionFilter: {
            category: 1
        },
        friction: 1
    });
    leftWall = Bodies.rectangle(-25, height / 2, 100, height + 10, {
        isStatic: true,
        collisionFilter: {
            category: 1
        },
        friction: 1
    });
    rightWall = Bodies.rectangle(width + 25, height / 2, 100, height + 10, {
        isStatic: true,
        collisionFilter: {
            category: 1
        },
        friction: 1
    });
    for (let i = 0; i < 0; i++) {
        boxes.push(Bodies.rectangle(random(50, 550), random(50, 550), 25, 25, {
            collisionFilter: {
                category: 1
            },
        }));
    }
    steve = Person({
        x: 500,
        y: 475,
        weapon: dagger,
        category: 4
            //color: genColor()
    });
    steveio = Person({
        x: 100,
        y: 475,
        weapon: axe,
        category: 2
            //color: genColor()
    });
    //start();
}
let doneOnce = false;

function start(difficulty, { side = "left", leftColor, rightColor } = {}) {
	console.log(localProxy.diffHatsTried[localProxy.diffHatsTried.length-1], localProxy.hat);
	localProxy.gamesPlayed++;
	if(localProxy.diffHatsTried[localProxy.diffHatsTried.length-1] !== localProxy.hat){
		localProxy.diffHatsTried = localProxy.diffHatsTried.concat([localProxy.hat]);
		if(localProxy.diffHatsTried.length > 6) achievements.add(stylish);
	}
    currDifficulty = difficulty;
    fightTimer = 60 * 3;
    victorDisplayed = false;
    let steveWeapon;
    let steveioWeapon;
    let steveCow;
    switch (difficulty) {
        case "Easy":
            steveCow = 0.99;
            steveWeapon = dagger;
            steveioWeapon = axe;
            break;
        case "Medium":
            steveCow = 0.97;
            steveWeapon = sword;
            steveioWeapon = sword;
            break;
        case "Hard":
            steveCow = 0.95;
            steveWeapon = axe;
            steveioWeapon = sword;
            break;
        case "Insane":
            steveCow = 0.9;
            steveWeapon = axe;
            steveioWeapon = dagger;
            break;
        case "Multiplayer":
            steveCow = 0;
            steveWeapon = sword;
            steveioWeapon = sword;
            break;
    }
    if (steve) {
        steve.remove();
    }
    if (steveio) {
        steveio.remove();
    }
    if (difficulty === "Multiplayer") {
        steve = Person({
            x: side === "left" ? 500 : 100,
            y: 475,
            weapon: steveWeapon,
            category: 4,
            cowardice: steveCow,
            puppet: difficulty === "Multiplayer",
            color: side === "left" ? rightColor : leftColor,
            hat: currOpponentHat
        });
        steveio = Person({
            x: side === "left" ? 100 : 500,
            y: 475,
            weapon: steveioWeapon,
            category: 2,
            color: side === "left" ? leftColor : rightColor,
            hat: currHat
        });
        inMultiplayerFight = true;
    } else {
        currOpponentHat = "undefined";
        steve = Person({
            x: 500,
            y: 475,
            weapon: steveWeapon,
            category: 4,
            cowardice: steveCow,
            puppet: difficulty === "Multiplayer",
            hat: currOpponentHat
                //color: genColor()
        });
        steveio = Person({
            x: 100,
            y: 475,
            weapon: steveioWeapon,
            category: 2,
            hat: currHat
                //color: genColor()
        });
    }
    if (doneOnce === false) {
        World.add(engine.world, [ground, ceiling, leftWall, rightWall, ...boxes]);
    }
    steveio.add();
    steve.add();
    if (doneOnce === false) {
        Engine.run(engine);
    }
    doneOnce = true;
    gameMode = "play";
}
let effects = [];
let prevCollisions = [];

function draw() {
    background(0);
    if (gameMode === "play") {
        if (fightTimer > 0) {
            fill(255);
            textSize(50);
            text(ceil(fightTimer / 60), 300, 300);
        }
        fill(200);
        noStroke();
        /*boxes.forEach(box => {
            drawVertices(box.vertices);
            const gravity = engine.world.gravity;
            Body.applyForce(box, box.position, {
                x: -gravity.x * gravity.scale * box.mass,
                y: -gravity.y * gravity.scale * box.mass
            });
        })*/
        drawVertices(ground.vertices);
        drawVertices(ceiling.vertices);
        drawVertices(leftWall.vertices);
        drawVertices(rightWall.vertices);
        stroke(0);
        steve.draw();
        steveio.draw();
        steve.takeDamage();
        steveio.takeDamage();
        textSize(13);
        fill(0);
        text("You", 120, 12);
        text("Opponent", 460, 12);
        strokeWeight(2);
        noFill();
        rect(1, 1, 102, 10);
        strokeWeight(0);
        fill(255 * (1 - steveio.getHealth()), 255 * steveio.getHealth(), 0)
        rect(2, 2, 100 * steveio.getHealth(), 8);
        strokeWeight(1);
        strokeWeight(2);
        noFill();
        rect(497, 1, 102, 10);
        strokeWeight(0);
        fill(255 * (1 - steve.getHealth()), 255 * steve.getHealth(), 0);
        rect(498, 2, 100 * steve.getHealth(), 8);
        strokeWeight(1);
        [...steveio.collisionPoints(), ...steve.collisionPoints()].forEach((point) => {
            if (point && point.length !== 0) {
                fill(255, 0, 0);
                noStroke();
                //circle(point.x, point.y, 5);
                if (!collidedBodies.some((body) => body === point.body)) {
                    collidedBodies.push(point.body);
                    const s = new ParticleSystem(createVector(point.x, point.y));
                    for (let i = 0; i < 5; i++) {
                        s.addParticle();
                    }
                    effects.push(s);
                }
            }
        });
        collidedBodies.forEach((body, i) => {
                if (Math.random() < 0.01) {
                    collidedBodies.splice(i, 1);
                }
            })
            //prevCollisions = [...steve.collisionPoints(), ...steveio.collisionPoints()];
        effects.forEach(system => {
                system.run();
                strokeWeight(1);
            })
            /*if (RIGHT && steveio.speed < 5) {
                steveio.speed += 0.25;
            } else
            if (LEFT && steveio.speed > -5) {
                steveio.speed -= 0.25;
            } else if (steveio.touchingGround()) {
                steveio.speed *= 0.8;
            }
            if (DOWN) {
                steveio.down();
            }*/
        if (steveio.touchingGround()) {
            steveio.speed *= 0.9;
        } else {
            steveio.speed *= 0.99;
        }
        if (inMultiplayerFight) {
            socket.emit("sendBodyData", { roomName, bodyData: steveio.getVelocities(), bodyPosData: steveio.getPositions(), bodyAngData: steveio.getAngles(), bodyAngVData: steveio.getAngleVels(), health: steveio.getHealth() });
        }
        if (fightTimer === 180) {
            sounds.trumpet.setVolume(0.1);
            sounds.trumpet.play();
        }
        if (fightTimer === 0) {
            sounds.background.setVolume(0.1);
            sounds.background.loop();
        }
        fightTimer -= 1;
    } else {
        sounds.background.stop();
    }
    achievements.render();
}

function drawCircle(body) {
    circle(body.position.x, body.position.y, body.circleRadius * 2);
}

function drawVertices(vertices) {
    beginShape();
    for (var i = 0; i < vertices.length; i++) {
        vertex(vertices[i].x, vertices[i].y);
    }
    endShape(CLOSE);
}

function drawConstraint(c) {
    line(c.bodyA.position.x + c.pointA.x, c.bodyA.position.y + c.pointA.y, c.bodyB.position.x + c.pointB.x, c.bodyB.position.y + c.pointB.y);
}
let volSetting = true;

function keyPressed() {
    if (key === "m" || key === "M") {
        if (volSetting) {
            masterVolume(0);
        } else {
            masterVolume(1);
        }
        volSetting = !volSetting;
    }
    if (gameMode === "play") {
        if (key === " " && fightTimer < 0) {
            steveio.jump();
        }
        if (key === "ArrowRight") {
            RIGHT = true;
        }
        if (key === "ArrowLeft") {
            LEFT = true;
        }
        if (key === "ArrowDown") {
            DOWN = true;
        }
    }
}

function keyReleased() {
    if (gameMode === "play") {
        if (key === "ArrowUp") {
            //steveio.jump();
        }
        if (key === "ArrowRight") {
            RIGHT = false;
        }
        if (key === "ArrowLeft") {
            LEFT = false;
        }
        if (key === "ArrowDown") {
            DOWN = false;
        }
    }
}
const menu = document.getElementById("menu");

function displayVictor() {
	if(performance.now()-timeDisarmed > 60000 && winner === "You"){
		achievements.add(neverGiveUp);
	}
    if (!victorDisplayed) {
        let winner = (victor === steveio) ? "You" : "The AI";
        if (inMultiplayerFight) {
            winner = "You";
        }
        if (victor === steveio) {
            localProxy.gamesInARow += 1;
            switch (localProxy.gamesInARow) {
                case 3:
                    achievements.add(hatTrick);
                    break;
                case 5:
                    achievements.add(fiver);
                    break;
                case 10:
                    achievements.add(hamilton);
                    break;
                case 100:
                    achievements.add(benFranklin);
                    break;
            }
            if(localProxy.gamesPlayed>200) achievements.add(technoblade);
            switch (currDifficulty) {
                case "Easy":
                    achievements.add(pieceOfCake);
                    break;
                case "Medium":
                    achievements.add(fightScene);
                    break;
                case "Hard":
                    achievements.add(axeTheHead);
                    break;
                case "Insane":
                    achievements.add(undying);
                    break;
                case "Multiplayer":
                    achievements.add(strangerDanger);
                    break;
            }
            const timeTaken = fightTimer / -60;
            if (timeTaken < 30) {
                achievements.add(gg);
            }
            if (timeTaken < 15) {
                achievements.add(ggNoob);
            }
            if (timeTaken < 10) {
                achievements.add(lolGGEz);
            }
        }
        if (victor === steve) {
            localProxy.gamesInARow = 0;
            const timeTaken = fightTimer / -60;
            if (timeTaken < 10) {
                achievements.add(gitGud);
            }
            if (timeTaken > 60) {
                achievements.add(lastStand);
            }
        }
        const winMessage = (victor === steve && inMultiplayerFight) ? "Lost" : "Won"
        menu.innerHTML = `<h1 style="font-size: 60px; margin-left: ${winner === "You" ? 108 : 78}px" class="w3-text-white w3-animate-opacity">${winner} ${winMessage}</h1>`;
        const restartButton = document.createElement("button");
        restartButton.innerHTML = inMultiplayerFight ? "Return To Lobby" : "Restart";
        restartButton.style.marginLeft = "100px";
        restartButton.classList.add(...
            "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
        restartButton.onclick = inMultiplayerFight ? (() => {
            gameMode = "load";
            displayRoomLobby(roomPartner);
            displayRoomChat();
        }) : singlePlayerSelection;
        menu.appendChild(restartButton);
        victorDisplayed = true;
    }
}
const singlePlayerSelection = () => {
    gameMode = "load";
    menu.innerHTML = `<h1 style="font-size: 60px; margin-left: 64px;" class="w3-text-white">Singleplayer</h1>
    <p style="margin-left: 32px" class="w3-xlarge w3-text-white">Difficulty:</p>`
        /*
        <select id="difficulty" style="margin-left: 24px" class="w3-select">
        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>
        <option>Master</option>
        </select>
        */
    const difficulty = document.createElement("select");
    difficulty.innerHTML = `<option>Easy</option>
   <option>Medium</option>
   <option>Hard</option>
   <option>Insane</option>`;
    difficulty.style.marginLeft = "24px";
    difficulty.classList.add("w3-select");
    menu.appendChild(difficulty);
    menu.appendChild(document.createElement("br"));
    menu.appendChild(document.createElement("br"));
    const startButton = document.createElement("button");
    startButton.innerHTML = "Start";
    startButton.style.marginLeft = "32px";
    startButton.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    startButton.onclick = () => {
        menu.innerHTML = "";
        const diffVal = difficulty.value;
        start(diffVal);
    }
    menu.appendChild(startButton);
    const backButton = document.createElement("button");
    backButton.innerHTML = "Back";
    backButton.style.marginLeft = "32px";
    backButton.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    backButton.onclick = mainMenu;
    menu.appendChild(document.createElement("br"));
    menu.appendChild(document.createElement("br"))
    menu.appendChild(backButton);
}
const askUsername = () => {
    gameMode = "load";
    menu.innerHTML = `<h1 style="font-size: 60px; margin-left: 64px;" class="w3-text-white">Multiplayer</h1>`;
    const usernameBox = document.createElement("input");
    usernameBox.setAttribute("placeholder", "Enter a username...");
    usernameBox.classList.add("w3-xlarge");
    usernameBox.style.marginLeft = "48px";
    usernameBox.onkeyup = (e) => {
        if (e.key === "Enter") {
            username = usernameBox.value;
            openLobby();
        }
    }
    menu.appendChild(usernameBox);
    const backButton = document.createElement("button");
    backButton.innerHTML = "Back";
    backButton.style.marginLeft = "32px";
    backButton.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    backButton.onclick = mainMenu;
    menu.appendChild(document.createElement("br"));
    menu.appendChild(document.createElement("br"))
    menu.appendChild(backButton);
}
const openLobby = () => {
    gameMode = "load";
    menu.innerHTML = `<h1 style="font-size: 60px; margin-left: 64px;" class="w3-text-white">Multiplayer</h1>`;
    const chatLog = document.createElement("div");
    chatLog.classList.add("w3-white", "w3-round-xlarge");
    chatLog.style.padding = "4px";
    chatLog.style.width = "200px";
    chatLog.style.height = "200px";
    chatLog.style.fontFamily = "'Ubuntu', sans-serif";
    chatLog.style.marginLeft = "110px";
    chatLog.style.textAlign = "left";
    chatLog.style.overflowY = "scroll";
    chatLog.style.wordWrap = "break-word";
    chatLog.innerHTML = "Chat Log:<br>";
    chatLog.id = "chatLog";
    const chatInput = document.createElement("input");
    chatInput.classList.add("w3-round-xlarge")
    chatInput.style.marginLeft = "110px";
    chatInput.placeholder = `Message Here...`;
    chatInput.style.width = "200px";
    chatInput.style.fontFamily = "'Ubuntu', sans-serif";
    chatInput.onkeyup = (e) => {
        if (e.key === "Enter") {
            sendMessage(chatInput.value);
            chatInput.value = "";
        }
    }
    const randomMatch = document.createElement("button");
    randomMatch.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    randomMatch.innerHTML = "Random Match";
    randomMatch.style.marginLeft = "105px";
    randomMatch.onclick = () => {
        menu.innerHTML = `<h1 style="font-size: 60px; margin-left: 100px;" class="w3-text-white">Waiting...</h1>`;
        socket.emit("addToRWaiting", {
            username,
            id,
            currHat
        });
    }
    const createMatch = document.createElement("button");
    createMatch.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    createMatch.innerHTML = "Create Match";
    createMatch.style.marginLeft = "35px";
    createMatch.onclick = () => {
        socket.emit("createCustomRoom", { username, id, currHat });
    }
    const joinMatch = document.createElement("button");
    joinMatch.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    joinMatch.innerHTML = "Join Match";
    joinMatch.style.marginLeft = "20px";
    joinMatch.onclick = () => {
        Swal.fire({
            title: "Enter Room Code",
            input: "text",
            showCancelButton: true
        }).then(({ value }) => {
            if (value) {
                socket.emit("attemptRoomJoin", { roomName: value, username, id, currHat });
            }
        })
    }
    menu.appendChild(chatLog);
    const group = document.createElement("div");
    group.style.textAlign = "left";
    group.appendChild(chatInput);
    group.appendChild(document.createElement("br"));
    group.appendChild(document.createElement("br"));
    group.appendChild(randomMatch);
    group.appendChild(document.createElement("br"));
    group.appendChild(document.createElement("br"));
    group.appendChild(createMatch);
    group.appendChild(joinMatch);
    menu.appendChild(group);
    displayLobbyChat();
}
const displayLobbyChat = () => {
    const chatLog = document.getElementById("chatLog")
    if (chatLog) {
        chatLog.innerHTML = " Chat Log:<br>";
        lobbyChat.forEach(message => {
            chatLog.innerHTML += message;
            chatLog.innerHTML += "<br>";
        });
        chatLog.scrollTop = chatLog.scrollHeight;
    }
}
const displayRoomChat = () => {
    const chatLog = document.getElementById("chatLogRoom")
    if (chatLog) {
        chatLog.innerHTML = " Chat Log:<br>";
        roomChat.forEach(message => {
            chatLog.innerHTML += message;
            chatLog.innerHTML += "<br>";
        });
        chatLog.scrollTop = chatLog.scrollHeight;
    }
}
const displayRoomLobby = (partner) => {
    roomName = partner.roomName;
    menu.innerHTML = "";
    const title = document.createElement("h1");
    title.classList.add("w3-text-white");
    title.innerHTML = partner.username !== undefined ? `Partner Found: ${partner.username}` : `Room Code: ${roomName}`;
    const chatLog = document.createElement("div");
    chatLog.classList.add("w3-white", "w3-round-xlarge");
    chatLog.style.padding = "4px";
    chatLog.style.width = "200px";
    chatLog.style.height = "200px";
    chatLog.style.fontFamily = "'Ubuntu', sans-serif";
    chatLog.style.marginLeft = "110px";
    chatLog.style.textAlign = "left";
    chatLog.style.overflowY = "scroll";
    chatLog.style.wordWrap = "break-word";
    chatLog.innerHTML = "Chat Log:<br>";
    chatLog.id = "chatLogRoom";
    const chatInput = document.createElement("input");
    chatInput.classList.add("w3-round-xlarge")
    chatInput.style.marginLeft = "110px";
    chatInput.placeholder = `Message Here...`;
    chatInput.style.width = "200px";
    chatInput.style.fontFamily = "'Ubuntu', sans-serif";
    chatInput.onkeyup = (e) => {
        if (e.key === "Enter") {
            sendRoomMessage(chatInput.value);
            chatInput.value = "";
        }
    }
    const fightButton = document.createElement("button");
    fightButton.innerHTML = "Fight";
    fightButton.style.marginLeft = "150px";
    fightButton.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    fightButton.onclick = () => {
        socket.emit("startFightMessage", { roomName });
    }
    const leaveButton = document.createElement("button");
    leaveButton.innerHTML = "Leave";
    leaveButton.style.marginLeft = "150px";
    leaveButton.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    leaveButton.onclick = () => {
        openLobby();
        socket.emit("takeDownRoom", { roomName });
    }
    menu.appendChild(title);
    menu.appendChild(chatLog);
    const group = document.createElement("div");
    group.style.textAlign = "left";
    group.appendChild(chatInput);
    group.appendChild(document.createElement("br"));
    group.appendChild(document.createElement("br"));
    group.appendChild(fightButton);
    group.appendChild(document.createElement("br"));
    group.appendChild(document.createElement("br"));
    group.appendChild(leaveButton);
    menu.appendChild(group);
}
const achievementHall = () => {
    menu.innerHTML = `<h1 style="font-size: 60px;" class="w3-text-white">Achievements</h1>`;
    const achievementDisplay = document.createElement("div");
    achievementDisplay.classList.add("w3-text-white");
    achievementDisplay.style.maxHeight = "300px";
    achievementDisplay.style.maxWidth = "400px";
    achievementDisplay.style.overflow = "scroll";
    achievementList.forEach(a => {
        achievementDisplay.innerHTML += `
            <div style="padding: 4px; max-height: 100px; border: 2px solid white;" class="w3-text-white w3-gray">
            <h4 class="${localProxy.achievements.includes(a.title) ? "w3-text-white" : "graytext"}">${a.title}</h4>
            <p class="${localProxy.achievements.includes(a.title) ? "w3-text-white" : "graytext"}"><em>${a.desc}</em></p>
            </div>
        `;
    });
    const backButton = document.createElement("button");
    backButton.innerHTML = "Back";
    backButton.style.marginLeft = "150px";
    backButton.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    backButton.onclick = mainMenu;
    /*
    <br>
        <br>
        <button id="singleplayer" style="width:200px" class="w3-button w3-gray w3-xlarge w3-text-white w3-round">Singleplayer</button>
        <br>
        <br>
        <button id="multiplayer" style="width:200px" class="w3-button w3-gray w3-xlarge w3-text-white w3-round">Multiplayer</button>
        <br>
        <br>
        <button id="achievements" style="width:200px" class="w3-button w3-gray w3-xlarge w3-text-white w3-round">Achievements</button>
        <br>
        <br>
        <button id="instructions" style="width:200px" class="w3-button w3-gray w3-xlarge w3-text-white w3-round">"Instructions"</button>*/

    const group = document.createElement("div");
    group.style.textAlign = "left";
    group.appendChild(achievementDisplay);
    group.appendChild(document.createElement("br"))
    group.appendChild(backButton);
    menu.appendChild(group);
}
const hatSelect = () => {
    menu.innerHTML = ``;
    const backButton = document.createElement("button");
    backButton.innerHTML = "Back";
    backButton.style.marginLeft = "175px";
    backButton.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    backButton.onclick = mainMenu;
    const group = document.createElement("div");
    group.innerHTML += `<h1 style="font-size: 60px; margin-left: 50px;" class="w3-text-white">Select A Hat</h1>`;
    group.style.textAlign = "left";
    const refinedHats = Object.fromEntries(Object.entries(hats).filter(([hatname, _]) => localProxy.unlockedHats.includes(hatname)));
    let currHatIndex = Object.keys(refinedHats).indexOf(currHat);
    const [hatname, hat] = Object.entries(refinedHats)[currHatIndex];
    currHat = hatname;
    const img = document.createElement("img");
    img.src = hat.sourceFile;
    const back = document.createElement("button");
    back.innerHTML = "<";
    const forward = document.createElement("button");
    forward.innerHTML = ">"
    img.width = 300;
    img.height = 300;
    img.style.border = "5px solid white";
    img.style.backgroundColor = "white";
    img.style.marginLeft = "50px";
    back.onclick = () => {
        currHatIndex -= 1;
        if (currHatIndex < 0) {
            currHatIndex = Object.values(refinedHats).length - 1;
        }
        img.src = Object.values(refinedHats)[currHatIndex].sourceFile;
        currHat = Object.keys(refinedHats)[currHatIndex];
        localProxy.hat = currHat;
    }
    forward.style.marginLeft = "32px";
    forward.onclick = () => {
        currHatIndex += 1;
        if (currHatIndex > Object.values(refinedHats).length - 1) {
            currHatIndex = 0;
        }
        img.src = Object.values(refinedHats)[currHatIndex].sourceFile;
        currHat = Object.keys(refinedHats)[currHatIndex];
        localProxy.hat = currHat;
    }
    group.appendChild(back);
    group.appendChild(img);
    group.appendChild(forward);
    group.appendChild(document.createElement("br"));
    group.appendChild(document.createElement("br"));
    group.appendChild(backButton);
    menu.appendChild(group);
}
const mainMenu = () => {
    menu.innerHTML = `<h1 style="font-size: 60px" class="w3-text-white">Boomba Zoomba</h1>`;
    menu.appendChild(document.createElement("br"));
    const singleplayer = document.createElement("button");
    singleplayer.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    singleplayer.style.width = "200px";
    singleplayer.innerHTML = "Singleplayer";
    menu.appendChild(singleplayer);
    menu.appendChild(document.createElement("br"));
    menu.appendChild(document.createElement("br"));
    const multiplayer = document.createElement("button");
    multiplayer.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    multiplayer.style.width = "200px";
    multiplayer.innerHTML = "Multiplayer";
    menu.appendChild(multiplayer);
    menu.appendChild(document.createElement("br"));
    menu.appendChild(document.createElement("br"));
    const achievements = document.createElement("button");
    achievements.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    achievements.style.width = "200px";
    achievements.innerHTML = "Achievements";
    menu.appendChild(achievements);
    menu.appendChild(document.createElement("br"));
    menu.appendChild(document.createElement("br"));
    const hatButton = document.createElement("button");
    hatButton.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    hatButton.style.width = "200px";
    hatButton.innerHTML = "Hats";
    menu.appendChild(hatButton);
    menu.appendChild(document.createElement("br"));
    menu.appendChild(document.createElement("br"));
    const instructions = document.createElement("button");
    instructions.classList.add(...
        "w3-button w3-gray w3-xlarge w3-text-white w3-round".split(" "));
    instructions.style.width = "200px";
    instructions.innerHTML = "Instructions";
    menu.appendChild(instructions);
    singleplayer.onclick = singlePlayerSelection;
    multiplayer.onclick = askUsername;
    achievements.onclick = achievementHall;
    hatButton.onclick = hatSelect;
    instructions.onclick = () => {
        document.getElementById("inModal").style.display = "block";
    }
};
document.getElementById("singleplayer").onclick = singlePlayerSelection;
document.getElementById("multiplayer").onclick = askUsername;
document.getElementById("achievements").onclick = achievementHall;
document.getElementById("hats").onclick = hatSelect;
document.getElementById("instructions").onclick = () => {
    document.getElementById("inModal").style.display = "block";
}
socket.on("connect", () => {
    console.log("Connected to server!");
})
socket.on("idSent", data => {
    id = data.id;
});
socket.on("messageRecord", messages => {
    lobbyChat = messages;
    displayLobbyChat();
});
socket.on("roomMessageRecord", messages => {
    roomChat = messages;
    displayRoomChat();
})
socket.on("partnerFound", partner => {
    displayRoomLobby(partner);
    roomPartner = partner;
    currOpponentHat = partner.currHat;
})
socket.on("roomCreated", ({ roomName }) => {
    displayRoomLobby({ roomName });
})
socket.on("startFight", ({ side, leftColor, rightColor }) => {
    menu.innerHTML = "";
    start("Multiplayer", { side, leftColor, rightColor });
})
socket.on("receiveBodyData", ({ bodyData, bodyPosData, bodyAngData, bodyAngVData, health }) => {
    steve.setPositions(bodyPosData);
    steve.setAngles(bodyAngData);
    steve.setVelocities(bodyData);
    steve.setAngleVels(bodyAngVData);
    steve.setHealth(health);
});
let deathSoundPlayed = false;
socket.on("win", () => {
    victor = steveio;
    displayVictor();
    if (!deathSoundPlayed) {
        sounds.death.play();
        deathSoundPlayed = true;
    }
});
socket.on("leaveRoom", ({ disconnected, displayMessage }) => {
    if (disconnected) {
        Swal.fire({
            title: 'Your partner disconnected!',
            text: 'You have been returned to the main lobby.',
            icon: 'error',
            confirmButtonText: 'Ok.'
        })
    }
    if (displayMessage) {
        Swal.fire({
            title: "Your partner left the room!",
            text: "You have been returned to the main lobby.",
            icon: "error",
            confirmButtonText: 'Ok.'
        })
    }
    openLobby();
});
socket.on("roomJoinFail", () => {
    Swal.fire({
        title: 'Invalid Room Code!',
        text: 'No room with that code exists.',
        icon: 'error',
        confirmButtonText: 'Ok.'
    })
})
socket.on("rmCPuppet", remove => {
    steve.removeJoints(remove);
})
setInterval(() => {
    socket.emit("heartbeat", Date.now());
}, 1000)

function sendMessage(message) {
    socket.emit("messageSend", {
        username,
        message,
        id
    })
}

function sendRoomMessage(message) {
    socket.emit("roomMessageSend", {
        username,
        message,
        id,
        roomName
    });
}