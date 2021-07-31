import fs from 'fs-extra';
import readline from 'readline';
import path from 'path';

import chalk from 'chalk';
import { Anime } from "../../src/types";

const ANIME_LIST_PATH = path.join(__dirname, '../resources/raw/anime-list.raw');
const ANIME_LIST_OUTPUT_PATH = path.join(__dirname, '../resources/anime-list.json');
const GENRES_OUTPUT_PATH = path.join(__dirname, '../resources/genres.json');

const prefixes = {
    URL: 'url:',
    NAME: 'name:',
    GENRES: 'genres:',
    DESCRIPTION: 'description:',
    IMAGE: 'image:',
};

async function proceed() {
    const isFileExists = await fs.pathExists(ANIME_LIST_PATH);

    if (!isFileExists) {
        throw new Error('There is no raw anime file');
    }

    let animeList: Array<Anime> = await new Promise((resolve, reject) => {
        const readInterface = readline.createInterface({
            input: fs.createReadStream(ANIME_LIST_PATH),
        });

        const animes: Array<Anime> = [];
        let index = 0;
        let anime: Anime = { index, url: '', genres: [], name: '', fullName: '', description: '' };

        readInterface.on('line', function (line) {
            if (line === '[Written by MAL Rewrite]' || !line) {
                return null;
            }

            if (/^#+$/.test(line)) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                animes.push(JSON.parse(JSON.stringify(anime)));
                index++;
                anime = { index, url: '', genres: [], name: '', fullName: '', description: '' };
                return null;
            }

            if (line.startsWith(prefixes.URL)) {
                anime.url = line.replace(prefixes.URL, '').trim();
            } else if (line.startsWith(prefixes.NAME)) {
                const name = line.replace(prefixes.NAME, '').trim();
                anime.fullName = name;
                anime.name = name.split(' / ')[0];
            } else if (line.startsWith(prefixes.GENRES)) {
                anime.genres = line.replace(prefixes.GENRES, '').trim().split(',');
            } else if (line.startsWith(prefixes.IMAGE)) {
                anime.image = line.replace(prefixes.IMAGE, '').trim();
            } else if (line.startsWith(prefixes.DESCRIPTION)) {
                anime.description = line.replace(prefixes.DESCRIPTION, '').replace(/"/g, '').trim();
            }
        });

        readInterface.on('error', function (e) {
            reject(e);
        });

        readInterface.on('close', function () {
            animes.push(JSON.parse(JSON.stringify(anime)));
            anime = { index: -1, url: '', genres: [], name: '', fullName: '', description: '' };
            resolve(animes);
        });
    });
    animeList = animeList.filter(({ name }) => Boolean(name));

    const genresList: Set<string> = new Set();
    animeList.forEach(({ genres = [] }) => {
        genres.forEach((g) => genresList.add(g));
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await fs.outputFile(GENRES_OUTPUT_PATH, JSON.stringify([...genresList].sort()));
    return fs.outputFile(ANIME_LIST_OUTPUT_PATH, JSON.stringify(animeList))
}

proceed()
    .then(() => console.log(chalk.blue('Succeed')))
    .catch((e) => console.error(chalk.red('Error:'), e));
