import * as t from 'io-ts';
import { Realm } from '../realm';
import { Ref } from '../ref';
import { Transaction } from 'kysely';
import { Database } from './database';
import { Sequence } from '@thaumaturgy/core';

export const Kingdom = t.type({ name: t.string }, 'Kingdom');

export const Phylum = t.type({ kingdom: t.string, name: t.string }, 'Phylum');

export const Class = t.type({ phylum: t.string, name: t.string }, 'Class');

export const Author = t.type({ id: t.string, name: t.string }, 'Author');

export const Post = t.type(
  {
    id: t.string,
    authorId: t.string,
    title: t.string,
  },
  'Post'
);

export const Comment = t.type(
  {
    id: t.string,
    postId: t.string,
    username: t.string,
  },
  'Comment'
);

export interface Context {
  tx: Transaction<Database>;
}

export const define = (realm: Realm<Context>) => {
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
    persist: async (author, context) => {
      await context.tx
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
    persist: async (post, context) => {
      await context.tx
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
    persist: async (comment, context) => {
      await context.tx
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
