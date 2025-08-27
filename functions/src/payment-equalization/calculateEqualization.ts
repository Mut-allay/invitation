
import { PartsOrderWithItems } from '../../../src/types/partsOrder';

export const calculateEqualization = (
  partsOrders: PartsOrderWithItems[],
  period: string
): number => {
  const total = partsOrders
    .filter(order => {
      const orderPeriod = order.orderDate.toISOString().slice(0, 7);
      return order.status === 'delivered' && orderPeriod === period;
    })
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return total;
};
