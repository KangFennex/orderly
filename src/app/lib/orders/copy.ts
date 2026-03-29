import type { Order } from '@/app/types/orders'

export const formatDateForCopy = (dateValue: string | null | undefined) => {
    if (!dateValue) {
        return '-'
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        const [year, month, day] = dateValue.split('-')
        return `${month}/${day}/${year}`
    }

    const parsedDate = new Date(dateValue)

    if (Number.isNaN(parsedDate.getTime())) {
        return dateValue
    }

    return new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    }).format(parsedDate)
}

const escapeCsvValue = (value: string) => {
    const escaped = value.replaceAll('"', '""')
    return `"${escaped}"`
}

export const buildSelectedOrdersPlainText = (selectedOrders: Order[]) => {
    return selectedOrders
        .map((order) =>
            [
                `OA ${order.oa_number ?? '-'}`,
                `Account ${order.account_code}`,
                `Client PO ${order.client_po ?? '-'}`,
                `Status ${order.status}`,
                `Req Del ${formatDateForCopy(order.req_del_date)}`,
                `WH Pick ${formatDateForCopy(order.wh_pick_date)}`,
                `WH Ship ${formatDateForCopy(order.wh_ship_date)}`,
            ].join(' | '),
        )
        .join('\n')
}

export const buildSelectedOrdersCsv = (selectedOrders: Order[]) => {
    const header = ['OA Number', 'Account Code', 'Client PO', 'Status', 'Req Del Date', 'WH Pick Date', 'WH Ship Date']
        .map(escapeCsvValue)
        .join(',')

    const rows = selectedOrders.map((order) =>
        [
            order.oa_number ?? '-',
            order.account_code,
            order.client_po ?? '-',
            order.status,
            formatDateForCopy(order.req_del_date),
            formatDateForCopy(order.wh_pick_date),
            formatDateForCopy(order.wh_ship_date),
        ]
            .map((value) => escapeCsvValue(String(value)))
            .join(','),
    )

    return [header, ...rows].join('\n')
}
