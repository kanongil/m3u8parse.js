import { Attr, Byterange, Resolution } from './attr-types.ts';


const deserialize = {
    [Attr.BigInt](stringValue: string): bigint {

        const intValue = BigInt(stringValue);

        if (/^\s*0[^\d]/.test(stringValue)) {
            throw new SyntaxError('Representation is not decimal integer compatible');
        }

        return intValue;
    },

    [Attr.HexInt](stringValue: string): bigint {

        const intValue = BigInt(stringValue);

        if (!/^\s*0x/.test(stringValue)) {
            throw new SyntaxError('Representation is not hexadecimal integer compatible');
        }

        return intValue;
    },

    [Attr.Int](stringValue: string): number {

        const intValue = parseInt(stringValue, 10);
        if (intValue > Number.MAX_SAFE_INTEGER) {
            return Number.POSITIVE_INFINITY;
        }

        return intValue;
    },

    [Attr.HexNo](stringValue: string): number {

        const intValue = parseInt(stringValue, 16);
        if (intValue > Number.MAX_SAFE_INTEGER) {
            return Number.POSITIVE_INFINITY;
        }

        return intValue;
    },

    [Attr.Float](stringValue: string): number {

        return parseFloat(stringValue);
    },

    [Attr.SignedFloat](stringValue: string): number {

        return parseFloat(stringValue);
    },

    [Attr.String](stringValue: string): string {

        return stringValue.slice(1, -1);
    },

    [Attr.Enum](stringValue: string): string {

        return stringValue;
    },

    [Attr.List](stringValue: string): string[] {

        const list = deserialize[Attr.String](stringValue);
        return list.split(',');
    },

    [Attr.Resolution](stringValue: string): Resolution | undefined {

        const res = /^(\d+)x(\d+)$/.exec(stringValue);
        if (res === null) {
            return undefined;
        }

        return { width: parseInt(res[1], 10), height: parseInt(res[2], 10) };
    },

    [Attr.Byterange](stringValue: string): Byterange | undefined {

        const res = /^"?(\d+)(?:@(\d+))?"?$/.exec(stringValue);
        if (res === null) {
            return undefined;
        }

        return {
            offset: res[2] !== undefined ? parseInt(res[2], 10) : undefined,
            length: parseInt(res[1], 10)
        };
    }
};

type MustExtend<T, E> = T extends E ? T : never;

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export default deserialize as MustExtend<typeof deserialize, Record<Attr, (stringValue: string) => unknown>>;
