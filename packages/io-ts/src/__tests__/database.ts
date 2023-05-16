import SqliteDatabase from 'better-sqlite3';
import { Kysely, SqliteDialect, sql } from 'kysely';

interface Car {
  make: string;
  model: string;
}

interface Kingdom {
  name: string;
}

interface Phylum {
  kingdom: string;
  name: string;
}

interface Class {
  phylum: string;
  name: string;
}

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

export interface Database {
  car: Car;
  kingdom: Kingdom;
  phylum: Phylum;
  class: Class;
  author: Author;
  post: Post;
  comment: Comment;
}

export const setupDatabase = async () => {
  const db = new Kysely<Database>({
    dialect: new SqliteDialect({
      database: async () => new SqliteDatabase(':memory:'),
    }),
  });

  await sql`pragma foreign_keys = on`.execute(db);

  await db.schema
    .createTable('car')
    .addColumn('make', 'text', col => col.notNull())
    .addColumn('model', 'text', col => col.notNull())
    .execute();

  await db.schema
    .createTable('kingdom')
    .addColumn('name', 'text', col => col.primaryKey())
    .execute();

  await db.schema
    .createTable('phylum')
    .addColumn('kingdom', 'text', col => col.notNull())
    .addColumn('name', 'text', col => col.primaryKey())
    .addForeignKeyConstraint('phylum_kingdom', ['kingdom'], 'kingdom', ['name'])
    .execute();

  await db.schema
    .createTable('class')
    .addColumn('phylum', 'text', col => col.notNull())
    .addColumn('name', 'text', col => col.primaryKey())
    .addForeignKeyConstraint('class_phylum', ['phylum'], 'phylum', ['name'])
    .execute();

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
    .addForeignKeyConstraint('post_author_id', ['author_id'], 'author', ['id'])
    .execute();

  await db.schema
    .createTable('comment')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('post_id', 'text', col => col.notNull())
    .addColumn('username', 'text', col => col.notNull())
    .addForeignKeyConstraint('comment_post_id', ['post_id'], 'post', ['id'])
    .execute();

  return { db };
};
