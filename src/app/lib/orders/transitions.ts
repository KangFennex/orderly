import type { Order } from '@/app/types/orders'

export type OrderStatus = Order['status']

const orderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['picking'],
    picking: ['shipped', 'backorder'],
    shipped: [],
    backorder: [],
}

export function getNextOrderStatus(currentStatus: OrderStatus) {
    const nextStatuses = orderStatusTransitions[currentStatus]

    if (!nextStatuses || nextStatuses.length === 0) {
        return null
    }

    return nextStatuses[0]
}

export function canTransitionOrderStatus(currentStatus: OrderStatus, nextStatus: OrderStatus) {
    return orderStatusTransitions[currentStatus]?.includes(nextStatus) ?? false
}
