import deserialize from './attr-deserialize.js';
import serialize from './attr-serialize.js';
import { Attr, Byterange, Resolution } from './attr-types.js';

export { Attr as AttrType };
export type { Byterange, Resolution };


type Enum<T extends string> = T | `${T}`;
type StringKeys<T> = Extract<keyof T, string>;

type TypeMapping<T extends Attr> =
    T extends Enum<Attr.BigInt | Attr.HexInt> ? bigint :
        T extends Enum<Attr.Int | Attr.HexNo | Attr.Float | Attr.SignedFloat> ? number :
            T extends Enum<Attr.Enum | Attr.String> ? string :
                T extends Enum<Attr.Resolution> ? Resolution :
                    T extends Enum<Attr.Byterange> ? Byterange :
                        never;

const tokenify = function <T extends string>(attr: T): T {

    if (typeof attr !== 'string') {
        throw new TypeError('Attributes must be a "string"');
    }

    return attr.toLowerCase() as T;
};

export type TAnyAttr = { [key: string]: Attr };

// AttrList's are handled without any implicit knowledge of key/type mapping

// eslint-disable-next-line @typescript-eslint/ban-types
export class AttrList<E extends TAnyAttr = TAnyAttr> extends Map<StringKeys<E>, string> {

    static readonly Types = Attr;

    constructor(attrs?: ImmutableAttrList<E> | string | { readonly [key in StringKeys<E>]?: string } | Map<string, unknown> | ReadonlyArray<ReadonlyArray<string>>);
    constructor(attrs?: AttrList | string | { [key: string]: string } | Map<string, unknown> | Array<Array<string>>) {

        super();

        const set = (key: string, value: unknown, format?: (val: unknown) => string) => {

            if (value !== null && value !== undefined) {
                super.set(key as any, format ? format(value) : <string>value);
            }
        };

        if (attrs instanceof AttrList) {
            for (const [key, value] of attrs) {
                set(key, value);
            }
        }
        else if (typeof attrs === 'string') {

            // TODO: handle newline escapes in quoted-string's

            const re = /(.+?)=((?:\".*?\")|.*?)(?:,|$)/g;
            let match;

            while ((match = re.exec(attrs)) !== null) {
                set(tokenify(match[1]), match[2]);
            }
        }
        else if (!(attrs instanceof Map) && !Array.isArray(attrs)) {
            for (const attr in attrs) {
                set(tokenify(attr), attrs[attr], (val) => `${val || ''}`);
            }
        }
        else {
            for (const [key, value] of attrs) {
                set(tokenify(key), value, (val) => `${val}`);
            }
        }
    }

    get(attr: StringKeys<E>): string | undefined;
    get<K extends StringKeys<E>, T extends E[K]>(attr: K, type: Enum<T>): TypeMapping<T> | undefined;
    get(attr: StringKeys<E>, type: Enum<Attr> = Attr.Enum): unknown | undefined {

        attr = tokenify(attr);

        const stringValue = super.get(attr);
        if (stringValue !== undefined) {
            const formatter = deserialize[type];
            if (!formatter) {
                throw new TypeError('Invalid type: ' + type);
            }

            return formatter(stringValue);
        }

        return stringValue;
    }

    set(attr: StringKeys<E>, value: undefined | null): this;
    set<K extends StringKeys<E>, T extends Attr>(attr: K, value: TypeMapping<T>, type?: Enum<E[K]>): this;
    set(attr: StringKeys<E>, value: unknown, type: Enum<Attr> = Attr.Enum): this {

        attr = tokenify(attr);

        if (value === undefined || value === null) {
            super.delete(attr);
            return this;
        }

        const formatter = serialize[type];
        if (!formatter) {
            throw new TypeError('Invalid type: ' + type);
        }

        const stringValue = formatter(value);
        super.set(attr, stringValue);

        return this;
    }

    has(attr: StringKeys<E>): boolean {

        return super.has(tokenify(attr));
    }

    delete(attr: StringKeys<E>): boolean {

        return super.delete(tokenify(attr));
    }

    toString(): string {

        let res = '';

        for (const [key, value] of this) {
            const comma = (res.length !== 0) ? ',' : '';
            res += `${comma}${key.toUpperCase()}=${value}`;
        }

        return res;
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    toJSON(): object {

        const obj = Object.create(null);

        for (const [key, value] of this) {
            obj[key as string] = value;
        }

        return obj;
    }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ImmutableAttrList<T extends TAnyAttr = TAnyAttr> extends Pick<AttrList<T>, keyof ReadonlyMap<any, any>> {}
