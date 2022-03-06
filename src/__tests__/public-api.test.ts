import * as t from 'io-ts';
// Importing from the root barrel file intentionally to simulate what library
// consumers will see.
import { define, manifest, Ref } from '..';

describe('Public API', () => {
  it('works with a basic example', () => {
    const Movie = t.strict({
      title: t.string,
      year: t.number,
    });

    define(Movie, {
      manifest: ({ faker }) =>
        Movie.encode({
          title: faker.random.words(),
          year: faker.date.past(10).getFullYear(),
        }),
    });

    const movie = manifest(Movie);

    expect(movie).toEqual({
      title: expect.any(String),
      year: expect.any(Number),
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
      manifest: ({ faker }) =>
        Author.encode({
          id: faker.datatype.uuid(),
          name: faker.name.findName(),
        }),
    });

    define(Book, {
      manifest: ({ faker }) =>
        Book.encode({
          id: faker.datatype.uuid(),
          authorId: Ref.to(Author).through(author => author.id),
          title: faker.random.words(),
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
