# Thaumaturge

[![npm](https://img.shields.io/npm/v/thaumaturge.svg?maxAge=3600&style=flat-square)](https://www.npmjs.com/package/thaumaturge)

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
  manifest: faker =>
    Movie.encode({
      title: faker.random.words(),
      year: faker.date.past(10).getFullYear(),
    }),
});

const movie = manifest(Movie);

console.log(movie);
// > { title: 'efficient turn-key', year: 2021 }
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
  manifest: faker =>
    Author.encode({
      id: faker.datatype.uuid(),
      name: faker.name.findName(),
    }),
});

define(Book, {
  manifest: faker =>
    Book.encode({
      id: faker.datatype.uuid(),
      authorId: Ref.to(Author).through(author => author.id),
      title: faker.random.words(),
    }),
});

const book = manifest(Book);

console.log(book);
// > {
//     id: '1ab4790a-9911-4e20-9006-b12e6b60dfe6',
//     authorId: 'c6a1f6e0-6845-4675-b570-87024446a371',
//     title: 'Tuna Central'
//   }
```
