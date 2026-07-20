/**
 * @typedef ShowWinData
 * @type {object}
 * @property {Level} level - an ID.
 * @property {string} name - your name.
 * @property {number} age - your age.
 */

/**
 *
 * @param {ShowWinData} data
 * @returns {void}
 */
function showWin() {
    playSound('win');

    // todo: посчитать очки игрока и выдать звезды
    showWindow(WIN_WINDOW, window => {
        window.__setAliasesData({

            againButton: {
                __onTap(){
                    gameState.openedLevel.restart();
                },
                __onTapHighlight: 1
            },
            nextButton: {
                __onTap(){
                    gameState.openedLevel.close();
                },
                __onTapHighlight: 1
            }

        })
    })

}

/**
 *
 * @returns {string}
 */
function getNextLevel() {
    const [prefix, levelNumber] = gameState.openedLevel.levelName.split(LEVEL_NAME_SEPARATOR);
    let nextLevel = Number(levelNumber) + 1;

    if (nextLevel > ALL_LEVELS.length) {
        nextLevel = 1;
    }

    return `${prefix}${LEVEL_NAME_SEPARATOR}${nextLevel}`
}

function openLevel(levelName) {
    const level = new Level(levelName);

    gameState.openedLevel = level;

    level.open();
}

// удаляет ссыолку на старый уровень при переходе из объекта scene
function removeLevelNode(node) {
    if (!node) {
        return;
    }

    const parent = node.__parent;
    const name = node.name;

    if (parent) {
        node.__removeFromParent();
    }

    // EEditor сам эту именованную ссылку не удаляет.
    if (
        parent &&
        name &&
        parent[name] === node
    ) {
        delete parent[name];
    }
}