class Level {
    constructor(levelName) {
        this._levelName = levelName;
        this._level = null;
        this._blocks = [];
        this._destructableBlocks = 0;
        this._levelScoreTextNode = null;
        this.levelNumberOfAttempts = null;

        this._awakeBlocks = this._awakeBlocks.bind(this);
        this._collisionStartHandler = this._collisionStartHandler.bind(this);
        this._initLevelInfo = this._initLevelInfo.bind(this);
    }

    get levelName() {
        return this._levelName;
    }

    _awakeBlocks()  {
        $each(this._blocks, b => {
            b.__ph_awake();
        });
    }

    _collisionStartHandler(event) {
        for (const pair of event.pairs) {
            let bodyA = pair.bodyA;
            let bodyB = pair.bodyB;
            let speed = this._relImpactSpeed(bodyA, bodyB);

            if (bodyA && bodyA.__onCollision) {
                bodyA.__onCollision(speed);
            }

            if (bodyB && bodyB.__onCollision) {
                bodyB.__onCollision(speed);
            }
        }
    }

    _initLevelInfo() {
        return {
            levelName: (node) => {
                const [, levelNumber] = this._levelName.split(LEVEL_NAME_SEPARATOR);

                node.__text = TR('level', levelNumber)
            },
            levelScore: (node) => {
                this._levelScoreTextNode = node;

                node.__text = TR('score', levelState.score)
            },
            levelNumberOfAttempts: (node) => {
                this._levelNumberOfAttempts = node;

                node.__text = TR('numberOfAttempts', levelState.numberOfAttempts)
            }
        }
    }

    _looperPostOne(fn, delay) {
        if (fn.__posted > 0) {
            fn.__posted = _clearTimeout(fn.__posted);
        }

        if (!fn.__posted) {
            const cb = () => {
                fn.__posted = 0;
                fn();
            };

            if (delay) {
                fn.__posted = _setTimeout(cb, delay);
            } else {
                fn.__posted = -1;

                looperPost(cb);
            }
        }
    }

    _relImpactSpeed(bodyA, bodyB) {
        const velocityA = bodyA.velocity;
        const velocityB = bodyB.velocity;
        const vector = new Vector2(velocityA.x - velocityB.x, velocityA.y - velocityB.y);

        return vector.__length();
    }

    _addBreakBlock(x, y, velocity) {
        const breakBlock = this._level.__addChildBox({
            __img: `break_${randomInt(1, 9)}`,
            __ofs: [x, y, -20],
            __rotate: randomInt(0, 360),
            __physics: {
                __isStatic: false,
                __friction: 10,
                __frictionAir: 1,
                __frictionStatic: 50,
                __restitution: 0,
                __density: 1,
                __bodyType: 1
            }
        });

        looperPost(() => {
            const body = breakBlock.__ph_body;

            if (!body) {
                return;
            }

            ph_Body.setVelocity(
                body,
                new Vector2(
                    velocity.x + randomFloat(-10, 10),
                    velocity.y + randomFloat(-8, 3)
                )
            );

            _setTimeout(() => {
                const body = breakBlock.__ph_body;

                if (!body) {
                    return;
                }

                this._initCollision(body, breakBlock, 50, 10);

                _setTimeout(() => {
                    if (!breakBlock.__destructed) {
                        this._removeBlock(breakBlock);
                    }
                }, randomFloat(5, 10));
            }, 1);
        });
    }

    _removeBlock(block, blockCost) {
        removeFromArray(block, this._blocks);

        const size = block.__size;
        const body = block.__ph_body;

        block.__removeFromParent();

        this._looperPostOne(this._awakeBlocks);

        if (blockCost) {
            this.updateScore(blockCost);
        }

        if (block.__needBreaks) {
            playSound(`break_${randomInt(1, 4)}`, 0, 0, 0.5);

            const velocity = body.velocity;
            const angle = body.angle;
            const center = new Vector2(body.position.x, body.position.y);
            const step = 50;

            for (let x = 0; x < size.x; x += step) {
                for (let y = 0; y < size.y; y += step) {
                    const localPosition = new Vector2(x - size.x / 2, y - size.y / 2);
                    localPosition.__rotateAroundZ0(angle);

                    this._addBreakBlock(
                        center.x + localPosition.x,
                        center.y + localPosition.y,
                        velocity
                    )
                }
            }

            this._destructableBlocks--;

            if (this._destructableBlocks === 0) {
                _setTimeout(() => {
                    showWin();
                }, 1);
            }
        } else {
            if (random() > 0.5 && !windowManager.__hasOpenedWindow()) {
                playSound('break_' + randomInt(1, 4), 0, 0, 0.5);
            }
        }

    }

    _initCollision(body, node, hp, cost) {
        this._blocks.push(node);

        body.__hp = hp;
        body.__onCollision = (speed) => {
            const dmg = floor(clamp((speed - 1) * (speed - 2), 0, 100));

            if (dmg && body.__hp) {
                body.__hp = mmax(0, body.__hp - dmg);

                if (!body.__hp) {
                    body.__onCollision = 0;

                    looperPost(() => {
                        this._removeBlock(node, cost);
                    });
                }
            }
        }
    }

    _reset(isRestart = false) {
        closeWindow(WIN_WINDOW);

        ph_Events.off(ph_Engine, 'collisionStart', this._collisionStartHandler);

        removeLevelNode(this._level)

        levelState.score = 0;
        levelState.numberOfAttempts = 0;

        if (isRestart) {
            this._blocks = [];
            this._destructableBlocks = 0;
        }
    }

    updateNumberOfAttempts() {
        this._levelNumberOfAttempts.__text = TR('numberOfAttempts', levelState.numberOfAttempts)
    }

    updateScore(blockCost) {
        levelState.score += blockCost;

        this._levelScoreTextNode.__text = TR('score', levelState.score)
    }

    open() {
        const level = scene.__addChildBox(this._levelName);

        this._level = level;

        const slingshotParams = new Slingshot(this._level).configuredParams;

        level.__setAliasesData(Object.assign(slingshotParams, this._initLevelInfo()))

        this._level.update(1);

        // настраиваем коллизии для отработки повреждения блоков
        ph_Events.on(ph_Engine, 'collisionStart', this._collisionStartHandler);

        // проходим по уровню и инициализируем блоки
        this._level.__traverse(node => {
            const body = node.__ph_body;

            if (body && !body.isStatic && !!node.__isBreakable) {
                node.__needBreaks = 1;

                this._destructableBlocks++;
                this._initCollision(body, node, 100, 50);
            }
        });
    }

    close() {
        this._reset();

        if (this._level.__destructed) {
            BUS.__post(__ON_LEVEL_CLOSED)
        }
    }

    restart() {
        this._reset(true);

        if (this._level.__destructed) {
            this.open();
        }
    }
}