import { Attr, Byterange, Resolution } from './attr-types.ts';


const deserialize: Record<Attr, (stringValue: string) => any> = {
    [Attr.BigInt](stringValue): bigint {

        const intValue = BigInt(stringValue);

        if (/^\s*0[^\d]/.test(stringValue)) {
            throw new SyntaxError('Representation is not decimal integer compatible');
        }

        return intValue;
    },

    [Attr.HexInt](stringValue): bigint {

        const intValue = BigInt(stringValue!);

        if (!/^\s*0x/.test(stringValue)) {
            throw new SyntaxError('Representation is not hexadecimal integer compatible');
        }

        return intValue;
    },

    [Attr.Int](stringValue): number {

        const intValue = parseInt(stringValue, 10);
        if (intValue > Number.MAX_SAFE_INTEGER) {
            return Number.POSITIVE_INFINITY;
        }

        return intValue;
    },

    [Attr.HexNo](stringValue): number {

        const intValue = parseInt(stringValue, 16);
        if (intValue > Number.MAX_SAFE_INTEGER) {
            return Number.POSITIVE_INFINITY;
        }

        return intValue;
    },

    [Attr.Float](stringValue): number {

        return parseFloat(stringValue);
    },

    [Attr.SignedFloat](stringValue): number {

        return parseFloat(stringValue);
    },

    [Attr.String](stringValue): string | undefined {

        return stringValue.slice(1, -1);
    },

    [Attr.Enum](stringValue): string {

        return stringValue;
    },

    [Attr.List](stringValue): string[] {

        const list = deserialize[Attr.String](stringValue);
        return list.split(',');
    },

    [Attr.Resolution](stringValue): Resolution | undefined {

        const res = /^(\d+)x(\d+)$/.exec(stringValue);
        if (res === null) {
            return undefined;
        }

        return { width: parseInt(res[1], 10), height: parseInt(res[2], 10) };
    },

    [Attr.Byterange](stringValue): Byterange | undefined {

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

export default deserialize;
