const Enum = require('enum');

const DEFAULT_ANSWER = {
    text: `
Я аниме-Алиса! Я помогаю выбирать аниме для просмотра.\n 
Назовите мне жанр, который Вы предпочитаете, и начнем.\n
Так же я разбираюсь в классике аниме, а иногда могу посоветовать свежие тайтлы.
`
};

const DEFAULT_ENDING = {
    text: 'Если смогу еще чем-то помочь - только позовите. Бип-бип-буп'
};
/**
 * @type {Array<Object>}
 */
const ANIME_LIST = require('../resources/anime-list');
const GENRES_LIST = require('../resources/genres');

const commands = new Enum([
    'AGREE',
    'DISAGREE',
    'MORE',
    'ANY_GENRE',
    'RANDOM',
]);

module.exports = {
    DEFAULT_ANSWER,
    DEFAULT_ENDING,
    ANIME_LIST,
    commands,
    GENRES_LIST,
};
