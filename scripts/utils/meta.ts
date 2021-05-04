import path from "path";
import fs from 'fs-extra';

type Meta = {
    lastParsedPage: number;
    lastParserRun: number;
};

const META = path.join(__dirname, '../../resources/_meta.json');

async function readMeta(today): Promise<Meta> {
    const exists = await fs.pathExists(META);

    if (exists) {
        return await fs.readJson(META);
    }

    return { lastParsedPage: 0, lastParserRun: today };
}

async function writeMeta(meta: Meta): Promise<void> {
    await fs.writeJson(META, meta);
}

export {
    readMeta,
    writeMeta
};
