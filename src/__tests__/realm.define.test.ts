import { faker } from '@faker-js/faker';
import * as t from 'io-ts';
import { Realm } from '../realm';

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

        expect(manifester).toHaveBeenCalledWith(
          expect.objectContaining({ faker })
        );
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
});
