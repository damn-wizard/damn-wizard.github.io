class Projectile {
    constructor(level) {
        if (!level) {
            throw new Error('[Projectile]: Не была передана текущая нода уровеня');
        }

        this._level = level;

        this._loadedProjectile = null;
    }

    get isDestructed() {
        return !this._loadedProjectile || this._loadedProjectile.__destructed;
    }

    calculateLoadedPosition(originPosition, pullOffset) {
        return originPosition.__clone().add(pullOffset);
    }

    createLoadedProjectile(root, position) {
        const { x, y } = this.calculateLoadedPosition(position, new Vector2());

        this._loadedProjectile = root.__addChildBox({
            __img: 'circle1',
            __size: [PROJECTILE_SIZE, PROJECTILE_SIZE],
            __ofs: [x, y, PROJECTILE_LOADED_DEFAULT_Z]
        });
    }

    updateLoadedProjectilePosition(originPosition, visualPullOffset, powerPullOffset) {
        if (this.isDestructed || this._loadedProjectile.__ph_body) {
            return;
        }

        const { x, y } = this.calculateLoadedPosition(originPosition, visualPullOffset);

        this._loadedProjectile.__x = x;
        this._loadedProjectile.__y = y;
        this._loadedProjectile.__z = abs(powerPullOffset.x) < SLINGSHOT_MIN_SHOT_PULL
            ? PROJECTILE_LOADED_DEFAULT_Z
            : PROJECTILE_LOADED_Z;

    }

    launch(originPosition, visualPullOffset, powerPullOffset) {
        const { x, y } = this.calculateLoadedPosition(originPosition, visualPullOffset);

        if (this._loadedProjectile && !this._loadedProjectile.__destructed) {
            this._loadedProjectile.__removeFromParent();

            this._loadedProjectile = null;
        }

        const projectile = this._level.__addChildBox({
            __img: 'circle1',
            __size: [PROJECTILE_SIZE, PROJECTILE_SIZE],
            __ofs: [x, y, PROJECTILE_FLYING_Z],
            __physics: {
                __isStatic: false,
                __friction: 130,
                __frictionAir: 0.2,
                __frictionStatic: 500,
                __restitution: 10,
                __density: 4,
                __bodyType: 1
            }
        }).update();

        _setTimeout(() => {
            projectile.__effect = 'tail';
        }, PROJECTILE_SHOW_TRAIL_DELAY)


        if (projectile.__ph_body) {
            const velocity = powerPullOffset.__clone().__multiplyScalar(-SLINGSHOT_SHOT_POWER);

            ph_Body.setVelocity(projectile.__ph_body, velocity);
        }

        _setTimeout(() => {
            projectile.__removeFromParent();
        }, PROJECTILE_LIFETIME);
    }
}