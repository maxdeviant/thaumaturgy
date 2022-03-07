import * as t from 'io-ts';
import { Realm } from '../realm';

describe('io-ts Codecs', () => {
  describe('with a `type` codec', () => {
    it('works', () => {
      const realm = new Realm();

      const Type = t.type({ check: t.boolean });

      realm.define(Type, {
        manifest: () => Type.encode({ check: true }),
      });

      expect(realm.manifest(Type)).toEqual({ check: true });
    });
  });

  describe('with a `strict` codec', () => {
    it('works', () => {
      const realm = new Realm();

      const Strict = t.strict({ check: t.boolean });

      realm.define(Strict, {
        manifest: () => Strict.encode({ check: true }),
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
          manifest: () => ReadonlyType.encode({ check: true }),
        });

        expect(realm.manifest(ReadonlyType)).toEqual({ check: true });
      });
    });

    describe('wrapping a `strict` codec', () => {
      it('works', () => {
        const realm = new Realm();

        const ReadonlyStrict = t.readonly(t.strict({ check: t.boolean }));

        realm.define(ReadonlyStrict, {
          manifest: () => ReadonlyStrict.encode({ check: true }),
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
            manifest: () =>
              ReadonlyIntersection.encode({ a: 'hello', b: 'world' }),
          });

          expect(realm.manifest(ReadonlyIntersection)).toEqual({
            a: 'hello',
            b: 'world',
          });
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
            manifest: () =>
              ReadonlyStrictIntersection.encode({ a: 'hello', b: 'world' }),
          });

          expect(realm.manifest(ReadonlyStrictIntersection)).toEqual({
            a: 'hello',
            b: 'world',
          });
        });
      });
    });
  });
});
