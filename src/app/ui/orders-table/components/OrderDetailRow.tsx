'use client'

import { TableCell, TableRow } from '@/components/ui/table'
import { formatDate } from '@/app/lib/orders'
import type { Order } from '@/app/types/orders'

type OrderDetailRowProps = {
    order: Order
}

export function OrderDetailRow({ order }: OrderDetailRowProps) {
    return (
        <TableRow className="orders-detail-row">
            <TableCell colSpan={6} className="orders-detail-cell">
                <dl className="orders-detail-list">
                    <div className="orders-detail-item">
                        <dt>Account Name</dt>
                        <dd>{order.account_name ?? '-'}</dd>
                    </div>
                    <div className="orders-detail-item">
                        <dt>Client PO</dt>
                        <dd>{order.client_po ?? '-'}</dd>
                    </div>
                    <div className="orders-detail-item">
                        <dt>Order Date</dt>
                        <dd>{formatDate(order.order_date)}</dd>
                    </div>
                    <div className="orders-detail-item">
                        <dt>Req. Pick Date</dt>
                        <dd>{formatDate(order.req_pick_date)}</dd>
                    </div>
                    <div className="orders-detail-item">
                        <dt>Req. Ship Date</dt>
                        <dd>{formatDate(order.req_ship_date)}</dd>
                    </div>
                    <div className="orders-detail-item">
                        <dt>WH Pick Date</dt>
                        <dd>{formatDate(order.wh_pick_date)}</dd>
                    </div>
                    <div className="orders-detail-item">
                        <dt>WH Del Date</dt>
                        <dd>{formatDate(order.wh_del_date)}</dd>
                    </div>
                    <div className="orders-detail-item">
                        <dt>Created At</dt>
                        <dd>{formatDate(order.created_at)}</dd>
                    </div>
                </dl>
            </TableCell>
        </TableRow>
    )
}
