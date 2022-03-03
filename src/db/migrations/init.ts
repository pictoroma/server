import {
  Table,
  MigrationInterface,
  QueryRunner,
  TableForeignKey,
  TableIndex,
} from 'typeorm';
import * as tableNames from '../table-names';

class Init20200214205800 implements MigrationInterface {
  public up = async (runner: QueryRunner) => {
    await runner.createTable(
      new Table({
        name: tableNames.USERS,
        columns: [
          { name: 'id', type: 'varchar', isPrimary: true },
          {
            name: 'username',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          { name: 'name', type: 'varchar', isNullable: true },
          { name: 'admin', type: 'boolean', isNullable: false },
          { name: 'secret', type: 'varchar', isNullable: true },
          { name: 'creationToken', type: 'varchar', isNullable: true },
        ],
      })
    );
    await runner.createIndex(
      tableNames.USERS,
      new TableIndex({
        columnNames: ['username'],
      })
    );
    await runner.createIndex(
      tableNames.USERS,
      new TableIndex({
        columnNames: ['creationToken'],
      })
    );

    await runner.createTable(
      new Table({
        name: tableNames.FEEDS,
        columns: [
          { name: 'id', type: 'varchar', isPrimary: true },
          { name: 'name', type: 'varchar', isNullable: false },
        ],
      })
    );

    await runner.createTable(
      new Table({
        name: tableNames.MEDIA,
        columns: [
          { name: 'id', type: 'varchar', isPrimary: true },
          { name: 'content_type', type: 'varchar', isNullable: true },
          { name: 'size', type: 'int', isNullable: false },
          { name: 'creator_id', type: 'varchar', isNullable: false },
          { name: 'post_id', type: 'varchar', isNullable: true },
          { name: 'lowres', type: 'string', isNullable: true },
          { name: 'aspect', type: 'int', isNullable: true },
          { name: 'type', type: 'varchar', isNullable: true },
          { name: 'filename', type: 'varchar', isNullable: true },
        ],
      })
    );

    await runner.createTable(
      new Table({
        name: tableNames.POSTS,
        columns: [
          { name: 'id', type: 'varchar', isPrimary: true },
          { name: 'creator_id', type: 'varchar', isNullable: false },
          { name: 'feed_id', type: 'varchar', isNullable: false },
          { name: 'created_at', type: 'datetime', isNullable: false },
          { name: 'body', type: 'string', isNullable: false },
        ],
      })
    );

    await runner.createIndex(
      tableNames.POSTS,
      new TableIndex({
        columnNames: ['feed_id'],
      })
    );
    await runner.createIndex(
      tableNames.POSTS,
      new TableIndex({
        columnNames: ['created_at'],
      })
    );

    await runner.createTable(
      new Table({
        name: tableNames.USER_FEED_RELATIONS,
        columns: [
          { name: 'user_id', type: 'varchar', isNullable: false },
          { name: 'feed_id', type: 'varchar', isNullable: false },
          { name: 'access_type', type: 'string', isNullable: false },
        ],
      })
    );

    await runner.createPrimaryKey(tableNames.USER_FEED_RELATIONS, [
      'user_id',
      'feed_id',
    ]);

    await runner.createTable(
      new Table({
        name: tableNames.POST_MEDIA_RELATIONS,
        columns: [
          { name: 'media_id', type: 'varchar', isNullable: false },
          { name: 'post_id', type: 'varchar', isNullable: false },
        ],
      })
    );
    await runner.createPrimaryKey(tableNames.POST_MEDIA_RELATIONS, [
      'media_id',
      'post_id',
    ]);

    await runner.createTable(
      new Table({
        name: tableNames.COMMENTS,
        columns: [
          { name: 'id', type: 'varchar', isPrimary: true },
          { name: 'creator_id', type: 'varchar', isNullable: false },
          { name: 'post_id', type: 'varchar', isNullable: false },
          { name: 'created_at', type: 'datetime', isNullable: false },
          { name: 'content', type: 'string', isNullable: false },
        ],
      })
    );
    await runner.createIndex(
      tableNames.COMMENTS,
      new TableIndex({
        columnNames: ['post_id'],
      })
    );

    await runner.createForeignKey(
      tableNames.MEDIA,
      new TableForeignKey({
        columnNames: ['creator_id'],
        referencedColumnNames: ['id'],
        referencedTableName: tableNames.USERS,
      })
    );

    await runner.createForeignKey(
      tableNames.MEDIA,
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedColumnNames: ['id'],
        referencedTableName: tableNames.POSTS,
      })
    );

    await runner.createForeignKey(
      tableNames.POSTS,
      new TableForeignKey({
        columnNames: ['creator_id'],
        referencedColumnNames: ['id'],
        referencedTableName: tableNames.USERS,
      })
    );

    await runner.createForeignKey(
      tableNames.POSTS,
      new TableForeignKey({
        columnNames: ['feed_id'],
        referencedColumnNames: ['id'],
        referencedTableName: tableNames.FEEDS,
      })
    );

    await runner.createForeignKey(
      tableNames.USER_FEED_RELATIONS,
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: tableNames.USERS,
      })
    );

    await runner.createForeignKey(
      tableNames.USER_FEED_RELATIONS,
      new TableForeignKey({
        columnNames: ['feed_id'],
        referencedColumnNames: ['id'],
        referencedTableName: tableNames.FEEDS,
      })
    );

    await runner.createForeignKey(
      tableNames.COMMENTS,
      new TableForeignKey({
        columnNames: ['creator_id'],
        referencedColumnNames: ['id'],
        referencedTableName: tableNames.USERS,
      })
    );

    await runner.createForeignKey(
      tableNames.COMMENTS,
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedColumnNames: ['id'],
        referencedTableName: tableNames.POSTS,
      })
    );

    await runner.createForeignKey(
      tableNames.POST_MEDIA_RELATIONS,
      new TableForeignKey({
        columnNames: ['media_id'],
        referencedColumnNames: ['id'],
        referencedTableName: tableNames.MEDIA,
      })
    );

    await runner.createForeignKey(
      tableNames.POST_MEDIA_RELATIONS,
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedColumnNames: ['id'],
        referencedTableName: tableNames.POSTS,
      })
    );
  };

  public down = async (runner: QueryRunner) => {
    await runner.dropTable(tableNames.USER_FEED_RELATIONS);
    await runner.dropTable(tableNames.MEDIA);
    await runner.dropTable(tableNames.COMMENTS);
    await runner.dropTable(tableNames.POSTS);
    await runner.dropTable(tableNames.FEEDS);
    await runner.dropTable(tableNames.USERS);
  };
}

export { Init20200214205800 };
