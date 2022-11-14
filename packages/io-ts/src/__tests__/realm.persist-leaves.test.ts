import { Sequence } from '@thaumaturgy/core';
import * as t from 'io-ts';
import assert from 'node:assert';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { Realm } from '../realm';
import { Ref } from '../ref';

describe('Realm', () => {
  describe('persistLeaves', () => {
    const setupDatabase = async () => {
      const db = await open({
        filename: ':memory:',
        driver: sqlite3.Database,
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

        await db.exec('pragma foreign_keys = on');
        await db.exec(
          'create table author (id text primary key, name text not null)'
        );
        await db.exec(
          'create table post (id text primary key, author_id text not null, title text not null, foreign key(author_id) references author(id))'
        );
        await db.exec(
          'create table comment (id text primary key, post_id text not null, username text not null, foreign key(post_id) references post(id))'
        );

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
            await db.run(
              'insert into author (id, name) values (?, ?)',
              author.id,
              author.name
            );

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
            await db.run(
              'insert into post (id, author_id, title) values (?, ?, ?)',
              post.id,
              post.authorId,
              post.title
            );

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
            await db.run(
              'insert into comment (id, post_id, username) values (?, ?, ?)',
              comment.id,
              comment.postId,
              comment.username
            );

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

        const authorsInDatabase = await db.all('select * from author');

        expect(authorsInDatabase).toEqual([
          {
            id: expect.any(String),
            name: 'Author 1',
          },
        ]);

        const postsInDatabase = await db.all('select * from post');

        expect(postsInDatabase).toEqual([
          {
            id: comment.postId,
            author_id: authorsInDatabase[0].id,
            title: 'Post 1',
          },
        ]);

        const commentsInDatabase = await db.all('select * from comment');

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
