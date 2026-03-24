'use client'

import { Fragment } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { canTransitionOrderStatus, formatDate, getStatusRowClassName } from '@/app/lib/orders'
import { OrderRowActionsCell } from './OrderRowActionsCell'
import { OrderStatusCell } from './OrderStatusCell'
import { OrderDetailRow } from './OrderDetailRow'
import type { Order } from '@/app/types/orders'

type OrderTableRowProps = {
    order: Order
    rowId: string
    isExpanded: boolean
    isSelected: boolean
    isFavorite: boolean
    isFavoriteActionPending: boolean
    hasOrderNote: boolean
    onToggleExpand: (rowId: string) => void
    onToggleSelection: (orderId: string) => void
    onToggleFavorite: (orderId: string) => void
    onOpenNoteModal: (orderId: string) => void
    onOpenViewModal: (order: Order) => void
    onChangeStatus: (orderId: string, nextStatus: Order['status']) => void
}

export function OrderTableRow({
    order,
    rowId,
    isExpanded,
    isSelected,
    isFavorite,
    isFavoriteActionPending,
    hasOrderNote,
    onToggleExpand,
    onToggleSelection,
    onToggleFavorite,
    onOpenNoteModal,
    onOpenViewModal,
    onChangeStatus,
}: OrderTableRowProps) {
    const canSetPending = canTransitionOrderStatus(order.status, 'pending')
    const canSetPicking = canTransitionOrderStatus(order.status, 'picking')
    const canSetShipped = canTransitionOrderStatus(order.status, 'shipped')
    const canSetBackorder = canTransitionOrderStatus(order.status, 'backorder')
    const canSetCancelled = canTransitionOrderStatus(order.status, 'cancelled')

    return (
        <Fragment>
            <TableRow className={getStatusRowClassName(order.status)}>
                <OrderRowActionsCell
                    orderId={order.id}
                    rowId={rowId}
                    oaNumber={order.oa_number}
                    isSelected={isSelected}
                    isFavorite={isFavorite}
                    isFavoriteActionPending={isFavoriteActionPending}
                    hasOrderNote={hasOrderNote}
                    isExpanded={isExpanded}
                    onToggleSelection={onToggleSelection}
                    onOpenViewModal={onOpenViewModal}
                    onToggleExpand={onToggleExpand}
                    onOpenNoteModal={onOpenNoteModal}
                    onToggleFavorite={onToggleFavorite}
                    order={order}
                />
                <TableCell>{order.oa_number ?? '-'}</TableCell>
                <TableCell>{order.account_code}</TableCell>
                <TableCell>{order.account_name ?? '-'}</TableCell>
                <TableCell>{formatDate(order.req_del_date)}</TableCell>
                <OrderStatusCell
                    orderId={order.id}
                    status={order.status}
                    canSetPending={canSetPending}
                    canSetPicking={canSetPicking}
                    canSetShipped={canSetShipped}
                    canSetBackorder={canSetBackorder}
                    canSetCancelled={canSetCancelled}
                    onChangeStatus={onChangeStatus}
                />
            </TableRow>

            {isExpanded && <OrderDetailRow order={order} />}
        </Fragment>
    )
}
