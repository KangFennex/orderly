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
    isFavourite: boolean
    isFavouriteActionPending: boolean
    hasCustomReminder: boolean
    hasOrderNote: boolean
    onToggleExpand: (rowId: string) => void
    onToggleSelection: (orderId: string) => void
    onToggleFavourite: (orderId: string) => void
    onSetCustomReminder: (order: Order, remindAt: string) => void
    onClearCustomReminder: (orderId: string) => void
    onOpenNoteModal: (order: Order) => void
    onOpenViewModal: (order: Order) => void
    onChangeStatus: (orderId: string, nextStatus: Order['status']) => void
}

export function OrderTableRow({
    order,
    rowId,
    isExpanded,
    isSelected,
    isFavourite,
    isFavouriteActionPending,
    hasCustomReminder,
    hasOrderNote,
    onToggleExpand,
    onToggleSelection,
    onToggleFavourite,
    onSetCustomReminder,
    onClearCustomReminder,
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
                    isFavourite={isFavourite}
                    isFavouriteActionPending={isFavouriteActionPending}
                    hasCustomReminder={hasCustomReminder}
                    hasOrderNote={hasOrderNote}
                    isExpanded={isExpanded}
                    onToggleSelection={onToggleSelection}
                    onOpenViewModal={onOpenViewModal}
                    onToggleExpand={onToggleExpand}
                    onOpenNoteModal={onOpenNoteModal}
                    onToggleFavourite={onToggleFavourite}
                    onSetCustomReminder={onSetCustomReminder}
                    onClearCustomReminder={onClearCustomReminder}
                    order={order}
                />
                <TableCell>{order.oa_number ?? '-'}</TableCell>
                <TableCell>{order.account_code}</TableCell>
                <TableCell>{formatDate(order.req_del_date)}</TableCell>
                <TableCell>{formatDate(order.wh_ship_date)}</TableCell>
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
