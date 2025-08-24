/// <reference lib="dom" />

import { ImmutableMediaSegment, IndependentSegment, MediaSegment } from './media-segment.ts';
import { ImmutableMainPlaylist, MainPlaylist } from './playlist-main.ts';
import { ImmutableMediaPlaylist, MediaPlaylist } from './playlist-media.ts';


export type { ImmutableMainPlaylist, ImmutableMediaPlaylist, ImmutableMediaSegment, IndependentSegment };
export { MainPlaylist, MediaPlaylist, MediaSegment };

export type M3U8Playlist = MainPlaylist | MediaPlaylist;
