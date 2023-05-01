import "reflect-metadata";
import {
  Attribute,
  AutoGenerateAttribute,
  AUTO_GENERATE_ATTRIBUTE_STRATEGY,
  Entity,
  INDEX_TYPE,
} from '@typedorm/common';

@Entity({
  name: 'wallet',
  primaryKey: {
    partitionKey: 'USER<{{userId}}>#WALLET<{{walletId}}>',
    sortKey: 'INFO',
  },
  indexes: {
    GSI1: {
      type: INDEX_TYPE.GSI,
      partitionKey: 'USER<{{userId}}>#WALLET',
      sortKey: 'WALLET<{{walletId}}>',
    },
  },
})
export class Wallet {
  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.UUID4,
  })
  walletId: string;

  @Attribute()
  userId: string;

  @Attribute()
  walletName: string;

  @Attribute()
  currencyCode: string;
}
