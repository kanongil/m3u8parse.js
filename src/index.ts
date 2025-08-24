import { M3U8Parser, PlaylistType } from './parser.ts';

import type { ParserOptions } from './parser.ts';
import type { M3U8Playlist, MainPlaylist, MediaPlaylist } from './playlist.ts';

export { AttrList } from './attrlist.ts';
export { ParserError, PlaylistType } from './parser.ts';
export { MainPlaylist, MediaPlaylist, MediaSegment } from './playlist.ts';

export type { ParserOptions } from './parser.ts';
export type { IndependentSegment, M3U8Playlist } from './playlist.ts';


export interface ParseOptions extends ParserOptions {
    type?: PlaylistType | `${PlaylistType}`;
}


export default function (input: string, options?: ParseOptions & { type: PlaylistType.Main | 'main' }): MainPlaylist;
export default function (input: string, options?: ParseOptions & { type: PlaylistType.Media | 'media' }): MediaPlaylist;
export default function (input: string, options?: ParseOptions): M3U8Playlist;

export default function (input: string, options: ParseOptions = {}): M3U8Playlist {

    if (typeof input !== 'string') {
        throw new TypeError('Passed input must be a string');
    }

    if (options.type && (options.type !== PlaylistType.Main && options.type !== PlaylistType.Media)) {
        throw new TypeError(`Passed type must be "${PlaylistType.Main}" or "${PlaylistType.Media}"`);
    }

    const parser = new M3U8Parser(options);

    const lines = input.split(/\r?\n/);
    if (lines[0] === '') {
        lines.shift();
    }

    for (const line of lines) {
        parser.feed(line);
    }

    return parser.finalize(options.type);
}

