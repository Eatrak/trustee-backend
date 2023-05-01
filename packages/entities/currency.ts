import "reflect-metadata";
import {
  Attribute,
  Entity
} from '@typedorm/common';

@Entity({
  name: 'currency',
  primaryKey: {
    partitionKey: 'CURRENCY',
    sortKey: 'CURRENCY<{{currencyCode}}>',
  }
})
export class Currency {
  @Attribute()
  currencyCode: string;

  @Attribute()
  currencySymbol: string;
}
