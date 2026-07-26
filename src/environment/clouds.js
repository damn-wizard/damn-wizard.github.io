class Clouds {
    constructor(level) {
        if (!level) {
            throw new Error('[Clouds]: Не была передана текущая нода уровеня');
        }

        this._level = level;
        this._clouds = null;

        this._step = this._level.__size.x;
        this._stepMultiplier = 2;

        this._currentFirstCloud = null;
        this._currentSecondCloud = null;
        this._finishedFirstCloud = null;
        this._finishedSecondCloud = null;

        this._interval = null;
        this._halfCloudsTime = Math.floor(CLOUDS_TIME / 2);

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
        return {
            clouds: (node) => {
                this._clouds = node;
            }
        };
    }

    _animClouds() {
        const finishedX = this._step * this._stepMultiplier;

        this._clouds.__anim(
            {__x: finishedX},
            CLOUDS_TIME,
            0,
            easeLinear
        );

        _setTimeout(() => {
            this._finishedFirstCloud = this._currentFirstCloud;
            this._currentFirstCloud = this._currentFirstCloud.__clone();
            this._currentFirstCloud.__x = -finishedX;
            this._clouds.__addChildBox(this._currentFirstCloud).update();

            this._finishedSecondCloud = this._currentSecondCloud;
            this._currentSecondCloud = this._currentSecondCloud.__clone();
            this._currentSecondCloud.__x = -finishedX - this._step;
            this._clouds.__addChildBox(this._currentSecondCloud).update();
        }, this._halfCloudsTime);
    }


    _init() {
        consoleLog('[Clouds]: inited');

        [this._currentFirstCloud, this._currentSecondCloud] = this._clouds.__childs;

        this._animClouds();

        this._interval = _setInterval(() => {
            this._finishedFirstCloud.__removeFromParent();
            this._finishedSecondCloud.__removeFromParent();

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
