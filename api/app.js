const chalk = require('chalk');

const { DEFAULT_ANSWER, COMMANDS_INPUT, ANIME_LIST, commands } = require('../src/constants');

const pickRandomAnime = () => {
    return ANIME_LIST[Math.floor(Math.random() * ANIME_LIST.length)]
};


let kek = 0;

const responseToUser = ({ res, version, session }, response) => {
    res.end(JSON.stringify({
        version,
        session,
        response: {
            end_session: false,
            // ...(response || {}),
            text: kek++,
        },
    }));
};

const defaultAnswer = ({ res, version, session }) => {
    return responseToUser({ res, version, session }, DEFAULT_ANSWER)
};

module.exports = async (req, res) => {
    console.log(`I got my ${chalk.red.bold('dialog!')}`);

    console.log(JSON.stringify(req.body));
    const { request, session, version } = req.body || {};

    const defaultRes = { res, version, session };

    if (request) {
        if (request.original_utterance) {
            const orig = request.original_utterance;
            const command = COMMANDS_INPUT[orig];

            if (commands.ANIME_RECOMMENDATION.is(command)) {
                const anime = pickRandomAnime();

                return responseToUser(defaultRes, { text: anime.name });
            }
        }

        return defaultAnswer(defaultRes);
    }

    return defaultAnswer(defaultRes);
};
