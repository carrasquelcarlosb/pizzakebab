import { OrderCreation } from '../models/order';

export interface OrderRepository {
  create(input: OrderCreation): Promise<void>;
}
