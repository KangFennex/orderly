import { ColumnDef } from '@tanstack/react-table'

export type Order = {
    id: string
    oa_number: string | null
    account_code: string
    account_name: string | null
    client_po: string | null
    order_date: string | null
    req_pick_date: string | null
    req_ship_date: string | null
    req_del_date: string | null
    wh_pick_date: string | null
    wh_ship_date: string | null
    wh_del_date: string | null
    status: 'pending' | 'picking' | 'shipped' | 'backorder' | 'cancelled'
    created_at: string
}

export const columns: ColumnDef<Order>[] = [
    { accessorKey: 'oa_number', header: 'OA Number' },
    { accessorKey: 'account_code', header: 'Account Code' },
    { accessorKey: 'account_name', header: 'Account Name' },
    { accessorKey: 'client_po', header: 'Client PO' },
    { accessorKey: 'order_date', header: 'Order Date' },
    { accessorKey: 'req_pick_date', header: 'Req. Pick Date' },
    { accessorKey: 'req_ship_date', header: 'Req. Ship Date' },
    {
        accessorKey: 'req_del_date',
        header: 'Req. Del Date',
    },
    { accessorKey: 'wh_pick_date', header: 'WH Pick Date' },
    { accessorKey: 'wh_ship_date', header: 'WH Ship Date' },
    { accessorKey: 'wh_del_date', header: 'WH Del Date' },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status
            return status.charAt(0).toUpperCase() + status.slice(1)
        },
    },
    { accessorKey: 'created_at', header: 'Created At' },
]