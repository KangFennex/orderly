'use client'

import { Fragment, useState } from 'react'
import { FaRegNoteSticky } from 'react-icons/fa6'
import { ImShrink } from 'react-icons/im'
import { IoMdClose } from 'react-icons/io'
import { IoIosExpand } from 'react-icons/io'
import { MdDataSaverOn } from 'react-icons/md'
import { LuGrab } from 'react-icons/lu'
import { RiInboxArchiveLine } from 'react-icons/ri'
import { RiTruckLine } from 'react-icons/ri'
import {
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from '@tanstack/react-table'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { canTransitionOrderStatus } from '@/app/lib/orders'
import { useFavoritesStore } from '@/app/lib/favorites-store'
import { useOrderNotesStore } from '@/app/lib/order-notes-store'

import { columns, type Order } from '@/app/types/orders'

type OrdersDataTableProps = {
    data: Order[]
    onChangeStatus: (orderId: string, nextStatus: Order['status']) => void
}

export function OrdersDataTable({ data, onChangeStatus }: OrdersDataTableProps) {
    'use no memo'
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
    const [sorting, setSorting] = useState<SortingState>([])
    const [activeNoteOrderId, setActiveNoteOrderId] = useState<string | null>(null)
    const [noteDraft, setNoteDraft] = useState('')
    const favoriteOrderIds = useFavoritesStore((state) => state.favoriteOrderIds)
    const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
    const notesByOrderId = useOrderNotesStore((state) => state.notesByOrderId)
    const setOrderNote = useOrderNotesStore((state) => state.setOrderNote)

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    const toggleRow = (rowId: string) => {
        setExpandedRows((prev) => ({
            ...prev,
            [rowId]: !prev[rowId],
        }))
    }

    const openOrderNoteModal = (orderId: string) => {
        setActiveNoteOrderId(orderId)
        setNoteDraft(notesByOrderId[orderId] ?? '')
    }

    const closeOrderNoteModal = () => {
        setActiveNoteOrderId(null)
        setNoteDraft('')
    }

    const saveOrderNote = () => {
        if (!activeNoteOrderId) {
            return
        }

        setOrderNote(activeNoteOrderId, noteDraft)
        closeOrderNoteModal()
    }

    const formatDate = (dateValue: string | null | undefined) => {
        if (!dateValue) {
            return '-'
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            const [year, month, day] = dateValue.split('-')
            return `${month}/${day}/${year.slice(-2)}`
        }

        const parsedDate = new Date(dateValue)

        if (Number.isNaN(parsedDate.getTime())) {
            return dateValue
        }

        return new Intl.DateTimeFormat('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit',
        }).format(parsedDate)
    }

    const renderSortHeader = (columnId: keyof Order, label: string) => {
        const column = table.getColumn(columnId)
        const sortDirection = column?.getIsSorted()

        return (
            <button
                type="button"
                className="orders-sort-button"
                onClick={() => column?.toggleSorting(sortDirection === 'asc')}
            >
                <span>{label}</span>
                <span className="orders-sort-indicator" aria-hidden="true">
                    {sortDirection === 'asc' ? '▲' : sortDirection === 'desc' ? '▼' : '↕'}
                </span>
            </button>
        )
    }

    const getStatusClassName = (status: Order['status']) => {
        switch (status) {
            case 'backorder':
                return 'status-pill status-pill--backorder'
            case 'shipped':
                return 'status-pill status-pill--shipped'
            case 'picking':
                return 'status-pill status-pill--picking'
            case 'pending':
                return 'status-pill status-pill--pending'
            default:
                return 'status-pill'
        }
    }

    const formatStatusLabel = (status: Order['status']) => {
        return status.charAt(0).toUpperCase() + status.slice(1)
    }

    const getStatusRowClassName = (status: Order['status']) => {
        switch (status) {
            case 'shipped':
                return 'orders-data-row orders-data-row--shipped'
            case 'picking':
                return 'orders-data-row orders-data-row--picking'
            case 'pending':
                return 'orders-data-row orders-data-row--pending'
            case 'backorder':
                return 'orders-data-row orders-data-row--backorder'
            default:
                return 'orders-data-row'
        }
    }

    return (
        <div className="orders-table-card">
            <Table className="orders-table">
                <TableHeader>
                    <TableRow>
                        <TableHead className="orders-expand-head" />
                        <TableHead>{renderSortHeader('oa_number', 'OA Number')}</TableHead>
                        <TableHead>{renderSortHeader('account_code', 'Account Code')}</TableHead>
                        <TableHead>{renderSortHeader('account_name', 'Account Name')}</TableHead>
                        <TableHead>{renderSortHeader('req_del_date', 'Req. Del Date')}</TableHead>
                        <TableHead className="orders-status-head">{renderSortHeader('status', 'Status')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => {
                            const canSetPicking = canTransitionOrderStatus(row.original.status, 'picking')
                            const canSetShipped = canTransitionOrderStatus(row.original.status, 'shipped')
                            const canSetBackorder = canTransitionOrderStatus(row.original.status, 'backorder')
                            const isFavorite = favoriteOrderIds.includes(row.original.id)
                            const hasOrderNote = (notesByOrderId[row.original.id] ?? '').trim().length > 0

                            return (
                                <Fragment key={row.id}>
                                    <TableRow className={getStatusRowClassName(row.original.status)}>
                                        <TableCell className="orders-expand-cell">
                                            <div className="orders-row-actions">
                                                <button
                                                    type="button"
                                                    className="orders-expand-toggle"
                                                    onClick={() => toggleRow(row.id)}
                                                    aria-expanded={expandedRows[row.id] ? 'true' : 'false'}
                                                    aria-label={expandedRows[row.id] ? 'Collapse order details' : 'Expand order details'}
                                                >
                                                    <span className="orders-expand-icon" aria-hidden="true">
                                                        {expandedRows[row.id] ? <ImShrink size={11} /> : <IoIosExpand size={15} />}
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={hasOrderNote ? 'orders-note-toggle is-active' : 'orders-note-toggle'}
                                                    onClick={() => openOrderNoteModal(row.original.id)}
                                                    aria-label="Open order note"
                                                    title="Order note"
                                                >
                                                    <FaRegNoteSticky size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className={
                                                        isFavorite
                                                            ? 'orders-save-toggle is-active'
                                                            : 'orders-save-toggle'
                                                    }
                                                    onClick={() => toggleFavorite(row.original.id)}
                                                    aria-label={
                                                        isFavorite
                                                            ? 'Remove order from favorites'
                                                            : 'Add order to favorites'
                                                    }
                                                    title={
                                                        isFavorite
                                                            ? 'Remove from favorites'
                                                            : 'Add to favorites'
                                                    }
                                                >
                                                    <MdDataSaverOn size={14} />
                                                </button>
                                            </div>
                                        </TableCell>
                                        <TableCell>{row.original.oa_number}</TableCell>
                                        <TableCell>{row.original.account_code}</TableCell>
                                        <TableCell>{row.original.account_name ?? '-'}</TableCell>
                                        <TableCell>{formatDate(row.original.req_del_date)}</TableCell>
                                        <TableCell className="orders-status-cell">
                                            <div className="orders-status-cell-content">
                                                <span className={getStatusClassName(row.original.status)}>
                                                    {formatStatusLabel(row.original.status)}
                                                </span>
                                                <div className="orders-status-actions">
                                                    <button
                                                        type="button"
                                                        className="orders-status-icon-button"
                                                        onClick={() => onChangeStatus(row.original.id, 'picking')}
                                                        disabled={!canSetPicking}
                                                        aria-label="Set status to picking"
                                                        title="Set to picking"
                                                    >
                                                        <LuGrab size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="orders-status-icon-button"
                                                        onClick={() => onChangeStatus(row.original.id, 'shipped')}
                                                        disabled={!canSetShipped}
                                                        aria-label="Set status to shipped"
                                                        title="Set to shipped"
                                                    >
                                                        <RiTruckLine size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="orders-status-icon-button"
                                                        onClick={() => onChangeStatus(row.original.id, 'backorder')}
                                                        disabled={!canSetBackorder}
                                                        aria-label="Set status to backorder"
                                                        title="Set to backorder"
                                                    >
                                                        <RiInboxArchiveLine size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {expandedRows[row.id] ? (
                                        <TableRow className="orders-detail-row">
                                            <TableCell colSpan={6} className="orders-detail-cell">
                                                <dl className="orders-detail-list">
                                                    <div className="orders-detail-item">
                                                        <dt>Client PO</dt>
                                                        <dd>{row.original.client_po ?? '-'}</dd>
                                                    </div>
                                                    <div className="orders-detail-item">
                                                        <dt>Order Date</dt>
                                                        <dd>{formatDate(row.original.order_date)}</dd>
                                                    </div>
                                                    <div className="orders-detail-item">
                                                        <dt>Req. Pick Date</dt>
                                                        <dd>{formatDate(row.original.req_pick_date)}</dd>
                                                    </div>
                                                    <div className="orders-detail-item">
                                                        <dt>Req. Ship Date</dt>
                                                        <dd>{formatDate(row.original.req_ship_date)}</dd>
                                                    </div>
                                                    <div className="orders-detail-item">
                                                        <dt>WH Pick Date</dt>
                                                        <dd>{formatDate(row.original.wh_pick_date)}</dd>
                                                    </div>
                                                    <div className="orders-detail-item">
                                                        <dt>WH Ship Date</dt>
                                                        <dd>{formatDate(row.original.wh_ship_date)}</dd>
                                                    </div>
                                                    <div className="orders-detail-item">
                                                        <dt>WH Del Date</dt>
                                                        <dd>{formatDate(row.original.wh_del_date)}</dd>
                                                    </div>
                                                    <div className="orders-detail-item">
                                                        <dt>Created At</dt>
                                                        <dd>{formatDate(row.original.created_at)}</dd>
                                                    </div>
                                                </dl>
                                            </TableCell>
                                        </TableRow>
                                    ) : null}
                                </Fragment>
                            )
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No orders found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {activeNoteOrderId ? (
                <div className="add-order-modal-overlay" role="dialog" aria-modal="true" onClick={closeOrderNoteModal}>
                    <div className="order-note-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="order-note-modal-header">
                            <h3 className="order-note-modal-title">Order Note</h3>
                            <button
                                type="button"
                                className="add-order-close-button"
                                onClick={closeOrderNoteModal}
                                aria-label="Close order note modal"
                            >
                                <IoMdClose size={20} />
                            </button>
                        </div>
                        <div className="order-note-modal-content">
                            <textarea
                                className="order-note-textarea"
                                value={noteDraft}
                                onChange={(event) => setNoteDraft(event.target.value)}
                                placeholder="Write a note for this order"
                                aria-label="Order note"
                                rows={5}
                            />
                            <button
                                type="button"
                                className="order-note-save-button"
                                onClick={saveOrderNote}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}