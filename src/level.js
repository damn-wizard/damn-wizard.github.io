class Level {
    constructor(levelName) {
        if (!levelName) {
            throw new Error('[Level]: Название уровня не было передано');
        }

        this._levelName = levelName;
        this._level = null;
        this._blocks = [];
        this._destructableBlocksCount = 0;
        this._maxScore = 0;

        this._awakeBlocks = this._awakeBlocks.bind(this);
        this._collisionStartHandler = this._collisionStartHandler.bind(this);
    }

    get levelName() {
        return this._levelName;
    }

    _awakeBlocks() {
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
        const image = `break_${randomInt(1, 9)}`;

        const breakBlock = this._level.__addChildBox({
            __img: image,
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

                const blockScoreValue = BREAK_BLOCK_SCORE_MAP.has(image) && this._destructableBlocksCount > 0
                    ? BREAK_BLOCK_SCORE_MAP.get(image)
                    : 0;

                this._initCollision(body, breakBlock, BREAK_BLOCK_HP, blockScoreValue);

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

        if (blockCost && !windowManager.__hasOpenedWindow()) {
            BUS.__post(__ON_ADD_SCORE, blockCost);
        }

        if (block.__needBreaks) {
            playSound(`break_${randomInt(1, 4)}`, 0, 0, 0.5);

            const velocity = body.velocity;
            const angle = body.angle;
            const center = new Vector2(body.position.x, body.position.y);
            const { x: sizeX, y: sizeY } = size;

            for (let x = 0; x < sizeX; x += BREAK_STEP) {
                for (let y = 0; y < sizeY; y += BREAK_STEP) {
                    const localPosition = new Vector2(x - sizeX / 2, y - sizeY / 2);

                    localPosition.__rotateAroundZ0(angle);

                    this._addBreakBlock(
                        center.x + localPosition.x,
                        center.y + localPosition.y,
                        velocity
                    )
                }
            }

            this._destructableBlocksCount--;

            if (this._destructableBlocksCount === 0) {
                _setTimeout(() => {
                    BUS.__post(__ON_SHOW_WIN_WINDOW, this._maxScore);
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

        this._maxScore += cost;

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

        const parent = this._level.__parent;
        const name = this._level.name;

        if (parent) {
            this._level.__removeFromParent();
        }

        if (parent && name && parent[name] === this._level) {
            delete parent[name];
        }

        if (isRestart) {
            this._blocks = [];
            this._destructableBlocksCount = 0;
            this._maxScore = 0;

            stopSound('main-theme');
        }
    }

    open() {
        this._level = scene.__addChildBox(this._levelName);

        new Slingshot(this._level);

        const cloudsParams = new Clouds(this._level).configuredParams;
        const topPanelParams = new TopPanel(this._levelName).configuredParams;

        this._level.__setAliasesData(Object.assign({}, cloudsParams, topPanelParams));

        this._level.update(1);
        this._level.__updateMatrixWorld(1);

        ph_Events.on(ph_Engine, 'collisionStart', this._collisionStartHandler);

        this._level.__traverse(node => {
            const body = node.__ph_body;

            if (body && !body.isStatic && node.__userData && !!node.__userData.isBreakable) {
                node.__needBreaks = 1;

                this._destructableBlocksCount++;
                this._initCollision(body, node, BIG_BLOCK_HP, BIG_BLOCK_SCORE_VALUE);
            }
        });

        playSound('main-theme', 1);

        BUS.__post(__ON_LEVEL_OPENED, this._destructableBlocksCount);
    }

    close() {
        this._reset();

        if (this._level.__destructed) {
            BUS.__post(__ON_LEVEL_CLOSED);
        }
    }

    restart() {
        this._reset(true);

        if (this._level.__destructed) {
            this.open();
        }
    }
}