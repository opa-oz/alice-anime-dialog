// @ts-ignore
import Fuse from 'fuse.js';
import { NowRequest, NowResponse } from '@vercel/node';

import { Commands, COMMANDS_LIST, phrases } from '../src/constants';
import { Anime, Params, Session, UserSession, Version, Request, Response } from "../src/types";

import sd from '../src/utils/short-description';
import pickRandomItem from '../src/utils/pick-random-item';
import pickRandomPhrase from '../src/utils/pick-random-phrase';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ANIME_LIST: Array<Anime> = require('../resources/anime-list.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const GENRES_LIST: Array<string> = require('../resources/genres.json');

const sessionStorage: { [item: string]: UserSession } = {};

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
    return responseToUser({ res, version, session }, { text: pickRandomPhrase(phrases.DEFAULT) })
};

const genreSearcher = new Fuse(GENRES_LIST, { shouldSort: true });
const commandsSearcher = new Fuse(COMMANDS_LIST, { keys: ['text'], shouldSort: true });

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
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
                    text: pickRandomPhrase(phrases.GENRE, [foundGenre, anime])
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
                                description: sd(userAnime?.description),
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

                        return responseToUser(defaultRes, {
                            text: pickRandomPhrase(phrases.ENDING),
                            end_session: true
                        });
                    }
                    break;
                }
                case Commands.MORE: {
                    if (userSession) {
                        // so, another anime in the same genre
                        const { genre, anime } = userSession;

                        const availableAnimeList = ANIME_LIST
                            .filter((a) => !!a.genres.includes(genre as string))
                            .filter(({ index }) => index !== anime?.index);
                        const nextAnime = pickRandomItem(availableAnimeList);

                        if (!nextAnime) {
                            delete sessionStorage[session.session_id];
                            return responseToUser(defaultRes, {
                                text: pickRandomPhrase(phrases.NOT_FOUND, [genre]),
                                end_session: true,
                            });
                        }

                        userSession.isDescriptionShown = false;
                        userSession.anime = nextAnime;
                        userSession.lastUpdateTime = Date.now();

                        return responseToUser(defaultRes, {
                            text: pickRandomPhrase(phrases.MORE, [genre, nextAnime]),
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
                        text: pickRandomPhrase(phrases.ANY, [genre, anime]),
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
                        anime,
                        lastUpdateTime: Date.now(),
                    };

                    return responseToUser(defaultRes, {
                        text: pickRandomPhrase(phrases.RANDOM, [anime])
                    });
                }
                default: {
                    return responseToUser(defaultRes, {
                        text: pickRandomPhrase(phrases.ERROR)
                    });
                }
            }
        }

        return defaultAnswer(defaultRes);
    }

    return defaultAnswer(defaultRes);
};
