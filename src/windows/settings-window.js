class SettingsWindow {
    constructor() {
        this._currentLang = getUserLanguage();

        const localIsSoundDisabled = LocalGetKey(LS_SOUND_DISABLED_VALUE, options.__soundDisabled)
        this._isSoundDisabled = options.__soundDisabled = localIsSoundDisabled === null ? options.__soundDisabled : Number(localIsSoundDisabled);

        this._soundOffButtonNode = null;
        this._soundOnButtonNode = null;
        this._ruLangButtonNode = null;
        this._enLangButtonNode = null;

        this._configuredParams = {
            closeButton: this._configureCloseButton.bind(this),
            soundOffButton: this._configureSoundOffButton.bind(this),
            soundOnButton: this._configureSoundOnButton.bind(this),
            ruLangButton: this._configureRuLangButton.bind(this),
            enLangButton: this._configureEnLangButton.bind(this),
        }
    }

    get configuredParams() {
        return this._configuredParams;
    }

    _configureCloseButton(node) {
        node.__onTapHighlight = 1;
        node.__onTap = () => {
            playSound('click');

            closeWindow(SETTINGS_WINDOW);
        }
    }

    _configureSoundOffButton(node) {
        node.__onTapHighlight = 1;
        node.__onTap = () => {
            if (this._isSoundDisabled) return;

            this._changeSoundDisabled(1);
        }

        this._soundOffButtonNode = node;
    }

    _configureSoundOnButton(node) {
        node.__onTapHighlight = 1;
        node.__onTap = () => {
            if (!this._isSoundDisabled) return;

            this._changeSoundDisabled(0);
        }

        this._soundOnButtonNode = node;
    }

    _changeSoundDisabled(isDisabled) {
        this._isSoundDisabled = options.__soundDisabled = isDisabled;
        this._setSoundActiveButton();
        LocalSetKey(LS_SOUND_DISABLED_VALUE, isDisabled);

        playSound('click');

        if (isDisabled) {
            stopSound('main-theme');
        } else {
            playSound('main-theme', 1);
        }
    }

    _configureRuLangButton(node) {
        node.__onTapHighlight = 1;
        node.__onTap = () => {
            if (this._currentLang === 'ru') return;

            this._tryToChangeLang('ru');
        }

        this._ruLangButtonNode = node;
    }

    _configureEnLangButton(node) {
        node.__onTapHighlight = 1;
        node.__onTap = () => {
            if (this._currentLang === 'en') return;

            this._tryToChangeLang('en');
        }

        this._enLangButtonNode = node;
    }

    _tryToChangeLang(newLang) {
        if (!__checkUserLanguage(newLang)) return;

        playSound('click');

        TASKS_RUN(
            [
                ['locale', newLang]
            ],
            () => {
                this._langChanged(newLang);
            }
        );
    }

    _langChanged(newLang) {
        setUserSavedLanguage(newLang);

        globalTextCache.forEach(function (text) {
            text.__needUpdate = 1;
        });

        this._currentLang = newLang;
        this._setLangActiveButton();

        BUS.__post(__ON_LANGUAGE_CHANGED);
    }

    _setSoundActiveButton() {
        this._soundOffButtonNode.__alpha = this._isSoundDisabled ? 1 : 0.5;
        this._soundOnButtonNode.__alpha = this._isSoundDisabled ? 0.5 : 1;
    }

    _setLangActiveButton() {
        this._ruLangButtonNode.__alpha = this._currentLang === 'ru' ? 1 : 0.5;
        this._enLangButtonNode.__alpha = this._currentLang === 'ru' ? 0.5 : 1;
    }

    _setActiveButtons() {
        this._setSoundActiveButton();
        this._setLangActiveButton();
    }
}