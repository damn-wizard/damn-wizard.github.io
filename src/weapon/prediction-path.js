class PredictionPath {
    constructor(level) {
        if (!level) {
            throw new Error('[PredictionPath]: Не была передана текущая нода уровеня');
        }

        this._level = level;

        this._predictionDots = [];
        this._lastDotIndex = PREDICTION_PATH_DOTS_COUNT - 1;
    }

    hide() {
        $each(this._predictionDots, dot => {
            if (dot && !dot.__destructed) {
                dot.__alpha = 0;
            }
        });
    }

    update(isLengthEnough, position, velocity) {
        if (!isLengthEnough) {
            this.hide();

            return;
        }

        let { x, y } = position;
        let { x: velocityX, y: velocityY } = velocity;

        $each(this._predictionDots, (dot, index) => {
            for (let step = 0; step < PREDICTION_PATH_STEPS_PER_DOT; step++) {
                velocityY += PREDICTION_PATH_GRAVITY_PER_STEP;

                x += velocityX;
                y += velocityY;
            }

            const alpha = index / this._lastDotIndex;

            dot.__x = x;
            dot.__y = y;
            dot.__alpha = lerp(PREDICTION_PATH_DOT_ALPHA_MAX, PREDICTION_PATH_DOT_ALPHA_MIN, alpha);
        });
    }

    create() {
        if (this._predictionDots.length) {
            return;
        }

        for (let i = 0; i < PREDICTION_PATH_DOTS_COUNT; i++) {
            const alpha = i / this._lastDotIndex;
            const size = lerp(PREDICTION_PATH_DOT_SIZE_MAX, PREDICTION_PATH_DOT_SIZE_MIN, alpha);

            const dot = this._level.__addChildBox({
                __img: 'circle1',
                __alpha: 0,
                __size: [size, size],
                __ofs: [0, 0, -14]
            });

            this._predictionDots.push(dot);
        }
    }
}