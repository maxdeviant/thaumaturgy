import { describe, expect, it } from 'vitest';
import { Realm } from '../realm';
import { setupDatabase } from './database';
import { Car, Class, Comment, Context, define } from './fixtures';

describe('Realm', () => {
  const performSetup = async () => {
    const { db } = await setupDatabase();

    const realm = new Realm<Context>();

    define(realm);

    return { db, realm };
  };

  describe('persist', () => {
    describe('with no overrides', () => {
      it('persists an instance of the provided type', async () => {
        const { db, realm } = await performSetup();

        await db.transaction().execute(async tx => {
          const persisted = await realm.persist(Car, { tx });

          expect(persisted).toEqual({
            make: 'Honda',
            model: 'Civic',
          });

          const carFromDatabase = await tx
            .selectFrom('car')
            .select(['make', 'model'])
            .executeTakeFirst();

          expect(carFromDatabase).toEqual(persisted);
        });
      });
    });

    describe('with overrides', () => {
      it('persists an instance of the provided type with the overrides applied', async () => {
        const { db, realm } = await performSetup();

        await db.transaction().execute(async tx => {
          const persisted = await realm.persist(
            Car,
            { tx },
            {
              model: 'CRV',
            }
          );

          expect(persisted).toEqual({
            make: 'Honda',
            model: 'CRV',
          });

          const carFromDatabase = await tx
            .selectFrom('car')
            .select(['make', 'model'])
            .executeTakeFirst();

          expect(carFromDatabase).toEqual(persisted);
        });
      });
    });

    describe('for an entity hierarchy', () => {
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
