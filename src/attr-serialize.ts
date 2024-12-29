import { Attr, Byterange, Resolution } from './attr-typings.js';


const serialize: Record<Attr, (value: any) => string> = {
    [Attr.BigInt](value: number | bigint): string {

        return BigInt(value!).toString(10);
    },

    [Attr.HexInt](value: number | bigint): string {

        return '0x' + BigInt(value!).toString(16);
    },

    [Attr.Int](value: number | bigint): string {

        return serialize[Attr.BigInt](value);
    },

    [Attr.HexNo](value: number | bigint): string {

        return serialize[Attr.HexInt](value);
    },

    [Attr.Float](value: number | bigint): string {

        return value.toString();
    },

    [Attr.SignedFloat](value: number | bigint): string {

        return value.toString();
    },

    [Attr.String](value: string): string {

        return `"${value}"`;
    },

    [Attr.Enum](value: string): string {

        return value.toString();
    },

    [Attr.Resolution](value: Resolution): string {

        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        return '' + Math.floor(value?.width!) + 'x' + Math.floor(value?.height!);
    },

    [Attr.Byterange](value: Byterange): string {

        const base = `"${Math.floor(value?.length ?? 0)}`;
        return base + (value?.offset === undefined ? '"' : `@${Math.floor(value.offset)}"`);
    }
};

export default serialize;
