class WinWindow {
    constructor(score, throws, maxScore, destructableBlocksCount) {
        this._score = score;
        this._throws = throws;
        this._maxScore = maxScore;
        this._destructableBlocksCount = destructableBlocksCount;

        this._firstStarNode = null;
        this._secondStarNode = null;
        this._thirdStarNode = null;

        this._configuredParams = {
            againButton: this._configureAgainButton.bind(this),
            nextButton: this._configureNextButton.bind(this),
            levelScore: this._configureLevelScore.bind(this),
            levelThrowsCount: this._configureLevelThrowsCount.bind(this),
            firstStar: this._configureFirstStar.bind(this),
            secondStar: this._configureSecondStar.bind(this),
            thirdStar: this._configureThirdStar.bind(this),
        }
    }

    get configuredParams() {
        return this._configuredParams;
    }

    _configureAgainButton(node) {
        node.__onTapHighlight = 1;
        node.__onTap = () => {
            playSound('click');

            BUS.__post(__ON_RESTART_LEVEL);
        }
    }

    _configureNextButton(node) {
        node.__onTapHighlight = 1;
        node.__onTap = () => {
            playSound('click');

            BUS.__post(__ON_CHANGE_LEVEL);
        }
    }

    _configureLevelScore(node) {
        node.__text = TR('score', this._score);
    }

    _configureLevelThrowsCount(node) {
        node.__text = TR('throws', this._throws);
    }

    _configureFirstStar(node) {
        node.____visible = 0;
        this._firstStarNode = node;
    }

    _configureSecondStar(node) {
        node.____visible = 0;
        this._secondStarNode = node;
    }

    _configureThirdStar(node) {
        node.____visible = 0;
        this._thirdStarNode = node;
    }

    calculateStars() {
        const bigBlockScoreSummary = this._destructableBlocksCount * BIG_BLOCK_SCORE_VALUE;

        const scoreEffective = mmin(1, bigBlockScoreSummary / this._maxScore);
        const throwEffective = mmin(1, this._destructableBlocksCount / mmax(this._throws, 1));

        const levelRating = scoreEffective * SCORE_WEIGHT_RATING + throwEffective * THROW_WEIGHT_RATING;

        this._firstStarNode.__visible = 1;

        if (levelRating >= RATING_FOR_TWO_STARS) {
            this._secondStarNode.__visible = 1;
        }

        if (levelRating >= RATING_FOR_THREE_STARS) {
            this._thirdStarNode.__visible = 1;
        }
    }
}