require('dotenv').config();
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const request = require('request-promise');

const ENDPOINT = 'https://dialogs.yandex.net/api/v1/';
const ANIME_LIST_OUTPUT_PATH = path.join(__dirname, '../resources/anime-list.json');

let animeList = require('../resources/anime-list.json');

const makeRequest = (options) => {
    return request(options);
}

async function proceed() {
    const { AUTH_TOKEN, ID } = process.env;

    const responses = [];
    console.log(`We have ${chalk.blue.bold(animeList.length)} images to do`);

    for (let i = 0; i < animeList.length; i++) {
        const { image } = animeList[i];
        console.log(`Working at ${chalk.bold(i)}...`);
        let response = await makeRequest({
            uri: `${ENDPOINT}/skills/${ID}/images`,
            headers: {
                Authorization: `OAuth ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ url: image }),
        });
        response = typeof response === 'string' ? JSON.parse(response) : response

        console.log(`${chalk.bold.green('Done')}. ${response && response.image && response.image.id ? chalk.bold('Fine') : chalk.bold.red('Error')}`);
        console.log({ response });

        responses.push(response);
    }

    const result = responses.map((r, key) => {
        const original = animeList[key];
        const { image = {} } = r || {};
        const { id } = image || {};
        if (!id) {
            console.log(r, original);
        }

        return {
            ...original,
            image_id: id,
        };
    });

    return fs.outputFile(ANIME_LIST_OUTPUT_PATH, JSON.stringify(result))
}

proceed()
    .then(() => console.log(chalk.blue('Succeed')))
    .catch((e) => console.error(chalk.red('Error:'), e));

