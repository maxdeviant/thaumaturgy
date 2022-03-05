# Thaumaturge

[![npm](https://img.shields.io/npm/v/thaumaturge.svg?maxAge=3600&style=flat-square)](https://www.npmjs.com/package/thaumaturge)

Thaumaturge is a fixtures and seeding library powered by `io-ts`.

## Installation

Thaumaturge has peer dependencies on `io-ts` and `fp-ts`.

#### Yarn

```sh
yarn add thaumaturge io-ts fp-ts
```

#### npm

```sh
npm install thaumaturge io-ts fp-ts
```

## Usage

```ts
import * as t from 'io-ts';
import { Realm } from 'thaumaturge';

const Movie = t.strict({
  title: t.string,
  year: t.number,
});

const realm = new Realm();

realm.define(Movie, {
  manifest: faker =>
    Movie.encode({
      title: faker.random.words(),
      year: faker.date.past(10).getFullYear(),
    }),
});

const movie = realm.manifest(Movie);

console.log(movie); // { title: 'efficient turn-key', year: 2021 }
```
