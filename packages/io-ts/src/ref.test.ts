import { ManifesterOptions } from '@thaumaturgy/core';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as t from 'io-ts';
import { either, option } from 'io-ts-types';
import { Realm } from './realm';
import { Ref } from './ref';

describe('Ref', () => {
  describe('when used inside of an `Option`', () => {
    it(`calls the referenced entity's manifester`, () => {
      const realm = new Realm();

      const Author = t.strict({ id: t.string });

      const Post = t.strict({
        id: t.string,
        authorId: option(t.string),
      });

      const authorManifester = jest.fn<
        t.TypeOf<typeof Author>,
        [ManifesterOptions<unknown>]
      >(({ uuid }) => ({ id: uuid() }));

      realm.define(Author, {
        manifest: authorManifester,
      });

      realm.define(Post, {
        manifest: ({ uuid }) => ({
          id: uuid(),
          authorId: O.some(Ref.to(Author).through(author => author.id)),
        }),
      });

      const post = realm.manifest(Post);

      expect(post.authorId).toEqual(O.some(expect.any(String)));

      expect(authorManifester).toHaveBeenCalled();
    });
  });

  describe('when used inside of an `Either`', () => {
    describe('inside of a `Left`', () => {
      it(`calls the referenced entity's manifester`, () => {
        const realm = new Realm();

        const Author = t.strict({ id: t.string });

        const Post = t.strict({
          id: t.string,
          authorId: either(t.string, t.string),
        });

        const authorManifester = jest.fn<
          t.TypeOf<typeof Author>,
          [ManifesterOptions<unknown>]
        >(({ uuid }) => ({ id: uuid() }));

        realm.define(Author, {
          manifest: authorManifester,
        });

        realm.define(Post, {
          manifest: ({ uuid }) => ({
            id: uuid(),
            authorId: E.left(Ref.to(Author).through(author => author.id)),
          }),
        });

        const post = realm.manifest(Post);

        expect(post.authorId).toEqual(E.left(expect.any(String)));

        expect(authorManifester).toHaveBeenCalled();
      });
    });

    describe('inside of a `Right`', () => {
      it(`calls the referenced entity's manifester`, () => {
        const realm = new Realm();

        const Author = t.strict({ id: t.string });

        const Post = t.strict({
          id: t.string,
          authorId: either(t.string, t.string),
        });

        const authorManifester = jest.fn<
          t.TypeOf<typeof Author>,
          [ManifesterOptions<unknown>]
        >(({ uuid }) => ({ id: uuid() }));

        realm.define(Author, {
          manifest: authorManifester,
        });

        realm.define(Post, {
          manifest: ({ uuid }) => ({
            id: uuid(),
            authorId: E.right(Ref.to(Author).through(author => author.id)),
          }),
        });

        const post = realm.manifest(Post);

        expect(post.authorId).toEqual(E.right(expect.any(String)));

        expect(authorManifester).toHaveBeenCalled();
      });
    });
  });

  describe('when used inside of a deeply-nested object', () => {
    it(`calls the referenced entity's manifester`, () => {
      const realm = new Realm();

      const Author = t.strict({ id: t.string });

      const Post = t.strict({
        id: t.string,
        a: t.strict({
          u: t.strict({
            t: t.strict({
              h: t.strict({
                o: t.strict({
                  r: t.strict({
                    id: t.string,
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      const authorManifester = jest.fn<
        t.TypeOf<typeof Author>,
        [ManifesterOptions<unknown>]
      >(({ uuid }) => ({ id: uuid() }));

      realm.define(Author, {
        manifest: authorManifester,
      });

      realm.define(Post, {
        manifest: ({ uuid }) => ({
          id: uuid(),
          a: {
            u: {
              t: {
                h: {
                  o: {
                    r: {
                      id: Ref.to(Author).through(author => author.id),
                    },
                  },
                },
              },
            },
          },
        }),
      });

      const post = realm.manifest(Post);

      expect(post).toMatchObject({
        a: {
          u: {
            t: {
              h: {
                o: {
                  r: {
                    id: expect.any(String),
                  },
                },
              },
            },
          },
        },
      });

      expect(authorManifester).toHaveBeenCalled();
    });
  });
});
