class WinWindow {
    constructor(score, throws) {
        this._score = score;
        this._throws = throws;

        this._configuredParams = {
            againButton: this._configureAgainButton.bind(this),
            nextButton: this._configureNextButton.bind(this),
            levelScore: this._configureLevelScore.bind(this),
            levelThrowsCount: this._configureLevelThrowsCount.bind(this),
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
}