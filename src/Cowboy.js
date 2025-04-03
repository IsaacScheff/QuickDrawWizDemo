import Phaser from 'phaser';

export default class Cowboy {
    constructor(scene, x, y, config) {
        this.scene = scene;
        this.config = config;

        this.sprite = scene.add.sprite(x, y, config.texture);
        this.sprite.setOrigin(0.5, 0.5);

        this.maxHealth = config.maxHealth;
        this.health = this.maxHealth;
        this.isActive = true;
        
        this.shotDamage = config.shotDamage;
        this.minResetTime = config.minReset;
        this.maxResetTime = config.maxReset;
        this.nextShotTime = 0;
        
        this.createAnimations();
        this.playIdle();
        
        this.createHealthBar();
    }

    createAnimations() {
        const anims = this.scene.anims;
        const texture = this.config.texture;
        
        // Idle animation
        if (!anims.exists(`${texture}_idle`)) {
            anims.create({
                key: `${texture}_idle`,
                frames: anims.generateFrameNumbers(texture, this.config.idleAnim),
                frameRate: this.config.idleAnim.frameRate,
                repeat: -1
            });
        }
        
        // Quick draw animation
        if (!anims.exists(`${texture}_quickDraw`)) {
            anims.create({
                key: `${texture}_quickDraw`,
                frames: anims.generateFrameNumbers(texture, this.config.quickDrawAnim),
                frameRate: this.config.quickDrawAnim.frameRate,
                repeat: 0
            });
        }
    }

    createHealthBar() {
        // Health bar background
        this.healthBarBg = this.scene.add.graphics()
            .fillStyle(0xff0000, 1)
            .fillRect(this.sprite.x - 25, this.sprite.y - 40, 50, 5);
        
        // Actual health bar
        this.healthBar = this.scene.add.graphics()
            .fillStyle(0x00ff00, 1)
            .fillRect(this.sprite.x - 25, this.sprite.y - 40, 50, 5);
    }

    updateHealthBar() {
        const healthPercent = this.health / this.maxHealth;
        this.healthBar.clear()
            .fillStyle(this.getHealthColor(healthPercent), 1)
            .fillRect(this.sprite.x - 25, this.sprite.y - 40, 50 * healthPercent, 5);
    }

    getHealthColor(percent) {
        if (percent < 0.3) return 0xffa500;  // Orange
        if (percent < 0.6) return 0xffff00;  // Yellow
        return 0x00ff00;  // Green
    }

    playIdle() {
        this.sprite.play(`${this.config.texture}_idle`);
    }

    playQuickDraw() {
        this.sprite.play(`${this.config.texture}_quickDraw`);
    }

    takeDamage(amount) {
        if (!this.isActive) return false;
        
        this.health = Phaser.Math.Clamp(this.health - amount, 0, this.maxHealth);
        this.updateHealthBar();
        
        this.flashRed();
        
        if (this.health <= 0) {
            this.disable();
            return true; //returns true if cowboy dies
        }
        return false;
    }

    flashRed() {
        this.scene.tweens.addCounter({
            from: 0,
            to: 3,
            duration: 300,
            onUpdate: tween => {
                const value = Math.floor(tween.getValue());
                this.sprite.tint = value % 2 === 0 ? 0xff0000 : 0xffffff;
            },
            onComplete: () => {
                if (this.isActive) {
                    this.sprite.tint = 0xffffff;
                } else {
                    this.sprite.tint = 0x000000;
                }
            }
        });
    }

    disable() {
        this.isActive = false;
        this.sprite.tint = 0x000000;
        this.sprite.anims.stop();
        
        this.healthBarBg.destroy();
        this.healthBar.destroy();
    }

    canShoot(currentTime) {
        return this.isActive && 
               currentTime >= this.nextShotTime && 
               this.sprite.anims.currentAnim?.key === `${this.config.texture}_idle`;
    }

    shoot(currentTime, shotFrameToCheck, onShotFired) {
        if (!this.isActive) return;
        
        this.playQuickDraw();
        
        this.nextShotTime = currentTime + Phaser.Math.Between(
            this.minResetTime, 
            this.maxResetTime
        );

        this.sprite.on('animationupdate', (animation, frame) => {
            if (frame.index === shotFrameToCheck) {
                onShotFired();
                this.sprite.off('animationupdate');
            }
        });
        
        this.sprite.once('animationcomplete', () => {
            if (this.isActive) {
                this.playIdle();
            }
        });
    }

    updatePosition(x, y) {
        this.sprite.setPosition(x, y);

        this.healthBarBg.clear()
            .fillStyle(0xff0000, 1)
            .fillRect(x - 25, y - 40, 50, 5);
        this.updateHealthBar();
    }
}