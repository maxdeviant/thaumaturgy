import assert from 'node:assert';
import { describe, expect, it } from 'vitest';
import { Realm } from '../realm';
import { setupDatabase } from './database';
import { Comment, Context, define } from './fixtures';

describe('Realm', () => {
  const performSetup = async () => {
    const { db } = await setupDatabase();

    const realm = new Realm<Context>();

    define(realm);

    return { db, realm };
  };

  describe('persistLeaves', () => {
    describe('for an entity hierarchy with randomly-generated IDs', () => {
      it('persists an instance of each entity in the hierarchy', async () => {
        const { db, realm } = await performSetup();

        await db.transaction().execute(async tx => {
          const leaves = await realm.persistLeaves({ tx });

          expect(leaves).toHaveLength(2);

          const comment = leaves[1];
          expect(Comment.is(comment)).toBe(true);
          assert.ok(Comment.is(comment));

          expect(comment).toEqual({
            id: expect.any(String),
            postId: expect.any(String),
            username: 'user1',
          });

          const authorsInDatabase = await tx
            .selectFrom('author')
            .selectAll()
            .execute();

          expect(authorsInDatabase).toEqual([
            {
              id: expect.any(String),
              name: 'Author 1',
            },
          ]);

          const postsInDatabase = await tx
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
        });
      });
    });
  });
});
