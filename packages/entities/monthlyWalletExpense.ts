import "reflect-metadata";
import {
  Attribute,
  Entity,
  INDEX_TYPE,
} from '@typedorm/common';

@Entity({
  name: 'MonthlyWalletExpense',
  primaryKey: {
    partitionKey: 'USER<{{userId}}>#WALLET<{{walletId}}>#MONTHLY_EXPENSE',
    sortKey: 'CURRENCY_CODE<{{currencyCode}}>#YEAR<{{year}}>#MONTH<{{month}}>',
  },
  indexes: {
    GSI1: {
      type: INDEX_TYPE.GSI,
      partitionKey: 'USER<{{userId}}>#WALLET#MONTHLY_EXPENSE',
      sortKey: 'CURRENCY_CODE<{{currencyCode}}>#YEAR<{{year}}>#MONTH<{{month}}>#WALLET<{{walletId}}>',
    },
  },
})
export class MonthlyWalletExpense {
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
