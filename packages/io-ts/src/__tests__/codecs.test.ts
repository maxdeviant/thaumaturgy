import * as t from 'io-ts';
import { describe, expect, it } from 'vitest';
import { Realm } from '../realm';

describe('io-ts Codecs', () => {
  describe('with a `type` codec', () => {
    it('works', () => {
      const realm = new Realm();

      const Type = t.type({ check: t.boolean });

      realm.define(Type, {
        manifest: () => ({ check: true }),
      });

      expect(realm.manifest(Type)).toEqual({ check: true });
    });
  });

  describe('with a `strict` codec', () => {
    it('works', () => {
      const realm = new Realm();

      const Strict = t.strict({ check: t.boolean });

      realm.define(Strict, {
        manifest: () => ({ check: true }),
      });

      expect(realm.manifest(Strict)).toEqual({ check: true });
    });
  });

  describe('with a `readonly` codec', () => {
    describe('wrapping a `type` codec', () => {
      it('works', () => {
        const realm = new Realm();

        const ReadonlyType = t.readonly(t.type({ check: t.boolean }));

        realm.define(ReadonlyType, {
          manifest: () => ({ check: true }),
        });

        expect(realm.manifest(ReadonlyType)).toEqual({ check: true });
      });
    });

    describe('wrapping a `strict` codec', () => {
      it('works', () => {
        const realm = new Realm();

        const ReadonlyStrict = t.readonly(t.strict({ check: t.boolean }));

        realm.define(ReadonlyStrict, {
          manifest: () => ({ check: true }),
        });

        expect(realm.manifest(ReadonlyStrict)).toEqual({ check: true });
      });
    });

    describe('wrapping an `intersection` codec', () => {
      describe('between two `type` codecs', () => {
        it('works', () => {
          const realm = new Realm();

          const ReadonlyIntersection = t.readonly(
            t.intersection([t.type({ a: t.string }), t.type({ b: t.string })])
          );

          realm.define(ReadonlyIntersection, {
            manifest: () => ({ a: 'hello', b: 'world' }),
          });

          const manifested = realm.manifest(ReadonlyIntersection);

          expect(manifested.a).toBe('hello');
          expect(manifested.b).toBe('world');
        });
      });

      describe('between two `strict` codecs', () => {
        it('works', () => {
          const realm = new Realm();

          const ReadonlyStrictIntersection = t.readonly(
            t.intersection([
              t.strict({ a: t.string }),
              t.strict({ b: t.string }),
            ])
          );

          realm.define(ReadonlyStrictIntersection, {
            manifest: () => ({ a: 'hello', b: 'world' }),
          });

          const manifested = realm.manifest(ReadonlyStrictIntersection);

          expect(manifested.a).toBe('hello');
          expect(manifested.b).toBe('world');
        });
      });
    });
  });

  describe('with a `brand` codec', () => {
    interface PositiveBrand {
      readonly Positive: unique symbol;
    }

    const Positive = t.brand(
      t.number,
      (n): n is t.Branded<number, PositiveBrand> => 0 < n,
      'Positive'
    );

    type Positive = t.TypeOf<typeof Positive>;

    it('works', () => {
      const realm = new Realm();

      realm.define(Positive, {
        manifest: () => 7 as Positive,
      });

      const manifested = realm.manifest(Positive);

      expect(Positive.is(manifested)).toBe(true);
      expect(manifested).toBe(7);
    });
  });
});
