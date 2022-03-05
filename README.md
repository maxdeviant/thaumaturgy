# Thaumaturge

[![npm](https://img.shields.io/npm/v/thaumaturge.svg?maxAge=3600&style=flat-square)](https://www.npmjs.com/package/thaumaturge)

### Usage

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
