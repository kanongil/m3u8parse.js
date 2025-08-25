interface BufferIntf {
    isBuffer(obj: unknown): boolean;
}

interface StreamImpl {
    new(): StreamImpl & StreamLike;
    setEncoding(e: string): void;
    [Symbol.asyncIterator]: () => AsyncIterator<string>;
}

const { Buffer } = await import('node:' + 'buffer') as { Buffer: BufferIntf };
const { Stream } = await import('node:' + 'stream') as { Stream: StreamImpl };

import { M3U8Parser, PlaylistType } from './parser.ts';

import type { M3U8Playlist, MainPlaylist, MediaPlaylist } from './playlist.ts';

import parseString, { ParseOptions } from './index.ts';


export * from './index.ts';


interface BufferLike extends Uint8Array {
    toString(encoding?: string, start?: number, end?: number): string;

    // Unique methods that distinguish a Buffer from a plain Uint8Array

    equals(otherBuffer: Uint8Array): boolean;
}

interface StreamLike {
    pipe(destination: any, options?: any): any;

    // A few EventListener methods

    addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    emit(event: string | symbol, ...args: any[]): boolean;
}


const parseStream = async function (stream: typeof Stream, options: ParseOptions): Promise<M3U8Playlist> {

    const parser = new M3U8Parser(options);

    stream.setEncoding('utf-8');

    let saved = '';
    for await (const input of stream) {
        const lines = (saved + input).split(/\r?\n/);

        let i;
        for (i = 0; i < lines.length - 1; ++i) {
            parser.feed(lines[i]);
        }

        saved = lines[i];
    }

    parser.feed(saved);

    return parser.finalize(options.type);
};


export default function (input: string | BufferLike, options?: ParseOptions & { type: PlaylistType.Main | 'main' }): MainPlaylist;
export default function (input: string | BufferLike, options?: ParseOptions & { type: PlaylistType.Media | 'media' }): MediaPlaylist;
export default function (input: string | BufferLike, options?: ParseOptions): M3U8Playlist;
export default function (input: StreamLike, options?: ParseOptions & { type: PlaylistType.Main | 'main' }): Promise<MainPlaylist>;
export default function (input: StreamLike, options?: ParseOptions & { type: PlaylistType.Media | 'media' }): Promise<MediaPlaylist>;
export default function (input: StreamLike, options?: ParseOptions): Promise<M3U8Playlist>;

export default function (input: StreamLike | string | BufferLike, options: ParseOptions = {}): Promise<M3U8Playlist> | M3U8Playlist {

    if (!(input instanceof Stream) && typeof input !== 'string' && !Buffer.isBuffer(input)) {
        throw new TypeError('Passed input must be a stream, string, or buffer');
    }

    if (options.type && (options.type !== PlaylistType.Main && options.type !== PlaylistType.Media)) {
        throw new TypeError(`Passed type must be "${PlaylistType.Main}" or "${PlaylistType.Media}"`);
    }

    if (input instanceof Stream) {
        return parseStream(input, options);
    }

    input = Buffer.isBuffer(input) ? (input as BufferLike).toString('utf-8') : input as string;
    return parseString(input, options);
}
