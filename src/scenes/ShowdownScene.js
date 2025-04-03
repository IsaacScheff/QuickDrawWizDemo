import Cowboy from '../Cowboy.js';
import Phaser from 'phaser';

class ShowdownScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShowdownScene' });
    this.shieldActive = false;
    this.nextShotTime = 0;
    this.shotFrameToCheck = 9;
    this.wizardOriginalTint = 0xffffff;
    this.shieldOriginalTint = 0xffffff;

    this.isWizardAttacking = false;
    this.attackChargeTimer = null;

    this.wizAttackTime = 1000;

    this.shieldCooldown = false;
    this.shieldCooldownDuration = 1000;
    this.shieldCooldownTimer = null;
    this.lastShieldTime = 0;
    this.shieldSpellFrameRate = 8 / (this.shieldCooldownDuration / 1000);
    this.shieldTime = 500;

    this.attackCooldown = false;
    this.attackCooldownDuration = 500;
    this.attackCooldownTimer = null;
    this.lastAttackTime = 0;
    this.fireballSpellFrameRate = 8 / (this.attackCooldownDuration / 1000);
    this.attackDamage = 25;
    
    this.backgroundColor = 0xadd8e6

    this.wizardMaxHealth = 1000;

    this.wizardFacingRight = true;
  }

  cowboyTypes = {
    default: {
      texture: 'cowboy',
      maxHealth: 100,
      shotDamage: 80,
      idleAnim: { start: 0, end: 6, frameRate: 10 },
      quickDrawAnim: { start: 14, end: 31, frameRate: 20 },
      minReset: 2000,
      maxReset: 4000,
      isDual: false
  },
    cowboy: {
        texture: 'cowboy',
        maxHealth: 100,
        shotDamage: 80,
        idleAnim: { start: 0, end: 6, frameRate: 10 },
        quickDrawAnim: { start: 14, end: 31, frameRate: 20 },
        minReset: 2000,
        maxReset: 4000,
        isDual: true
    },
    cowboyRedbeard: {
        texture: 'cowboyRedbeard',
        maxHealth: 120,
        shotDamage: 70,
        idleAnim: { start: 0, end: 6, frameRate: 8 },
        quickDrawAnim: { start: 14, end: 31, frameRate: 18 },
        minReset: 2500,
        maxReset: 4500,
        isDual: false
    },
    cowboyWhitesuit: {
        texture: 'cowboyWhitesuit',
        maxHealth: 80,
        shotDamage: 100,
        idleAnim: { start: 0, end: 6, frameRate: 12 },
        quickDrawAnim: { start: 14, end: 31, frameRate: 24 },
        minReset: 1500,
        maxReset: 3500,
        isDual: false
    },
    // cowboyDuo: {
    //   texture: 'cowboy', 
    //   maxHealth: 150, // Combined health
    //   shotDamage: 30, // Per cowboy
    //   idleAnim: { start: 0, end: 6, frameRate: 10 },
    //   quickDrawAnim: { start: 14, end: 31, frameRate: 20 },
    //   minReset: 1800,
    //   maxReset: 3200,
    //   isDual: true 
    // }
  };

  preload() {
    this.load.image('background', 'assets/images/cowboyBackground.png');
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
    this.load.image('wizardOne', 'assets/images/WizardOne.png');
    this.load.image('wizardShield', 'assets/images/WizShieldOne.png');
    this.load.image('wizardOneAttack', 'assets/images/WizardOneAttack.png');
    this.load.spritesheet('shieldSpellIcon', 'assets/images/ShieldSpellIcon.png', {
      frameWidth: 21,
      frameHeight: 21,
    });
    this.load.spritesheet('fireballSpellIcon', 'assets/images/FireballSpellIcon.png', {
      frameWidth: 21,
      frameHeight: 21,
    });
  }

  create() {
    this.wizardHealth = this.wizardMaxHealth;

    const cowboyTypeKey = this.game.registry.get('cowboyData') || 'default';
    const cowboyType = this.cowboyTypes[cowboyTypeKey];

    const idleKey = `${cowboyTypeKey}_idle`;
    const quickDrawKey = `${cowboyTypeKey}_quickDraw`;
    
    this.add.image(0, 0, 'background').setOrigin(0, 0.2);
    this.cameras.main.setBackgroundColor(this.backgroundColor);

    if (!this.anims.exists(idleKey)) {
      this.anims.create({
          key: idleKey,
          frames: this.anims.generateFrameNumbers(cowboyType.texture, cowboyType.idleAnim),
          frameRate: cowboyType.idleAnim.frameRate,
          repeat: -1
      });
    }
    
    if (!this.anims.exists(quickDrawKey)) {
        this.anims.create({
            key: quickDrawKey,
            frames: this.anims.generateFrameNumbers(cowboyType.texture, cowboyType.quickDrawAnim),
            frameRate: cowboyType.quickDrawAnim.frameRate, 
            repeat: 0
        });
    }

    this.createAnimationIfNotExists('shieldIconCooldown', {
      texture: 'shieldSpellIcon',
      frames: { start: 0, end: 7 },
      frameRate: this.shieldSpellFrameRate,
      repeat: 0
    });

    this.createAnimationIfNotExists('fireballIconCooldown', {
      texture: 'fireballSpellIcon',
      frames: { start: 0, end: 7 },
      frameRate: this.shieldSpellFrameRate,
      repeat: 0
    });

    if (cowboyType.isDual) {
      this.wizard = this.add.sprite(128, 130, 'wizardOne');
      this.targetCowboy = this.wizardFacingRight ? 'right' : 'left';
      
      // Create cowboy instances
      this.cowboys = [
          new Cowboy(this, 40, 130, cowboyType),
          new Cowboy(this, 190, 130, cowboyType)
      ];
      
      // Flip left cowboy
      this.cowboys[0].sprite.setFlipX(true);
    } else {
        this.wizard = this.add.sprite(66, 130, 'wizardOne');
        this.cowboys = [new Cowboy(this, 190, 130, cowboyType)];
    }
    this.nextShotTime = this.time.now + Phaser.Math.Between(
        cowboyType.minReset, 
        cowboyType.maxReset
    );

    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.hKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    this.lKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    
    this.shield = this.add.image(this.wizard.x + 20, this.wizard.y, 'wizardShield')
      .setVisible(false)
      .setDepth(1);

    this.shieldCooldownIndicator = this.add.sprite(100, 200, 'shieldSpellIcon').setInteractive();
    this.shieldCooldownIndicator.setFrame(7);
    this.updateShieldCooldownVisual();

    this.fireballCooldownIndicator = this.add.sprite(140, 200, 'fireballSpellIcon').setInteractive();
    this.fireballCooldownIndicator.setFrame(7);
    
    this.scheduleRandomShot();

    this.createWizardHealthBar(this.wizard.x, this.wizard.y);

    this.createConfirmationBox();
  }

  update() {
    const now = this.time.now;

    // Find active cowboys
    const activeCowboys = this.cowboys.filter(c => c.isActive);
    if (activeCowboys.length === 0) return;  // All cowboys defeated

    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        this.showConfirmationBox();
    }

    this.fireballCooldownIndicator.on('pointerdown', () => {
        if (!this.isWizardAttacking && !this.attackCooldown) {
            this.startWizardAttack();
        }
    });

    this.shieldCooldownIndicator.on('pointerdown', () => {
        if (!this.isWizardAttacking) {
            this.activateShield();
        }
    });

    if (now >= this.nextShotTime) {
        const shooter = Phaser.Math.RND.pick(activeCowboys);
        
        if (shooter.canShoot(now)) {
            shooter.shoot(now, this.shotFrameToCheck, () => {
                this.checkShotResult();
            });
            this.scheduleRandomShot();
        }
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.isWizardAttacking) {
        this.activateShield();
    }

    if (Phaser.Input.Keyboard.JustDown(this.fKey) && !this.isWizardAttacking && !this.attackCooldown) {
        this.startWizardAttack();
    }

    if (Phaser.Input.Keyboard.JustDown(this.leftKey) || Phaser.Input.Keyboard.JustDown(this.hKey)) {
        this.flipWizard('left');
    }
    if (Phaser.Input.Keyboard.JustDown(this.rightKey) || Phaser.Input.Keyboard.JustDown(this.lKey)) {
        this.flipWizard('right');
    }

    this.updateShieldCooldownVisual();
    this.updateAttackCooldownVisual();
  }
  
  scheduleRandomShot() {
    const cowboyType = this.cowboyTypes[this.game.registry.get('cowboyData') || 'default'];
    const delay = Phaser.Math.Between(cowboyType.minReset, cowboyType.maxReset);
    this.nextShotTime = this.time.now + delay;
}
  
  activateShield() {
    if (!this.shieldActive && !this.shieldCooldown) {
        this.shieldCooldownIndicator.setFrame(0);
        this.shieldActive = true;
        this.shield.setVisible(true);
        this.lastShieldTime = this.time.now;
        
        this.time.delayedCall(this.shieldTime, () => {
            this.shield.setVisible(false);
            this.shieldActive = false;

            this.shieldCooldown = true;
            this.shieldCooldownTimer = this.time.delayedCall(this.shieldCooldownDuration, () => {
                this.shieldCooldown = false;
                this.shieldCooldownTimer = null;
            });
        });
    }
  }

  checkShotResult() {
    if (this.shieldActive) {
      console.log("blocked!");
      this.flashShieldWhite();
    } else {
      console.log("hit!");
      this.damageWizard(this.cowboyShotDamage);
      this.flashWizardRed();
      this.interruptWizardAttack();
    }
  }
  
  flashWizardRed() {
    if (this.wizardHealth <= 0) return;

    this.tweens.addCounter({
      from: 0,
      to: 3,
      duration: 300,
      onUpdate: tween => {
        const value = Math.floor(tween.getValue());
        this.wizard.tint = value % 2 === 0 ? 0xff0000 : this.wizardOriginalTint;
      },
      onComplete: () => {
        this.wizard.tint = this.wizardOriginalTint;
      }
    });
  }
  
  flashShieldWhite() {
    this.tweens.addCounter({
      from: 0,
      to: 3,
      duration: 300,
      onUpdate: tween => {
        const value = Math.floor(tween.getValue());
        this.shield.tint = value % 2 === 0 ? 0x00a2ff : this.shieldOriginalTint;
        this.shield.setScale(value % 2 === 0 ? 1.1 : 1.0);
      },
      onComplete: () => {
        this.shield.tint = this.shieldOriginalTint;
        this.shield.setScale(1.0);
      }
    });
  }

  startWizardAttack() {
    if (!this.isWizardAttacking && !this.attackCooldown) {
      this.isWizardAttacking = true;
      this.fireballCooldownIndicator.setFrame(0);
        
      this.wizard.setTexture('wizardOneAttack');
        
      this.attackChargeTimer = this.time.delayedCall(this.wizAttackTime, () => {
        this.completeWizardAttack();
            
        this.attackCooldown = true;
        this.lastAttackTime = this.time.now;
        this.attackCooldownTimer = this.time.delayedCall(this.attackCooldownDuration, () => {
          this.attackCooldown = false;
            this.attackCooldownTimer = null;
        });
      });
    }
  }
  
  interruptWizardAttack() {
    if (this.isWizardAttacking) {

      if (this.attackChargeTimer) {
        this.attackChargeTimer.destroy();
        this.attackChargeTimer = null;
      }

      this.wizard.setTexture('wizardOne');
      this.isWizardAttacking = false;
    }
  }
  
  completeWizardAttack() {    
    this.damageCowboy(this.attackDamage);
    this.flashCowboyRed();
    
    this.wizard.setTexture('wizardOne');
    this.isWizardAttacking = false;
  }

  damageCowboy(amount) {
    const cowboyType = this.cowboyTypes[this.game.registry.get('cowboyData') || 'default'];
    
    if (cowboyType.isDual) {
        // Damage targeted cowboy
        const targetIndex = this.targetCowboy === 'left' ? 0 : 1;
        const cowboyDied = this.cowboys[targetIndex].takeDamage(amount);
        
        if (cowboyDied) {
            const allDead = this.cowboys.every(c => !c.isActive);
            if (allDead) this.cowboyDefeated();
        }
    } else {
        if (this.cowboys[0].takeDamage(amount)) {
            this.cowboyDefeated();
        }
    }
  }
  
  // Helper method for health bar colors
  getHealthColor(percent) {
    if (percent < 0.3) return 0xff0000;
    if (percent < 0.6) return 0xffff00;
    return 0x00ff00;
  }

  flashCowboyRed() {
    const cowboyType = this.cowboyTypes[this.game.registry.get('cowboyData') || 'default'];
    
    this.tweens.addCounter({
        from: 0,
        to: 3,
        duration: 300,
        onUpdate: tween => {
            const value = Math.floor(tween.getValue());
            const tint = value % 2 === 0 ? 0xff0000 : 0xffffff;
            
            if (cowboyType.isDual) {
                const targetIndex = this.targetCowboy === 'left' ? 0 : 1;
                this.cowboys[targetIndex].sprite.tint = tint;
            } else {
                this.cowboys[0].sprite.tint = tint;
            }
        },
        onComplete: () => {
            this.cowboys.forEach(cowboy => {
                if (!cowboy.isActive) {
                    cowboy.sprite.tint = 0x000000;
                } else {
                    cowboy.sprite.tint = 0xffffff;
                }
            });
        }
    });
  }

  updateShieldCooldownVisual() {
    if (this.shieldCooldown) {
        if (!this.shieldCooldownIndicator.anims.isPlaying) {
            this.shieldCooldownIndicator.play('shieldIconCooldown');
        }
    } else {
        this.shieldCooldownIndicator.anims.stop();
    }
  }

  updateAttackCooldownVisual() {
    if (this.attackCooldown) {
        if (!this.fireballCooldownIndicator.anims.isPlaying) {
            this.fireballCooldownIndicator.play('fireballIconCooldown');
        }
    } else if(this.isWizardAttacking) {
      this.fireballCooldownIndicator.setFrame(0);
    } else {
      this.fireballCooldownIndicator.anims.stop();
      this.fireballCooldownIndicator.setFrame(7);
    }
  }

  cowboyDefeated() {
    console.log("Cowboy defeated!");
    this.nextShotTime = Infinity;
    this.time.delayedCall(1000, () => this.showConfirmationBox());
  }

  updateWizardHealthBar() {
    const healthPercent = this.wizardHealth / this.wizardMaxHealth;
    const width = 50 * healthPercent;

    this.wizardHealthBar.clear();
    
    if (healthPercent < 0.3) {
        this.wizardHealthBar.fillStyle(0xffa500, 1); //orange
    } else if (healthPercent < 0.6) {
        this.wizardHealthBar.fillStyle(0xffff00, 1); //yellow
    } else {
        this.wizardHealthBar.fillStyle(0x00ff00, 1); //green
    }
    
    this.wizardHealthBar.fillRect(this.wizard.x - 25, this.wizard.y - 30, width, 5);
  }

  damageWizard(amount) {
    this.wizardHealth = Phaser.Math.Clamp(this.wizardHealth - amount, 0, this.wizardMaxHealth);
    this.updateWizardHealthBar();
    
    if (this.wizardHealth <= 0) {
        this.wizardDefeated();
    }
  }

  wizardDefeated() {
    console.log("Wizard defeated!");
    this.wizard.setTint(0x000000);
    this.wizard.anims.stop();

    this.nextShotTime = Infinity;
    
    this.isWizardAttacking = false;
    this.shieldActive = false;
    this.shield.setVisible(false);
    
    if (this.attackChargeTimer) {
        this.attackChargeTimer.destroy();
        this.attackChargeTimer = null;
    }
    if (this.shieldCooldownTimer) {
        this.shieldCooldownTimer.destroy();
        this.shieldCooldownTimer = null;
    }

    this.time.delayedCall(1000, () => {
      this.showConfirmationBox();
    });
  }

  createConfirmationBox() {
    this.confirmationBg = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      300,
      150,
      0x000000,
      0.7
    ).setOrigin(0.5).setDepth(10).setVisible(false);
  
    this.confirmationText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 30,
      'Return to Main Menu?',
      { 
        fontSize: '24px',
        color: '#FFFFFF',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5).setDepth(11).setVisible(false);
  
    this.yesButton = this.add.text(
      this.cameras.main.centerX - 60,
      this.cameras.main.centerY + 30,
      'Yes',
      { 
        fontSize: '20px',
        color: '#FFFFFF',
        backgroundColor: '#008000',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5).setDepth(11).setVisible(false)
     .setInteractive()
     .on('pointerdown', () => {
      this.scene.stop('ShowdownScene');
       this.scene.start('MainMenuScene');
     });
  
    this.noButton = this.add.text(
      this.cameras.main.centerX + 60,
      this.cameras.main.centerY + 30,
      'No',
      { 
        fontSize: '20px',
        color: '#FFFFFF',
        backgroundColor: '#800000',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5).setDepth(11).setVisible(false)
     .setInteractive()
     .on('pointerdown', () => {
       this.hideConfirmationBox();
     });
  }
  
  showConfirmationBox() {
    this.confirmationBg.setVisible(true);
    this.confirmationText.setVisible(true);
    this.yesButton.setVisible(true);
    this.noButton.setVisible(true);
  }
  
  hideConfirmationBox() {
    this.confirmationBg.setVisible(false);
    this.confirmationText.setVisible(false);
    this.yesButton.setVisible(false);
    this.noButton.setVisible(false);
  }

  createAnimationIfNotExists(key, config) {
    if (!this.anims.exists(key)) {
        if (!this.textures.exists(config.texture)) {
            console.error(`Texture "${config.texture}" not found for animation "${key}"`);
            return;
        }
        
        try {
            this.anims.create({
                key: key,
                frames: this.anims.generateFrameNumbers(config.texture, {
                    start: config.frames.start,
                    end: config.frames.end
                }),
                frameRate: config.frameRate,
                repeat: config.repeat
            });
            console.log(`Created animation "${key}" using texture "${config.texture}"`);
        } catch (error) {
            console.error(`Failed to create animation "${key}":`, error);
        }
    }
  }

  flipWizard(direction) {
    const shouldFaceRight = direction === 'right';
    
    if (shouldFaceRight !== this.wizardFacingRight) {
      this.wizard.setFlipX(!shouldFaceRight);
      this.wizardFacingRight = shouldFaceRight;
      this.targetCowboy = shouldFaceRight ? 'right' : 'left';
      
      this.shield.setPosition(
        this.wizard.x + (shouldFaceRight ? 20 : -20), 
        this.wizard.y
      );
    }
  }

  createWizardHealthBar(x, y) {
    if (this.wizardHealthBarBg) this.wizardHealthBarBg.destroy();
    if (this.wizardHealthBar) this.wizardHealthBar.destroy();

    this.wizardHealthBarBg = this.add.graphics()
        .fillStyle(0xff0000, 1)
        .fillRect(x - 25, y - 30, 50, 5);

    this.wizardHealthBar = this.add.graphics()
        .fillStyle(0x00ff00, 1)
        .fillRect(x - 25, y - 30, 50, 5);
  }
}

export default ShowdownScene;