/**
 * RESOURCES
 * http://www.w3schools.com/html5/html5_ref_av_dom.asp
 * http://www.superflashbros.net/as3sfxr/
 * http://www.thesoundarchive.com/star-wars.asp
 * http://blog.sklambert.com/galaxian-html5-game/
 * http://soundbible.com/tags-star-wars.html
 * https://codepen.io/wizardfly/pen/zxWeaQ
 */

/**
 * Nastavení timeoutu pro animační smyčku
 */
window.requestAnimFrame = function(callback) {

    return window.setTimeout(callback, 1000 / 60);

};

let game = new Game();

/**
 * Inicializace hry
 */
function init() {

    document.getElementById('score-game').style.display = "none";
    setKeyListeners();
    initDirection();
    game.init();

}

/**
 * Hra - spuštění
 */
function Game() {

    /**
	 * Inicializace celé hry a všech potřebných objektů
     */
    this.init = function() {

        this.backgroundCanvas = document.getElementById('background');
        this.shipCanvas = document.getElementById('ship');
        this.gameCanvas = document.getElementById('main');

        if (this.backgroundCanvas.getContext) {

            this.backgroundContext = this.backgroundCanvas.getContext('2d');
            this.shipContext = this.shipCanvas.getContext('2d');
            this.mainContext = this.gameCanvas.getContext('2d');

            Background.prototype.context = this.backgroundContext;
            Background.prototype.canvasWidth = this.backgroundCanvas.width;
            Background.prototype.canvasHeight = this.backgroundCanvas.height;

            SpaceShip.prototype.context = this.shipContext;
            SpaceShip.prototype.canvasWidth = this.shipCanvas.width;
            SpaceShip.prototype.canvasHeight = this.shipCanvas.height;

            Bullet.prototype.context = this.mainContext;
            Bullet.prototype.canvasWidth = this.gameCanvas.width;
            Bullet.prototype.canvasHeight = this.gameCanvas.height;

            EnemySpaceShip.prototype.context = this.mainContext;
            EnemySpaceShip.prototype.canvasWidth = this.gameCanvas.width;
            EnemySpaceShip.prototype.canvasHeight = this.gameCanvas.height;

            EnemyBullet.prototype.context = this.mainContext;
            EnemyBullet.prototype.canvasWidth = this.gameCanvas.width;
            EnemyBullet.prototype.canvasHeight = this.gameCanvas.height;

            this.background = new Background();
            this.background.init(0,0);

            this.ship = new SpaceShip();
            const shipStartPosition = 30;
            this.shipStartX = this.shipCanvas.width/2 - imageLoader.spaceship.width;
            this.shipStartY = this.shipCanvas.height/4*3 + imageLoader.spaceship.height*2 - shipStartPosition;
            this.ship.init(this.shipStartX, this.shipStartY, imageLoader.spaceship.width, imageLoader.spaceship.height);

            this.enemyStorage = new EnemyStorage();
            this.enemyStorage.init("enemy");
            this.spawnWave();

            this.enemyBulletStorage = new EnemyBulletStorage(50);
            this.enemyBulletStorage.init("enemyBullet");

            this.board = new Board({x:0,y:0,width:this.gameCanvas.width,height:this.gameCanvas.height});

            this.laser = new SoundStorage(10);
            this.laser.init("laser");

            this.explosion = new SoundStorage(20);
            this.explosion.init("explosion");

            this.backgroundAudio = new Audio("sounds/star-wars-theme-song.mp3");
            this.backgroundAudio.loop = true;
            this.backgroundAudio.volume = .25;
            this.backgroundAudio.load();

            this.gameOverAudio = new Audio("sounds/game_over.wav");
            this.gameOverAudio.loop = true;
            this.gameOverAudio.volume = .25;
            this.gameOverAudio.load();

            game.background.draw();
            document.getElementById('start-game').style.display = "block";

            this.bossSpawned = false;
            this.playerScore = 0;

        }
    };

    /**
	 * Spawn nepřátelské flotily
     */
    this.spawnWave = function() {

        this.bossSpawned = false;
        imageLoader.enemy.src = "imgs/enemy.png";

        const height = imageLoader.enemy.height;
        const width = imageLoader.enemy.width;
        let x = 100;
        let y = -height;
        let spacer = y * 1.5;

        for (let i = 1; i <= 18; i++) {

            this.enemyStorage.get(x,y,2);
            x += width + 25;

            if (i % 6 == 0) {
                x = 100;
                y += spacer
            }

        }

    };

    /**
	 * Spawn nepřátelského bosse
     */
    this.spawnBoss = function() {

    	// TODO Boss extended
        this.bossSpawned = true;
        imageLoader.enemy.src = "imgs/bossEnemy.png";

        const height = imageLoader.enemy.height;
        const x = 250;
        const y = -height * 2;

        this.enemyStorage.get(x,y,2);

    };

    /**
	 * Start hry
     */
    this.start = function() {

        this.backgroundAudio.play();
        this.ship.draw();
        animateInfiniteLoop();

    };

    /**
	 * Restart hry
     */
    this.restart = function() {

        this.gameOverAudio.pause();

        document.getElementById('game-over').style.display = "none";
        this.backgroundContext.clearRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);
        this.shipContext.clearRect(0, 0, this.shipCanvas.width, this.shipCanvas.height);
        this.mainContext.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        this.board.clear();

        this.background.init(0,0);
        this.ship.init(this.shipStartX, this.shipStartY,
            imageLoader.spaceship.width, imageLoader.spaceship.height);

        this.enemyStorage.init("enemy");
        this.spawnWave();
        this.enemyBulletStorage.init("enemyBullet");

        this.playerScore = 0;

        this.backgroundAudio.currentTime = 0;
        this.backgroundAudio.play();

        this.start();

    };

    /**
	 * Konec hry - sestřelen
     */
    this.gameOver = function() {

        this.backgroundAudio.pause();
        this.gameOverAudio.currentTime = 0;
        this.gameOverAudio.play();
        document.getElementById('game-over').style.display = "block";

    };

    /**
	 * Návrat do menu
     */
    this.backToMenu = function backToMenu() {

        this.gameOverAudio.pause();

        document.getElementById('game-over').style.display = "none";
        this.shipContext.clearRect(0, 0, this.shipCanvas.width, this.shipCanvas.height);
        this.mainContext.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        document.getElementById('score-game').style.display = "none";
        document.getElementById('instructions').style.display = "none";
        document.getElementById('start-game').style.display = "block";

        this.init();

    };

    /**
	 * Menu pro výběr lodi
     */
    this.shipMenu = function selectShip() {

        document.getElementById('start-game').style.display = "none";
        document.getElementById('ships').style.display = "block";

    };

    /**
	 * Zobrazení nápovědy
     */
    this.help = function help() {

        document.getElementById('start-game').style.display = "none";
        document.getElementById('instructions').style.display = "block";

    };

    /**
	 * Výběr lodě, nastavení zdroje
     */
    this.setShip = function selectShip(shipNumber) {

        document.getElementById('ships').style.display = "none";
        document.getElementById('start-game').style.display = "block";

        switch(shipNumber) {
            case 1:
                imageLoader.spaceship.src = "imgs/millennium_falcon.png";
                break;
            case 2:
                imageLoader.spaceship.src = "imgs/x_wing.png";
                break;
            case 3:
                imageLoader.spaceship.src = "imgs/corvete.png";
                break;
            case 4:
                imageLoader.spaceship.src = "imgs/land_speedster.png";
                break;
            default:
                imageLoader.spaceship.src = "imgs/millennium_falcon.png";
        }

    }

}

/**
 * Nahrání všech obrázků do hry
 */
let imageLoader = new function() {

	this.background = new Image();
    this.background.src = "imgs/background.jpeg";
    this.background.onload = function() {imageLoad();};

	this.spaceship = new Image();
    this.spaceship.src = "imgs/millennium_falcon.png";
    this.spaceship.onload = function() {imageLoad();};

	this.bullet = new Image();
    this.bullet.src = "imgs/bullet.png";
    this.bullet.onload = function() {imageLoad();};

	this.enemy = new Image();
    this.enemy.src = "imgs/enemy.png";
    this.enemy.onload = function() {imageLoad();};

	this.enemyBullet = new Image();
    this.enemyBullet.src = "imgs/bullet_enemy.png";
    this.enemyBullet.onload = function() {imageLoad();};

	const numImages = 5;
	let numLoaded = 0;

    function imageLoad() {

    	numLoaded++;
        if (numLoaded === numImages) window.init();

    }

};

/**
 * Pozadí hry
 */
function Background() {

    this.init = function(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 1;
    };

    /**
	 * Vykreslení pozadí
     */
	this.draw = function() {

		this.y += this.speed;
		this.context.drawImage(imageLoader.background, this.x, this.y);
		this.context.drawImage(imageLoader.background, this.x, this.y - this.canvasHeight);
		if (this.y >= this.canvasHeight) this.y = 0;

	};

}

/**
 * Uložiště nepřátelských lodí
 */
function EnemyStorage() {

	const size = 30;
    let storage = [];

    /**
     * Vrací "živé" prvky v uložišti
     */
    this.getStorage = function() {

        let obj = [];

        for (let i = 0; i < size; i++) {

            if (storage[i].alive) obj.push(storage[i]);

        }

        return obj;

    };

    /**
     * Vytvoří nové uložiště
     */
    this.init = function() {

		for (let i = 0; i < size; i++) {

			let enemy = new EnemySpaceShip();
			enemy.init(0,0, imageLoader.enemy.width, imageLoader.enemy.height);
			storage[i] = enemy;

		}

    };


    /**
     * Vrací prvek na základě pozice
     */
    this.get = function(x, y, speed) {

        if(!storage[size - 1].alive) {
            storage[size - 1].spawn(x, y, speed);
            storage.unshift(storage.pop());
        }

    };

    /**
     * Animace prvků uložiště
     */
    this.animate = function() {

        for (let i = 0; i < size; i++) {

            if (storage[i].alive) {

                if (storage[i].draw()) {
                    storage[i].clear();
                    storage.push((storage.splice(i,1))[0]);
                }

            } else {
                break;
            }

        }

    };

}

/**
 * Uložiště výstřelů hráče
 */
function BulletStorage() {

	const size = 30;
    let storage = [];

    /**
     * Vrací "živé" prvky v uložišti
     */
    this.getStorage = function() {

        let obj = [];

        for (let i = 0; i < size; i++) {

            if (storage[i].alive) obj.push(storage[i]);

        }

        return obj;

    };

    /**
     * Vytvoří nové uložiště
     */
    this.init = function() {

		for (let i = 0; i < size; i++) {

			let bullet = new Bullet();
			bullet.init(0,0, imageLoader.bullet.width, imageLoader.bullet.height);
			bullet.collidableWith = "enemy";
			storage[i] = bullet;

		}

    };

    /**
     * Vrací dva prvky na základě pozice - výstřely pro hráčovu loď
     */
    this.getTwo = function(x1, y1, speed1, x2, y2, speed2) {

        if(!storage[size - 1].alive && !storage[size - 2].alive) {
            get(x1, y1, speed1);
            get(x2, y2, speed2);
        }

		function get(x, y, speed) {

            if(!storage[size - 1].alive) {
                storage[size - 1].spawn(x, y, speed);
                storage.unshift(storage.pop());
            }

        }

    };

    /**
     * Animace prvků uložiště
     */
    this.animate = function() {

        for (let i = 0; i < size; i++) {

            if (storage[i].alive) {

                if (storage[i].draw()) {
                    storage[i].clear();
                    storage.push((storage.splice(i,1))[0]);
                }

            } else {
                break;
            }

        }

    };

}

/**
 * Uložiště výstřelů nepřátel
 */
function EnemyBulletStorage() {

	const size = 50;
	let storage = [];

    /**
	 * Vrací "živé" prvky v uložišti
     */
	this.getStorage = function() {

		let obj = [];

		for (let i = 0; i < size; i++) {

			if (storage[i].alive) obj.push(storage[i]);

		}

		return obj;

	};

    /**
	 * Vytvoří nové uložiště
     */
	this.init = function() {

		for (let i = 0; i < size; i++) {

			let bullet = new EnemyBullet();
			bullet.init(0,0, imageLoader.enemyBullet.width, imageLoader.enemyBullet.height);
			bullet.collidableWith = "ship";
			storage[i] = bullet;

		}

	};


    /**
	 * Vrací prvek na základě pozice
     */
	this.get = function(x, y, speed) {

		if(!storage[size - 1].alive) {
			storage[size - 1].spawn(x, y, speed);
			storage.unshift(storage.pop());
		}

	};

    /**
	 * Animace prvků uložiště
     */
	this.animate = function() {

		for (let i = 0; i < size; i++) {

			if (storage[i].alive) {

				if (storage[i].draw()) {
					storage[i].clear();
					storage.push((storage.splice(i,1))[0]);
				}

			} else {
				break;
			}

		}

	};

}

/**
 * Hráčova loď
 */
function SpaceShip() {

	const fireRate = 15;
	let counter = 0;

	this.init = function(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.alive = true;
		this.isColliding = false;
        this.bulletStorage = new BulletStorage();
		this.bulletStorage.init("bullet");
        this.collidableWith = "enemyBullet";
        this.type = "ship";
        this.speed = 3;

	};

	this.draw = function() {
		this.context.drawImage(imageLoader.spaceship, this.x, this.y);
	};

    /**
	 * Pohyb hráčovy lodě, dle stisku kláves
     */
	this.move = function() {

		counter++;

		if (MOVE_DIRECTION.left || MOVE_DIRECTION.right || MOVE_DIRECTION.down || MOVE_DIRECTION.up) {

			this.context.clearRect(this.x, this.y, this.width, this.height);

			if (MOVE_DIRECTION.left){

				this.x -= this.speed;
				if (this.x <= 0)this.x = 0;

			} else if (MOVE_DIRECTION.right){

				this.x += this.speed;
				if (this.x >= this.canvasWidth - this.width) this.x = this.canvasWidth - this.width;

			} else if (MOVE_DIRECTION.up){

				this.y -= this.speed;
				if (this.y <= this.canvasHeight/4*3) this.y = this.canvasHeight/4*3;

			} else if (MOVE_DIRECTION.down){

				this.y += this.speed;
				if (this.y >= this.canvasHeight - this.height) this.y = this.canvasHeight - this.height;

			}

		}

		if(this.isColliding){
            this.alive = false;
            game.gameOver();
		}

		this.draw();

		if (MOVE_DIRECTION.space && counter >= fireRate && !this.isColliding) {
			this.fire();
			counter = 0;
		}

	};

    /**
	 * Výstřel hráčovy lodě
     */
	this.fire = function fire() {
		this.bulletStorage.getTwo(this.x+6, this.y, 3, this.x+33, this.y, 3);
		game.laser.get();
	};

}

/**
 * Výstřel z lodě
 */
function Bullet() {

    this.init = function(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.alive = false;
    };

    this.spawn = function(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.alive = true;
    };

    this.clear = function() {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.alive = false;
        this.isColliding = false;
    };

    /**
     * Pohyb výstřelu
     */
    this.draw = function() {

        this.context.clearRect(this.x-1, this.y-1, this.width+2, this.height+2);
        this.y -= this.speed;

        if (this.isColliding) return true;

        if (this.y <= 0 - this.height){
            return true
        } else {
            this.context.drawImage(imageLoader.bullet, this.x, this.y);
        }

        return false;

    };

}

/**
 * Nepřátelská loď
 */
function EnemySpaceShip() {

    this.init = function(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.alive = false;
        this.collidableWith = "bullet";
        this.type = "enemy";
        this.percentFire = .01;
    };

	this.spawn = function(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.speedX = 0;
		this.speedY = speed;
		this.alive = true;
		this.leftEdge = this.x - 90;
		this.rightEdge = this.x + 90;
		this.bottomEdge = this.y + 140;
	};

    this.clear = function() {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.alive = false;
        this.isColliding = false;
    };

    /**
	 * Pohyb nepřátelské lodě
     */
	this.draw = function() {

		this.context.clearRect(this.x-1, this.y, this.width+1, this.height);

		this.x += this.speedX;
		this.y += this.speedY;

		if(this.x <= this.leftEdge){

			this.speedX = this.speed;

		} else if(this.x >= this.rightEdge + this.width){

			this.speedX = -this.speed;

		} else if(this.y >= this.bottomEdge){

			this.speed = 1.5;
			this.speedY = 0;
			this.y -= 5;
			this.speedX = -this.speed;

		}

		if (!this.isColliding){

			this.context.drawImage(imageLoader.enemy, this.x, this.y);

			let chance = Math.floor(Math.random()*101);
			if (chance/100 < this.percentFire) {
				this.fire();
			}

			return false;

		} else {

			if(game.bossSpawned) {
                game.playerScore += 10;
			} else {
                game.playerScore += 1;
			}
			game.explosion.get();
			return true;

		}

	};

    /**
	 * Výstřel nepřítelské lodě
     */
	this.fire = function() {
		game.enemyBulletStorage.get(this.x+this.width/2, this.y+this.height, -2.5);
	};

}

/**
 * Výstřel z nepřátelské lodě
 */
function EnemyBullet() {

    this.init = function(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.alive = false;
    };

    this.spawn = function(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.alive = true;
    };

    this.clear = function() {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.alive = false;
        this.isColliding = false;
    };

    /**
     * Pohyb výstřelu
     */
    this.draw = function() {

        this.context.clearRect(this.x-1, this.y-1, this.width+2, this.height+2);
        this.y -= this.speed;

        if (this.isColliding) return true;

		if (this.y >= this.canvasHeight){
			return true;
		} else {
			this.context.drawImage(imageLoader.enemyBullet, this.x, this.y);
		}

		return false;

    };

}

/**
 * Uložiště zvukových efektů
 */
function SoundStorage(size) {

	let storage = [];
    let currentSoundIndex = 0;

	this.init = function(soundType) {

        switch(soundType) {
            case "laser":

                for (let i = 0; i < size; i++) {

                    let laser = new Audio("sounds/laser.wav");
                    laser.volume = .12;
                    laser.load();
                    storage[i] = laser;

                }
                break;

            case "explosion":

            	for (let i = 0; i < size; i++) {

                    let explosion = new Audio("sounds/explosion.wav");
                    explosion.volume = .12;
                    explosion.load();
                    storage[i] = explosion;

            	}
                break;

        }

	};

    /**
	 * Vrátí aktuální zvuk
     */
	this.get = function() {

		if(storage[currentSoundIndex].currentTime == 0 || storage[currentSoundIndex].ended) {
			storage[currentSoundIndex].play();
		}
		currentSoundIndex = (currentSoundIndex + 1) % size;

	};

}

/**
 * Animační nekonečná smyčka hry
 */
function animateInfiniteLoop() {

    redrawView();
	insertObjects(game.board);
	collisionDetection();

	if(game.enemyStorage.getStorage().length === 0){
		addNewEnemies()
	}

	if(game.ship.alive){
		animateGameObjects();
	}

}

/**
 * Přidá nové nepřátele do hry
 */
function addNewEnemies() {

    if((game.playerScore%90)%10 ===0){
        game.spawnBoss();
    } else {
        game.spawnWave();
    }

}

/**
 * Spuštění animace objektů hry
 */
function animateGameObjects() {

    requestAnimFrame(animateInfiniteLoop);
    game.background.draw();
    game.ship.move();
    game.ship.bulletStorage.animate();
    game.enemyStorage.animate();
    game.enemyBulletStorage.animate();

}

/**
 * Překreslí View pro začátek hry
 */
function redrawView() {

    document.getElementById('start-game').style.display = "none";
    document.getElementById('score-game').style.display = "block";
    document.getElementById('score').innerHTML = game.playerScore;

}

/**
 * Vložení objektů do herní plochy
 */
function insertObjects(board){

    board.clear();
    board.insert(game.ship);
    board.insert(game.ship.bulletStorage.getStorage());
    board.insert(game.enemyStorage.getStorage());
    board.insert(game.enemyBulletStorage.getStorage());

}

/**
 * Detekce kolizí objektů
 */
function collisionDetection() {

	let objects = [];
	game.board.getAllObjects(objects);

	for (let x = 0, len = objects.length; x < len; x++) {
		game.board.findCollisionableObjects(obj = [], objects[x]);

		for (let y = 0, length = obj.length; y < length; y++) {

			if (objects[x].collidableWith === obj[y].type &&
				 objects[x].x < obj[y].x + obj[y].width &&
				 objects[x].x + objects[x].width > obj[y].x &&
				 objects[x].y < obj[y].y + obj[y].height &&
				 objects[x].y + objects[x].height > obj[y].y
			) {
				objects[x].isColliding = true;
				obj[y].isColliding = true;
			}

		}

	}

}

/**
 * Herní plocha
 * Rozdělení na nezávislé segmenty pro detekci kolizí
 */
function Board(bound, lvl) {

    let objects = [];
    let level = lvl || 0;

    this.nodes = [];

    if(bound){

        this.bounds = bound;

    } else {

        this.bounds = {
            x: 0,
            y: 0,
            width: 0,
            height: 0};

    }

    /**
     * Vyčištění herní plochy
     */
    this.clear = function() {

        objects = [];

        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].clear();
        }

        this.nodes = [];

    };

    /**
     * Vrátí všechny objekty herní plochy
     */
    this.getAllObjects = function(allObjects) {

        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].getAllObjects(allObjects);
        }

        for (let i = 0, len = objects.length; i < len; i++) {
            allObjects.push(objects[i]);
        }

        return allObjects;

    };

    /**
     * Vrací objekty se kterými může daný objekt kolidovat
     */
    this.findCollisionableObjects = function(collisionableObjects, object) {

        const index = this.getIndex(object);

        if (index != -1 && this.nodes.length) {
            this.nodes[index].findCollisionableObjects(collisionableObjects, object);
        }

        for (let i = 0, len = objects.length; i < len; i++) {
            collisionableObjects.push(objects[i]);
        }

        return collisionableObjects;

    };

    /**
     * Vloží objekt do herní plochy
     */
    this.insert = function(object) {

        if (object instanceof Array) {

            for (let i = 0, len = object.length; i < len; i++) {
                this.insert(object[i]);
            }

            return;

        }

        if (this.nodes.length) {

            const index = this.getIndex(object);

            if (index != -1) {

                this.nodes[index].insert(object);
                return;

            }

        }

        objects.push(object);

        if (objects.length > 10 && level < 5) {

            if (this.nodes[0] == null) this.split();

            let i = 0;
            while (i < objects.length) {

                const index = this.getIndex(objects[i]);

                if (index != -1) {

                    this.nodes[index].insert((objects.splice(i,1))[0]);

                } else {

                    i++;

                }

            }

        }

    };

    /**
     * Vrací index odjektu
     * -1 pokud se objekt nevejde do části herní plochy
     */
    this.getIndex = function(object) {

        let index = -1;
        const verticalSplit = this.bounds.x + this.bounds.width / 2;
        const horizontalSplit = this.bounds.y + this.bounds.height / 2;

        let top = (object.y < horizontalSplit && object.y + object.height < horizontalSplit);
        let bot = (object.y > horizontalSplit);

        if (object.x < verticalSplit && object.x + object.width < verticalSplit) {

            if (top) {
                index = 1;
            } else if (bot) {
                index = 2;
            }

        } else if (object.x > verticalSplit) {

            if (top) {
                index = 0;
            } else if (bot) {
                index = 3;
            }

        }

        return index;

    };

    /**
     * Rozdělení herní plochy na 4 podpolochy
     */
    this.split = function() {

        const subWidth = (this.bounds.width / 2) | 0;
        const subHeight = (this.bounds.height / 2) | 0;

        this.nodes[0] = new Board({
            x: this.bounds.x + subWidth,
            y: this.bounds.y,
            width: subWidth,
            height: subHeight
        }, level+1);

        this.nodes[1] = new Board({
            x: this.bounds.x,
            y: this.bounds.y,
            width: subWidth,
            height: subHeight
        }, level+1);

        this.nodes[2] = new Board({
            x: this.bounds.x,
            y: this.bounds.y + subHeight,
            width: subWidth,
            height: subHeight
        }, level+1);

        this.nodes[3] = new Board({
            x: this.bounds.x + subWidth,
            y: this.bounds.y + subHeight,
            width: subWidth,
            height: subHeight
        }, level+1);

    };
}

/**
 * Výčet kláves ve hře
 */
KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
};

/**
 * Struktura pro rozeznání jakým směrem se hráč pohybuje
 */
MOVE_DIRECTION = {};

function initDirection(){

    for (let key in KEY_CODES) {
        MOVE_DIRECTION[KEY_CODES[key]] = false;
    }

}

/**
 * Nastaví listenery pro poslouchání klávesnice. Na základě zmáčknuté
 * klávesnice nastavují flag pro daný směr pohybu.
 * Pohybuji se do té doby co je klávesa zmáčknutá.
 * */
function setKeyListeners(){

    document.onkeydown = function(e) {
        if (KEY_CODES[e.keyCode]) {
            e.preventDefault();
            MOVE_DIRECTION[KEY_CODES[e.keyCode]] = true;
        }
    };

    document.onkeyup = function(e) {
        if (KEY_CODES[e.keyCode]) {
            e.preventDefault();
            MOVE_DIRECTION[KEY_CODES[e.keyCode]] = false;
        }
    };

}