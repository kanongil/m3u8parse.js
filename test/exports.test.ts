import { expect } from '@hapi/code';
import { describe, it } from 'mocha';

import * as M3U8Parse from 'm3u8parse';
import * as AttrList from 'm3u8parse/attrlist';
import * as Playlist from 'm3u8parse/playlist';


it('has required exports for', () => {

    describe('M3U8Parse', () => {

        expect(M3U8Parse).to.contain([
            'AttrList',
            'MainPlaylist',
            'MediaPlaylist',
            'MediaSegment',
            'ParserError',
            'default'
        ]);
    });

    describe('AttrList', () => {

        expect(AttrList).to.contain([
            'AttrList'
        ]);
    });

    describe('Playlist', () => {

        expect(Playlist).to.contain([
            'MainPlaylist',
            'MediaPlaylist',
            'MediaSegment'
        ]);
    });
});
