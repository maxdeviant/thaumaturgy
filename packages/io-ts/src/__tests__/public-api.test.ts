import { Sequence } from '@thaumaturgy/core';
import * as t from 'io-ts';
import { describe, expect, it } from 'vitest';
// Importing from the root barrel file intentionally to simulate what library
// consumers will see.
import { Realm, Ref } from '..';

describe('Public API', () => {
  it('works with a basic example', () => {
    const realm = new Realm();

    const Movie = t.strict({
      title: t.string,
      year: t.number,
    });

    realm.define(Movie, {
      sequences: {
        movies: new Sequence(n => `Movie ${n}` as const),
        years: new Sequence(n => 2022 - n),
      },
      manifest: ({ sequences }) => ({
        title: sequences.movies.next(),
        year: sequences.years.next(),
      }),
    });

    const movie = realm.manifest(Movie);

    expect(movie).toEqual({
      title: expect.any(String),
      year: expect.any(Number),
    });
  });

  it('works with an entity containing an array field', () => {
    const realm = new Realm();

    const Post = t.strict({
      title: t.string,
      tags: t.array(t.string),
    });

    realm.define(Post, {
      manifest: ({ sequences }) => ({
        title: sequences.titles.next(),
        tags: sequences.tags.take(3),
      }),
      sequences: {
        titles: new Sequence(n => `Post ${n}` as const),
        tags: new Sequence(n => `Tag ${n}` as const),
      },
    });

    const post = realm.manifest(Post);

    expect(post).toEqual({
      title: expect.any(String),
      tags: [expect.any(String), expect.any(String), expect.any(String)],
    });
  });

  it('works with an entity hierarchy', () => {
    const realm = new Realm();

    const Author = t.type({
      id: t.string,
      name: t.string,
    });

    const Book = t.type({
      id: t.string,
      authorId: t.string,
      title: t.string,
    });

    realm.define(Author, {
      manifest: ({ uuid }) => ({
        id: uuid(),
        name: 'J. R. R. Tolkien',
      }),
    });

    realm.define(Book, {
      manifest: ({ uuid }) => ({
        id: uuid(),
        authorId: Ref.to(Author).through(author => author.id),
        title: 'The Lord of the Rings',
      }),
    });

    const book = realm.manifest(Book);

    expect(book).toEqual({
      id: expect.any(String),
      authorId: expect.any(String),
      title: expect.any(String),
    });
  });
});
