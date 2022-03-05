import { faker } from '@faker-js/faker';
import * as t from 'io-ts';
import { Realm } from './realm';

describe('Realm', () => {
  describe('define', () => {
    const Movie = t.type({
      title: t.string,
      year: t.Int,
    });

    describe('when `manifest` is invoked', () => {
      it('calls the manifester', () => {
        const realm = new Realm();

        const manifester = jest.fn(() =>
          Movie.encode({ title: 'Pulp Fiction', year: 1994 as t.Int })
        );

        realm.define(Movie, { manifest: manifester });

        realm.manifest(Movie);

        expect(manifester).toHaveBeenCalledTimes(1);
      });

      it('passes a Faker instance to the manifester', () => {
        const realm = new Realm();

        const manifester = jest.fn(() =>
          Movie.encode({ title: 'Pulp Fiction', year: 1994 as t.Int })
        );

        realm.define(Movie, { manifest: manifester });

        realm.manifest(Movie);

        expect(manifester).toHaveBeenCalledWith(faker);
      });
    });

    describe('when `persist` is invoked', () => {
      it('calls the persister', async () => {
        const realm = new Realm();

        const persister = jest.fn(movie => Promise.resolve(movie));

        realm.define(Movie, {
          manifest: () =>
            Movie.encode({ title: 'Arrival', year: 2017 as t.Int }),
          persist: persister,
        });

        await realm.persist(Movie);

        expect(persister).toHaveBeenCalledTimes(1);
      });

      it('passes the manifested entity to the persister', async () => {
        const realm = new Realm();

        const persister = jest.fn(movie => Promise.resolve(movie));

        realm.define(Movie, {
          manifest: () =>
            Movie.encode({ title: 'Arrival', year: 2017 as t.Int }),
          persist: persister,
        });

        await realm.persist(Movie);

        expect(persister).toHaveBeenCalledWith(
          Movie.encode({
            title: 'Arrival',
            year: 2017 as t.Int,
          })
        );
      });
    });
  });

  describe('manifest', () => {
    describe('for a `type` codec', () => {
      const realm = new Realm();

      const Car = t.type({
        make: t.string,
        model: t.string,
      });

      beforeAll(() => {
        realm.define(Car, {
          manifest: () =>
            Car.encode({
              make: 'Honda',
              model: 'Civic',
            }),
        });
      });

      describe('with no overrides', () => {
        it('manifests an instance of the provided type', () => {
          const manifested = realm.manifest(Car);

          expect(manifested).toEqual(
            Car.encode({
              make: 'Honda',
              model: 'Civic',
            })
          );
        });
      });

      describe('with overrides', () => {
        it('manifests an instance of the provided type with the overrides applied', () => {
          const manifested = realm.manifest(Car, {
            model: 'CRV',
          });

          expect(manifested).toEqual(
            Car.encode({
              make: 'Honda',
              model: 'CRV',
            })
          );
        });
      });
    });

    describe('for a `strict` codec', () => {
      const realm = new Realm();

      const Car = t.strict({
        make: t.string,
        model: t.string,
      });

      beforeAll(() => {
        realm.define(Car, {
          manifest: () =>
            Car.encode({
              make: 'Honda',
              model: 'Civic',
            }),
        });
      });

      describe('with no overrides', () => {
        it('manifests an instance of the provided type', () => {
          const manifested = realm.manifest(Car);

          expect(manifested).toEqual(
            Car.encode({
              make: 'Honda',
              model: 'Civic',
            })
          );
        });
      });

      describe('with overrides', () => {
        it('manifests an instance of the provided type with the overrides applied', () => {
          const manifested = realm.manifest(Car, {
            model: 'CRV',
          });

          expect(manifested).toEqual(
            Car.encode({
              make: 'Honda',
              model: 'CRV',
            })
          );
        });
      });
    });

    describe('for an entity hierarchy', () => {
      const realm = new Realm();

      const Kingdom = t.type({ name: t.string });

      const Phylum = t.type({ kingdom: t.string, name: t.string });

      const Class = t.type({ phylum: t.string, name: t.string });

      beforeEach(() => {
        realm.define(Kingdom, {
          manifest: () => Kingdom.encode({ name: 'Animalia' }),
        });

        realm.define(Phylum, {
          manifest: () =>
            Phylum.encode({
              kingdom: realm.ref(Kingdom).through(kingdom => kingdom.name),
              name: 'Chordata',
            }),
        });

        realm.define(Class, {
          manifest: () =>
            Class.encode({
              phylum: realm.ref(Phylum).through(phylum => phylum.name),
              name: 'Mammalia',
            }),
        });
      });

      it('manifests an instance of each entity in the hierarchy', () => {
        const manifestSpy = jest.spyOn(realm, 'manifest');

        realm.manifest(Class);

        expect(manifestSpy).toHaveBeenCalledTimes(3);
        expect(manifestSpy).toHaveBeenNthCalledWith(1, Class);
        expect(manifestSpy).toHaveBeenNthCalledWith(2, Phylum);
        expect(manifestSpy).toHaveBeenNthCalledWith(3, Kingdom);
      });

      describe('when providing a parent entity via overrides', () => {
        it('does not ', () => {
          const manifestSpy = jest.spyOn(realm, 'manifest');

          realm.manifest(Class, {
            phylum: 'Arthropoda',
          });

          expect(manifestSpy).toHaveBeenCalledTimes(1);
          expect(manifestSpy).toHaveBeenNthCalledWith(1, Class, {
            phylum: 'Arthropoda',
          });
        });
      });
    });
  });
});
