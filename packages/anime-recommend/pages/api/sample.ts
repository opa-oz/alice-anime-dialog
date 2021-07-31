import type { NextApiRequest, NextApiResponse } from 'next'

import path from 'path';
import fs from 'fs-extra';

import type { Anime } from '../../anime';

type Data = {
    animes: Array<Anime>
}

const SAMPLE_PATH = path.join(__dirname, '../../../../resources/anime-list.json');

let AnimeList: Array<Anime> = [];

fs.readJSON(SAMPLE_PATH).then(r => {
    AnimeList = r;
})

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    res.status(200).json({ animes: AnimeList })
}
