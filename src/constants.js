const Enum = require('enum');

const DEFAULT_ANSWER = {
    text: 'Привет! Это Аниме-Алиса! Я подскажу тебе самое свежее аниме, либо порекомендую неумирающую классику! Просто скажи "Порекомендуй аниме" и тотчас получишь ответ'
};

const ANIME_LIST = require('../resources/anime-list');

const commands = new Enum([
    'ANIME_RECOMMENDATION',
    'DESCRIPTION',
    'LINK'
]);

const COMMANDS_INPUT = {
    'порекомендуй аниме': commands.ANIME_RECOMMENDATION,
    'подробнее':commands.DESCRIPTION,
    'открой': commands.LINK
};

module.exports = {
    DEFAULT_ANSWER,
    ANIME_LIST,
    commands,
    COMMANDS_INPUT
};
