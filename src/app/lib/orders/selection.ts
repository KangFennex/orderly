import type { Order } from '@/app/types/orders'

export const toggleOrderSelectionIds = (selectedOrderIds: string[], orderId: string) => {
    return selectedOrderIds.includes(orderId)
        ? selectedOrderIds.filter((id) => id !== orderId)
        : [...selectedOrderIds, orderId]
}

export const toggleSelectAllVisibleOrderIds = (
    selectedOrderIds: string[],
    visibleOrderIds: string[],
    areAllVisibleSelected: boolean,
) => {
    if (areAllVisibleSelected) {
        return selectedOrderIds.filter((id) => !visibleOrderIds.includes(id))
    }

    const merged = new Set([...selectedOrderIds, ...visibleOrderIds])
    return Array.from(merged)
}

export const areAllVisibleOrderIdsSelected = (
    selectedOrderIds: string[],
    visibleOrderIds: string[],
) => {
    return visibleOrderIds.length > 0 && visibleOrderIds.every((id) => selectedOrderIds.includes(id))
}

export const getSelectedOrdersByIds = (orders: Order[], selectedOrderIds: string[]) => {
    return orders.filter((order) => selectedOrderIds.includes(order.id))
}
