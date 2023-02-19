import "reflect-metadata";
import {
  Attribute,
  AutoGenerateAttribute,
  AUTO_GENERATE_ATTRIBUTE_STRATEGY,
  Entity,
  INDEX_TYPE,
} from '@typedorm/common';

@Entity({
  name: 'transaction',
  primaryKey: {
    partitionKey: 'USER<{{userId}}>#WALLET<{{walletId}}>#TRANSACTION<{{transactionId}}>',
    sortKey: 'CREATION<{{transactionTimestamp}}>',
  },
  indexes: {
    GSI1: {
      type: INDEX_TYPE.GSI,
      partitionKey: 'USER<{{userId}}>#WALLET#TRANSACTION',
      sortKey: 'CREATION<{{transactionTimestamp}}>#WALLET<{{walletId}}>#TRANSACTION<{{transactionId}}>',
    },
  },
})
export class Transaction {
  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.UUID4,
  })
  transactionId: string;

  @Attribute()
  userId: string;

  @Attribute()
  walletId: string;
  
  @Attribute()
  transactionTimestamp: string;

  @Attribute()
  categoryName: string;

  @Attribute()
  transactionName: string;

  @Attribute()
  itemCreationTimestamp: string;
}

export interface ITransaction {
    userId: string;
    walletId: string;
    categoryName: string;
    transactionId: string;
    transactionName: string;
    transactionTimestamp: string;
    itemCreationTimestamp: string;
}
