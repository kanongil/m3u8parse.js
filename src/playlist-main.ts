import type * as AttrT from './attr-types.ts';

import { AttrList } from './attrlist.ts';
import { BasePlaylist, cloneAttrArray, cloneAttrMap, ImmutableUriMapFunction, Immutify, IRewritableUris, isStringish, rewriteAttrs, rewriteMappedAttrs, UriMapFunction } from './playlist-base.ts';
import { MediaPlaylist } from './playlist-media.ts';
import type { Proto } from './types.ts';


interface Variant {
    uri: string;
    info?: AttrList<AttrT.StreamInf> | undefined;
}

export type EntryType = 'variant' | 'iframe' | 'group' | 'data' | 'session-key';

export class MainPlaylist extends BasePlaylist implements IRewritableUris {

    static cast(index: MediaPlaylist | MainPlaylist): MainPlaylist | never {

        if (!index.master) {
            throw new Error('Cannot cast a media playlist');
        }

        return index as MainPlaylist;
    }

    override readonly master = true as const;

    /** @see {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.6.1 `EXT-X-MEDIA`} */
    groups: Map<string, AttrList<AttrT.Media>[]>;

    /** @see {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.6.2 `EXT-X-STREAM-INF`} */
    variants: Variant[];

    /** @see {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.6.3 `EXT-X-I-FRAME-STREAM-INF`} */
    iframes: AttrList<AttrT.IFrameStreamInf>[];

    /** @see {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.6.4 `EXT-X-SESSION-DATA`} */
    data: Map<string, AttrList<AttrT.SessionData>[]>;

    /** @see {@link https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis-16#section-4.4.6.5 `EXT-X-SESSION-KEY`} */
    session_keys: AttrList<AttrT.SessionKey>[];

    constructor(obj?: Proto<MainPlaylist | ImmutableMainPlaylist>);
    constructor(obj?: Proto<ImmutableMainPlaylist>) {

        obj ??= {};

        super(obj);

        if (obj.master !== undefined && !!obj.master !== this.master) {
            throw new Error('Cannot create from media playlist');
        }

        this.variants = obj.variants?.map((variant) => ({ uri: variant.uri, info: new AttrList(variant.info) })) ?? [];
        this.groups = cloneAttrMap(obj.groups);
        this.iframes = cloneAttrArray(obj.iframes);
        this.data = cloneAttrMap(obj.data);
        this.session_keys = cloneAttrArray(obj.session_keys);
    }

    rewriteUris(mapFn: UriMapFunction<EntryType>): this {

        for (const variant of this.variants) {
            const newUri = mapFn(variant.uri, 'variant', variant);
            if (isStringish(newUri)) {
                variant.uri = newUri!;
            }
        }

        rewriteAttrs(mapFn, this.iframes, 'iframe');
        rewriteMappedAttrs(mapFn, this.groups, 'group');
        rewriteMappedAttrs(mapFn, this.data, 'data');
        rewriteAttrs(mapFn, this.session_keys, 'session-key');

        return this;
    }
}

interface _ImmutableMain extends MainPlaylist {
    rewriteUris(mapFn: ImmutableUriMapFunction<EntryType>): this;
}

export type ImmutableMainPlaylist = Immutify<_ImmutableMain>;
