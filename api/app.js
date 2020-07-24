import Fuse from 'fuse.js';

import { DEFAULT_ANSWER, ANIME_LIST, GENRES_LIST, DEFAULT_ENDING, commands } from '../src/constants';

const sessionStorage = {};

const pickRandomItem = (array = ANIME_LIST) => {
    return array[Math.floor(Math.random() * array.length)]
};

const responseToUser = ({ res, version, session }, response) => {
    res.end(JSON.stringify({
        version,
        session,
        response: {
            end_session: false,
            ...(response || {}),
        },
    }));
};

const defaultAnswer = ({ res, version, session }) => {
    return responseToUser({ res, version, session }, DEFAULT_ANSWER)
};

const COMMANDS_LIST = [
    {
        text: 'да',
        command: commands.AGREE
    },
    {
        text: 'ага',
        command: commands.AGREE
    },
    {
        text: 'подробнее',
        command: commands.AGREE
    },
    {
        text: 'конечно',
        command: commands.AGREE
    },
    {
        text: 'давай',
        command: commands.AGREE
    },
    {
        text: 'нет',
        command: commands.DISAGREE
    },
    {
        text: 'ни',
        command: commands.DISAGREE
    },
    {
        text: 'хватит',
        command: commands.DISAGREE
    },
    {
        text: 'стоп',
        command: commands.DISAGREE
    },
    {
        text: 'ещё',
        command: commands.MORE,
    },
    {
        text: 'еще',
        command: commands.MORE,
    },
    {
        text: 'больше',
        command: commands.MORE,
    },
    {
        text: 'любой жанр',
        command: commands.ANY_GENRE,
    },
    {
        text: 'в любом жанре',
        command: commands.ANY_GENRE,
    },
    {
        text: 'на твой выбор',
        command: commands.ANY_GENRE,
    },
    {
        text: 'другой жанр',
        command: commands.ANY_GENRE,
    },
    {
        text: 'порекомендуй аниме',
        command: commands.RANDOM
    },
    {
        text: 'случайное аниме',
        command: commands.RANDOM
    },
    {
        text: 'что посмотреть',
        command: commands.RANDOM
    },
    {
        text: 'аниме посмотреть',
        command: commands.RANDOM
    },
];

const genreSearcher = new Fuse(GENRES_LIST, { shouldSort: true });
const commandsSearcher = new Fuse(COMMANDS_LIST, { keys: ['text'], shouldSort: true });

module.exports = async (req, res) => {
    const { request, session, version } = req.body || {};

    setTimeout(() => {
        Object.keys(sessionStorage)
            .filter(key => Boolean(sessionStorage[key]))
            .forEach((key) => {
                if (Math.abs(sessionStorage[key].startTime - Date.now()) >= 50000) {
                    delete sessionStorage[key];
                }
            });
    }, 10);

    const defaultRes = { res, version, session };
    const userSession = sessionStorage[session.session_id];

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
                    anime: anime,
                    sessionStart: Date.now(),
                };

                return responseToUser(defaultRes, {
                    text: `Жанр "${foundGenre}" сейчас на пике популярности. Могу предложить посмотреть "${anime.name}".\nРассказать подробнее? `
                }); // *жанр*
            }

            const [searchResult] = commandsSearcher.search(orig);
            console.log('❄️', commandsSearcher.search(orig), orig);
            let { item } = searchResult || {};
            const { command: callToAction } = item || {};

            if (callToAction) {
                if (callToAction.is(commands.AGREE) && userSession) {
                    if (userSession.isAnimeShown) {
                        // so, description
                        userSession.isDesciptionShown = true;
                        userSession.sessionStart = Date.now();

                        return responseToUser(defaultRes, {
                            text: userSession.anime.description,
                            card: {
                                type: 'BigImage',
                                image_id: '937455/b6d5e0827e05c96ce052',
                                title: userSession.anime.name,
                                description: userSession.anime.description.slice(0, 255),
                                button: {
                                    url: userSession.anime.url,
                                    text: 'Открыть на MAL',
                                    payload: {},
                                },
                            },
                        });
                    }
                }

                if (callToAction.is(commands.DISAGREE) && userSession) {
                    sessionStorage[session.session_id] = undefined;

                    return responseToUser(defaultRes, { ...DEFAULT_ENDING, end_session: true });
                }

                if (callToAction.is(commands.MORE) && userSession) {
                    const { genre, anime } = userSession;

                    const availableAnimeList = ANIME_LIST
                        .filter((a) => a.genres.includes(genre))
                        .filter(({ index }) => index !== anime.index);
                    const nextAnime = pickRandomItem(availableAnimeList);

                    if (!nextAnime) {
                        sessionStorage[session.session_id] = undefined;
                        return responseToUser(defaultRes, {
                            text: `К сожалению, я не нашла у себя другого аниме в жанре "${genre}.\n Простите мою оплошность и давайте начнём с начала."`,
                            end_session: true,
                        });
                    }

                    userSession.isDesciptionShown = false;
                    userSession.anime = nextAnime;
                    userSession.sessionStart = Date.now();

                    return responseToUser(defaultRes, {
                        text: `Еще из жанра "${genre}" можно посмотреть "${nextAnime.name}".\nРассказать подробнее? `
                    });
                }

                if (callToAction.is(commands.ANY_GENRE)) {
                    sessionStorage[session.session_id] = undefined;
                    const genre = pickRandomItem(GENRES_LIST);
                    const availableAnimeList = ANIME_LIST
                        .filter((a) => a.genres.includes(genre));
                    const anime = pickRandomItem(availableAnimeList);

                    sessionStorage[session.session_id] = {
                        isGenreShown: true,
                        isAnimeShown: true,
                        genre: genre,
                        anime: anime,
                        sessionStart: Date.now(),
                    };

                    return responseToUser(defaultRes, {
                        text: `Многие предпочитают жанр "${genre}". Предлагаю Вам посмотреть "${anime.name}".\nРассказать подробнее?`
                    });
                }

                if (callToAction.is(command.RANDOM)) {
                    let availableAnimeList = ANIME_LIST;
                    if (userSession && userSession.anime) {
                        availableAnimeList.filter(({ index }) => index !== userSession.anime.index);
                    }

                    const anime = pickRandomItem(availableAnimeList);
                    sessionStorage[session.session_id] = {
                        isAnimeShown: true,
                        anime: anime,
                        sessionStart: Date.now(),
                    };

                    return responseToUser(defaultRes, {
                        text: `Предлагаю Вам посмотреть "${anime.name}".\nРассказать о нём подробнее?`
                    });
                }
            } else {
                // todo: я ничего не поняла
            }

        }

        return defaultAnswer(defaultRes);
    }

    return defaultAnswer(defaultRes);
};
