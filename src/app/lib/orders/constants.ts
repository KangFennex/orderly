import type { DateFilterField, FilterStatus } from '@/app/lib/orders/filters'
import type { DateRangeFilter } from '@/app/lib/orders/date-range'

export const orderStatusOptions: { value: FilterStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'picking', label: 'Picking' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'backorder', label: 'Backorder' },
]

export const orderDateFieldOptions: { value: DateFilterField; label: string }[] = [
    { value: 'req_ship_date', label: 'Req. Ship Date' },
    { value: 'req_del_date', label: 'Req. Del Date' },
    { value: 'req_pick_date', label: 'Req. Pick Date' },
    { value: 'wh_pick_date', label: 'WH Pick Date' },
    { value: 'wh_ship_date', label: 'WH Ship Date' },
    { value: 'wh_del_date', label: 'WH Del Date' },
    { value: 'order_date', label: 'Order Date' },
]

export const orderDateRangeOptions: { value: DateRangeFilter; label: string }[] = [
    { value: 'week', label: 'Week' },
    { value: '2-weeks', label: '2 Weeks' },
    { value: 'month', label: 'Month' },
    { value: 'next-month', label: 'Next Month' },
]
