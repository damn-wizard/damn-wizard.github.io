class SettingsWindow {
    constructor() {
        this._currentLang = getUserLanguage();

        const localIsSoundDisabled = LocalGetKey(LS_SOUND_DISABLED_VALUE, options.__soundDisabled);
        this._isSoundDisabled = options.__soundDisabled = localIsSoundDisabled === null
            ? options.__soundDisabled
            : Number(localIsSoundDisabled);

        this._isMainMenu = false;

        this._soundOffButton = null;
        this._soundOnButton = null;
        this._ruLangButton = null;
        this._enLangButton = null;
    }

    set isMainMenu(value) {
        this._isMainMenu = value;
    }

    get configuredParams() {
        return {
            closeButton: (node) => {
                node.__onTapHighlight = 1;
                node.__onTap = () => {
                    playSound('click');

                    closeWindow(SETTINGS_WINDOW);
                };
            },
            soundOffButton: (node) => {
                node.__onTapHighlight = 1;
                node.__onTap = () => {
                    if (this._isSoundDisabled) {
                        return;
                    }

                    this._changeSoundDisabled(1);
                };

                this._soundOffButton = node;
            },
            soundOnButton: (node) => {
                node.__onTapHighlight = 1;
                node.__onTap = () => {
                    if (!this._isSoundDisabled) {
                        return;
                    }

                    this._changeSoundDisabled(0);
                };

                this._soundOnButton = node;
            },
            ruLangButton: (node) => {
                node.__onTapHighlight = 1;
                node.__onTap = () => {
                    if (this._currentLang === 'ru') {
                        return;
                    }

                    this._tryToChangeLang('ru');
                };

                this._ruLangButton = node;
            },
            enLangButton: (node) => {
                node.__onTapHighlight = 1;
                node.__onTap = () => {
                    if (this._currentLang === 'en') {
                        return;
                    }

                    this._tryToChangeLang('en');
                };

                this._enLangButton = node;
            },
        };
    }

    _changeSoundDisabled(isDisabled) {
        this._isSoundDisabled = options.__soundDisabled = isDisabled;
        this._setSoundActiveButton();
        LocalSetKey(LS_SOUND_DISABLED_VALUE, isDisabled);

        playSound('click');

        const sound = this._isMainMenu
            ? 'main-menu-theme'
            : 'main-theme';

        console.log(sound)

        if (isDisabled) {
            stopSound(sound);
        } else {
            playSound(sound, 1);
        }
    }

    _tryToChangeLang(newLang) {
        if (!__checkUserLanguage(newLang)) {
            return;
        }

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
        this._soundOffButton.__alpha = this._isSoundDisabled
            ? ACTIVE_BUTTON_OPACITY
            : NOT_ACTIVE_BUTTON_OPACITY;
        this._soundOnButton.__alpha = this._isSoundDisabled
            ? NOT_ACTIVE_BUTTON_OPACITY
            : ACTIVE_BUTTON_OPACITY;
    }

    _setLangActiveButton() {
        this._ruLangButton.__alpha = this._currentLang === 'ru'
            ? ACTIVE_BUTTON_OPACITY
            : NOT_ACTIVE_BUTTON_OPACITY;
        this._enLangButton.__alpha = this._currentLang === 'ru'
            ? NOT_ACTIVE_BUTTON_OPACITY
            : ACTIVE_BUTTON_OPACITY;
    }

    _setActiveButtons() {
        this._setSoundActiveButton();
        this._setLangActiveButton();
    }
}