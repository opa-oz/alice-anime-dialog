import Fuse from 'fuse.js';
import { v4 as uuidv4 } from 'uuid';

import { Commands, COMMANDS_LIST, LOG_TYPES, phrases, PING_COMMAND } from '../constants';
import { Anime, Params, Session, UserSession, Version, Request, Response, TTSPhrase } from "../types";

import sd from '../utils/short-description';
import pickRandomItem from '../utils/pick-random-item';
import pickRandomPhrase from '../utils/pick-random-phrase';
import buildButtons from '../utils/build-buttons';
import logger from "../utils/logger";
import { Express } from "express";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ANIME_LIST: Array<Anime> = require('../../resources/anime-list.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const GENRES_LIST: Array<string> = require('../../resources/genres.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ONGOINGS_LIST: Array<Anime> = require('../../resources/ongoing-list.json');

const sessionStorage: { [item: string]: UserSession } = {};

const responseToUser = ({ res, version, session, logId }: Params, response: Response, logless = false) => {
    if (!logless) {
        logger.info({
            type: LOG_TYPES.response,
            payload: response,
            customer_id: session && session.session_id,
            log_id: logId,
        });
    }

    res.end(JSON.stringify({
        version,
        session,
        response: {
            end_session: false,
            ...(response || {}),
            text: sd(response.text, 1024),
            tts: response.tts ? sd(response.tts, 1024) : undefined,
        },
    }));
};

const defaultAnswer = ({ res, version, session, logId }: Params) => {
    return responseToUser({ res, version, session, logId }, {
        text: pickRandomPhrase(phrases.DEFAULT) as string,
        buttons: buildButtons([
            'Что посмотреть?',
            pickRandomItem(GENRES_LIST),
            pickRandomItem(GENRES_LIST),
            'Любой жанр',
            pickRandomItem(['Топ "Гуру"', 'Топ Алисы']),
            'Что новенького?'
        ])
    })
};

const genreSearcher = new Fuse(GENRES_LIST, { shouldSort: true });
const commandsSearcher = new Fuse(COMMANDS_LIST, { keys: ['text'], shouldSort: true });

export default async (req: Express.Request, res: Express.Response): Promise<void> => {
    const { request, session, version }: { session: Session, version?: Version, request: Request } = req.body || {};

    setTimeout(() => {
        Object.keys(sessionStorage)
            .filter(key => Boolean(sessionStorage[key]))
            .forEach((key) => {
                if (Math.abs(sessionStorage[key].lastUpdateTime - Date.now()) >= 50000) {
                    delete sessionStorage[key];
                }
            });
    }, 10);

    const defaultRes = { res, version, session, logId: uuidv4() } as Params;
    const userSession = sessionStorage[session?.session_id];

    const endWithError = (orig?: string) => {
        delete sessionStorage[session.session_id];

        if (orig !== PING_COMMAND) {
            logger.info({
                customer_id: session && session.session_id,
                type: LOG_TYPES.error,
                orig,
                log_id: defaultRes.logId,
            });
        }

        return responseToUser(defaultRes, {
            text: pickRandomPhrase(phrases.ERROR) as string,
            buttons: buildButtons([
                'Что посмотреть?',
                pickRandomItem(GENRES_LIST),
                'Любой жанр',
                'Топ "Гуру"',
            ])
        }, orig === PING_COMMAND);
    }

    const endWithRandom = () => {
        let availableAnimeList = ANIME_LIST;
        if (userSession && userSession.anime) {
            availableAnimeList = availableAnimeList.filter(({ index }) => index !== userSession?.anime?.index);
        }

        const anime = pickRandomItem(availableAnimeList);
        sessionStorage[session.session_id] = {
            isAnimeShown: true,
            anime,
            lastUpdateTime: Date.now(),
        };

        return responseToUser(defaultRes, {
            ...(pickRandomPhrase(phrases.RANDOM, [anime]) as TTSPhrase),
            buttons: buildButtons([
                {
                    title: 'Открыть Шикимори',
                    url: anime.url,
                    hide: false,
                },
                'Расскажи больше',
                pickRandomItem(GENRES_LIST),
                'Что сейчас выходит?',
                'Порекомендуй следующее аниме'
            ])
        });
    }

    if (request) {
        if (request.original_utterance) {
            const orig = request.original_utterance;
            const command = request.command;

            const [searchResult] = commandsSearcher.search(orig);
            const { item } = searchResult || {};
            const { command: callToAction } = item || {};

            if (command === PING_COMMAND) {
                return endWithError(command);
            }

            logger.info({
                type: LOG_TYPES.request,
                orig,
                command,
                callToAction,
                customer_id: session && session.session_id,
                log_id: defaultRes.logId,
            });

            if (userSession?.readyToTopAlice && callToAction !== Commands.DISAGREE && callToAction !== Commands.HELP) {
                return responseToUser(defaultRes, {
                    text: pickRandomPhrase(phrases.LOCAL_TOP_ANSWER) as string,
                    end_session: true
                });
            }

            switch (callToAction) {
                case Commands.HELP: {
                    return responseToUser(defaultRes, {
                        text: pickRandomPhrase(phrases.HELP) as string,
                        buttons: buildButtons([
                            'Приключения',
                            'Случайное аниме',
                            pickRandomItem(GENRES_LIST),
                            'Любой жанр',
                            'Онгоинги'
                        ])
                    })
                }
                case Commands.AGREE: {
                    if (userSession && userSession.isAnimeShown) {
                        // so, description
                        userSession.isDescriptionShown = true;
                        userSession.lastUpdateTime = Date.now();
                        const { anime: userAnime } = userSession;

                        return responseToUser(defaultRes, {
                            text: userAnime?.description || '',
                            card: {
                                type: 'BigImage',
                                image_id: userAnime?.image_id || '',
                                title: userAnime?.name || '',
                                description: sd(userAnime?.description),
                                button: {
                                    url: userAnime?.url,
                                    text: 'Открыть на Шикимори',
                                    payload: {},
                                },
                            },
                            buttons: buildButtons([
                                'Покажи ещё',
                                'Любой жанр',
                                'Случайное аниме',
                                pickRandomItem(['Топ "Гуру"', 'Топ Алисы']),
                                'Хватит'
                            ])
                        });
                    }

                    break;
                }
                case Commands.LOCAL_TOP: {
                    sessionStorage[session?.session_id] = {
                        readyToTopAlice: true,
                        lastUpdateTime: Date.now(),
                    };

                    return responseToUser(defaultRes, {
                        text: pickRandomPhrase(phrases.LOCAL_TOP) as string,
                        buttons: buildButtons([
                            'Стоп',
                        ])
                    });
                }
                case Commands.DISAGREE: {
                    if (userSession) {
                        // so, end
                        delete sessionStorage[session.session_id];

                        return responseToUser(defaultRes, {
                            text: pickRandomPhrase(phrases.ENDING) as string,
                            end_session: true,
                            buttons: buildButtons([
                                'Любой жанр',
                                'Порекомендуй аниме',
                            ])
                        });
                    }
                    break;
                }
                case Commands.ONGOINGS: {
                    let availableAnimeList = ONGOINGS_LIST;
                    if (userSession && userSession.anime) {
                        availableAnimeList = availableAnimeList.filter(({ index }) => index !== userSession?.anime?.index);
                    }

                    const anime = pickRandomItem(availableAnimeList);
                    sessionStorage[session.session_id] = {
                        isAnimeShown: true,
                        askedForOngoing: true,
                        anime,
                        lastUpdateTime: Date.now(),
                    };

                    return responseToUser(defaultRes, {
                        ...(pickRandomPhrase(phrases.ONGOING, [anime]) as TTSPhrase),
                        buttons: buildButtons([
                            {
                                title: 'Открыть Шикимори',
                                url: anime.url,
                                hide: false,
                            },
                            'Расскажи больше',
                            'Ещё',
                            pickRandomItem(GENRES_LIST),
                            'Любой жанр',
                            pickRandomItem(['Топ "Гуру"', 'Топ Алисы']),
                        ])
                    });
                }
                case Commands.MORE: {
                    if (userSession) {
                        // so, another anime in the same genre
                        const { genre, anime, askedForOngoing } = userSession;

                        if (askedForOngoing) {
                            const availableAnimeList = ONGOINGS_LIST
                                .filter(({ index }) => index !== anime?.index);
                            const nextAnime = pickRandomItem(availableAnimeList);

                            userSession.isDescriptionShown = false;
                            userSession.anime = nextAnime;
                            userSession.lastUpdateTime = Date.now();

                            return responseToUser(defaultRes, {
                                ...(pickRandomPhrase(phrases.MORE, [genre, nextAnime]) as TTSPhrase),
                                buttons: buildButtons([
                                    {
                                        title: 'Открыть Шикимори',
                                        url: nextAnime.url,
                                        hide: false,
                                    },
                                    'Расскажи подробнее',
                                    'Нет',
                                    'Другой жанр',
                                    'Любой жанр',
                                    'Что ещё новенького??'
                                ])
                            });
                        }

                        if (!genre) {
                            return endWithRandom();
                        }

                        const availableAnimeList = ANIME_LIST
                            .filter((a) => !!a.genres.includes(genre as string))
                            .filter(({ index }) => index !== anime?.index);
                        const nextAnime = pickRandomItem(availableAnimeList);

                        if (!nextAnime) {
                            delete sessionStorage[session.session_id];
                            return responseToUser(defaultRes, {
                                text: pickRandomPhrase(phrases.NOT_FOUND, [genre]) as string,
                                end_session: true,
                            });
                        }

                        userSession.isDescriptionShown = false;
                        userSession.anime = nextAnime;
                        userSession.lastUpdateTime = Date.now();

                        return responseToUser(defaultRes, {
                            ...(pickRandomPhrase(phrases.MORE, [genre, nextAnime]) as TTSPhrase),
                            buttons: buildButtons([
                                {
                                    title: 'Открыть Шикимори',
                                    url: nextAnime.url,
                                    hide: false,
                                },
                                'Расскажи подробнее',
                                'Нет',
                                'Другой жанр',
                                'Любой жанр',
                                'Что посмотреть?'
                            ])
                        });
                    }
                    break;
                }
                case Commands.ANY_GENRE: {
                    // any genre you like
                    delete sessionStorage[session.session_id];
                    const genre = pickRandomItem(GENRES_LIST);
                    const availableAnimeList = ANIME_LIST
                        .filter((a) => !!a.genres.includes(genre));
                    const anime = pickRandomItem(availableAnimeList);

                    sessionStorage[session.session_id] = {
                        isGenreShown: true,
                        isAnimeShown: true,
                        genre,
                        anime,
                        lastUpdateTime: Date.now(),
                    };

                    return responseToUser(defaultRes, {
                        ...(pickRandomPhrase(phrases.ANY, [genre, anime]) as TTSPhrase),
                        buttons: buildButtons([
                            {
                                title: 'Открыть Шикимори',
                                url: anime.url,
                                hide: false,
                            },
                            'Расскажи больше',
                            pickRandomItem(GENRES_LIST),
                            'Другой жанр',
                            'Порекомендуй аниме'
                        ])
                    });
                }
                case Commands.RANDOM: {
                    // random anime
                    return endWithRandom();
                }
                case Commands.OPEN: {
                    if (userSession && userSession.anime) {
                        delete sessionStorage[session.session_id];

                        return responseToUser(defaultRes, {
                            text: pickRandomPhrase(phrases.OPEN) as string,
                            buttons: buildButtons([
                                'Что посмотреть?',
                                'Что нового в сезоне?',
                                'Любой жанр',
                                'Порекомендуй аниме',
                            ]),
                        });
                    }

                    return endWithError(orig);
                }
                default: {
                    break;
                }
            }

            const [foundResult] = genreSearcher.search(command);
            if (foundResult && foundResult.item) {
                const foundGenre = foundResult.item;
                const availableAnimeList = ANIME_LIST.filter((a) => !!a.genres.includes(foundGenre));
                const anime = pickRandomItem(availableAnimeList);

                sessionStorage[session.session_id] = {
                    isGenreShown: true,
                    isAnimeShown: true,
                    genre: foundGenre,
                    lastUpdateTime: Date.now(),
                    anime,
                };

                return responseToUser(defaultRes, {
                    ...(pickRandomPhrase(phrases.GENRE, [foundGenre, anime]) as TTSPhrase),
                    buttons: buildButtons([
                        {
                            title: 'Открыть Шикимори',
                            url: anime.url,
                            hide: false,
                        },
                        'Давай',
                        'Нет',
                        'Подробнее',
                        'Любой жанр',
                        'Случайное аниме'
                    ])
                });
            }

            return endWithError(orig);
        }

        return defaultAnswer(defaultRes);
    }

    return defaultAnswer(defaultRes);
};
