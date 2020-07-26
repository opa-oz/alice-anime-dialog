const MAX_LENGTH = 256;
const ENDING_LENGTH = 3;

const ENDING = '...';

export default (description?: string, maxLength: number = MAX_LENGTH): string => {
    if (!description) {
        return '';
    }

    const { length } = description;
    let result = '';

    if (length >= maxLength) {
        result = `${description.slice(0, maxLength - ENDING_LENGTH)}${ENDING}`
    } else {
        result = description;
    }

    return result;
}
