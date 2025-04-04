export default {
    shield: {
        name: 'shield',
        type: 'instant',
        cooldownDuration: 1000,
        castTime: 0,
        iconTexture: 'shieldSpellIcon',
        indicatorX: 100,
        indicatorY: 200,
        onCast: (scene) => {
            scene.shieldActive = true;
            scene.shield.setVisible(true);
            scene.time.delayedCall(500, () => {
                scene.shield.setVisible(false);
                scene.shieldActive = false;
            });
        }
    },
    fireball: {
        name: 'fireball',
        type: 'charged',
        cooldownDuration: 500,
        castTime: 1000,
        iconTexture: 'fireballSpellIcon',
        indicatorX: 140,
        indicatorY: 200,
        onCast: (scene) => {
            scene.wizard.setTexture('wizardOneAttack');
        },
        onComplete: (scene) => {
            scene.wizard.setTexture('wizardOne');
            scene.damageCowboy(25);
            scene.flashCowboyRed();
        },
        onInterrupt: (scene) => {
            scene.wizard.setTexture('wizardOne');
        }
    }
};