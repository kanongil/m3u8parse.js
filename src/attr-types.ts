// Updated for draft-pantos-hls-rfc8216bis-12

// Base types

export interface Resolution {
    width: number;
    height: number;
}

export interface Byterange {
    offset?: number;
    length: number;
}

/** @see Spec {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.2 Attribute Lists} */
export enum Attr {
    /** Spec `decimal-integer` as `bigint` */
    BigInt = 'bigint',

    /** Spec `decimal-integer` as `number` */
    Int = 'int',

    /** Spec `hexadecimal-sequence` as `bigint` */
    HexInt = 'hexint',

    /** Spec `hexadecimal-sequence` as `number` */
    HexNo = 'hexno',

    /** Spec `enumerated-string` as `string` */
    Enum = 'enum',

    /** Spec `enumerated-string-list` as `string[]` */
    List = 'list',

    /** Spec `quoted-string` as `string` */
    String = 'string',

    /** Spec `decimal-floating-point` as `float` */
    Float = 'float',

    /** Spec `signed-decimal-floating-point` as `float` */
    SignedFloat = 'signed-float',

    /** Spec `decimal-resolution` as {@link Resolution} */
    Resolution = 'resolution',

    /** Inferred type as {@link Byterange} */
    Byterange = 'byterange'
}

// Shared

/** {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.2.2 `EXT-X-START`} attributes */
export type Start = {
    'time-offset': Attr.SignedFloat;
    precise?: Attr.Enum;
};

/** {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.2.3 `EXT-X-DEFINE`} attributes */
export type Define = {
    name?: Attr.String;
    value?: Attr.String;
    import?: Attr.String;
    queryparam?: Attr.String;
};

// Media


/** {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.3.7 `EXT-X-PART-INF`} attributes */
export type PartInf = {
    'part-target': Attr.Float;
};

/** {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.3.8 `EXT-X-SERVER-CONTROL`} attributes */
export type ServerControl = {
    'can-skip-until'?: Attr.Float;
    'can-skip-dateranges'?: Attr.Float;
    'hold-back'?: Attr.Float;
    'part-hold-back'?: Attr.Float;
    'can-block-reload'?: Attr.Enum;
};

// Media Segment

/** {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.4.4 `EXT-X-KEY`} attributes */
export type Key = {
    method: Attr.Enum;
    uri?: Attr.String;
    iv?: Attr.HexInt;
    keyformat?: Attr.String;
    keyformatversions?: Attr.String;
};

/** {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.4.5 `EXT-X-MAP`} attributes */
export type Map = {
    uri: Attr.String;
    byterange?: Attr.Byterange | Attr.Enum;
};

/** {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.4.9 `EXT-X-PART`} attributes */
export type Part = {
    uri: Attr.String;
    duration: Attr.Float;
    independent?: Attr.Enum;
    byterange?: Attr.Byterange | Attr.Enum;
    gap?: Attr.Enum;
};

type SchemaValidate<T extends { [key: string]: Attr }> = {
    [Prop in keyof T]: Prop extends `x-${string}` ? T[Prop] : never
};

/** {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.5.1 `EXT-X-DATERANGE`} attributes */
// eslint-disable-next-line @typescript-eslint/ban-types
export type Daterange<Schema extends SchemaValidate<{}> = {}> = {
    id: Attr.String;
    class?: Attr.String;
    'start-date': Attr.String;
    cue?: Attr.List;
    'end-date'?: Attr.String;
    duration?: Attr.Float;
    'planned-duration'?: Attr.Float;
    // 'x-<client-attribute>'                  // Supported using Schema
    'scte35-cmd'?: Attr.HexInt | Attr.HexNo;
    'scte-in'?: Attr.HexInt | Attr.HexNo;
    'scte-out'?: Attr.HexInt | Attr.HexNo;
    'end-on-next'?: Attr.Enum;
} & Schema;

// eslint-disable-next-line @typescript-eslint/no-namespace, @typescript-eslint/no-redeclare
export namespace Daterange {

    /**
     * `class: "com.apple.hls.interstitial"`
     *
     * @see {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#appendix-D.2 `EXT-X-DATERANGE` interstitial}
     */
    export type Interstitial = {
        'x-asset-uri'?: Attr.String;
        'x-asset-list'?: Attr.String;
        'x-resume-offset'?: Attr.SignedFloat;
        'x-playout-limit'?: Attr.Float;
        'x-snap'?: Attr.List;
        'x-restrict'?: Attr.List;
        'x-content-may-vary'?: Attr.String;
        'x-timeline-occupies'?: Attr.String;
        'x-timeline-style'?: Attr.String;
    };
}

/** {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.5.2 `EXT-X-SKIP`} attributes */
export type Skip = {
    'skipped-segments': Attr.BigInt | Attr.Int;
    'recently-removed-dateranges'?: Attr.String;
};

/** {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.5.3 `EXT-X-PRELOAD-HINT`} attributes */
export type PreloadHint = {
    type: Attr.Enum;
    uri: Attr.String;
    'byterange-start'?: Attr.BigInt | Attr.Int;
    'byterange-length'?: Attr.BigInt | Attr.Int;
};

/** {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.5.4 `EXT-X-RENDITION-REPORT`} attributes */
export type RenditionReport = {
    uri: Attr.String;
    'last-msn': Attr.BigInt | Attr.Int;
    'last-part': Attr.BigInt | Attr.Int;
};

// Multivariant / Main

/** {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.6.1 `EXT-X-MEDIA`} attributes */
export type Media = {
    type: Attr.Enum;
    uri?: Attr.String;
    'group-id': Attr.String;
    language?: Attr.String;
    'assoc-language'?: Attr.String;
    name: Attr.String;
    'stable-rendition-id'?: Attr.String;
    default?: Attr.Enum;
    autoselect?: Attr.Enum;
    forced?: Attr.Enum;
    'instream-id'?: Attr.String;
    'bit-depth'?: Attr.BigInt | Attr.Int;
    'sample-rate'?: Attr.BigInt | Attr.Int;
    characteristics?: Attr.String;
    channels?: Attr.String;
};

/** {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.6.2 `EXT-X-STREAM-INF`} attributes */
export type StreamInf = {
    bandwidth: Attr.Int | Attr.BigInt;
    'average-bandwidth'?: Attr.Int | Attr.BigInt;
    score?: Attr.Float;
    codecs?: Attr.String;
    'supplemental-codecs'?: Attr.String;
    resolution?: Attr.Resolution;
    'frame-rate'?: Attr.Float;
    'hdcp-level'?: Attr.Enum;
    'alloved-cpc'?: Attr.String;
    'video-range'?: Attr.Enum;
    'req-video-layout'?: Attr.String;
    'stable-variant-id'?: Attr.String;
    audio?: Attr.String;
    video?: Attr.String;
    subtitles?: Attr.String;
    'closed-captions'?: Attr.String | Attr.Enum;
    'pathway-id'?: Attr.String;
};

/** {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.6.3 `EXT-X-I-FRAME-STREAM-INF`} attributes */
export type IFrameStreamInf = Omit<StreamInf, 'frame-rate' | 'audio' | 'subtitles' | 'closed-captions'> & {
    uri: Attr.String;
};

/** {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.6.4 `EXT-X-SESSION-DATA`} attributes */
export type SessionData = {
    'data-id': Attr.String;
    value?: Attr.String;
    uri?: Attr.String;
    format?: Attr.Enum;
    language?: Attr.String;
};

/** {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.6.5 `EXT-X-SESSION-KEY`} attributes */
export type SessionKey = Key;

/** {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.6.6 `EXT-X-CONTENT-STEERING`} attributes */
export type ContentSteering = {
    'server-uri': Attr.String;
    'pathway-id'?: Attr.String;
};
