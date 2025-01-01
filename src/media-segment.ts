import type * as AttrT from './attr-types.js';

import { AttrList, Byterange } from './attrlist.js';
import { cloneAttrArray, IRewritableUris, isStringish, rewriteAttr, rewriteAttrs, UriMapFunction } from './playlist-base.js';
import type { Proto } from './types.js';

export class MediaSegment implements IRewritableUris {

    /* Segment URI */
    uri?: string;

    /** @see {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.4.1 `#EXTINF`} */
    duration?: number;

    /** @see {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.4.1 `#EXTINF`} */
    title?: string;

    /** @see {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.4.3 `#EXT-X-DISCONTINUITY`} */
    discontinuity: boolean;

    /** @see {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.4.6 `#EXT-X-PROGRAM-DATE-TIME`} */
    program_time?: Date | null;

    /** @see {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.4.4 `#EXT-X-KEY`} */
    keys?: AttrList<AttrT.Key>[];

    /** @see {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.4.2 `#EXT-X-BYTERANGE`} */
    byterange?: Byterange;

    /** @see {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.4.5 `#EXT-X-MAP`} */
    map?: AttrList<AttrT.Map>;

    /** @see {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.4.7 `#EXT-X-GAP`} */
    gap?: boolean;

    /** @see {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.4.8 `#EXT-X-BITRATE`} */
    bitrate?: number;

    /** @see {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.4.9 `#EXT-X-PART`} */
    parts?: AttrList<AttrT.Part>[];

    /** Custom vendor-defined properties */
    vendor?: Iterable<[string, string | null]>;

    constructor(obj?: Proto<MediaSegment>);
    constructor(uri: string | typeof URL | undefined, meta: Readonly<MediaSegment>, version?: number);
    // eslint-disable-next-line @typescript-eslint/unified-signatures
    constructor(uri: string | typeof URL | undefined, meta: Proto<MediaSegment>, version?: number);

    constructor(uri?: string | typeof URL | Proto<MediaSegment>, meta?: Proto<MediaSegment>, version?: number) {

        if (URL && uri instanceof URL) {
            uri = uri.href;
        }

        if (uri && typeof uri === 'object') {
            meta = uri;
            uri = meta.uri;
            version = 10000;
        }

        meta = meta || {} as Proto<MediaSegment>;

        this.duration = meta.duration;
        this.title = meta.title;
        this.uri = uri as string;
        this.discontinuity = !!meta.discontinuity;

        // optional
        if (meta.program_time) {
            this.program_time = new Date(meta.program_time);
        }

        if (meta.keys) {
            this.keys = cloneAttrArray(meta.keys);
        }

        if (version! >= 4 && meta.byterange) {
            this.byterange = { ...meta.byterange };
        }

        if (version! >= 5 && meta.map) {
            this.map = new AttrList<AttrT.Map>(meta.map);
        }

        if (meta.bitrate) {
            this.bitrate = meta.bitrate;
        }

        if (meta.gap) {
            this.gap = true; // V8 - ignoreable
        }

        if (meta.parts) {
            this.parts = cloneAttrArray(meta.parts);
        }

        // custom vendor extensions
        if (meta.vendor) {
            if (typeof meta.vendor[Symbol.iterator] !== 'function') {
                // Convert from old style serialized format

                this.vendor = Object.entries(meta.vendor as unknown as { [entry: string]: string });
            }
            else {
                const set = this.vendor = [] as [string, string | null][];
                for (const [ext, value] of meta.vendor) {
                    set.push([ext, value]);
                }
            }
        }
    }

    isPartial(): this is PartialSegment {

        const full = (this.uri || this.uri === '') && this.duration! >= 0;
        return !full;
    }

    rewriteUris(mapFn: UriMapFunction<'segment' | 'segment-key' | 'segment-map' | 'segment-part'>): this {

        rewriteAttrs(mapFn, this.keys, 'segment-key');
        rewriteAttr(mapFn, this.map, 'segment-map');
        rewriteAttrs(mapFn, this.parts, 'segment-part');

        const newUri = mapFn(this.uri, 'segment', this);
        if (isStringish(newUri)) {
            this.uri = newUri!;
        }

        return this;
    }
}


interface FullSegment extends Readonly<MediaSegment> {
    duration: number;
    title: string;
    uri: string;
}


interface PartialSegment extends Readonly<MediaSegment> {
    /** Only used for TS typings. @internal @deprecated */
    readonly __isPartial__: undefined;
}


export type ImmutableMediaSegment = PartialSegment | FullSegment;


export type IndependentSegment = ImmutableMediaSegment & {
    byterange?: Required<Byterange>;
};
