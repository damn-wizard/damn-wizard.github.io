// BUS events
const __ON_RESTART_LEVEL = '__ON_RESTART_LEVEL';
const __ON_CHANGE_LEVEL = '__ON_CHANGE_LEVEL';
const __ON_LEVEL_OPENED = '__ON_LEVEL_OPENED';
const __ON_LEVEL_CLOSED = '__ON_LEVEL_CLOSED';

const __ON_SHOOT = '__ON_SHOOT'
const __ON_ADD_SCORE = '__ON_ADD_SCORE';
const __ON_THROWS_COUNT_UPDATED = '__ON_THROWS_COUNT_UPDATED';
const __ON_SCORE_VALUE_UPDATED = '__ON_SCORE_VALUE_UPDATED';
const __ON_LANGUAGE_CHANGED = '__ON_LANGUAGE_CHANGED';
const __ON_SHOW_SETTINGS_WINDOW = '__ON_SHOW_SETTINGS_WINDOW';
const __ON_SHOW_WIN_WINDOW = '__ON_SHOW_WIN_WINDOW';

// Levels
const LEVEL_NAME_SEPARATOR = '_';
const LEVEL_1 = `level${LEVEL_NAME_SEPARATOR}1`;
const LEVEL_2 = `level${LEVEL_NAME_SEPARATOR}2`;
const LEVEL_3 = `level${LEVEL_NAME_SEPARATOR}3`;
const ALL_LEVELS = [LEVEL_1, LEVEL_2, LEVEL_3];

// Windows
const WIN_WINDOW = 'win';
const SETTINGS_WINDOW = 'settings';

// Config
const MAX_BULLET_VELOCITY = 75;
const MAX_SLINGSHOT_RUBBER_LENGTH = 50;
const CLOUDS_TIME = 60;
const REMOVE_BULLET_FROM_LEVEL_TIME = 2;
const BIG_BLOCK_HP = 100;
const BREAK_BLOCK_HP = 50;
const BIG_BLOCK_SCORE_VALUE = 50;
const BREAK_BLOCK_SCORE_MAP = new Map([
    ['break_1', 10],
    ['break_2', 10],
    ['break_3', 10],
    ['break_4', 10],
    ['break_5', 5],
    ['break_6', 0],
    ['break_7', 0],
    ['break_8', 0],
    ['break_9', 10],
]);
const BREAK_STEP = 50;
const RATING_FOR_TWO_STARS = 0.55;
const RATING_FOR_THREE_STARS = 0.85;
const SCORE_WEIGHT_RATING = 0.35;
const THROW_WEIGHT_RATING = 0.65;

// Local storage
const LS_SOUND_DISABLED_VALUE = 'sound';