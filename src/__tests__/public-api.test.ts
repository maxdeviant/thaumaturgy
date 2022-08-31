import * as t from 'io-ts';
// Importing from the root barrel file intentionally to simulate what library
// consumers will see.
import { define, manifest, Ref, Sequence } from '..';

describe('Public API', () => {
  it('works with a basic example', () => {
    const Movie = t.strict({
      title: t.string,
      year: t.number,
    });

    define(Movie, {
      sequences: {
        movies: n => `Movie ${n}` as const,
        years: n => 2022 - n,
      },
      manifest: ({ sequences }) => ({
        title: sequences.movies.next(),
        year: sequences.years.next(),
      }),
    });

    const movie = manifest(Movie);

    expect(movie).toEqual({
      title: expect.any(String),
      year: expect.any(Number),
    });
  });

  it('works with an entity containing an array field', () => {
    const Post = t.strict({
      title: t.string,
      tags: t.array(t.string),
    });

    define(Post, {
      manifest: ({ uuid, sequences }) => ({
        title: uuid(),
        tags: sequences.tags.take(3),
      }),
      sequences: {
        tags: new Sequence(n => `Tag ${n}` as const),
      },
    });

    const post = manifest(Post);

    console.log(post);

    expect(post).toEqual({
      title: expect.any(String),
      tags: [expect.any(String), expect.any(String), expect.any(String)],
    });
  });

  it('works with an entity hierarchy', () => {
    const Author = t.type({
      id: t.string,
      name: t.string,
    });

    const Book = t.type({
      id: t.string,
      authorId: t.string,
      title: t.string,
    });

    define(Author, {
      manifest: ({ uuid }) => ({
        id: uuid(),
        name: uuid(),
      }),
    });

    define(Book, {
      manifest: ({ uuid }) => ({
        id: uuid(),
        authorId: Ref.to(Author).through(author => author.id),
        title: uuid(),
      }),
    });

    const book = manifest(Book);

    expect(book).toEqual({
      id: expect.any(String),
      authorId: expect.any(String),
      title: expect.any(String),
    });
  });
});
