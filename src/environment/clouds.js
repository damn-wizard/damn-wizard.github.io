class Clouds {
    constructor(level) {
        if (!level) {
            throw new Error('[Clouds]: Не была передана текущая нода уровеня');
        }

        this._levelNode = level;
        this._cloudsNode = null;

        this._step = this._levelNode.__size.x;
        this._stepMultiplier = 2;

        this._currentFirstCloudNode = null;
        this._currentSecondCloudNode = null;
        this._finishedFirstCloudNode = null;
        this._finishedSecondCloudNode = null;

        this._interval = null;
        this._halfCloudsTime = Math.floor(CLOUDS_TIME / 2);

        this._configuredParams = {
            clouds: this._configureClouds.bind(this),
        };

        BUS.__addEventListener(__ON_LEVEL_OPENED, () => {
            this._init();

            return 1;
        });

        this._destroyListenter = {
            __on: () => {
                this._destroy()
            }
        };

        BUS.__addEventListener([__ON_LEVEL_CLOSED, __ON_RESTART_LEVEL], this._destroyListenter);
    }

    get configuredParams() {
        return this._configuredParams;
    }

    _configureClouds(node) {
        this._cloudsNode = node;
    }

    _animClouds() {
        const finishedX = this._step * this._stepMultiplier;

        this._cloudsNode.__anim(
            { __x: finishedX },
            CLOUDS_TIME,
            0,
            easeLinear
        );

        _setTimeout(() => {
            this._finishedFirstCloudNode = this._currentFirstCloudNode;
            this._currentFirstCloudNode = this._currentFirstCloudNode.__clone();
            this._currentFirstCloudNode.__x = -finishedX;
            this._cloudsNode.__addChildBox(this._currentFirstCloudNode).update();

            this._finishedSecondCloudNode = this._currentSecondCloudNode;
            this._currentSecondCloudNode = this._currentSecondCloudNode.__clone();
            this._currentSecondCloudNode.__x = -finishedX - this._step;
            this._cloudsNode.__addChildBox(this._currentSecondCloudNode).update();
        }, this._halfCloudsTime);
    }


    _init() {
        consoleLog('[Clouds]: inited');

        [this._currentFirstCloudNode, this._currentSecondCloudNode] = this._cloudsNode.__childs;

        this._animClouds();

        this._interval = _setInterval(() => {
            this._finishedFirstCloudNode.__removeFromParent();
            this._finishedSecondCloudNode.__removeFromParent();

            this._stepMultiplier += 2;

            this._animClouds();
        }, CLOUDS_TIME);
    }

    _destroy() {
        consoleLog('[Clouds]: destroyed');

        _clearInterval(this._interval);

        BUS.__removeEventListenerByType(__ON_LEVEL_CLOSED, this._destroyListenter);
        BUS.__removeEventListenerByType(__ON_RESTART_LEVEL, this._destroyListenter);
    }
}
