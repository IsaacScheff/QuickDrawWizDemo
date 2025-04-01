export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x222034)
            .setOrigin(0);
        
        const tutorialButton = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 60,
            300,
            60,
            0x4a4a8a
        ).setInteractive();
        
        const tutorialText = this.add.text(
            tutorialButton.x,
            tutorialButton.y,
            'TUTORIAL',
            { 
                fontSize: '32px',
                color: '#FFFFFF',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        
        const showdownButton = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 60,
            300,
            60,
            0x8a4a4a
        ).setInteractive();
        
        const showdownText = this.add.text(
            showdownButton.x,
            showdownButton.y,
            'SHOWDOWN',
            { 
                fontSize: '32px',
                color: '#FFFFFF',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        
        tutorialButton.on('pointerover', () => {
            tutorialButton.setFillStyle(0x6a6aaa);
        });
        
        tutorialButton.on('pointerout', () => {
            tutorialButton.setFillStyle(0x4a4a8a);
        });
        
        showdownButton.on('pointerover', () => {
            showdownButton.setFillStyle(0xaa6a6a);
        });
        
        showdownButton.on('pointerout', () => {
            showdownButton.setFillStyle(0x8a4a4a);
        });
        
        tutorialButton.on('pointerdown', () => {
            tutorialButton.setFillStyle(0x3a3a7a);
        });
        
        tutorialButton.on('pointerup', () => {
            tutorialButton.setFillStyle(0x4a4a8a);
            this.scene.start('TutorialScene');
        });
        
        showdownButton.on('pointerdown', () => {
            showdownButton.setFillStyle(0x7a3a3a);
        });
        
        showdownButton.on('pointerup', () => {
            showdownButton.setFillStyle(0x8a4a4a);
            this.game.registry.set('cowboyData', { type: 'cowboy' });
            this.scene.start('ShowdownScene');
        });

        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height - 30,
            'Click to select mode',
            { 
                fontSize: '16px',
                color: '#AAAAAA'
            }
        ).setOrigin(0.5);
    }
}