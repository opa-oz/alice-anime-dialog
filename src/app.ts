// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Fuse from 'fuse.js';

import { DEFAULT_ANSWER, DEFAULT_ENDING, Commands, COMMANDS_LIST } from './constants';
import { Anime, Params, Session, UserSession, Version, Request, Response } from "./types";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ANIME_LIST: Array<Anime> = require('../resources/anime-list.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const GENRES_LIST: Array<string> = require('../resources/genres.json');

const sessionStorage: { [item: string]: UserSession } = {};

function pickRandomItem<T>(array: Array<T>): T {
    return array[Math.floor(Math.random() * array.length)]
}

const responseToUser = ({ res, version, session }: Params, response: Response) => {
    res.end(JSON.stringify({
        version,
        session,
        response: {
            end_session: false,
            ...(response || {}),
        },
    }));
};

const defaultAnswer = ({ res, version, session }: Params) => {
    return responseToUser({ res, version, session }, DEFAULT_ANSWER)
};

const genreSearcher = new Fuse(GENRES_LIST, { shouldSort: true });
const commandsSearcher = new Fuse(COMMANDS_LIST, { keys: ['text'], shouldSort: true });

module.exports = async (req, res) => {
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

    const defaultRes = { res, version, session } as Params;
    const userSession = sessionStorage[session?.session_id];

    if (request) {
        if (request.original_utterance) {
            const orig = request.original_utterance;
            const command = request.command;

            let [foundGenre] = genreSearcher.search(command);
            if (foundGenre && foundGenre.item) {
                foundGenre = foundGenre.item;
                const availableAnimeList = ANIME_LIST.filter((a) => a.genres.includes(foundGenre));
                const anime = pickRandomItem(availableAnimeList);

                sessionStorage[session.session_id] = {
                    isGenreShown: true,
                    isAnimeShown: true,
                    genre: foundGenre,
                    lastUpdateTime: Date.now(),
                    anime,
                };

                return responseToUser(defaultRes, {
                    text: `Жанр "${foundGenre}" сейчас на пике популярности. Могу предложить посмотреть "${anime.name}".\nРассказать подробнее? `
                });
            }

            const [searchResult] = commandsSearcher.search(orig);
            const { item } = searchResult || {};
            const { command: callToAction } = item || {};

            switch (callToAction) {
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
                                image_id: '937455/b6d5e0827e05c96ce052',
                                title: userAnime?.name || '',
                                description: userAnime?.description.slice(0, 255),
                                button: {
                                    url: userAnime?.url,
                                    text: 'Открыть на MAL',
                                    payload: {},
                                },
                            },
                        });
                    }

                    break;
                }
                case Commands.DISAGREE: {
                    if (userSession) {
                        // so, end
                        delete sessionStorage[session.session_id];

                        return responseToUser(defaultRes, { ...DEFAULT_ENDING, end_session: true });
                    }
                    break;
                }
                case Commands.MORE: {
                    if (userSession) {
                        // so, another anime in the same genre
                        const { genre, anime } = userSession;

                        const availableAnimeList = ANIME_LIST
                            .filter((a) => a.genres.includes(genre as string))
                            .filter(({ index }) => index !== anime?.index);
                        const nextAnime = pickRandomItem(availableAnimeList);

                        if (!nextAnime) {
                            delete sessionStorage[session.session_id];
                            return responseToUser(defaultRes, {
                                text: `К сожалению, я не нашла у себя другого аниме в жанре "${genre}.\n Простите мою оплошность и давайте начнём с начала."`,
                                end_session: true,
                            });
                        }

                        userSession.isDescriptionShown = false;
                        userSession.anime = nextAnime;
                        userSession.lastUpdateTime = Date.now();

                        return responseToUser(defaultRes, {
                            text: `Еще из жанра "${genre}" можно посмотреть "${nextAnime.name}".\nРассказать подробнее? `
                        });
                    }
                    break;
                }
                case Commands.ANY_GENRE: {
                    // any genrer you like
                    delete sessionStorage[session.session_id];
                    const genre = pickRandomItem(GENRES_LIST);
                    const availableAnimeList = ANIME_LIST
                        .filter((a) => a.genres.includes(genre));
                    const anime = pickRandomItem(availableAnimeList);

                    sessionStorage[session.session_id] = {
                        isGenreShown: true,
                        isAnimeShown: true,
                        genre: genre,
                        anime: anime,
                        lastUpdateTime: Date.now(),
                    };

                    return responseToUser(defaultRes, {
                        text: `Многие предпочитают жанр "${genre}". Предлагаю Вам посмотреть "${anime.name}".\nРассказать подробнее?`
                    });
                }
                case Commands.RANDOM: {
                    // random anime
                    let availableAnimeList = ANIME_LIST;
                    if (userSession && userSession.anime) {
                        availableAnimeList = availableAnimeList.filter(({ index }) => index !== userSession?.anime?.index);
                    }

                    const anime = pickRandomItem(availableAnimeList);
                    sessionStorage[session.session_id] = {
                        isAnimeShown: true,
                        anime: anime,
                        lastUpdateTime: Date.now(),
                    };

                    return responseToUser(defaultRes, {
                        text: `Предлагаю Вам посмотреть "${anime.name}".\nРассказать о нём подробнее?`
                    });
                }
                default: {
                    // todo: я ничего не поняла
                    break;
                }
            }
        }

        return defaultAnswer(defaultRes);
    }

    return defaultAnswer(defaultRes);
};
