import { Sequence } from '@thaumaturgy/core';
import * as t from 'io-ts';
import assert from 'node:assert';
import SqliteDatabase from 'better-sqlite3';
import { Kysely, SqliteDialect, sql } from 'kysely';
import { describe, expect, it } from 'vitest';
import { Realm } from '../realm';
import { Ref } from '../ref';

interface Author {
  id: string;
  name: string;
}

interface Post {
  id: string;
  author_id: string;
  title: string;
}

interface Comment {
  id: string;
  post_id: string;
  username: string;
}

interface Database {
  author: Author;
  post: Post;
  comment: Comment;
}

describe('Realm', () => {
  describe('persistLeaves', () => {
    const setupDatabase = async () => {
      const db = new Kysely<Database>({
        dialect: new SqliteDialect({
          database: async () => new SqliteDatabase(':memory:'),
        }),
      });

      return { db };
    };

    describe('for an entity hierarchy with randomly-generated IDs', () => {
      const Author = t.type({ id: t.string, name: t.string }, 'Author');

      const Post = t.type(
        {
          id: t.string,
          authorId: t.string,
          title: t.string,
        },
        'Post'
      );

      const Comment = t.type(
        {
          id: t.string,
          postId: t.string,
          username: t.string,
        },
        'Comment'
      );

      const performSetup = async () => {
        const { db } = await setupDatabase();

        await sql`pragma foreign_keys = on`.execute(db);

        await db.schema
          .createTable('author')
          .addColumn('id', 'text', col => col.primaryKey())
          .addColumn('name', 'text', col => col.notNull())
          .execute();

        await db.schema
          .createTable('post')
          .addColumn('id', 'text', col => col.primaryKey())
          .addColumn('author_id', 'text', col => col.notNull())
          .addColumn('title', 'text', col => col.notNull())
          .addForeignKeyConstraint('post_author_id', ['author_id'], 'author', [
            'id',
          ])
          .execute();

        await db.schema
          .createTable('comment')
          .addColumn('id', 'text', col => col.primaryKey())
          .addColumn('post_id', 'text', col => col.notNull())
          .addColumn('username', 'text', col => col.notNull())
          .addForeignKeyConstraint('comment_post_id', ['post_id'], 'post', [
            'id',
          ])
          .execute();

        const realm = new Realm();

        realm.define(Author, {
          sequences: {
            names: new Sequence(n => `Author ${n}` as const),
          },
          manifest: ({ uuid, sequences }) => ({
            id: uuid(),
            name: sequences.names.next(),
          }),
          persist: async author => {
            await db
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
          persist: async post => {
            await db
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
          persist: async comment => {
            await db
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

        return { db, realm };
      };

      it('persists an instance of each entity in the hierarchy', async () => {
        const { db, realm } = await performSetup();

        const leaves = await realm.persistLeaves();

        expect(leaves).toHaveLength(1);

        const comment = leaves[0];
        expect(Comment.is(comment)).toBe(true);
        assert.ok(Comment.is(comment));

        expect(comment).toEqual({
          id: expect.any(String),
          postId: expect.any(String),
          username: 'user1',
        });

        const authorsInDatabase = await db
          .selectFrom('author')
          .selectAll()
          .execute();

        expect(authorsInDatabase).toEqual([
          {
            id: expect.any(String),
            name: 'Author 1',
          },
        ]);

        const postsInDatabase = await db
          .selectFrom('post')
          .selectAll()
          .execute();

        expect(postsInDatabase).toEqual([
          {
            id: comment.postId,
            author_id: authorsInDatabase[0]?.id,
            title: 'Post 1',
          },
        ]);

        const commentsInDatabase = await db
          .selectFrom('comment')
          .selectAll()
          .execute();

        expect(commentsInDatabase).toEqual([
          {
            id: comment.id,
            post_id: comment.postId,
            username: comment.username,
          },
        ]);
      });
    });
  });
});
