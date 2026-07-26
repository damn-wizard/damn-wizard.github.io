class WinWindow {
    constructor(score, throws, maxScore, destructableBlocksCount) {
        this._score = score;
        this._throws = throws;
        this._maxScore = maxScore;
        this._destructableBlocksCount = destructableBlocksCount;

        this._firstStar = null;
        this._secondStar = null;
        this._thirdStar = null;
    }

    get configuredParams() {
        return {
            againButton: (node) => {
                node.__onTapHighlight = 1;
                node.__onTap = () => {
                    playSound('click');

                    BUS.__post(__ON_RESTART_LEVEL);
                };
            },
            nextButton: (node) => {
                node.__onTapHighlight = 1;
                node.__onTap = () => {
                    playSound('click');

                    BUS.__post(__ON_CHANGE_LEVEL);
                };
            },
            levelScore: (node) => {
                node.__text = TR('score', this._score);
            },
            levelThrowsCount: (node) => {
                node.__text = TR('throws', this._throws);
            },
            firstStar: (node) => {
                node.____visible = 0;

                this._firstStar = node;
            },
            secondStar: (node) => {
                node.____visible = 0;

                this._secondStar = node;
            },
            thirdStar: (node) => {
                node.____visible = 0;

                this._thirdStar = node;
            },
        };
    }

    calculateStars() {
        const bigBlockScoreSummary = this._destructableBlocksCount * BIG_BLOCK_SCORE_VALUE;

        const scoreEffective = mmin(1, bigBlockScoreSummary / this._maxScore);
        const throwEffective = mmin(1, this._destructableBlocksCount / mmax(this._throws, 1));

        const levelRating = scoreEffective * SCORE_WEIGHT_RATING + throwEffective * THROW_WEIGHT_RATING;

        this._firstStar.__visible = 1;

        if (levelRating >= RATING_FOR_TWO_STARS) {
            this._secondStar.__visible = 1;
        }

        if (levelRating >= RATING_FOR_THREE_STARS) {
            this._thirdStar.__visible = 1;
        }
    }
}