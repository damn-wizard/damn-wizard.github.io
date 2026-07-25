class Slingshot {
    constructor(level) {
        if (!level) {
            throw new Error('[Slingshot]: Не была передана текущая нода уровеня');
        }

        this._level = level;

        this._leftRubberAnchor = null;
        this._rubberLeft = null;
        this._rightRubberAnchor = null;
        this._rubberRight = null;
        this._shotOrigin = null;
        this._slingshot = null;
        this._userInputArea = null;

        this._shotOriginLocalPosition = null;
        this._shotOriginWorldPosition = null;
        this._leftRubberAnchorLocalPosition = null;
        this._rightRubberAnchorLocalPosition = null;

        this._projectile = new Projectile(this._level);
        this._predictionPath = new PredictionPath(this._level);

        this._currentPowerPull = new Vector2()
        this._currentVisualPull = new Vector2()

        this._isReloading = false;

        BUS.__addEventListener(__ON_LEVEL_OPENED, () => {
            this._init();

            return 1;
        });
    }

    get _calculatedLoadedProjectileWorldPosition() {
        return this._projectile.calculateLoadedPosition(this._shotOriginWorldPosition, this._currentVisualPull);
    }

    get _rubbersContactPoint() {
        const projectileLocalPosition = this._projectile.calculateLoadedPosition(this._shotOriginLocalPosition, this._currentVisualPull);

        if (!this._currentPowerPull || this._currentPowerPull.__length() < 0.001) {
            return projectileLocalPosition;
        }

        return projectileLocalPosition.add(
            this._currentPowerPull
                .__clone()
                .__normalize()
                .__multiplyScalar(SLINGSHOT_RUBBER_CONTACT_RADIUS)
        );
    }

    _generate() {
        this._slingshot = this._level
            .__addChildBox('slingshot')
            .__setAliasesData({
                rubberAnchorLeft: (node) => {
                    this._leftRubberAnchor = node;
                },
                rubberAnchorRight: (node) => {
                    this._rightRubberAnchor = node;
                },
                rubberLeft: (node) => {
                    this._rubberLeft = node;
                },
                rubberRight: (node) => {
                    this._rubberRight = node;
                },
                shotOrigin: (node) => {
                    this._shotOrigin = node;
                },
                userInputArea: (node) => {
                    node.__dragDist = 1;
                    node.__dragStart = () => {
                        if (this._isReloading || this._projectile.isDestructed) {
                            return;
                        }

                        this._predictionPath.create();
                        this._predictionPath.update(this._calculatedLoadedProjectileWorldPosition, this._currentPowerPull);
                    };
                    node.__drag = (x, y) => {
                        const powerPull = new Vector2(
                            x - node.__worldPosition.x,
                            y - node.__worldPosition.y
                        );

                        powerPull.x = mmin(0, powerPull.x);
                        powerPull.y = powerPull.x < SLINGSHOT_MAX_POWER_PULL ? mmin(85, powerPull.y) : powerPull.y

                        this._constraintPull(powerPull, SLINGSHOT_MAX_POWER_PULL);
                        this._updatePull(powerPull);
                    };
                    node.__dragEnd = () => {
                        this._predictionPath.hide();

                        if (this._currentPowerPull.__length() < SLINGSHOT_MIN_SHOT_PULL) {
                            this._updatePull(new Vector2());

                            return;
                        }

                        playSound('punch');

                        this._projectile.launch(this._shotOriginWorldPosition, this._currentVisualPull, this._currentPowerPull);
                        this._resetRubbers();
                        this._startBulletReload();
                    }

                    this._userInputArea = node;
                }
            });

        this._slingshot.update()
        this._slingshot.__updateMatrixWorld();
    }

    _init() {
        this._generate();

        const {x: leftRubberX, y: leftRubberY} = this._leftRubberAnchor.__layoutPosition;
        const {x: rightRubberX, y: rightRubberY} = this._rightRubberAnchor.__layoutPosition;

        this._leftRubberAnchorLocalPosition = new Vector2(leftRubberX, leftRubberY);
        this._rightRubberAnchorLocalPosition = new Vector2(rightRubberX, rightRubberY);

        const {x: shotOriginX, y: shotOriginY} = this._shotOrigin.__layoutPosition;

        this._shotOriginLocalPosition = new Vector2(shotOriginX, shotOriginY);
        this._shotOriginWorldPosition = this._shotOrigin.__worldPosition.__clone();

        this._resetRubbers();
        this._projectile.createLoadedProjectile(this._slingshot, this._shotOriginLocalPosition);
        this._predictionPath.hide();
    }

    _resetRubbers() {
        this._currentVisualPull.set(0, 0);
        this._currentPowerPull.set(0, 0);

        this._updateRubbers();
    }

    _updateRubbers() {
        this._updateRubber(this._rubberRight, this._rightRubberAnchorLocalPosition);
        this._updateRubber(this._rubberLeft, this._leftRubberAnchorLocalPosition);
    }

    _updateRubber(node, anchor) {
        const delta = this._rubbersContactPoint.__clone().sub(anchor);
        const center = anchor.__clone().add(this._rubbersContactPoint).__multiplyScalar(0.5);

        node.__width = delta.__length();
        node.__x = center.x;
        node.__y = center.y;
        node.__rotate = -delta.__angle() * RAD2DEG;
    }

    _constraintPull(pull, maxLength) {
        const length = pull.__length();

        if (length > maxLength) {
            pull.__multiplyScalar(maxLength / length);
        }
    }

    _getVisualPull(powerPull) {
        const visualPull = powerPull.__clone().__multiplyScalar(SLINGSHOT_VISUAL_PULL_SCALE);

        this._constraintPull(visualPull, SLINGSHOT_MAX_VISUAL_PULL);

        return visualPull;
    }

    _updatePull(powerPull) {
        this._currentPowerPull.__copy(powerPull);
        this._currentVisualPull.__copy(this._getVisualPull(powerPull));

        this._updateRubbers();
        this._projectile.updateLoadedProjectilePosition(this._shotOriginLocalPosition, this._currentVisualPull, this._currentPowerPull);
        this._predictionPath.update(this._calculatedLoadedProjectileWorldPosition, this._currentPowerPull);
    }

    _startBulletReload() {
        if (this._isReloading) {
            return;
        }

        this._isReloading = true;
        this._userInputArea.__disabled = true;

        _setTimeout(() => {
            if (this._projectile.isDestructed) {
                this._projectile.createLoadedProjectile(this._slingshot, this._shotOriginLocalPosition);
            }

            this._resetRubbers();
            this._isReloading = false;
            this._userInputArea.__disabled = false;
        }, SLINGSHOT_RELOAD_DELAY);
    }
}

