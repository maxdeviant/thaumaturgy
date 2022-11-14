# @thaumaturgy/io-ts

[![npm](https://img.shields.io/npm/v/@thaumaturgy/io-ts.svg?maxAge=3600)](https://www.npmjs.com/package/@thaumaturgy/io-ts)

Thaumaturgy is a fixtures and seeding library for TypeScript.

This package contains bindings for [`io-ts`](https://github.com/gcanti/io-ts).

## Installation

Install `@thaumaturgy/io-ts` as a development dependency:

```sh
npm install -D @thaumaturgy/io-ts
```

> Note: `@thaumaturgy/io-ts` has peer dependencies on `io-ts` and `fp-ts`.

## Usage

```ts
import * as t from 'io-ts';
import { define, manifest } from '@thaumaturgy/io-ts';

const Movie = t.strict(
  {
    title: t.string,
    year: t.number,
  },
  'Movie'
);

define(Movie, {
  sequences: {
    titles: new Sequence(n => `Movie ${n}` as const),
    years: new Sequence(n => 2022 - n),
  },
  manifest: ({ sequences }) => ({
    title: sequences.titles.next(),
    year: sequences.years.next(),
  }),
});

const movie = manifest(Movie);

console.log(movie);
// > { title: 'Movie 1', year: 2021 }
```

### Entity Hierarchies

```ts
import * as t from 'io-ts';
import { define, manifest, Ref } from '@thaumaturgy/io-ts';

const Author = t.type(
  {
    id: t.string,
    name: t.string,
  },
  'Author'
);

const Book = t.type(
  {
    id: t.string,
    authorId: t.string,
    title: t.string,
  },
  'Book'
);

define(Author, {
  manifest: ({ uuid }) => ({
    id: uuid(),
    name: 'J. R. R. Tolkien',
  }),
});

define(Book, {
  manifest: ({ uuid }) => ({
    id: uuid(),
    authorId: Ref.to(Author).through(author => author.id),
    title: 'The Lord of the Rings',
  }),
});

const book = manifest(Book);

console.log(book);
// > {
//     id: '1ab4790a-9911-4e20-9006-b12e6b60dfe6',
//     authorId: 'c6a1f6e0-6845-4675-b570-87024446a371',
//     title: 'The Lord of the Rings'
//   }
```
