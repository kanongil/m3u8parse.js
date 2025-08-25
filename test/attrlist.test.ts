import { expect } from '@hapi/code';
import { describe, it } from 'mocha';

import { AttrList, AttrType } from '../lib/attrlist.js';

describe('AttrList', () => {

    describe('constructor()', () => {

        it('supports empty arguments', () => {

            const empty = new AttrList('');
            expect(new AttrList()).to.equal(empty);
            expect(new AttrList({})).to.equal(empty);
            expect(new AttrList(undefined)).to.equal(empty);
        });

        it('supports Map argument', () => {

            const map = new Map([['value', '42']]);
            const list = new AttrList(map);
            expect(list.get('VALUE', 'int')).to.equal(42);
            expect(list.size).to.equal(1);
        });

        it('supports mappable array argument', () => {

            const list = new AttrList([['value', '42'], ['null', null], ['UNDEFINED'], ['EMPTY', '']] as any);
            expect(list.get('VALUE', 'int')).to.equal(42);
            expect(list.get('empty', 'enum')).to.equal('');
            expect(list.size).to.equal(2);
        });

        it('supports object argument', () => {

            const obj = { value: '42', null: null, UNDEFINED: undefined, EMPTY: '' };
            const list = new AttrList(obj as any);
            expect(list.get('VALUE', 'int')).to.equal(42);
            expect(list.get('empty', 'enum')).to.equal('');
            expect(list.size).to.equal(2);
        });

        it('creates a copy', () => {

            const orig = new AttrList('A=B');
            const copy = new AttrList(orig);
            expect(copy).to.equal(orig);
        });

        it('does not copy null and undefined attrs', () => {

            // TODO
        });
    });

    it('toString() has valid output', () => {

        const list = new AttrList('INT=42,HEX=0x42,FLOAT=0.42,STRING="hi",ENUM=OK,RES=4x2');
        expect(list.toString()).to.equal('INT=42,HEX=0x42,FLOAT=0.42,STRING="hi",ENUM=OK,RES=4x2');
        list.set('extra', 123, 'int');
        expect(list.toString()).to.equal('INT=42,HEX=0x42,FLOAT=0.42,STRING="hi",ENUM=OK,RES=4x2,EXTRA=123');
        list.set('extra', null);
        expect(list.toString()).to.equal('INT=42,HEX=0x42,FLOAT=0.42,STRING="hi",ENUM=OK,RES=4x2');
    });


    describe('iterator', () => {

        it('works', () => {

            const attrs = new AttrList({ a: 'ok' });
            for (const [entry, value] of attrs.entries()) {
                new AttrList().set(entry, value.toUpperCase());
            }
        });
    });

    describe('method', () => {

        const list = new AttrList('BIGINT=42,HEXINT=0x42,INT=42,HEXNO=0x42,FLOAT=0.42,SIGNED-FLOAT=-0.42,STRING="hi",ENUM=OK,RESOLUTION=4x2,BYTERANGE="20@10"');
        const types: [any, any][] = [
            ['bigint', BigInt(42)],
            ['hexint', BigInt(66)],
            ['int', 42],
            ['hexno', 66],
            ['enum', 'OK'],
            ['string', 'hi'],
            ['float', 0.42],
            ['signed-float', -0.42],
            ['resolution', { width: 4, height: 2 }],
            ['byterange', { offset: 10, length: 20 }]
        ];

        describe('#get()', () => {

            it('handles all known types', () => {

                for (const [type, value] of types) {
                    expect(list.get(type, type as 'enum')).to.equal(value);
                }
            });

            it('returns "undefined" when attr is not present', () => {

                const empty = new AttrList();
                for (const [type] of types) {
                    expect(empty.get(type, type as 'enum')).to.be.undefined();
                }
            });

            it('fails on unknown types', () => {

                expect(() => list.get('int', 'b' as 'enum')).to.throw('Invalid type: b');
            });

            it('fails on non-string attributes', () => {

                expect(() => list.get(undefined as any)).to.throw('Attributes must be a "string"');
                expect(() => list.get({} as any)).to.throw('Attributes must be a "string"');
                expect(() => list.get(Symbol() as any)).to.throw('Attributes must be a "string"');
            });
        });

        describe('#set()', () => {

            it('handles all known types', () => {

                const attrs = new AttrList();
                for (const [type, value] of types) {
                    attrs.set(type, value, type as 'enum');
                }

                expect(attrs).to.equal(list);
            });

            it('fails on unknown types', () => {

                expect(() => list.set('int', 42, 'b' as 'int')).to.throw('Invalid type: b');
            });

            it('handles falsy types', () => {

                const attrs = new AttrList();

                attrs.set('a', '');
                expect(attrs.get('a')).to.equal('');

                attrs.set('a', 0);
                expect(attrs.get('a')).to.equal('0');

                attrs.set('a', -0);
                expect(attrs.get('a')).to.equal('0');

                attrs.set('a', BigInt(0));
                expect(attrs.get('a')).to.equal('0');

                attrs.set('a', false as any);
                expect(attrs.get('a')).to.equal('false');

                attrs.set('a', Number.NaN);
                expect(attrs.get('a')).to.equal('NaN');
            });

            it('deletes attr when null or undefined', () => {

                expect(list.has('string')).to.be.true();
                list.set('string', null);
                expect(list.has('string')).to.be.false();

                expect(list.has('enum')).to.be.true();
                list.set('enum', undefined);
                expect(list.has('enum')).to.be.false();
            });

            it('fails on non-string attributes', () => {

                expect(() => new AttrList().set(undefined as any, 'a')).to.throw('Attributes must be a "string"');
                expect(() => new AttrList().set({} as any, 'a')).to.throw('Attributes must be a "string"');
                expect(() => new AttrList().set(Symbol() as any, 'a')).to.throw('Attributes must be a "string"');
            });
        });

        describe('#has()', () => {

            it('returns whether entry exists', () => {

                const attrs = new AttrList('A=B');

                expect(attrs.has('a')).to.be.true();
                expect(attrs.has('A')).to.be.true();
                expect(attrs.has('b')).to.be.false();
            });

            it('fails on non-string attributes', () => {

                expect(() => new AttrList('A=B').has(undefined as any)).to.throw('Attributes must be a "string"');
                expect(() => new AttrList('A=B').has({} as any)).to.throw('Attributes must be a "string"');
                expect(() => new AttrList('A=B').has(Symbol() as any)).to.throw('Attributes must be a "string"');
            });
        });

        describe('#delete()', () => {

            it('removes the entry if it exists', () => {

                let attrs = new AttrList('A=B');
                expect(attrs.delete('a')).to.be.true();
                expect(attrs.size).to.equal(0);

                attrs = new AttrList('A=B');
                expect(attrs.delete('A')).to.be.true();
                expect(attrs.size).to.equal(0);

                attrs = new AttrList('A=B');
                expect(attrs.delete('B')).to.be.false();
                expect(attrs.size).to.equal(1);
            });

            it('fails on non-string attributes', () => {

                expect(() => new AttrList('A=B').delete(undefined as any)).to.throw('Attributes must be a "string"');
                expect(() => new AttrList('A=B').delete({} as any)).to.throw('Attributes must be a "string"');
                expect(() => new AttrList('A=B').delete(Symbol() as any)).to.throw('Attributes must be a "string"');
            });
        });
    });

    describe('parsing', () => {

        it('parses valid decimalInteger attribute', () => {

            expect(new AttrList('INT=42').get('INT', 'int')).to.equal(42);
            expect(new AttrList('INT=0').get('INT', 'int')).to.equal(0);
        });

        it('parses valid hexadecimalInteger attribute', () => {

            expect(new AttrList('HEX=0x42').get('HEX', 'hexno')).to.equal(0x42);
            expect(new AttrList('HEX=0x0').get('HEX', 'hexno')).to.equal(0);
        });

        it('parses valid decimalFloatingPoint attribute', () => {

            expect(new AttrList('FLOAT=42.0').get('FLOAT', 'float')).to.equal(42.0);
            expect(new AttrList('FLOAT=0.42').get('FLOAT', 'float')).to.equal(0.42);
            expect(new AttrList('FLOAT=0').get('FLOAT', 'float')).to.equal(0);
        });

        it('parses valid signedDecimalFloatingPoint attribute', () => {

            expect(new AttrList('FLOAT=42.0').get('FLOAT', 'signed-float')).to.equal(42.0);
            expect(new AttrList('FLOAT=-42.0').get('FLOAT', 'signed-float')).to.equal(-42.0);
            expect(new AttrList('FLOAT=0.42').get('FLOAT', 'signed-float')).to.equal(0.42);
            expect(new AttrList('FLOAT=-0.42').get('FLOAT', 'signed-float')).to.equal(-0.42);
            expect(new AttrList('FLOAT=0').get('FLOAT', 'signed-float')).to.equal(0);
            expect(new AttrList('FLOAT=-0').get('FLOAT', 'signed-float')).to.equal(-0);
        });

        it('parses valid quotedString attribute', () => {

            expect(new AttrList('STRING="hi"').get('STRING', 'string')).to.equal('hi');
            expect(new AttrList('STRING=""').get('STRING', 'string')).to.equal('');
        });

        it('parses exotic quotedString attribute', () => {

            const list = new AttrList('STRING="hi,ENUM=OK,RES=4x2"');
            expect(list.get('STRING', 'string')).to.equal('hi,ENUM=OK,RES=4x2');
            expect(list.size).to.equal(1);
        });

        it('parses valid enumeratedString attribute', () => {

            expect(new AttrList('ENUM=OK').get('ENUM', 'enum')).to.equal('OK');
        });

        it('parses valid Attr.List attribute', () => {

            expect(new AttrList('LIST="ABC,DEF"').get('LIST', 'list')).to.equal(['ABC', 'DEF']);
            expect(new AttrList('LIST=""').get('LIST', 'list')).to.equal(['']);
        });

        it('parses exotic enumeratedString attribute', () => {

            expect(new AttrList('ENUM=1').get('ENUM', 'enum')).to.equal('1');
            expect(new AttrList('ENUM=A=B').get('ENUM', 'enum')).to.equal('A=B');
            expect(new AttrList('ENUM=A=B=C').get('ENUM', 'enum')).to.equal('A=B=C');
            const list = new AttrList('ENUM1=A=B=C,ENUM2=42');
            expect(list.get('ENUM1', 'enum')).to.equal('A=B=C');
            expect(list.get('ENUM2', 'enum')).to.equal('42');
        });

        it('parses valid decimalResolution attribute', () => {

            expect(new AttrList('RES=400x200').get('RES', 'resolution')).to.equal({ width: 400, height: 200 });
            expect(new AttrList('RES=0x0').get('RES', 'resolution')).to.equal({ width: 0, height: 0 });
        });

        it('handles invalid decimalResolution attribute', () => {

            expect(new AttrList('RES=400x-200').get('RES', 'resolution')).to.equal(undefined);
            expect(new AttrList('RES=400.5x200').get('RES', 'resolution')).to.equal(undefined);
            expect(new AttrList('RES=400x200.5').get('RES', 'resolution')).to.equal(undefined);
            expect(new AttrList('RES=400').get('RES', 'resolution')).to.equal(undefined);
            expect(new AttrList('RES=400x').get('RES', 'resolution')).to.equal(undefined);
            expect(new AttrList('RES=x200').get('RES', 'resolution')).to.equal(undefined);
            expect(new AttrList('RES=x').get('RES', 'resolution')).to.equal(undefined);
        });

        it('parses valid decimalByterange attribute', () => {

            expect(new AttrList('RANGE="400@0"').get('RANGE', 'byterange')).to.equal({ offset: 0, length: 400 });
            expect(new AttrList('RANGE="0@42"').get('RANGE', 'byterange')).to.equal({ offset: 42, length: 0 });
            expect(new AttrList('RANGE="100"').get('RANGE', 'byterange')).to.equal({ offset: undefined, length: 100 });
        });

        it('parses unqouted decimalByterange attribute', () => {

            expect(new AttrList('RANGE=400@0').get('RANGE', 'byterange')).to.equal({ offset: 0, length: 400 });
            expect(new AttrList('RANGE=0@42').get('RANGE', 'byterange')).to.equal({ offset: 42, length: 0 });
            expect(new AttrList('RANGE=100').get('RANGE', 'byterange')).to.equal({ offset: undefined, length: 100 });
        });

        it('handles invalid decimalByterange attribute', () => {

            expect(new AttrList('RANGE=').get('RANGE', 'byterange')).to.equal(undefined);
            expect(new AttrList('RANGE=""').get('RANGE', 'byterange')).to.equal(undefined);
            expect(new AttrList('RANGE="50.5"').get('RANGE', 'byterange')).to.equal(undefined);
            expect(new AttrList('RANGE="-50"').get('RANGE', 'byterange')).to.equal(undefined);
            expect(new AttrList('RANGE="50@"').get('RANGE', 'byterange')).to.equal(undefined);
            expect(new AttrList('RANGE="50@-10"').get('RANGE', 'byterange')).to.equal(undefined);
            expect(new AttrList('RANGE="@"').get('RANGE', 'byterange')).to.equal(undefined);
            expect(new AttrList('RANGE="@0"').get('RANGE', 'byterange')).to.equal(undefined);
        });

        it('parses multiple attributes', () => {

            const list = new AttrList('INT=42,HEX=0x42,FLOAT=0.42,STRING="hi",ENUM=OK,RES=4x2');
            expect(list.get('INT', 'int')).to.equal(42);
            expect(list.get('HEX', 'hexno')).to.equal(0x42);
            expect(list.get('FLOAT', 'float')).to.equal(0.42);
            expect(list.get('STRING', 'string')).to.equal('hi');
            expect(list.get('ENUM', 'enum')).to.equal('OK');
            expect(list.get('RES', 'resolution')).to.equal({ width: 4, height: 2 });
            expect(list.size).to.equal(6);
        });

        it('parses dashed attribute names', () => {

            const list = new AttrList('INT-VALUE=42,H-E-X=0x42,-FLOAT=0.42,STRING-="hi",ENUM=OK');
            expect(list.get('INT-VALUE', 'int')).to.equal(42);
            expect(list.get('H-E-X', 'hexno')).to.equal(0x42);
            expect(list.get('-FLOAT', 'float')).to.equal(0.42);
            expect(list.get('STRING-', 'string')).to.equal('hi');
            expect(list.get('ENUM', 'enum')).to.equal('OK');
            expect(list.size).to.equal(5);
        });

        it('handles decimalInteger conversions', () => {

            const list = new AttrList('INT1=1234567890123456789,INT2=123,INT3=0,HEX=0x123');
            expect(list.get('INT1', 'bigint')).to.equal(BigInt('1234567890123456789'));
            expect(list.get('INT2', 'bigint')).to.equal(BigInt(123));
            expect(list.get('INT3', 'bigint')).to.equal(BigInt(0));

            expect(() => list.get('HEX', 'bigint')).to.throw(SyntaxError);
        });

        it('handles hexadecimalInteger conversions', () => {

            const list = new AttrList('HEX1=0x0123456789abcdef0123456789abcdef,HEX2=0x123,HEX3=0x0,INT=123');
            expect(list.get('HEX1', 'hexint')).to.equal(BigInt('0x0123456789abcdef0123456789abcdef'));
            expect(list.get('HEX2', 'hexint')).to.equal(BigInt(0x123));
            expect(list.get('HEX3', 'hexint')).to.equal(BigInt(0));

            expect(() => list.get('INT', 'hexint')).to.throw(SyntaxError);
        });

        it('returns infinity on large number conversions', () => {

            const list = new AttrList('VAL=1234567890123456789,HEX=0x0123456789abcdef0123456789abcdef');
            expect(list.get('VAL', 'int')).to.equal(Infinity);
            expect(list.get('HEX', 'hexno')).to.equal(Infinity);
        });

        it('throws on duplicate attribute keys', () => {

            expect(() => {

                new AttrList('VAL=1,VAL=2');
            }).to.throw();
        });
    });

    describe('encoding', () => {

        const encode = function (type: AttrType, value: any) {

            const list = new AttrList();
            list.set('VALUE', value, type);
            return list.get('value', AttrList.Types.Enum);
        };

        it('encodes valid AttrType.Int attribute', () => {

            expect(encode(AttrType.Int, 42)).to.equal('42');
            expect(encode(AttrType.Int, 0)).to.equal('0');
        });

        it('encodes valid AttrType.HexNo attribute', () => {

            expect(encode(AttrType.HexNo, 0x42)).to.equal('0x42');
            expect(encode(AttrType.HexNo, 0x0)).to.equal('0x0');
        });

        it('encodes valid AttrType.Float attribute', () => {

            expect(encode(AttrType.Float, 42.5)).to.equal('42.5');
            expect(encode(AttrType.Float, 0.42)).to.equal('0.42');
            expect(encode(AttrType.Float, 0)).to.equal('0');
        });

        it('encodes valid AttrType.SignedFloat attribute', () => {

            expect(encode(AttrType.SignedFloat, 42.5)).to.equal('42.5');
            expect(encode(AttrType.SignedFloat, 0.42)).to.equal('0.42');
            expect(encode(AttrType.SignedFloat, -0.42)).to.equal('-0.42');
            expect(encode(AttrType.SignedFloat, 0)).to.equal('0');
            expect(encode(AttrType.SignedFloat, -0)).to.equal('0');
        });

        it('encodes valid AttrType.String attribute', () => {

            expect(encode(AttrType.String, 'hi')).to.equal('"hi"');
            expect(encode(AttrType.String, '')).to.equal('""');
        });

        it('encodes exotic AttrType.String attribute', () => {

            expect(encode(AttrType.String, 'hi,ENUM=OK,RES=4x2')).to.equal('"hi,ENUM=OK,RES=4x2"');
        });

        it('encodes valid AttrType.Enum attribute', () => {

            expect(encode(AttrType.Enum, 'OK')).to.equal('OK');
        });

        it('encodes exotic AttrType.Enum attribute', () => {

            expect(encode(AttrType.Enum, '1')).to.equal('1');
            expect(encode(AttrType.Enum, 'A=B')).to.equal('A=B');
            expect(encode(AttrType.Enum, 'A=B=C')).to.equal('A=B=C');
        });

        it('encodes valid AttrType.List attribute', () => {

            expect(encode(AttrType.List, ['ABC','DEF'])).to.equal('"ABC,DEF"');
            expect(encode(AttrType.List, [' '])).to.equal('" "');
            expect(encode(AttrType.List, [])).to.equal('""');
        });

        it('encodes exotic AttrType.List attribute', () => {

            expect(encode(AttrType.List, [false, 123, {}])).to.equal('"false,123,[object Object]"');
            expect(encode(AttrType.List, [null, undefined])).to.equal('","');
            expect(encode(AttrType.List, 'abc')).to.equal('"a,b,c"');
            expect(encode(AttrType.List, 0)).to.equal('"<INVALID INPUT>"');
        });

        it('encodes valid AttrType.Resolution attribute', () => {

            expect(encode(AttrType.Resolution, { width: 400, height: 200 })).to.equal('400x200');
            expect(encode(AttrType.Resolution, { width: 0, height: 0 })).to.equal('0x0');
        });

        it('handles invalid AttrType.Resolution attribute', () => {

            expect(encode(AttrType.Resolution, {})).to.equal('NaNxNaN');
        });

        it('encodes valid AttrType.Byterange attribute', () => {

            expect(encode(AttrType.Byterange, { offset: 400, length: 200 })).to.equal('"200@400"');
            expect(encode(AttrType.Byterange, { length: 200 })).to.equal('"200"');
            expect(encode(AttrType.Byterange, {})).to.equal('"0"');
        });

        it('handles AttrType.BigInt conversions', () => {

            expect(encode(AttrType.BigInt, BigInt('1234567890123456789'))).to.equal('1234567890123456789');
            expect(encode(AttrType.BigInt, 123)).to.equal('123');
            expect(encode(AttrType.BigInt, '123')).to.equal('123');
            expect(encode(AttrType.BigInt, 0)).to.equal('0');
        });

        it('handles AttrType.HexInt conversions', () => {

            expect(encode(AttrType.HexInt, BigInt('0x123456789abcdef0123456789abcdef'))).to.equal('0x123456789abcdef0123456789abcdef');
            expect(encode(AttrType.HexInt, 0x123)).to.equal('0x123');
            expect(encode(AttrType.HexInt, 0)).to.equal('0x0');
        });
    });
});
