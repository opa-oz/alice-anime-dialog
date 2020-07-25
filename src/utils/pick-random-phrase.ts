import pickRandomItem from './pick-random-item';

// eslint-disable-next-line @typescript-eslint/ban-types
export default (list: Array<Function>, params?: Array<unknown>): string => {
    const randomPhraseBuilder = pickRandomItem(list);

    return randomPhraseBuilder(...(params || []));
}
