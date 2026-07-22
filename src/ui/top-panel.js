class TopPanel {
    constructor(levelName) {
        if (!levelName) {
            throw new Error('[TopPanel]: Название уровня не было передано');
        }

        this._levelName = levelName;

        this._levelNameNode = null;
        this._levelScoreNode = null;
        this._levelThrowsCountNode = null;

        this._currentScore = 0;
        this._currentThrows = 0;

        this._configuredParams = {
            levelName: this._configureLevelName.bind(this),
            levelScore: this._configureLevelScore.bind(this),
            levelThrowsCount: this._configureLevelThrowsCount.bind(this),
            settingsButton: this._configureSettingsButton.bind(this),
        }

        BUS.__addEventListener(__ON_LEVEL_OPENED, () => {
            this._init();

            return 1;
        });

        this._updateThrowsCountNodeListener = {
            __on: (type, value) => {
                this._updateThrowsCountNode(value);
            }
        };
        this._updateScoreNodeListener = {
            __on: (type, value) => {
                this._updateScoreNode(value);
            }
        };
        this._languageChangedListener = {
            __on: () => {
                this._setTextValues();
            }
        }
        this._destroyListenter = {
            __on: () => {
                this._destroy();
            }
        }

        BUS.__addEventListener(__ON_THROWS_COUNT_UPDATED, this._updateThrowsCountNodeListener);
        BUS.__addEventListener(__ON_SCORE_VALUE_UPDATED, this._updateScoreNodeListener);
        BUS.__addEventListener(__ON_LANGUAGE_CHANGED, this._languageChangedListener);
        BUS.__addEventListener([__ON_LEVEL_CLOSED, __ON_RESTART_LEVEL], this._destroyListenter);
    }

    get configuredParams() {
        return this._configuredParams;
    }

    _configureLevelName(node) {
        this._levelNameNode = node;
    }

    _configureLevelScore(node) {
        this._levelScoreNode = node;
    }

    _configureLevelThrowsCount(node) {
        this._levelThrowsCountNode = node;
    }

    _configureSettingsButton(node) {
        node.__onTapHighlight = 1;
        node.__onTap = () => {
            BUS.__post(__ON_SHOW_SETTINGS_WINDOW);
        };
    }

    _setTextValues() {
        const [, levelNumber] = this._levelName.split(LEVEL_NAME_SEPARATOR);

        this._levelNameNode.__text = TR('level', levelNumber);
        this._levelScoreNode.__text = TR('score', this._currentScore);
        this._levelThrowsCountNode.__text = TR('throws', this._currentThrows);
    }

    _init() {
        consoleLog('[TopPanel]: inited');

        this._setTextValues();
    }

    _destroy() {
        consoleLog('[TopPanel]: destroyed');

        BUS.__removeEventListenerByType(__ON_RESTART_LEVEL, this._destroyListenter);
        BUS.__removeEventListenerByType(__ON_LEVEL_CLOSED, this._destroyListenter);
        BUS.__removeEventListenerByType(__ON_THROWS_COUNT_UPDATED, this._updateThrowsCountNodeListener);
        BUS.__removeEventListenerByType(__ON_SCORE_VALUE_UPDATED, this._updateScoreNodeListener);
        BUS.__removeEventListenerByType(__ON_LANGUAGE_CHANGED, this._languageChangedListener);
    }

    _updateThrowsCountNode(value) {
        this._currentThrows = value;
        this._levelThrowsCountNode.__text = TR('throws', this._currentThrows);
    }

    _updateScoreNode(value) {
        this._currentScore = value;
        this._levelScoreNode.__text = TR('score', this._currentScore);
    }
}