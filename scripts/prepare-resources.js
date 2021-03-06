const fs = require('fs-extra');
const readline = require('readline');
const path = require('path');

const chalk = require('chalk');

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

    let animeList = await new Promise((resolve, reject) => {
        const readInterface = readline.createInterface({
            input: fs.createReadStream(ANIME_LIST_PATH),
        });

        const animes = [];
        let index = 0;
        let anime = { index };

        readInterface.on('line', function (line) {
            if (line === '[Written by MAL Rewrite]' || !line) {
                return null;
            }

            if (/^#+$/.test(line)) {
                animes.push(JSON.parse(JSON.stringify(anime)));
                index++;
                anime = { index };
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
            anime = {};
            resolve(animes);
        });
    });
    animeList = animeList.filter(({ name }) => Boolean(name));

    const genresList = new Set();
    animeList.forEach(({ genres = [] }) => {
        genres.forEach((g) => genresList.add(g));
    });

    await fs.outputFile(GENRES_OUTPUT_PATH, JSON.stringify([...genresList].sort()));
    return fs.outputFile(ANIME_LIST_OUTPUT_PATH, JSON.stringify(animeList))
}

proceed()
    .then(() => console.log(chalk.blue('Succeed')))
    .catch((e) => console.error(chalk.red('Error:'), e));
