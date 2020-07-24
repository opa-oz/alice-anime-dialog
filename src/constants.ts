import { Response } from "./types";

export const DEFAULT_ANSWER: Response = {
    text: `
Я аниме-Алиса! Я помогаю выбирать аниме для просмотра.\n 
Назовите мне жанр, который Вы предпочитаете, и начнем.\n
Так же я разбираюсь в классике аниме, а иногда могу посоветовать свежие тайтлы.
`
};

export const DEFAULT_ENDING: Response = {
    text: 'Если смогу еще чем-то помочь - только позовите. Бип-бип-буп'
};

export enum Commands {
    AGREE,
    DISAGREE,
    MORE,
    ANY_GENRE,
    RANDOM
}

export const COMMANDS_LIST = [
    {
        text: 'да',
        command: Commands.AGREE
    },
    {
        text: 'ага',
        command: Commands.AGREE
    },
    {
        text: 'подробнее',
        command: Commands.AGREE
    },
    {
        text: 'конечно',
        command: Commands.AGREE
    },
    {
        text: 'давай',
        command: Commands.AGREE
    },
    {
        text: 'нет',
        command: Commands.DISAGREE
    },
    {
        text: 'ни',
        command: Commands.DISAGREE
    },
    {
        text: 'хватит',
        command: Commands.DISAGREE
    },
    {
        text: 'стоп',
        command: Commands.DISAGREE
    },
    {
        text: 'ещё',
        command: Commands.MORE,
    },
    {
        text: 'еще',
        command: Commands.MORE,
    },
    {
        text: 'больше',
        command: Commands.MORE,
    },
    {
        text: 'любой жанр',
        command: Commands.ANY_GENRE,
    },
    {
        text: 'в любом жанре',
        command: Commands.ANY_GENRE,
    },
    {
        text: 'на твой выбор',
        command: Commands.ANY_GENRE,
    },
    {
        text: 'другой жанр',
        command: Commands.ANY_GENRE,
    },
    {
        text: 'порекомендуй аниме',
        command: Commands.RANDOM
    },
    {
        text: 'случайное аниме',
        command: Commands.RANDOM
    },
    {
        text: 'что посмотреть',
        command: Commands.RANDOM
    },
    {
        text: 'аниме посмотреть',
        command: Commands.RANDOM
    },
];
