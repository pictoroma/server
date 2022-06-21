import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';
import * as tableNames from '../table-names';

class AddPostRemoved20200310205900 implements MigrationInterface {
  public up = async (runner: QueryRunner) => {
    await runner.addColumn(
      tableNames.POSTS,
      new TableColumn({
        name: 'removed',
        type: 'datetime',
        isNullable: true,
      })
    );
    await runner.createIndex(
      tableNames.POSTS,
      new TableIndex({
        columnNames: ['removed'],
      })
    )
  };

  public down = async () => {};
}

export { AddPostRemoved20200310205900 };
