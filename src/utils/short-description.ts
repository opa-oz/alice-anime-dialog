const MAX_LENGTH = 256;
const ENDING_LENGTH = 3;

const ENDING = '...';

export default (description?: string): string => {
    if (!description) {
        return '';
    }

    const { length } = description;
    let result = '';

    if (length >= MAX_LENGTH) {
        result = `${description.slice(0, MAX_LENGTH - ENDING_LENGTH)}${ENDING}`
    } else {
        result = description;
    }

    return result;
}
