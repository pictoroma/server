import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';
import * as tableNames from '../table-names';

class AddMeta20200310205800 implements MigrationInterface {
  public up = async (runner: QueryRunner) => {
    await runner.addColumn(
      tableNames.FEEDS,
      new TableColumn({
        name: 'removed',
        type: 'datetime',
        isNullable: true,
      })
    );
    await runner.createIndex(
      tableNames.FEEDS,
      new TableIndex({
        columnNames: ['removed'],
      })
    )

    await runner.addColumn(
      tableNames.USERS,
      new TableColumn({
        name: 'removed',
        type: 'datetime',
        isNullable: true,
      })
    );

    await runner.createIndex(
      tableNames.USERS,
      new TableIndex({
        columnNames: ['removed'],
      })
    )

    await runner.addColumn(
      tableNames.COMMENTS,
      new TableColumn({
        name: 'removed',
        type: 'datetime',
        isNullable: true,
      })
    );

    await runner.createIndex(
      tableNames.COMMENTS,
      new TableIndex({
        columnNames: ['removed'],
      })
    )

    await runner.addColumn(
      tableNames.MEDIA,
      new TableColumn({
        name: 'removed',
        type: 'datetime',
        isNullable: true,
      })
    );

    await runner.createIndex(
      tableNames.MEDIA,
      new TableIndex({
        columnNames: ['removed'],
      })
    )

  };

  public down = async () => {};
}

export { AddMeta20200310205800 };
