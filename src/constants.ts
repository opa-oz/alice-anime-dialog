import { Anime, TTSPhrase } from "./types";
import pickRandomPhrase from './utils/pick-random-phrase';

export enum Commands {
    AGREE,
    DISAGREE,
    MORE,
    ANY_GENRE,
    RANDOM,
    OPEN,
    HELP,
    ONGOINGS,
    LOCAL_TOP
}

export const COMMANDS_LIST = [
    {
        text: 'что ты умеешь',
        command: Commands.HELP
    },
    {
        text: 'помощь',
        command: Commands.HELP
    },
    {
        text: 'Открыть',
        command: Commands.OPEN,
    },
    {
        text: 'расскажи',
        command: Commands.AGREE
    },
    {
        text: 'подробнее',
        command: Commands.AGREE
    },
    {
        text: 'конечно',
        command: Commands.AGREE
    },
    {
        text: 'давай',
        command: Commands.AGREE
    },
    {
        text: 'нет',
        command: Commands.DISAGREE
    },
    {
        text: 'ни',
        command: Commands.DISAGREE
    },
    {
        text: 'хватит',
        command: Commands.DISAGREE
    },
    {
        text: 'стоп',
        command: Commands.DISAGREE
    },
    {
        text: 'ещё',
        command: Commands.MORE,
    },
    {
        text: 'еще',
        command: Commands.MORE,
    },
    {
        text: 'больше',
        command: Commands.AGREE,
    },
    {
        text: 'любой жанр',
        command: Commands.ANY_GENRE,
    },
    {
        text: 'в любом жанре',
        command: Commands.ANY_GENRE,
    },
    {
        text: 'на твой выбор',
        command: Commands.ANY_GENRE,
    },
    {
        text: 'другой жанр',
        command: Commands.ANY_GENRE,
    },
    {
        text: 'порекомендуй аниме',
        command: Commands.RANDOM
    },
    {
        text: 'случайное аниме',
        command: Commands.RANDOM
    },
    {
        text: 'что посмотреть',
        command: Commands.RANDOM
    },
    {
        text: 'аниме посмотреть',
        command: Commands.RANDOM
    },
    {
        text: 'аниме онгоинги',
        command: Commands.ONGOINGS
    },
    {
        text: 'онгоинги',
        command: Commands.ONGOINGS
    },
    {
        text: 'свежее',
        command: Commands.ONGOINGS
    },
    {
        text: 'новое',
        command: Commands.ONGOINGS
    },
    {
        text: 'новенькое',
        command: Commands.ONGOINGS
    },
    {
        text: 'новенького',
        command: Commands.ONGOINGS
    },
    {
        text: 'сезонное',
        command: Commands.ONGOINGS
    },
    {
        text: 'сезон',
        command: Commands.ONGOINGS
    },
    {
        text: 'сейчас выходит',
        command: Commands.ONGOINGS
    },
    {
        text: 'рейтинг',
        command: Commands.LOCAL_TOP,
    },
    {
        text: 'топ',
        command: Commands.LOCAL_TOP,
    },
    {
        text: 'мой топ',
        command: Commands.LOCAL_TOP,
    },
    {
        text: 'топ алисы',
        command: Commands.LOCAL_TOP,
    },
    {
        text: 'топ гуру',
        command: Commands.LOCAL_TOP,
    },
];

export const phrases = {
    LOCAL_TOP_ANSWER: [
        (): string => 'Спасибо за предложение!',
        (): string => 'Отлично! Думаю другим пользователям понравится',
        (): string => 'Ооо, я думала об этом тайтле! Шикарный выбор! Спасибо!',
        (): string => 'Спасибо! Ожидайте увидеть свою рекомендацию на сайте!',
    ],
    LOCAL_TOP: [
        (): string => 'Такое дело - я решила собрать топ аниме от своих пользователей, чтобы потом составить наш собственный топ аниме! \nВы мне очень поможете, если назовёте своё любимое аниме прямо сейчас!',
        (): string => 'Я собираюсь составить свой собственный топ аниме! Назову его... Хм.. Топ "Гуру"? Шикарно! \nКакое вот у Вас любимое аниме? Я обязательно включу его в топ!',
        (): string => 'Я с командой обучаю ML модель для рекомендации аниме на основе предпочтений моих пользователей. \nХотите что-то предложить? Просто назовите тайтл и я всё запомню!',
        (): string => 'Я делаю сайт Топ "Гуру", с рекомендациями аниме от моих пользователей, поможете? \nНазовите Ваше любимое аниме и он попадёт в мой рейтинг!',
    ],
    NEED_MORE: [
        (): string => 'Рассказать подробнее?',
        (): string => 'Рассказать больше?',
        (): string => 'Рассказать больше о нём?',
        (): string => 'Могу рассказать о нём подробнее.',
        (): string => 'Могу рассказать о нём подробнее. Хотите?',
    ],
    GENRE: [
        (genre: string, anime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `Жанр "${genre}" сейчас на пике популярности. Могу предложить посмотреть "${name}".\n${ending}`

            return {
                text: text(anime.fullName),
                tts: text(anime.name),
            }
        },
        (genre: string, anime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `Мне тоже нравится "${genre}". Особенно аниме "${name}".\n${ending}`;

            return {
                text: text(anime.fullName),
                tts: text(anime.name),
            }
        },
        (genre: string, anime: Anime): TTSPhrase => ({
            text: `"${genre}" - отличный выбор! Рекомендую посмотреть "${anime.fullName}".`,
            tts: `"${genre}" - отличный выбор! Рекомендую посмотреть "${anime.name}".`
        }),
        (genre: string, anime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `"${genre}"? А у Вас хороший вкус. Как насчёт посмотреть "${name}"?\n${ending}`;

            return {
                text: text(anime.fullName),
                tts: text(anime.name),
            }
        },
        (genre: string, anime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `Ммм, "${genre}"... Дайте подумать... Как Вам "${name}"?\n${ending}`;

            return {
                text: text(anime.fullName),
                tts: text(anime.name),
            }
        },
    ],
    ENDING: [
        (): string => 'Если смогу еще чем-то помочь - только позовите. Бип-бип-буп',
        (): string => 'Б-б-баака!',
        (): string => 'Вы всегда можете попросить меня порекомендовать другое аниме. Я не против.',
        (): string => 'Хорошо, но я всегда здесь, заходите почаще.',
    ],
    NOT_FOUND: [
        (genre: string): string => `К сожалению, я не нашла у себя другого аниме в жанре "${genre}.\n Простите мою оплошность и давайте начнём с начала."`,
        (genre: string): string => `Оуч... Кажется мне больше нечего Вам предложить в жанре "${genre}". Может попробуем другой жанр?`,
        (genre: string): string => `Увы, больше ничего в жанре "${genre}" я Вам предложить не могу. Назовите другой жанр, попробую поисктаь там.`,
        (genre: string): string => `Программист Алексей очень извиняется, что не добавил больше аниме в жанр "${genre}". Могу порекомендовать любое другое аниме, например.`,
    ],
    MORE: [
        (genre: string, nextAnime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `Жанр "${genre}" отлично представлен в аниме "${name}".\n${ending}`;

            return {
                text: text(nextAnime.fullName),
                tts: text(nextAnime.name),
            }
        },
        (genre: string, nextAnime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `Любители жанра "${genre}" часто смотрят "${name}".\n${ending}`;

            return {
                text: text(nextAnime.fullName),
                tts: text(nextAnime.name),
            }
        },
        (genre: string, nextAnime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `Хммм, что же ещё можно предложить в жанре "${genre}"... Может "${name}?\n${ending}"`;

            return {
                text: text(nextAnime.fullName),
                tts: text(nextAnime.name),
            }
        },
        (genre: string, nextAnime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `Еще из жанра "${genre}" можно посмотреть "${name}".\n${ending}`;

            return {
                text: text(nextAnime.fullName),
                tts: text(nextAnime.name),
            }
        },
    ],
    ANY: [
        (genre: string, anime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `Любите жанр "${genre}"? Я вот да! Особенно "${name}".\n${ending}`;

            return {
                text: text(anime.fullName),
                tts: text(anime.name),
            }
        },
        (genre: string, anime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `"${genre}" любят все! Рекомендую посмотреть "${name}".\n${ending}`;

            return {
                text: text(anime.fullName),
                tts: text(anime.name),
            }
        },
        (genre: string, anime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `"${genre}"? Сложный выбор... Как насчёт "${name}"?\n${ending}`;

            return {
                text: text(anime.fullName),
                tts: text(anime.name),
            }
        },
        (genre: string, anime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `Многие предпочитают жанр "${genre}". Предлагаю Вам посмотреть "${name}".\n${ending}`;

            return {
                text: text(anime.fullName),
                tts: text(anime.name),
            }
        }
    ],
    DEFAULT: [
        (): string => 'Я аниме-Алиса! Я помогаю выбирать аниме для просмотра.\nНазовите мне жанр, который Вы предпочитаете, и начнем.\nТак же я разбираюсь в классике аниме, а иногда могу посоветовать свежие тайтлы.',
        (): string => 'Я могу порекомендовать случайное аниме, а могу и аниме из названного Вами жанра.\nЕсли не можете определиться - ничего! Я могу выбрать на свой вкус и жанр и аниме.',
        (): string => 'Я аниме-Алиса! Скажите мне Ваш любимый жанр, и я тут же порекомендую Вам, что из него посмотреть!',
        (): string => 'Не знаете, что посмотреть? Давайте я Вам порекомендую! Назовите жанр, или просто попросите меня назвать случайное аниме!',
    ],
    ERROR: [
        (): string => 'Извините, я не поняла, что мне нужно сделать. Скажите мне жанр, который вы предпочитаете, либо просто попросите порекомендовать случайное аниме',
        (): string => 'Программист Алексей очень извиняется, так как не научил меня ответить на Вашу предыдущую фразу. Давайте лучше порекомендую аниме?',
        (): string => 'Простите меня, семпай, но я не могу ответить на это. Может порекомендовать Вам аниме?',
        (): string => 'Гомэн насай, сенсей, я не справилась. Могу я, в качестве извинений, порекомендовать случайное аниме?',
    ],
    RANDOM: [
        (anime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `Предлагаю Вам посмотреть "${name}".\n${ending}`;

            return {
                text: text(anime.fullName),
                tts: text(anime.name),
            }
        },
        (anime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `Рекомендую "${name}". Оно крутое!.\n${ending}`;

            return {
                text: text(anime.fullName),
                tts: text(anime.name),
            }
        },
        (anime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `Как насчёт "${name}"?\n${ending}`;

            return {
                text: text(anime.fullName),
                tts: text(anime.name),
            }
        },
        (anime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `Что насчёт "${name}"?\n${ending}`;

            return {
                text: text(anime.fullName),
                tts: text(anime.name),
            }
        },
        (anime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `Смотрели "${name}"?\n${ending}`;

            return {
                text: text(anime.fullName),
                tts: text(anime.name),
            }
        },
    ],
    ONGOING: [
        (anime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `Предлагаю Вам посмотреть свежее аниме - "${name}".\n${ending}`;

            return {
                text: text(anime.fullName),
                tts: text(anime.name),
            }
        },
        (anime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `Рекомендую "${name}". Оно прямо сейчас выходит! Это же круто!\n${ending}`;

            return {
                text: text(anime.fullName),
                tts: text(anime.name),
            }
        },
        (anime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `Как насчёт свежего "${name}"?\n${ending}`;

            return {
                text: text(anime.fullName),
                tts: text(anime.name),
            }
        },
        (anime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `Что думаете об онгоинге - "${name}"?\n${ending}`;

            return {
                text: text(anime.fullName),
                tts: text(anime.name),
            }
        },
        (anime: Anime): TTSPhrase => {
            const ending = pickRandomPhrase(phrases.NEED_MORE);
            const text = (name) => `Слышали что-то о свежем "${name}"?\n${ending}`;

            return {
                text: text(anime.fullName),
                tts: text(anime.name),
            }
        },
    ],
    OPEN: [
        (): string => 'Отличный выбор!',
        (): string => 'Посмотрите и возвращайесь ко мне!',
        (): string => 'Сиюминутно',
    ],
    HELP: [
        (): string => 'Я могу порекомендовать аниме, а могу и выбрать на свой вкус из названного Вами жанра.\nНазовите Ваш любимый жанр и начнём!\nНапример, "Приключения"',
        (): string => 'Я аниме-Алиса! Я помогаю выбирать аниме для просмотра.\nНазовите мне жанр, который Вы предпочитаете, и начнем.\nТак же я разбираюсь в классике аниме, а иногда могу посоветовать свежие тайтлы.',
    ]
};

export const LOG_TYPES = {
    request: 'user_input',
    response: 'answer_to_user',
    error: 'recognizing_error'
};

export const PING_COMMAND = 'ping';
