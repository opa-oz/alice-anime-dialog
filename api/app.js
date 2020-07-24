import FuzzySearch from 'fuzzy-search';

const { DEFAULT_ANSWER, ANIME_LIST, GENRES_LIST, DEFAULT_ENDING, commands } = require('../src/constants');

const sessionStorage = {};

const pickRandomAnime = (array = ANIME_LIST) => {
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
];

const genreSearcher = new FuzzySearch(GENRES_LIST, [], { sort: true });
const commandsSearcher = new FuzzySearch(COMMANDS_LIST, ['text'], { sort: true });

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

            const [foundGenre] = genreSearcher.search(command);
            if (foundGenre) {
                const availableAnimeList = ANIME_LIST.filter((a) => a.genres.includes(foundGenre));
                const anime = pickRandomAnime(availableAnimeList);

                sessionStorage[session.session_id] = {
                    isGenreShown: true,
                    isAnimeShown: true,
                    genre: foundGenre,
                    anime: anime,
                    sessionStart: Date.now(),
                };

                return responseToUser(defaultRes, {
                    text: `Жанр "${foundGenre}" сейчас на пике популярности. Могу предложить посмотреть "${anime.name}". Рассказать подробнее? `
                }); // *жанр*
            }

            const [searchResult] = commandsSearcher.search(orig);
            console.log('🥔', commandsSearcher.search(orig), orig);
            let { command: callToAction } = searchResult || {};

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
                    if (userSession.isDesciptionShown) {
                        const { genre, anime } = userSession;

                        const availableAnimeList = ANIME_LIST
                            .filter((a) => a.genres.includes(genre))
                            .filter(({ index }) => index !== anime.index);
                        const nextAnime = pickRandomAnime(availableAnimeList);

                        userSession.isDesciptionShown = false;
                        userSession.anime = nextAnime;
                        userSession.sessionStart = Date.now();

                        return responseToUser(defaultRes, {
                            text: `Еще из жанра "${genre}" можно посмотреть "${nextAnime.name}". Рассказать подробнее? `
                        });
                    }
                }
            } else {
                // todo: я ничего не поняла
            }

        }

        return defaultAnswer(defaultRes);
    }

    return defaultAnswer(defaultRes);
};
