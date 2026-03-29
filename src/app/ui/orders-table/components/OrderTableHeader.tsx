'use client'

import { TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Table } from '@tanstack/react-table'
import type { Order } from '@/app/types/orders'

type OrderTableHeaderProps = {
    table: Table<Order>
    onSortChange: (columnId: keyof Order, sortDirection: false | 'asc' | 'desc') => void
    areAllVisibleSelected: boolean
    dataLength: number
    onToggleSelectAll: () => void
}

export function OrderTableHeader({
    table,
    onSortChange,
    areAllVisibleSelected,
    dataLength,
    onToggleSelectAll,
}: OrderTableHeaderProps) {
    const renderSortHeader = (columnId: keyof Order, label: string) => {
        const column = table.getColumn(columnId)
        const sortDirection = column?.getIsSorted()

        return (
            <button
                type="button"
                className="orders-sort-button"
                onClick={() => {
                    const nextDirection =
                        sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? false : 'asc'
                    onSortChange(columnId, nextDirection)
                }}
            >
                <span>{label}</span>
                <span className="orders-sort-indicator" aria-hidden="true">
                    {sortDirection === 'asc' ? '▲' : sortDirection === 'desc' ? '▼' : '↕'}
                </span>
            </button>
        )
    }

    return (
        <TableHeader>
            <TableRow>
                <TableHead className="orders-expand-head">
                    <input
                        type="checkbox"
                        className="orders-select-checkbox"
                        checked={areAllVisibleSelected && dataLength > 0}
                        onChange={onToggleSelectAll}
                        aria-label="Select all visible orders"
                    />
                </TableHead>
                <TableHead>{renderSortHeader('oa_number', 'OA Number')}</TableHead>
                <TableHead>{renderSortHeader('account_code', 'Account Code')}</TableHead>
                <TableHead>{renderSortHeader('req_del_date', 'Req. Del Date')}</TableHead>
                <TableHead>{renderSortHeader('wh_ship_date', 'WH Ship Date')}</TableHead>
                <TableHead className="orders-status-head">
                    {renderSortHeader('status', 'Status')}
                </TableHead>
            </TableRow>
        </TableHeader>
    )
}
