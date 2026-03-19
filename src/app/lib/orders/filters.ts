import type { Order } from '@/app/types/orders'
import { getDateRangeBounds, parseOrderDateValue, type DateRangeFilter } from '@/app/lib/orders/date-range'
import { matchesOrderSearch } from '@/app/lib/orders/search'

export type DateFilterField =
    | 'order_date'
    | 'req_pick_date'
    | 'req_ship_date'
    | 'req_del_date'
    | 'wh_pick_date'
    | 'wh_ship_date'
    | 'wh_del_date'

export type FilterStatus = Order['status']

type FilterOrdersArgs = {
    orders: Order[]
    selectedStatuses: Order['status'][]
    selectedDateField: DateFilterField
    selectedDateRange: DateRangeFilter | null
    searchTerm?: string
}

export function filterOrders({
    orders,
    selectedStatuses,
    selectedDateField,
    selectedDateRange,
    searchTerm = '',
}: FilterOrdersArgs) {
    const normalizedSearchTerm = searchTerm.trim()

    if (normalizedSearchTerm.length > 0) {
        return orders.filter((order) => matchesOrderSearch(order, normalizedSearchTerm))
    }

    return orders.filter((order) => {
        const statusMatches =
            selectedStatuses.length === 0
                ? true
                : selectedStatuses.includes(order.status)

        const dateMatches = selectedDateRange
            ? (() => {
                const orderDate = parseOrderDateValue(order[selectedDateField])

                if (!orderDate) {
                    return false
                }

                const { start, end } = getDateRangeBounds(selectedDateRange)
                return orderDate >= start && orderDate <= end
            })()
            : true

        const searchMatches = matchesOrderSearch(order, normalizedSearchTerm)

        return statusMatches && dateMatches && searchMatches
    })
}
