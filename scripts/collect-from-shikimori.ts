import path from 'path';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import chalk from "chalk";
import fetch from 'node-fetch';
import parallelLimit from 'async/parallelLimit';
import series from 'async/series';
import asyncify from 'async/asyncify';

import { Anime } from "../src/types";
import wait from "./utils/wait";
import { Meta, readMeta, writeMeta } from "./utils/meta";
import { AnimeFromShikimori, FullAnime } from "./utils/types";
import formatResponse from "./utils/format-response";

dotenv.config();

const TOKEN = process.env.SHIKIMORI;
const PREFIX = 'https://shikimori.one';
const LIMIT = 50;
const ITERATIONS = 4;
const MAX_RPM = 89;
const MAX_RPS = 4;
const HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': TOKEN,
    'User-Agent': 'Alice.News'
};

const today = Date.now();

const OUTPUT = path.join(__dirname, `../resources/collected_${today}.json`);
const OUTPUT_ONGOING = path.join(__dirname, `../resources/collected_ongoing_${today}.json`);

let request = 0;
let rpmCounter = 0;
let requestsStart = 0;
const duration = 1000 * 60; // 1 minute

async function exportToFile(animeList: Array<Anime>, meta: Meta): Promise<void> {
    await fs.writeJson(meta.parseNew ? OUTPUT_ONGOING : OUTPUT, animeList);
}

function formatAnime(fullAnime: FullAnime): Anime {
    const result: Anime = {
        index: -1,
        url: `${PREFIX}${fullAnime.url}`,
        genres: (fullAnime.genres ?? []).map(v => v.russian),
        name: fullAnime.russian,
        fullName: `${fullAnime.russian} / ${fullAnime.name}`,
        description: fullAnime.description || '',
        image: `${PREFIX}${fullAnime.image.preview}`,
    };

    return result;
}

async function rpmLimiter() {
    if (rpmCounter === 0 || requestsStart === 0) {
        requestsStart = Date.now();
    }

    if (rpmCounter >= MAX_RPM || Date.now() - requestsStart >= duration) {
        console.log(chalk.bold.red('Max RPM. Wait for 1 minute'));
        rpmCounter = 0;
        await wait(duration);
    }

    rpmCounter++;
}

async function populateAnimes(animeList: Array<AnimeFromShikimori>, parallel = MAX_RPS): Promise<Array<Anime>> {
    const result: Array<FullAnime> = [];

    const worker = (task) => async () => {
        const currentRequest = ++request;
        const endpoint = `${PREFIX}/api/animes/${task.id}`;
        console.log(`#${chalk.red(currentRequest)} Endpoint: ${endpoint}`);
        await wait();

        await rpmLimiter();
        const fullAnime: FullAnime = await fetch(endpoint, {
            method: 'get',
            headers: HEADERS
        }).then(formatResponse);

        console.log(`#${chalk.red(currentRequest)} Done`);
        result.push(fullAnime);
        return fullAnime;
    }
    await parallelLimit(
        animeList.map(v => asyncify(worker(v))),
        parallel
    );

    console.log(`${chalk.blue('Proceed')} ${result.length} / ${animeList.length}`);

    return result.map(formatAnime) as Array<Anime>;
}

async function getPage(page = 0, ongoing = false) {
    const currentRequest = ++request;
    const endpoint = `${PREFIX}/api/animes?limit=${LIMIT}&page=${page}&order=popularity${ongoing ? '&status=ongoing' : ''}`;
    console.log(`#${chalk.red(currentRequest)} Endpoint page: ${endpoint}`);
    const animesRaw = await fetch(endpoint, {
        method: 'GET',
        headers: HEADERS,
    }).then(formatResponse) as Array<AnimeFromShikimori>;
    console.log(`#${chalk.red(currentRequest)} Done`);
    return populateAnimes(animesRaw);
}

async function main() {
    const meta = await readMeta(today);

    if (meta.parseNew) {
        console.log(chalk.bold(`${chalk.red('Warning:')} This is ONGOING run`));
    }

    const result: Array<Anime> = [];
    const worker = (page) => async () => {
        await rpmLimiter();
        const pageData = await getPage(page, meta.parseNew);

        pageData.forEach(v => result.push(v));

        return pageData;
    }

    const iterations = meta.parseNew ? 2 : ITERATIONS;
    const startPage = meta.parseNew ? 0 : meta.lastParsedPage;

    const pages = (new Array(startPage + iterations)).fill(null).map((_, key) => asyncify(worker(key + startPage + 1)))
    await series(pages);

    console.log(`${chalk.blue('Proceed pages')} ${result.length / LIMIT} / ${iterations}`);

    await exportToFile(result, meta);
    meta.lastParserRun = today;
    meta.lastParsedPage = meta.lastParsedPage + iterations;
    await writeMeta(meta);
}

main()
    .then(() => console.log(chalk.blue('Succeed')))
    .catch((e) => console.error(chalk.red('Error:'), e));
