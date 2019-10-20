var SceneA = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function SceneA() {
            Phaser.Scene.call(this, { key: 'sceneA' });
        },

    preload: function () {
        this.load.image('inicio', 'assets/BackGround.jpg');
    },

    create: function () {
        this.add.sprite(400, 300, 'inicio');

        this.input.once('pointerdown', function () {

            this.scene.start('sceneB');

        }, this);
    }

});

var SceneC = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function SceneC() {
            Phaser.Scene.call(this, { key: 'sceneC' });
        },

    preload: function () {
        this.load.image('fim', 'assets/F Screen.jpg');
    },

    create: function () {
        this.add.sprite(400, 300, 'fim');

        this.input.once('pointerdown', function () {

            this.scene.start('sceneA');

        }, this);
    }

});

var SceneB = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function SceneB() {
            Phaser.Scene.call(this, { key: 'sceneB' });
        },

    preload: function () {
        this.load.spritesheet('ship', 'assets/nave.png', { frameWidth: 66.66666, frameHeight: 64 });
        this.load.image('estacao', 'assets/estacao.png');
        this.load.image('porca', 'assets/Porca.png');
        this.load.image('parafuso', 'assets/Parafuso.png');
        this.load.image('fundo', 'assets/fundo.png');
        this.load.image('cometa', 'assets/asteroide.png');
    },

    create: function () {
        this.add.image(400, 300, 'fundo');

        sprite = this.physics.add.sprite(400, 300, 'ship');

        sprite.setDamping(true);
        sprite.setDrag(0.99);
        sprite.setMaxVelocity(200);
        sprite.setBounce(0.6);

        this.anims.create({
            key: 'on',
            frames: [{ key: 'ship', frame: 2 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'off',
            frames: [{ key: 'ship', frame: 0 }],
            frameRate: 20
        });

        cursors = this.input.keyboard.createCursorKeys();

        text = this.add.text(10, 10, '', { font: '16px Courier', fill: '#00ff00' });

        gerarPorcasParafusos(10, this);

        pontosTexto = this.add.text(10, 30, 'Score: 0', { fontSize: '16px', fill: '#fff' });
        capacidadeTexto = this.add.text(10, 50, 'Capacity: 0/5', { fontSize: '16px', fill: '#fff' });

        estacaoImg = this.physics.add.sprite(700, 120, 'estacao');
        this.physics.add.overlap(sprite, estacaoImg, passarEstacao, null, this);

        cometa1 = this.physics.add.sprite(0, 0, 'cometa');
        speed1 = Phaser.Math.GetSpeed(500, 6);
        speed2 = Phaser.Math.GetSpeed(1000, 6);
        this.physics.add.overlap(sprite, cometa1, colidir, null, this);
        this.physics.add.collider(sprite, cometa1);

        tempoMaximo = 3*60*1000;
        info = this.add.text(10, 70, '', { font: '16px Arial', fill: '#fff' });
        timer = this.time.addEvent({ delay: tempoMaximo, callback: gameOver, callbackScope: this });
    },

    update: function (time, delta) {
        if (cursors.up.isDown) {
            this.physics.velocityFromRotation(sprite.rotation, 200, sprite.body.acceleration);
            sprite.anims.play('on');
        }
        else {
            sprite.setAcceleration(0);
            sprite.anims.play('off');
        }

        if (cursors.left.isDown) {
            sprite.setAngularVelocity(-300);
        }
        else if (cursors.right.isDown) {
            sprite.setAngularVelocity(300);
        }
        else {
            sprite.setAngularVelocity(0);
        }

        text.setText('Speedy: ' + Math.floor(sprite.body.speed));

        this.physics.world.wrap(sprite, 32);

        if (pontos < 200) {
            cometa1.x += speed1 * delta;
            cometa1.y += speed1 * delta;
        } else {
            cometa1.x += speed2 * delta;
            cometa1.y += speed2 * delta;
        }
        if (cometa1.x > 850 || cometa1.y > 650) {
            cometa1.x = xRandom();
            cometa1.y = 0;
        }

        info.setText('Time: ' + Math.floor((tempoMaximo - timer.getElapsed())/1000));
    }

});

function xRandom() {
    var max = 800;
    var x = Math.random() * max;
    if (x > max) {
        x = max;
    }
    return x;
}

function yRandom() {
    var max = 600;
    var y = Math.random() * max;
    if (y > max) {
        y = max;
    }
    return y;
}

function coletarLixo(sprite, lixo) {
    if (capacidade < 5) {
        lixo.disableBody(true, true);
        capacidade++;
        capacidadeTexto.setText('Capacity: ' + capacidade + '/5');
    }
}

function passarEstacao(sprite, estacao) {
    if (capacidade > 0 && sprite.body.speed < 20) {
        pontos += capacidade * 10;
        pontosTexto.setText('Score: ' + pontos);
        capacidade = 0;
        capacidadeTexto.setText('Capacity: ' + capacidade + '/5');

        if (pontos == 200) {
            gerarPorcasParafusos(20, this);
        }
    }
}

function colidir(sprite, cometa) {
    if (capacidade > 0) {
        capacidade--;
        capacidadeTexto.setText('Capacity: ' + capacidade + '/5');

        if (Math.random > 0.5) {
            porcas = this.physics.add.sprite(xRandom(), yRandom(), 'porca');
            this.physics.add.overlap(sprite, porcas, coletarLixo, null, this);
        } else {
            parafusos = this.physics.add.sprite(xRandom(), yRandom(), 'parafuso');
            this.physics.add.overlap(sprite, parafusos, coletarLixo, null, this);
        }

    }
}

function gerarPorcasParafusos(quantidade, context) {
    for (let index = 0; index < quantidade; index++) {
        porcas = context.physics.add.sprite(xRandom(), yRandom(), 'porca');
        parafusos = context.physics.add.sprite(xRandom(), yRandom(), 'parafuso');
        context.physics.add.overlap(sprite, porcas, coletarLixo, null, context);
        context.physics.add.overlap(sprite, parafusos, coletarLixo, null, context);
    }
}

function gameOver() {
    this.scene.start('sceneC');
}

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: "arcade",
        arcade: {
            fps: 60,
            gravity: { y: 0 }
        }
    },
    scene: [SceneA, SceneB, SceneC]
};

var sprite;
var cursors;
var text;
var stars;
var porcas;
var parafusos;
var pontos = 0;
var pontosTexto;
var capacidade = 0;
var capacidadeTexto;
var estacao;
var estacaoImg;
var cometa1;
var cometa2;
var speed1;
var speed2;
var timer;
var info;
var tempoMaximo;

var game = new Phaser.Game(config);