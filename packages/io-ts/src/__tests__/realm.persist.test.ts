import SqliteDatabase from 'better-sqlite3';
import * as t from 'io-ts';
import { Kysely, SqliteDialect, sql } from 'kysely';
import { describe, expect, it } from 'vitest';
import { Realm } from '../realm';
import { Database } from './database';
import { Class, Comment, Context, define } from './fixtures';

describe('Realm', () => {
  describe('persist', () => {
    const setupDatabase = async () => {
      const db = new Kysely<Database>({
        dialect: new SqliteDialect({
          database: async () => new SqliteDatabase(':memory:'),
        }),
      });

      return { db };
    };

    const Car = t.type({
      make: t.string,
      model: t.string,
    });

    const performSetup = async () => {
      const { db } = await setupDatabase();

      await db.schema
        .createTable('car')
        .addColumn('make', 'text', col => col.notNull())
        .addColumn('model', 'text', col => col.notNull())
        .execute();

      const context = { db };

      const realm = new Realm<typeof context>();

      realm.define(Car, {
        manifest: () => ({
          make: 'Honda',
          model: 'Civic',
        }),
        persist: async car => {
          await db
            .insertInto('car')
            .values({ make: car.make, model: car.model })
            .execute();

          return car;
        },
      });

      return { db, realm, context };
    };

    describe('with no overrides', () => {
      it('persists an instance of the provided type', async () => {
        const { db, realm, context } = await performSetup();

        const persisted = await realm.persist(Car, context);

        expect(persisted).toEqual({
          make: 'Honda',
          model: 'Civic',
        });

        const carFromDatabase = await db
          .selectFrom('car')
          .select(['make', 'model'])
          .executeTakeFirst();

        expect(carFromDatabase).toEqual(persisted);
      });
    });

    describe('with overrides', () => {
      it('persists an instance of the provided type with the overrides applied', async () => {
        const { db, realm, context } = await performSetup();

        const persisted = await realm.persist(Car, context, {
          model: 'CRV',
        });

        expect(persisted).toEqual({
          make: 'Honda',
          model: 'CRV',
        });

        const carFromDatabase = await db
          .selectFrom('car')
          .select(['make', 'model'])
          .executeTakeFirst();

        expect(carFromDatabase).toEqual(persisted);
      });
    });

    describe('for an entity hierarchy', () => {
      const performSetup = async () => {
        const { db } = await setupDatabase();

        await sql`pragma foreign_keys = on`.execute(db);

        await db.schema
          .createTable('kingdom')
          .addColumn('name', 'text', col => col.primaryKey())
          .execute();

        await db.schema
          .createTable('phylum')
          .addColumn('kingdom', 'text', col => col.notNull())
          .addColumn('name', 'text', col => col.primaryKey())
          .addForeignKeyConstraint('phylum_kingdom', ['kingdom'], 'kingdom', [
            'name',
          ])
          .execute();

        await db.schema
          .createTable('class')
          .addColumn('phylum', 'text', col => col.notNull())
          .addColumn('name', 'text', col => col.primaryKey())
          .addForeignKeyConstraint('class_phylum', ['phylum'], 'phylum', [
            'name',
          ])
          .execute();

        const realm = new Realm<Context>();

        define(realm);

        return { db, realm };
      };

      it('persists an instance of each entity in the hierarchy', async () => {
        const { db, realm } = await performSetup();

        await db.transaction().execute(async tx => {
          const persisted = await realm.persist(Class, { tx });

          expect(persisted).toEqual({
            phylum: 'Chordata',
            name: 'Mammalia',
          });

          const classFromDatabase = await tx
            .selectFrom('class')
            .select(['phylum', 'name'])
            .executeTakeFirst();

          expect(classFromDatabase).toEqual(persisted);

          const phylumFromDatabase = await tx
            .selectFrom('phylum')
            .select(['kingdom', 'name'])
            .executeTakeFirst();

          expect(phylumFromDatabase).toEqual({
            kingdom: 'Animalia',
            name: 'Chordata',
          });

          const kingdomFromDatabase = await tx
            .selectFrom('kingdom')
            .select('name')
            .executeTakeFirst();

          expect(kingdomFromDatabase).toEqual({ name: 'Animalia' });
        });
      });
    });

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

        define(realm);

        return { db, realm };
      };

      it('persists an instance of each entity in the hierarchy', async () => {
        const { db, realm } = await performSetup();

        await db.transaction().execute(async tx => {
          const comment = await realm.persist(Comment, { tx });

          const commentsInDatabase = await tx
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

          const postsInDatabase = await tx
            .selectFrom('post')
            .selectAll()
            .execute();

          expect(postsInDatabase).toEqual([
            {
              id: comment.postId,
              author_id: expect.any(String),
              title: expect.any(String),
            },
          ]);

          const authorsInDatabase = await tx
            .selectFrom('author')
            .selectAll()
            .execute();

          expect(authorsInDatabase).toEqual([
            { id: postsInDatabase[0]?.author_id, name: expect.any(String) },
          ]);
        });
      });
    });
  });
});
