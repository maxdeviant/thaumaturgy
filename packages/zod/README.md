# @thaumaturgy/zod

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
import { define, manifest } from '@thaumaturgy/zod';

const Movie = z
  .object({
    title: z.string(),
    year: z.number(),
  })
  .strict()
  .describe('Movie');

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
import { z } from 'zod';
import { define, manifest, Ref } from 'thaumaturge';

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
