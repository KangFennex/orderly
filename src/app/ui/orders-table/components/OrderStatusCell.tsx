'use client'

import { MdAccessTime } from 'react-icons/md'
import { LuGrab } from 'react-icons/lu'
import { RiTruckLine } from 'react-icons/ri'
import { RiInboxArchiveLine } from 'react-icons/ri'
import { MdCancelScheduleSend } from 'react-icons/md'
import { TableCell } from '@/components/ui/table'
import {
    getStatusClassName,
    formatStatusLabel,
} from '@/app/lib/orders'
import type { Order } from '@/app/types/orders'

type OrderStatusCellProps = {
    orderId: string
    status: Order['status']
    canSetPending: boolean
    canSetPicking: boolean
    canSetShipped: boolean
    canSetBackorder: boolean
    canSetCancelled: boolean
    onChangeStatus: (orderId: string, nextStatus: Order['status']) => void
}

export function OrderStatusCell({
    orderId,
    status,
    canSetPending,
    canSetPicking,
    canSetShipped,
    canSetBackorder,
    canSetCancelled,
    onChangeStatus,
}: OrderStatusCellProps) {
    return (
        <TableCell className="orders-status-cell">
            <div className="orders-status-cell-content">
                <div className="orders-status-actions">
                    <button
                        type="button"
                        className="orders-status-icon-button"
                        onClick={() => onChangeStatus(orderId, 'pending')}
                        disabled={!canSetPending}
                        aria-label="Set status to pending"
                        title="Set to pending"
                    >
                        <MdAccessTime size={16} />
                    </button>
                    <button
                        type="button"
                        className="orders-status-icon-button"
                        onClick={() => onChangeStatus(orderId, 'picking')}
                        disabled={!canSetPicking}
                        aria-label="Set status to picking"
                        title="Set to picking"
                    >
                        <LuGrab size={16} />
                    </button>
                    <button
                        type="button"
                        className="orders-status-icon-button"
                        onClick={() => onChangeStatus(orderId, 'shipped')}
                        disabled={!canSetShipped}
                        aria-label="Set status to shipped"
                        title="Set to shipped"
                    >
                        <RiTruckLine size={16} />
                    </button>
                    <button
                        type="button"
                        className="orders-status-icon-button"
                        onClick={() => onChangeStatus(orderId, 'backorder')}
                        disabled={!canSetBackorder}
                        aria-label="Set status to backorder"
                        title="Set to backorder"
                    >
                        <RiInboxArchiveLine size={16} />
                    </button>
                    <button
                        type="button"
                        className="orders-status-icon-button"
                        onClick={() => onChangeStatus(orderId, 'cancelled')}
                        disabled={!canSetCancelled}
                        aria-label="Set status to cancelled"
                        title="Set to cancelled"
                    >
                        <MdCancelScheduleSend size={16} />
                    </button>
                </div>
                <span className={getStatusClassName(status)}>
                    {formatStatusLabel(status)}
                </span>
            </div>
        </TableCell>
    )
}
