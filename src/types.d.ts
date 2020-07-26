export type Anime = {
    index: number;
    url: string;
    name: string;
    image?: string;
    image_id?: string;
    fullName: string;
    genres: Array<string>;
    description: string;
}

export type UserSession = {
    genre?: string;
    anime?: Anime;
    lastUpdateTime: number;
    isGenreShown?: boolean;
    isAnimeShown?: boolean;
    isDescriptionShown?: boolean;
}

export type Session = {
    message_id: number;
    session_id: string;
    skill_id: string;
    user_id: string;
    user?: {
        user_id: string;
        access_token: string;
    };
    application: {
        application_id: string;
    };
    new: boolean;
};

export type Version = '1.0';

export type Params = {
    session: Session;
    res: any;
    version: Version;
}

type Entity = {
    tokens: {
        start: number;
        end: number;
    },
    type: "YANDEX.GEO" | "YANDEX.DATETIME" | "YANDEX.FIO" | "YANDEX.NUMBER";
    value: {
        house_number: string;
        street: string;
    }
}

export type Request = {
    command: string;
    original_utterance: string;
    type: string;
    markup: {
        dangerous_context: boolean;
    },
    payload: any;
    nlu: {
        tokens: Array<string>;
        entities: Array<Entity>
    }
}

export type GalleryCard = {
    type: "ItemsList",
    header?: {
        text: string;
    },
    items: Array<{
        image_id: string;
        title?: string;
        description?: string;
        button?: {
            text?: string;
            url?: string;
            payload: any;
        }
    }>,
    footer?: {
        text: string;
        button?: {
            text?: string;
            url?: string;
            payload: any;
        }
    }
}

export type ImageCard = {
    type: "BigImage";
    image_id: string;
    title?: string;
    description?: string;
    button?: {
        text?: string;
        url?: string;
        payload: any;
    }
};

export type Response = {
    text: string;
    tts?: string;
    buttons?: Array<Button>,
    end_session?: boolean;
    card?: ImageCard | GalleryCard;
};

export type Button = {
    title: string;
    url?: string;
    payload?: any;
    hide: boolean;
}

export type TTSPhrase = {
    text: string;
    tts: string;
}
