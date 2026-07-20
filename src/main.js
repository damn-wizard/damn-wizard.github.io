/**
 * @typedef GameState
 * @type {object}
 * @property {?Level} openedLevel
 * @property {?string} lang
 * @property {bool} isDisabledSound
 */

/** @type {GameState} */
const gameState = {
    openedLevel: null,
    lang: null,
    isDisabledSound: false,
}

/**
 * @typedef LevelState
 * @type {object}
 * @property {number} score
 * @property {number} numberOfAttempts
 */

/** @type {LevelState} */
const levelState = {
    score: 0,
    numberOfAttempts: 0,
}

BUS.__addEventListener(
    __ON_GAME_LOADED, () => {
        options.__soundDisabled = gameState.isDisabledSound;

        BUS.__post(__ON_OPEN_LEVEL, LEVEL_1);

        return 1;
    }
);

BUS.__addEventListener(__ON_OPEN_LEVEL, (_type, levelName) => {
        if (!levelName) {
            throw new Error('Не указано название уровня')
        }

        openLevel(levelName)
    }
);

BUS.__addEventListener(__ON_LEVEL_CLOSED, () => {
    const nextLevel = getNextLevel();

    BUS.__post(__ON_OPEN_LEVEL, nextLevel);
})

BUS.__addEventListener(__ON_SHOOT, () => {
    levelState.numberOfAttempts++;

    gameState.openedLevel.updateNumberOfAttempts();
})
