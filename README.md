# Thaumaturge

[![npm](https://img.shields.io/npm/v/thaumaturge.svg?maxAge=3600)](https://www.npmjs.com/package/thaumaturge)
[![CI](https://github.com/maxdeviant/thaumaturge/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/maxdeviant/thaumaturge/actions/workflows/ci.yml)

Thaumaturge is a fixtures and seeding library powered by `io-ts`.

## Installation

Thaumaturge has peer dependencies on `io-ts` and `fp-ts`, so be sure to have those installed first.

The `thaumaturge` package should then be installed as a development dependency:

#### Yarn

```sh
yarn add -D thaumaturge
```

#### npm

```sh
npm install -D thaumaturge
```

## Usage

```ts
import * as t from 'io-ts';
import { define, manifest } from 'thaumaturge';

const Movie = t.strict({
  title: t.string,
  year: t.number,
});

define(Movie, {
  manifest: ({ sequences }) => ({
    title: sequences.titles.next(),
    year: sequences.years.next(),
  }),
  sequences: {
    titles: new Sequence(n => `Movie ${n}` as const),
    years: new Sequence(n => 2022 - n),
  },
});

const movie = manifest(Movie);

console.log(movie);
// > { title: 'Movie 1', year: 2021 }
```

### Entity Hierarchies

```ts
import * as t from 'io-ts';
import { define, manifest, Ref } from 'thaumaturge';

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
