export default class SelectCowboyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SelectCowboyScene' });
        this.backgroundColor = 0x2e2249;
    }

    preload() {
        this.load.spritesheet('cowboy', 'assets/images/Cowboy.png', { 
            frameWidth: 48, 
            frameHeight: 48 
        });
        this.load.spritesheet('cowboyRedbeard', 'assets/images/Cowboy_Redbeard.png', { 
            frameWidth: 48, 
            frameHeight: 48 
        });
        this.load.spritesheet('cowboyWhitesuit', 'assets/images/Cowboy_WhiteSuit.png', { 
            frameWidth: 48, 
            frameHeight: 48 
        });
    }

    create() {
        this.cameras.main.setBackgroundColor(this.backgroundColor);
        
        this.add.bitmapText(
            128, 20,
            'pixelFont',
            'SELECT COWBOY',
            12
        ).setOrigin(0.5);

        this.createCowboyAnimations();

        const buttonYPositions = [70, 110, 150];
        const cowboys = [
            { name: 'cowboy', displayName: 'GUNSLINGER' },
            { name: 'cowboyRedbeard', displayName: 'REDBEARD' },
            { name: 'cowboyWhitesuit', displayName: 'WHITESUIT' }
        ];

        cowboys.forEach((cowboy, index) => {
            this.createCowboySelection(
                cowboy.name, 
                cowboy.displayName, 
                buttonYPositions[index]
            );
        });

        const backButton = this.add.rectangle(
            30, 200,
            50, 16,
            0xbb5d5d
        ).setInteractive();

        this.add.bitmapText(
            backButton.x, backButton.y,
            'pixelFont',
            'BACK',
            6
        ).setOrigin(0.5);

        backButton.on('pointerover', () => backButton.setFillStyle(0xdb7d7d));
        backButton.on('pointerout', () => backButton.setFillStyle(0xbb5d5d));
        backButton.on('pointerdown', () => this.scene.start('MainMenuScene'));
    }

    createCowboyAnimations() {
        const cowboyTypes = ['cowboy', 'cowboyRedbeard', 'cowboyWhitesuit'];
        
        cowboyTypes.forEach(type => {
            this.anims.create({
                key: `${type}_smoking`,
                frames: this.anims.generateFrameNumbers(type, { 
                    start: 65, 
                    end: 73 
                }),
                frameRate: 10,
                repeat: -1
            });
        });
    }

    createCowboySelection(spriteKey, displayName, yPosition) {
        const button = this.add.rectangle(
            120, yPosition,
            80, 20,
            0x5d5dbb
        ).setInteractive();

        this.add.bitmapText( //button text
            button.x, button.y,
            'pixelFont',
            displayName,
            8
        ).setOrigin(0.5);

        const cowboy = this.add.sprite(
            170, yPosition - 6, // Right of button
            spriteKey
        ).play(`${spriteKey}_smoking`);

        cowboy.setScale(0.7);

        // Button interactivity
        button.on('pointerover', () => {
            button.setFillStyle(0x7d7ddb);
            cowboy.setTint(0xcccccc);
        });

        button.on('pointerout', () => {
            button.setFillStyle(0x5d5dbb);
            cowboy.clearTint();
        });

        button.on('pointerdown', () => {
            this.game.registry.set('cowboyData', spriteKey);
            this.scene.start('ShowdownScene');
        });
    }
}