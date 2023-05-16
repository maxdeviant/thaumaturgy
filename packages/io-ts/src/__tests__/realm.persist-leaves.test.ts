import SqliteDatabase from 'better-sqlite3';
import { Kysely, SqliteDialect, sql } from 'kysely';
import assert from 'node:assert';
import { describe, expect, it } from 'vitest';
import { Realm } from '../realm';
import { Database } from './database';
import { Comment, Context } from './fixtures';

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

        const realm = new Realm<Context>();

        return { db, realm };
      };

      it('persists an instance of each entity in the hierarchy', async () => {
        const { db, realm } = await performSetup();

        await db.transaction().execute(async tx => {
          const leaves = await realm.persistLeaves({ tx });

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
});
