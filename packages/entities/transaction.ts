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
    sortKey: 'CREATION<{{transactionTimestamp}}>#CURRENCY_CODE<{{currencyCode}}>',
  },
  indexes: {
    GSI1: {
      type: INDEX_TYPE.GSI,
      partitionKey: 'USER<{{userId}}>#WALLET#TRANSACTION',
      sortKey: 'CREATION<{{transactionTimestamp}}>#CURRENCY_CODE<{{currencyCode}}>#WALLET<{{walletId}}>#TRANSACTION<{{transactionId}}>',
    }
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
  categoryId: string;
  
  @Attribute()
  transactionTimestamp: number;

  @Attribute()
  transactionName: string;
  
  @Attribute()
  transactionAmount: number;

  @Attribute()
  isIncome: boolean;

  @Attribute()
  transactionCreationTimestamp: number;

  @Attribute()
  currencyCode: string;
}

export interface ITransaction {
    userId: string;
    walletId: string;
    categoryId: string;
    transactionId: string;
    transactionName: string;
    transactionAmount: number;
    transactionTimestamp: number;
    isIncome: boolean;
    transactionCreationTimestamp: number;
}
