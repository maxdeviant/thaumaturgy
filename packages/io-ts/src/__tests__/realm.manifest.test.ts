import * as t from 'io-ts';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Realm } from '../realm';
import { Ref } from '../ref';

describe('Realm', () => {
  describe('manifest', () => {
    const realm = new Realm();

    const Car = t.type({
      make: t.string,
      model: t.string,
    });

    beforeAll(() => {
      realm.define(Car, {
        manifest: () => ({
          make: 'Honda',
          model: 'Civic',
        }),
      });
    });

    describe('with no overrides', () => {
      it('manifests an instance of the provided type', () => {
        const manifested = realm.manifest(Car);

        expect(manifested).toEqual({
          make: 'Honda',
          model: 'Civic',
        });
      });
    });

    describe('with overrides', () => {
      it('manifests an instance of the provided type with the overrides applied', () => {
        const manifested = realm.manifest(Car, {
          model: 'CRV',
        });

        expect(manifested).toEqual({
          make: 'Honda',
          model: 'CRV',
        });
      });
    });

    describe('for an entity hierarchy', () => {
      const Kingdom = t.type({ name: t.string });

      const Phylum = t.type({ kingdom: t.string, name: t.string });

      const Class = t.type({ phylum: t.string, name: t.string });

      const performSetup = () => {
        const realm = new Realm();

        const kingdomManifester = vi.fn(() => ({ name: 'Animalia' }));

        realm.define(Kingdom, {
          manifest: kingdomManifester,
        });

        const phylumManifester = vi.fn(() => ({
          kingdom: Ref.to(Kingdom).through(kingdom => kingdom.name),
          name: 'Chordata',
        }));

        realm.define(Phylum, {
          manifest: phylumManifester,
        });

        const classManifester = vi.fn(() => ({
          phylum: Ref.to(Phylum).through(phylum => phylum.name),
          name: 'Mammalia',
        }));

        realm.define(Class, {
          manifest: classManifester,
        });

        return { realm, kingdomManifester, phylumManifester, classManifester };
      };

      it('manifests an instance of each entity in the hierarchy', () => {
        const { realm, kingdomManifester, phylumManifester, classManifester } =
          performSetup();

        realm.manifest(Class);

        expect(kingdomManifester).toHaveBeenCalledTimes(1);
        expect(phylumManifester).toHaveBeenCalledTimes(1);
        expect(classManifester).toHaveBeenCalledTimes(1);
      });

      describe('when providing a parent entity via overrides', () => {
        it('only manifests the required entities', () => {
          const {
            realm,
            kingdomManifester,
            phylumManifester,
            classManifester,
          } = performSetup();

          realm.manifest(Class, {
            phylum: 'Arthropoda',
          });

          expect(classManifester).toHaveBeenCalledTimes(1);
          expect(phylumManifester).not.toHaveBeenCalled();
          expect(kingdomManifester).not.toHaveBeenCalled();
        });
      });
    });
  });
});
