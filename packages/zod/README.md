# @thaumaturgy/zod

[![npm](https://img.shields.io/npm/v/@thaumaturgy/zod.svg?maxAge=3600)](https://www.npmjs.com/package/@thaumaturgy/zod)

Thaumaturgy is a fixtures and seeding library for TypeScript.

This package contains bindings for [`zod`](https://github.com/colinhacks/zod).

## Installation

Install `@thaumaturgy/zod` as a development dependency:

```sh
npm install -D @thaumaturgy/zod
```

> Note: `@thaumaturgy/zod` has a peer dependency on `zod`.

## Usage

```ts
import { z } from 'zod';
import { Realm } from '@thaumaturgy/zod';

const Movie = z
  .object({
    title: z.string(),
    year: z.number(),
  })
  .strict()
  .describe('Movie');

const realm = new Realm();

realm.define(Movie, {
  sequences: {
    titles: new Sequence(n => `Movie ${n}` as const),
    years: new Sequence(n => 2022 - n),
  },
  manifest: ({ sequences }) => ({
    title: sequences.titles.next(),
    year: sequences.years.next(),
  }),
});

const movie = realm.manifest(Movie);

console.log(movie);
// > { title: 'Movie 1', year: 2021 }
```

### Entity Hierarchies

```ts
import { z } from 'zod';
import { Realm, Ref } from '@thaumaturgy/zod';

const Author = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .describe('Author');

const Book = z
  .object({
    id: z.string(),
    authorId: z.string(),
    title: z.string(),
  })
  .describe('Book');

const realm = new Realm();

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

console.log(book);
// > {
//     id: '1ab4790a-9911-4e20-9006-b12e6b60dfe6',
//     authorId: 'c6a1f6e0-6845-4675-b570-87024446a371',
//     title: 'The Lord of the Rings'
//   }
```
