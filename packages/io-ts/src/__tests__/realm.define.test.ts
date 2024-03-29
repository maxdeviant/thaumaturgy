import * as t from 'io-ts';
import { describe, expect, it, vi } from 'vitest';
import { Realm } from '../realm';

describe('Realm', () => {
  describe('define', () => {
    const Movie = t.type({
      title: t.string,
      year: t.Int,
    });

    type Movie = t.TypeOf<typeof Movie>;

    describe('when `manifest` is invoked', () => {
      it('calls the manifester', () => {
        const realm = new Realm();

        const manifester = vi.fn<[], Movie>(() => ({
          title: 'Pulp Fiction',
          year: 1994 as t.Int,
        }));

        realm.define(Movie, { manifest: manifester });

        realm.manifest(Movie);

        expect(manifester).toHaveBeenCalledTimes(1);
      });

      it('passes a `uuid` function to the manifester', () => {
        const realm = new Realm();

        const manifester = vi.fn<[], Movie>(() => ({
          title: 'Pulp Fiction',
          year: 1994 as t.Int,
        }));

        realm.define(Movie, { manifest: manifester });

        realm.manifest(Movie);

        expect(manifester).toHaveBeenCalledWith(
          expect.objectContaining({ uuid: expect.any(Function) })
        );
      });
    });

    describe('when `persist` is invoked', () => {
      it('calls the persister', async () => {
        const context = {};

        const realm = new Realm();

        const persister = vi.fn(movie => Promise.resolve(movie));

        realm.define(Movie, {
          manifest: () => ({ title: 'Arrival', year: 2017 as t.Int }),
          persist: persister,
        });

        await realm.persist(Movie, context);

        expect(persister).toHaveBeenCalledTimes(1);
      });

      it('passes the manifested entity to the persister', async () => {
        const context = {};

        const realm = new Realm();

        const persister = vi.fn(movie => Promise.resolve(movie));

        realm.define(Movie, {
          manifest: () => ({ title: 'Arrival', year: 2017 as t.Int }),
          persist: persister,
        });

        await realm.persist(Movie, context);

        expect(persister).toHaveBeenCalledWith(
          {
            title: 'Arrival',
            year: 2017 as t.Int,
          },
          context
        );
      });

      describe('with a `context` parameter', () => {
        it('passes the context to the persister', async () => {
          const context = { a: 'hello', b: 'world' };

          const realm = new Realm<typeof context>();

          const persister = vi.fn(movie => Promise.resolve(movie));

          realm.define(Movie, {
            manifest: () => ({ title: 'Arrival', year: 2017 as t.Int }),
            persist: persister,
          });

          await realm.persist(Movie, context, {});

          expect(persister).toHaveBeenCalledWith(
            {
              title: 'Arrival',
              year: 2017 as t.Int,
            },
            context
          );
        });
      });
    });
  });
});
