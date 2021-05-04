import { Anime } from "../../src/types";

function cleanDesc(list: Array<Anime>): Array<Anime> {
    return list.map((anime) => {
        anime.description = anime.description.replace(/\[character=[0-9]+]/gi, '');
        anime.description = anime.description.replace(/\[\/character]/gi, '');
        anime.description = anime.description.replace(/\[\[/gi, '');
        anime.description = anime.description.replace(/]]/gi, '');

        return anime;
    });
}

export default cleanDesc;
