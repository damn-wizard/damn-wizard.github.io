class Slingshot {
    constructor(level) {
        if (!level) {
            throw new Error('[Slingshot]: Не была передана текущая нода уровеня');
        }

        this._level = level;

        this._rubberNode = null;

        this._configuredParams = {
            rubber: this._configureRubber.bind(this),
            userInputArea: this._configureUserInputArea.bind(this),
        }
    }

    get configuredParams() {
        return this._configuredParams;
    }

    _configureRubber(node) {
        this._rubberNode = node;
    }

    _configureUserInputArea(node) {
        node.__dragDist = 1;
        node.__drag = (x, y) => {
            const dmouse = node.__dmouse = node.__worldPosition.__clone().sub(new Vector2(x, y));

            this._rubberNode.__parent.__rotate = -dmouse.__angle() * RAD2DEG;

            const length = dmouse.__length();

            if (length <= MAX_SLINGSHOT_RUBBER_LENGTH) {
                this._rubberNode.__width = length;
            }
        }
        node.__dragStart = () => {
            this._rubberNode.__killAllAnimations();
        }
        node.__dragEnd = () => {
            playSound('punch');

            BUS.__post(__ON_SHOOT);

            this._rubberNode.__anim(
                { __width: 10 },
                0.4,
                0,
                easeElasticO
            );

            const wp = node.__worldPosition;
            const bullet = this._level.__addChildBox({
                __effect: 'tail',
                __img: 'circle1',
                __size: [28, 28],
                __ofs: [wp.x, wp.y, -20],
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

            const velocity = node.__dmouse.__multiplyScalar(0.2);

            if (velocity.__length() > MAX_BULLET_VELOCITY) {
                velocity.__normalize().__multiplyScalar(MAX_BULLET_VELOCITY);
            }

            if (bullet.__ph_body) {
                ph_Body.setVelocity(bullet.__ph_body, velocity);
            }

           _setTimeout(() => {
                bullet.__removeFromParent();
            }, REMOVE_BULLET_FROM_LEVEL_TIME);
        }
    }
}

