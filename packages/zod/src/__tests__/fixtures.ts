import { Sequence } from '@thaumaturgy/core';
import { Transaction } from 'kysely';
import { z } from 'zod';
import { Realm } from '../realm';
import { Ref } from '../ref';
import { Database } from './database';

export const Car = z
  .object({
    make: z.string(),
    model: z.string(),
  })
  .describe('Car');

export const Kingdom = z.object({ name: z.string() }).describe('Kingdom');

export const Phylum = z
  .object({ kingdom: z.string(), name: z.string() })
  .describe('Phylum');

export const Class = z
  .object({ phylum: z.string(), name: z.string() })
  .describe('Class');

export const Author = z
  .object({ id: z.string(), name: z.string() })
  .describe('Author');

export const Post = z
  .object({
    id: z.string(),
    authorId: z.string(),
    title: z.string(),
  })
  .describe('Post');

export const Comment = z
  .object({
    id: z.string(),
    postId: z.string(),
    username: z.string(),
  })
  .describe('Comment');

export interface Context {
  tx: Transaction<Database>;
}

export const define = (realm: Realm<Context>) => {
  realm.define(Car, {
    manifest: () => ({
      make: 'Honda',
      model: 'Civic',
    }),
    persist: async (car, { tx }) => {
      await tx
        .insertInto('car')
        .values({ make: car.make, model: car.model })
        .execute();

      return car;
    },
  });

  realm.define(Kingdom, {
    manifest: () => ({ name: 'Animalia' }),
    persist: async (kingdom, { tx }) => {
      await tx.insertInto('kingdom').values({ name: kingdom.name }).execute();

      return kingdom;
    },
  });

  realm.define(Phylum, {
    manifest: () => ({
      kingdom: Ref.to(Kingdom).through(kingdom => kingdom.name),
      name: 'Chordata',
    }),
    persist: async (phylum, { tx }) => {
      await tx
        .insertInto('phylum')
        .values({ kingdom: phylum.kingdom, name: phylum.name })
        .execute();

      return phylum;
    },
  });

  realm.define(Class, {
    manifest: () => ({
      phylum: Ref.to(Phylum).through(phylum => phylum.name),
      name: 'Mammalia',
    }),
    persist: async (class_, { tx }) => {
      await tx
        .insertInto('class')
        .values({ phylum: class_.phylum, name: class_.name })
        .execute();

      return class_;
    },
  });

  realm.define(Author, {
    sequences: {
      names: new Sequence(n => `Author ${n}` as const),
    },
    manifest: ({ uuid, sequences }) => ({
      id: uuid(),
      name: sequences.names.next(),
    }),
    persist: async (author, { tx }) => {
      await tx
        .insertInto('author')
        .values({ id: author.id, name: author.name })
        .execute();

      return author;
    },
  });

  realm.define(Post, {
    sequences: {
      titles: new Sequence(n => `Post ${n}` as const),
    },
    manifest: ({ uuid, sequences }) => ({
      id: uuid(),
      authorId: Ref.to(Author).through(author => author.id),
      title: sequences.titles.next(),
    }),
    persist: async (post, { tx }) => {
      await tx
        .insertInto('post')
        .values({
          id: post.id,
          author_id: post.authorId,
          title: post.title,
        })
        .execute();

      return post;
    },
  });

  realm.define(Comment, {
    sequences: {
      usernames: new Sequence(n => `user${n}` as const),
    },
    manifest: ({ uuid, sequences }) => ({
      id: uuid(),
      postId: Ref.to(Post).through(post => post.id),
      username: sequences.usernames.next(),
    }),
    persist: async (comment, { tx }) => {
      await tx
        .insertInto('comment')
        .values({
          id: comment.id,
          post_id: comment.postId,
          username: comment.username,
        })
        .execute();

      return comment;
    },
  });
};
