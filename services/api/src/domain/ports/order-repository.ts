import { OrderCreation } from '@pizzakebab/domain-types';

export interface OrderRepository {
  create(input: OrderCreation): Promise<void>;
}
