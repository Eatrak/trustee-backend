import "reflect-metadata";
import { INDEX_TYPE, Table } from '@typedorm/common';

export const mainTable = new Table({
  name: `trustee-${process.env.STAGE}`,
  partitionKey: 'PK',
  sortKey: 'SK',
  indexes: {
    GSI1: {
      partitionKey: 'GSI1PK',
      sortKey: 'GSI1SK',
      type: INDEX_TYPE.GSI,
    },
    GSI2: {
      partitionKey: 'GSI1PK',
      sortKey: 'GSI1SK',
      type: INDEX_TYPE.GSI,
    }
  },
});