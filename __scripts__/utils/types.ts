export type AnimeFromShikimori = {
    "id": number;
    "name": string;
    "russian": string;
    "image": {
        "original": string;
        "preview": string;
        "x96": string;
        "x48": string;
    };
    "url": string;
    "kind": string;
    "score": string;
    "status": string;
    "episodes": string;
    "episodes_aired": string;
    "aired_on": string;
    "released_on": string;
};

export type FullAnime = {
    "id": number;
    "name": string;
    "russian": string;
    "image": {
        "original": string;
        "preview": string;
        "x96": string;
        "x48": string;
    },
    "url": string;
    "kind": string;
    "score": string;
    "status": string;
    "episodes": number;
    "episodes_aired": number;
    "aired_on"?: string;
    "released_on"?: string;
    "rating": string;
    "english": Array<string>;
    "japanese": Array<string>;
    "synonyms": Array<string>;
    "license_name_ru": string;
    "duration": number;
    "description"?: string;
    "description_html": string;
    "description_source"?: string;
    "franchise"?: string;
    "favoured": boolean;
    "anons": boolean;
    "ongoing": boolean;
    "thread_id": number;
    "topic_id": number;
    "myanimelist_id": number;
    "rates_scores_stats": Array<string>;
    "rates_statuses_stats": Array<string>;
    "updated_at": string;
    "next_episode_at"?: string;
    "genres": Array<{
        "id": number;
        "name": string;
        "russian": string;
        "kind": string;
    }>;
    "studios": Array<string>;
    "videos": Array<string>;
    "screenshots": Array<string>;
    "user_rate"?: string;
};
