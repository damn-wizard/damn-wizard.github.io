class Game {
    constructor() {
        this._openedLevel = null;
        this._settingsWindow = new SettingsWindow();

        this._score = 0;
        this._throws = 0;

        // level traveling
        BUS.__addEventListener(__ON_CHANGE_LEVEL, () => {
            this._goToNextLevel();
        });
        BUS.__addEventListener(__ON_RESTART_LEVEL, () => {
            this._restartLevel();
        });
        // windows
        BUS.__addEventListener(__ON_SHOW_SETTINGS_WINDOW, () => {
            this._showSettingsWindow();
        });
        BUS.__addEventListener(__ON_SHOW_WIN_WINDOW, () => {
            this._showWinWindow();
        });
        // player data
        BUS.__addEventListener(__ON_SHOOT, () => {
            this._throws++;

            BUS.__post(__ON_THROWS_COUNT_UPDATED, this._throws);
        });
        BUS.__addEventListener(__ON_ADD_SCORE, (type, value) => {
            this._score += value;

            BUS.__post(__ON_SCORE_VALUE_UPDATED, this._score);
        });
    }

    _resetLevelState() {
        this._score = 0;
        this._throws = 0;
    }

    _getNextLevelName() {
        const [prefix, levelNumber] = this._openedLevel.levelName.split(LEVEL_NAME_SEPARATOR);

        let nextLevel = Number(levelNumber) + 1;

        if (nextLevel > ALL_LEVELS.length) {
            nextLevel = 1;
        }

        return `${prefix}${LEVEL_NAME_SEPARATOR}${nextLevel}`
    }

    _openLevel(levelName) {
        this._openedLevel = new Level(levelName);

        this._openedLevel.open();
    }

    _goToNextLevel() {
        const nextLevelName = this._getNextLevelName();

        this._resetLevelState();
        this._openedLevel.close();

        this._openLevel(nextLevelName);
    }

    _restartLevel() {
        this._resetLevelState();
        this._openedLevel.restart();
    }

    _showSettingsWindow() {
        playSound('settings');

        showWindow(SETTINGS_WINDOW, window => {
            window.__setAliasesData(this._settingsWindow.configuredParams);

            this._settingsWindow._setActiveButtons();
        })
    }

    _showWinWindow() {
        stopSound('main-theme');

        playSound('win');

        const winWindow = new WinWindow(this._score, this._throws);

        showWindow(WIN_WINDOW, window => {
            window.__setAliasesData(winWindow.configuredParams);
        })

    }

    start() {
        this._openLevel(LEVEL_1);
    }
}