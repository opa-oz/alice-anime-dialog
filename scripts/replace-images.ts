import dotenv from 'dotenv';

dotenv.config();
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import fetch from 'node-fetch';
import { Anime } from "../src/types";
import { readMeta } from "./utils/meta";
import wait from "./utils/wait";
import formatResponse from "./utils/format-response";

const ENDPOINT = 'https://dialogs.yandex.net/api/v1/';
const ANIME_LIST_OUTPUT_PATH = path.join(__dirname, '../resources/anime-list-new.json');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const animeList: Array<Anime> = require('../resources/anime-list.json');


type ImageResponse = {
    image?: {
        id?: string;
    };
    index: number;
};

async function readNewSet(today: number): Promise<Array<Anime>> {
    const p = path.join(__dirname, `../resources/collected_${today}.json`);
    const exists = await fs.pathExists(p);

    if (!exists) {
        throw new Error('There is no fresh data');
    }

    return await fs.readJson(p);
}

function mergeArrays(oldSet: Array<Anime>, newSet: Array<Anime>): Array<Anime> {
    const result: Array<Anime> = [...oldSet];
    const oldNames = oldSet.map(v => v.name);
    const indices = oldSet.map(v => v.index);
    const lastIndex = Math.max(...indices);

    const uniqueNewSet = newSet.filter((v) => !oldNames.includes(v.name))
    uniqueNewSet.forEach((v, k) => {
        v.index = lastIndex + 1 + k;
        result.push(v);
    });

    return result;
}

async function proceed() {
    const meta = await readMeta(Date.now());

    if (!meta) {
        throw new Error('There is no meta');
    }

    const newSet = await readNewSet(meta.lastParserRun);
    const fullList = mergeArrays(animeList, newSet);
    const amount = fullList.reduce((acc, v) => {
        if (v.image_id) {
            return acc;
        }

        return acc + 1;
    }, 0)

    const { AUTH_TOKEN, ID } = process.env;

    const responses: Array<ImageResponse> = [];
    console.log(`We have ${chalk.blue.bold(amount)} images to do`);

    for (let i = 0; i < fullList.length; i++) {
        const { image, image_id, index } = fullList[i];
        if (image_id) {
            continue;
        }
        await wait(500);
        console.log(`Working at ${chalk.bold(i)}...`);
        let response: ImageResponse = await fetch(`${ENDPOINT}/skills/${ID}/images`, {
            headers: {
                Authorization: `OAuth ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ url: image }),
        }).then(formatResponse);

        response = typeof response === 'string' ? JSON.parse(response) : response;

        console.log(`${chalk.bold.green('Done')}. ${response && response.image && response.image.id ? chalk.bold('Fine') : chalk.bold.red('Error')}`);

        response.index = index
        responses.push(response);
    }

    responses.forEach((r) => {
        const { image = {}, index } = r || {};
        const { id } = image || {};
        const original = fullList.find(v => v.index === index);
        if (!id || !original) {
            console.log(r, original);
            return;
        }

        original.image_id = id;
    });

    fs.removeSync(path.join(__dirname, `../resources/collected_${meta.lastParsedPage}.json`));
    return fs.outputFile(ANIME_LIST_OUTPUT_PATH, JSON.stringify(fullList))
}

proceed()
    .then(() => console.log(chalk.blue('Succeed')))
    .catch((e) => console.error(chalk.red('Error:'), e));

