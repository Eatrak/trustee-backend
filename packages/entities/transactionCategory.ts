import "reflect-metadata";
import {
  Attribute,
  AutoGenerateAttribute,
  AUTO_GENERATE_ATTRIBUTE_STRATEGY,
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
  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.UUID4,
  })
  transactionCategoryId: string;

  @Attribute()
  transactionCategoryName: string;

  @Attribute()
  userId: string;
}
