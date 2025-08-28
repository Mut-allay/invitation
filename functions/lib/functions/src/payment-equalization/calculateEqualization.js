"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateEqualization = void 0;
const calculateEqualization = (partsOrders, period) => {
    const total = partsOrders
        .filter(order => {
        const orderPeriod = order.orderDate.toISOString().slice(0, 7);
        return order.status === 'delivered' && orderPeriod === period;
    })
        .reduce((sum, order) => sum + order.totalAmount, 0);
    return total;
};
exports.calculateEqualization = calculateEqualization;
//# sourceMappingURL=calculateEqualization.js.map