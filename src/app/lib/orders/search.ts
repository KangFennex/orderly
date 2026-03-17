import type { Order } from '@/app/types/orders'

function normalizeSearchValue(value: string) {
    return value.trim().toLowerCase()
}

export function matchesOrderSearch(order: Order, rawSearchTerm: string) {
    const searchTerm = normalizeSearchValue(rawSearchTerm)

    if (!searchTerm) {
        return true
    }

    const searchableValues: string[] = [
        order.id,
        order.oa_number ?? '',
        order.account_code,
        order.account_name ?? '',
        order.client_po ?? '',
        order.status,
        order.order_date ?? '',
        order.req_pick_date ?? '',
        order.req_ship_date ?? '',
        order.req_del_date ?? '',
        order.wh_pick_date ?? '',
        order.wh_ship_date ?? '',
        order.wh_del_date ?? '',
        order.created_at,
    ]

    return searchableValues
        .map((value) => value.toLowerCase())
        .some((value) => value.includes(searchTerm))
}
