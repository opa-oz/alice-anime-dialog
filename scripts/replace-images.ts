import dotenv from 'dotenv';

dotenv.config();
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import request from 'request-promise';
import { Anime } from "../src/types";

const ENDPOINT = 'https://dialogs.yandex.net/api/v1/';
const ANIME_LIST_OUTPUT_PATH = path.join(__dirname, '../resources/anime-list.json');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const animeList: Array<Anime> = require('../resources/anime-list.json');

type ImageResponse = {
    image?: {
        id?: string
    }
};

const makeRequest = (options) => {
    return request(options);
}

async function proceed() {
    const { AUTH_TOKEN, ID } = process.env;

    const responses: Array<ImageResponse> = [];
    console.log(`We have ${chalk.blue.bold(animeList.length)} images to do`);

    for (let i = 0; i < animeList.length; i++) {
        const { image } = animeList[i];
        console.log(`Working at ${chalk.bold(i)}...`);
        let response: ImageResponse = await makeRequest({
            uri: `${ENDPOINT}/skills/${ID}/images`,
            headers: {
                Authorization: `OAuth ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ url: image }),
        });
        response = typeof response === 'string' ? JSON.parse(response) : response;

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

