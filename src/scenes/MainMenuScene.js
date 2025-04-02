export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
        this.backgroundColor = 0x2e2249;
    }

    preload() {
        this.load.bitmapFont('pixelFont', 'assets/font/pixel_font.png', 'assets/font/pixel.xml');
    }

    create() {
        this.cameras.main.setBackgroundColor(this.backgroundColor);
        
        const title = this.add.bitmapText(
            128, 40, 
            'pixelFont', 
            'MAIN MENU',
            16
        ).setOrigin(0.5);
        
        const tutorialButton = this.createMenuButton(100, 'TUTORIAL', 0x5d5dbb, 0x7d7ddb, 'TutorialScene');
        
        const showdownButton = this.createMenuButton(140, 'NEW RUN', 0xbb5d5d, 0xdb7d7d, 'ShowdownScene');
        
        const freeDuelButton = this.createMenuButton(180, 'FREE DUEL', 0x5dbb5d, 0x7ddb7d, 'SelectCowboyScene');
        
        // Border
        this.add.rectangle(0, 0, 256, 224, 0x000000, 0)
            .setOrigin(0)
            .setStrokeStyle(2, 0xffffff);
    }

    createMenuButton(yPos, text, normalColor, hoverColor, targetScene) {
        const button = this.add.rectangle(
            128, yPos, 
            150, 24,
            normalColor
        ).setInteractive();
        
        const buttonText = this.add.bitmapText(
            button.x, button.y,
            'pixelFont',
            text,
            8
        ).setOrigin(0.5);
        
        // Hover effects
        button.on('pointerover', () => {
            button.setFillStyle(hoverColor);
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(normalColor);
        });
        
        // Click handler
        button.on('pointerdown', () => {
            this.scene.start(targetScene);
        });
        
        return button;
    }
}