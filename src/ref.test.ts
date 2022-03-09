import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as t from 'io-ts';
import { either, option } from 'io-ts-types';
import { Realm } from './realm';
import { Ref } from './ref';
import { ManifesterOptions, Traversal } from './types';

describe('Ref', () => {
  describe('when used inside of an `Option`', () => {
    it(`calls the referenced entity's manifester`, () => {
      const realm = new Realm();

      realm.defineTraversal({
        is: option(t.unknown).is,
        traverse: O.map,
      });

      const Author = t.strict({ id: t.string });

      const Post = t.strict({
        id: t.string,
        authorId: option(t.string),
      });

      const authorManifester = jest.fn<
        t.TypeOf<typeof Author>,
        [ManifesterOptions]
      >(({ faker }) => Author.encode({ id: faker.datatype.uuid() }));

      realm.define(Author, {
        manifest: authorManifester,
      });

      realm.define(Post, {
        manifest: ({ faker }) =>
          Post.encode({
            id: faker.datatype.uuid(),
            authorId: O.some(Ref.to(Author).through(author => author.id)),
          }),
      });

      const post = realm.manifest(Post);

      expect(post.authorId).toEqual(O.some(expect.any(String)));

      expect(authorManifester).toHaveBeenCalled();
    });
  });

  describe('when used inside of an `Either`', () => {
    const eitherTraversal: Traversal<E.Either<unknown, unknown>> = {
      is: either(t.unknown, t.unknown).is,
      traverse: f => E.bimap(f, f),
    };

    describe('inside of a `Left`', () => {
      it(`calls the referenced entity's manifester`, () => {
        const realm = new Realm();

        realm.defineTraversal(eitherTraversal);

        const Author = t.strict({ id: t.string });

        const Post = t.strict({
          id: t.string,
          authorId: either(t.string, t.string),
        });

        const authorManifester = jest.fn<
          t.TypeOf<typeof Author>,
          [ManifesterOptions]
        >(({ faker }) => Author.encode({ id: faker.datatype.uuid() }));

        realm.define(Author, {
          manifest: authorManifester,
        });

        realm.define(Post, {
          manifest: ({ faker }) =>
            Post.encode({
              id: faker.datatype.uuid(),
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

        realm.defineTraversal(eitherTraversal);

        const Author = t.strict({ id: t.string });

        const Post = t.strict({
          id: t.string,
          authorId: either(t.string, t.string),
        });

        const authorManifester = jest.fn<
          t.TypeOf<typeof Author>,
          [ManifesterOptions]
        >(({ faker }) => Author.encode({ id: faker.datatype.uuid() }));

        realm.define(Author, {
          manifest: authorManifester,
        });

        realm.define(Post, {
          manifest: ({ faker }) =>
            Post.encode({
              id: faker.datatype.uuid(),
              authorId: E.right(Ref.to(Author).through(author => author.id)),
            }),
        });

        const post = realm.manifest(Post);

        expect(post.authorId).toEqual(E.right(expect.any(String)));

        expect(authorManifester).toHaveBeenCalled();
      });
    });
  });
});
