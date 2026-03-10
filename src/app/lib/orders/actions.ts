import type { Order } from '@/app/types/orders'
import { canTransitionOrderStatus, getNextOrderStatus } from '@/app/lib/orders/transitions'

type StatusUpdateResult =
    | { ok: true; order: Order }
    | { ok: false; reason: string }

export function updateOrderStatus(order: Order, nextStatus: Order['status']): StatusUpdateResult {
    if (!canTransitionOrderStatus(order.status, nextStatus)) {
        return {
            ok: false,
            reason: `Invalid status transition from ${order.status} to ${nextStatus}`,
        }
    }

    return {
        ok: true,
        order: {
            ...order,
            status: nextStatus,
        },
    }
}

export function advanceOrderStatus(order: Order): StatusUpdateResult {
    const nextStatus = getNextOrderStatus(order.status)

    if (!nextStatus) {
        return {
            ok: false,
            reason: `Order already at terminal status: ${order.status}`,
        }
    }

    return updateOrderStatus(order, nextStatus)
}
