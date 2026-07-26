class TopPanel {
    constructor(levelName) {
        if (!levelName) {
            throw new Error('[TopPanel]: Название уровня не было передано');
        }

        this._levelNameText = levelName;

        this._levelName = null;
        this._levelScore = null;
        this._levelThrowsCount = null;

        this._currentScore = 0;
        this._currentThrows = 0;

        BUS.__addEventListener(__ON_LEVEL_OPENED, () => {
            this._init();

            return 1;
        });

        this._updateThrowsCountListener = {
            __on: (type, value) => {
                this._updateThrowsCount(value);
            }
        };
        this._updateScoreListener = {
            __on: (type, value) => {
                this._updateScore(value);
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

        BUS.__addEventListener(__ON_THROWS_COUNT_UPDATED, this._updateThrowsCountListener);
        BUS.__addEventListener(__ON_SCORE_VALUE_UPDATED, this._updateScoreListener);
        BUS.__addEventListener(__ON_LANGUAGE_CHANGED, this._languageChangedListener);
        BUS.__addEventListener([__ON_LEVEL_CLOSED, __ON_RESTART_LEVEL], this._destroyListenter);
    }

    get configuredParams() {
        return {
            levelName: (node) => {
                this._levelName = node;
            },
            levelScore: (node) => {
                this._levelScore = node;
            },
            levelThrowsCount: (node) => {
                this._levelThrowsCount = node;
            },
            settingsButton: (node) => {
                node.__onTapHighlight = 1;
                node.__onTap = () => {
                    BUS.__post(__ON_SHOW_SETTINGS_WINDOW);
                };
            },
        }
    }

    _setTextValues() {
        const [, levelNumber] = this._levelNameText.split(LEVEL_NAME_SEPARATOR);

        this._levelName.__text = TR('level', levelNumber);
        this._levelScore.__text = TR('score', this._currentScore);
        this._levelThrowsCount.__text = TR('throws', this._currentThrows);
    }

    _init() {
        consoleLog('[TopPanel]: inited');

        this._setTextValues();
    }

    _destroy() {
        consoleLog('[TopPanel]: destroyed');

        BUS.__removeEventListenerByType(__ON_RESTART_LEVEL, this._destroyListenter);
        BUS.__removeEventListenerByType(__ON_LEVEL_CLOSED, this._destroyListenter);
        BUS.__removeEventListenerByType(__ON_THROWS_COUNT_UPDATED, this._updateThrowsCountListener);
        BUS.__removeEventListenerByType(__ON_SCORE_VALUE_UPDATED, this._updateScoreListener);
        BUS.__removeEventListenerByType(__ON_LANGUAGE_CHANGED, this._languageChangedListener);
    }

    _updateThrowsCount(value) {
        this._currentThrows = value;
        this._levelThrowsCount.__text = TR('throws', this._currentThrows);
    }

    _updateScore(value) {
        this._currentScore = value;
        this._levelScore.__text = TR('score', this._currentScore);
    }
}