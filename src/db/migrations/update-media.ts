

import { Table, MigrationInterface, QueryRunner, TableForeignKey, TableIndex, TableColumn } from "typeorm";
import * as tableNames from '../table-names';

class UpdateMedia20200303205800 implements MigrationInterface {
  public up = async (runner: QueryRunner) => {
    await runner.addColumn(tableNames.MEDIA, new TableColumn({
      name: 'order', type: 'int', isNullable: true,
    }))
    await runner.addColumn(tableNames.MEDIA, new TableColumn({
      name: 'created_at', type: 'datetime', isNullable: true,
    }))
  }

  public down = async () => {};
}

export { UpdateMedia20200303205800 };
