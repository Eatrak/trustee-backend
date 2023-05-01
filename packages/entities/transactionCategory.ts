import "reflect-metadata";
import {
  Attribute,
  Entity
} from '@typedorm/common';

@Entity({
  name: 'transactionCategory',
  primaryKey: {
    partitionKey: 'USER<{{userId}}>#TRANSACTION#CATEGORY',
    sortKey: 'CATEGORY<{{transactionCategoryId}}>',
  }
})
export class TransactionCategory {
  @Attribute()
  transactionCategoryId: string;

  @Attribute()
  transactionCategoryName: string;

  @Attribute()
  userId: string;
}
