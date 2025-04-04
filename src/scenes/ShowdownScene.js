import Cowboy from '../Cowboy.js'
import cowboyTypes from '../cowboyTypes.js';
import Phaser from 'phaser';
import Spell from '../Spell.js';
import spellTypes from '../spellTypes.js';  

class ShowdownScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShowdownScene' });
    this.shieldActive = false;
    this.nextShotTime = 0;
    this.shotFrameToCheck = 9;
    this.wizardOriginalTint = 0xffffff;
    this.shieldOriginalTint = 0xffffff;
    
    this.backgroundColor = 0xadd8e6

    this.wizardMaxHealth = 100;

    this.wizardFacingRight = true;
    this.isDefeated;

    this.cowboyTypes = cowboyTypes;
    this.spellTypes = spellTypes;
  }

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
    this.isDefeated = false;

    const cowboyTypeKey = this.game.registry.get('cowboyData') || 'default';
    const cowboyType = this.cowboyTypes[cowboyTypeKey];

    const idleKey = `${cowboyTypeKey}_idle`;
    const quickDrawKey = `${cowboyTypeKey}_quickDraw`;
    
    this.add.image(0, 0, 'background').setOrigin(0, 0.2);
    this.cameras.main.setBackgroundColor(this.backgroundColor);

    const effect = this.cameras.main.postFX.addColorMatrix();
    const effectTwo = this.cameras.main.postFX.addVignette(0.5, 0.5, 1.1);
    effect.vintagePinhole();

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

    if (!this.anims.exists('shieldCooldown')) {
      this.anims.create({
        key: 'shieldCooldown',
        frames: this.anims.generateFrameNumbers('shieldSpellIcon', { start: 0, end: 7 }),
        frameRate: 8,
        repeat: 0
      });
    }
    
    if (!this.anims.exists('fireballCooldown')) {
      this.anims.create({
        key: 'fireballCooldown',
        frames: this.anims.generateFrameNumbers('fireballSpellIcon', { start: 0, end: 7 }),
        frameRate: 8,
        repeat: 0
      });
    }

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
    
    this.spells = {
      shield: new Spell(this, this.spellTypes.shield),
      fireball: new Spell(this, this.spellTypes.fireball)
    };
    
    this.scheduleRandomShot();

    this.createWizardHealthBar(this.wizard.x, this.wizard.y);

    this.createConfirmationBox();
  }

  update() {
    const now = this.time.now;

    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.showConfirmationBox();
    }

    if (this.isDefeated) return;

    const activeCowboys = this.cowboys.filter(c => c.isActive);
    if (activeCowboys.length === 0) return;  // All cowboys defeated

    if (now >= this.nextShotTime) {
        const shooter = Phaser.Math.RND.pick(activeCowboys);
        
        if (shooter.canShoot(now)) {
            shooter.shoot(now, this.shotFrameToCheck, () => {
                this.checkShotResult();
            });
            this.scheduleRandomShot();
        }
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.spells.shield.cast();
    }

    if (Phaser.Input.Keyboard.JustDown(this.fKey)) {
        this.spells.fireball.cast();
    }

    if (Phaser.Input.Keyboard.JustDown(this.leftKey) || Phaser.Input.Keyboard.JustDown(this.hKey)) {
        this.flipWizard('left');
    }
    if (Phaser.Input.Keyboard.JustDown(this.rightKey) || Phaser.Input.Keyboard.JustDown(this.lKey)) {
        this.flipWizard('right');
    }
  }
  
  scheduleRandomShot() {
    const cowboyType = this.cowboyTypes[this.game.registry.get('cowboyData') || 'default'];
    const delay = Phaser.Math.Between(cowboyType.minReset, cowboyType.maxReset);
    this.nextShotTime = this.time.now + delay;
  }

  checkShotResult() {
    if (this.shieldActive) {
        console.log("blocked!");
        this.flashShieldWhite();
    } else {
        const cowboyType = this.cowboyTypes[this.game.registry.get('cowboyData') || 'default'];
        const damage = cowboyType.shotDamage;
        console.log(`hit! Damage: ${damage}`);
        this.damageWizard(damage);
        this.flashWizardRed();
        
        // Interrupt any active spells
        if (this.spells.fireball.isActive) {
            this.spells.fireball.interrupt();
        }
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
    const newHealth = this.wizardHealth - amount;
    this.wizardHealth = Phaser.Math.Clamp(newHealth, 0, this.wizardMaxHealth);
    
    console.log(`Wizard took ${amount} damage. Health: ${this.wizardHealth}/${this.wizardMaxHealth}`);
    
    this.updateWizardHealthBar();
    
    if (this.wizardHealth <= 0) {
        this.wizardDefeated();
    } 
  }

  wizardDefeated() {
    console.log("Wizard defeated!");
    this.isDefeated = true;
    this.wizard.setTint(0x000000);
    this.wizard.anims.stop();

    this.nextShotTime = Infinity;
    
    // Interrupt any active spells
    Object.values(this.spells).forEach(spell => {
        if (spell.isActive) {
            spell.interrupt();
        }
    });
    
    this.shieldActive = false;
    this.shield.setVisible(false);

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
        
        if (this.shieldActive) {
            this.shield.setVisible(true);
        }
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