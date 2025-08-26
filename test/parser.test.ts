import { createReadStream } from 'fs';
import Fs from 'fs/promises';

import { expect } from '@hapi/code';
import { describe, it } from 'mocha';

import M3U8Parse, { MediaPlaylist, ParserError } from '../lib/index.node.js';

const fixtureBase = new URL('../test/fixtures/', import.meta.url);


describe('M3U8Parse', () => {

    it('should parse a valid live file', async () => {

        const stream = createReadStream(new URL('enc.m3u8', fixtureBase));
        const index = await M3U8Parse(stream);

        expect(index).to.exist();
        expect(index.master).to.be.false();
    });

    it('supports buffer input', async () => {

        const buf = await Fs.readFile(new URL('enc.m3u8', fixtureBase));
        const index = M3U8Parse(buf);

        expect(index).to.exist();
        expect(index.master).to.be.false();
    });

    it('supports string input', async () => {

        const str = await Fs.readFile(new URL('enc.m3u8', fixtureBase), 'utf-8');
        const index = M3U8Parse(str);

        expect(index).to.exist();
        expect(index.master).to.be.false();
    });

    it('throws a ParserError for empty input', () => {

        expect(() => M3U8Parse('')).to.throw(ParserError, 'No line data');
    });

    it('should parse a valid VOD file', async () => {

        const stream = createReadStream(new URL('vod.m3u8', fixtureBase));
        const index = await M3U8Parse(stream);
        expect(index).to.exist();
        expect(index.master).to.be.false();
    });

    it('should parse a basic master file', async () => {

        const stream = createReadStream(new URL('variant.m3u8', fixtureBase));
        const index = await M3U8Parse(stream);
        expect(index).to.exist();
        expect(index.master).to.be.true();
    });

    it('should parse an advanced master file', async () => {

        const stream = createReadStream(new URL('variant_v4.m3u8', fixtureBase));
        const index = await M3U8Parse(stream);
        expect(index).to.exist();
        expect(index.master).to.be.true();
    });

    it('should parse a v6 master file', async () => {

        const stream = createReadStream(new URL('variant_v6.m3u8', fixtureBase));
        const index = await M3U8Parse(stream);
        expect(index).to.exist();
        expect(index.master).to.be.true();
    });

    it('should parse an iframe master file', async () => {

        const stream = createReadStream(new URL('variant_iframe.m3u8', fixtureBase));
        const index = await M3U8Parse(stream);
        expect(index).to.exist();
        expect(index.master).to.be.true();
    });

    it('should handle vendor extensions', async () => {

        const stream = createReadStream(new URL('enc.m3u8', fixtureBase));
        const index = await M3U8Parse(stream, { type: 'media', extensions: { '#EXT-X-UNKNOWN-EXTENSION': false, '#EXT-Y-META-EXTENSION': true } });
        expect(index).to.exist();

        expect(index.vendor).to.equal([['#EXT-X-UNKNOWN-EXTENSION', null]]);
        expect(index.segments[2].vendor).to.equal([['#EXT-Y-META-EXTENSION', 'w00t']]);

        const index2 = new MediaPlaylist(index);
        expect(index2.vendor).to.equal([['#EXT-X-UNKNOWN-EXTENSION', null]]);
        expect(index2.segments[2].vendor).to.equal([['#EXT-Y-META-EXTENSION', 'w00t']]);
    });

    it('should fail on invalid files', async () => {

        const stream = createReadStream(new URL('empty.m3u8', fixtureBase));
        await expect(M3U8Parse(stream)).to.reject(ParserError);
    });

    it('throws a ParserError for duplicate attribute list keys', () => {

        const err = expect(() => M3U8Parse('#EXTM3U\n#EXT-X-SKIP:ABC=1,ABC=2')).to.throw(ParserError, 'Ext parsing failed');
        expect(err.cause).to.be.an.error('Duplicate attribute key: abc');
    });
});
