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

        const manifester = jest.fn();

        realm.define(Movie, { manifest: manifester });

        realm.manifest(Movie);

        expect(manifester).toHaveBeenCalledTimes(1);
      });

      it('passes a Faker instance to the manifester', () => {
        const realm = new Realm();

        const manifester = jest.fn();

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
  });
});
