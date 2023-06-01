import "reflect-metadata";
import {
  Attribute,
  Entity,
  INDEX_TYPE,
} from '@typedorm/common';

@Entity({
  name: 'MonthlyWalletIncome',
  primaryKey: {
    partitionKey: 'USER<{{userId}}>#WALLET<{{walletId}}>#MONTHLY_INCOME',
    sortKey: 'YEAR<{{year}}>#MONTH<{{month}}>',
  },
  indexes: {
    GSI1: {
      type: INDEX_TYPE.GSI,
      partitionKey: 'USER<{{userId}}>#WALLET#MONTHLY_INCOME',
      sortKey: 'YEAR<{{year}}>#MONTH<{{month}}>#WALLET<{{walletId}}>',
    },
  },
})
export class MonthlyWalletIncome {
  @Attribute()
  userId: string;

  @Attribute()
  walletId: string;

  @Attribute()
  year: number;

  @Attribute()
  month: number;

  @Attribute()
  amount: number;

  @Attribute()
  currencyCode: string;
}
