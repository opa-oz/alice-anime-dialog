import pickRandomItem from './pick-random-item';
import { TTSPhrase } from "../types";

// eslint-disable-next-line @typescript-eslint/ban-types
export default (list: Array<Function>, params?: Array<unknown>): string | TTSPhrase => {
    const randomPhraseBuilder = pickRandomItem(list);

    return randomPhraseBuilder(...(params || []));
}
