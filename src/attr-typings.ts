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

export enum Attr {
    BigInt = 'bigint',
    HexInt = 'hexint',
    Int = 'int',
    HexNo = 'hexno',
    Enum = 'enum',
    String = 'string',
    Float = 'float',
    SignedFloat = 'signed-float',
    Resolution = 'resolution',
    /* unofficial type */
    Byterange = 'byterange'
}

// Shared

export type Start = {
    'time-offset': Attr.SignedFloat;
    precise?: Attr.Enum;
};

export type Define = {
    name?: Attr.String;
    value?: Attr.String;
    import?: Attr.String;
};

// Media

export type PartInf = {
    'part-target': Attr.Float;
};

export type ServerControl = {
    'can-skip-until'?: Attr.Float;
    'can-skip-dateranges'?: Attr.Float;
    'hold-back'?: Attr.Float;
    'part-hold-back'?: Attr.Float;
    'can-block-reload'?: Attr.Enum;
};

// Media Segment

export type Key = {
    method: Attr.Enum;
    uri?: Attr.String;
    iv?: Attr.HexInt;
    keyformat?: Attr.String;
    keyformatversions?: Attr.String;
};

export type Map = {
    uri: Attr.String;
    byterange?: Attr.Byterange | Attr.Enum;
};

export type Part = {
    uri: Attr.String;
    duration: Attr.Float;
    independent?: Attr.Enum;
    byterange?: Attr.Byterange | Attr.Enum;
    gap?: Attr.Enum;
};

export type Daterange = {
    id: Attr.String;
    class?: Attr.String;
    'start-date': Attr.String;
    cue?: Attr.String;               // TODO: support enumerated-string-list
    'end-date'?: Attr.String;
    duration?: Attr.Float;
    'planned-duration'?: Attr.Float;
    // 'x-<client-attribute>'     // FIXME: unsupported
    'scte35-cmd'?: Attr.HexInt | Attr.HexNo;
    'scte-in'?: Attr.HexInt | Attr.HexNo;
    'scte-out'?: Attr.HexInt | Attr.HexNo;
    'end-on-next'?: Attr.Enum;
};

export type Skip = {
    'skipped-segments': Attr.BigInt | Attr.Int;
    'recently-removed-dateranges'?: Attr.String;
};

export type PreloadHint = {
    type: Attr.Enum;
    uri: Attr.String;
    'byterange-start'?: Attr.BigInt | Attr.Int;
    'byterange-length'?: Attr.BigInt | Attr.Int;
};

export type RenditionReport = {
    uri: Attr.String;
    'last-msn': Attr.BigInt | Attr.Int;
    'last-part': Attr.BigInt | Attr.Int;
};

// Multivariant / Main

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
    characteristics?: Attr.String;
    channels?: Attr.String;
};

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
    'stable-variant-id'?: Attr.String;
    audio?: Attr.String;
    video?: Attr.String;
    subtitles?: Attr.String;
    'closed-captions'?: Attr.String | Attr.Enum;
    'pathway-id'?: Attr.String;
};

export type IFrameStreamInf = Omit<StreamInf, 'frame-rate' | 'audio' | 'subtitles' | 'closed-captions'> & {
    uri: Attr.String;
};

export type SessionData = {
    'data-id': Attr.String;
    value?: Attr.String;
    uri?: Attr.String;
    language?: Attr.String;
};

export type SessionKey = Key;

export type ContentSteering = {
    'server-uri': Attr.String;
    'pathway-id'?: Attr.String;
};
