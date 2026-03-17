'use client'

import { Fragment, useState } from 'react'
import { FaRegNoteSticky } from 'react-icons/fa6'
import { ImEnlarge2 } from 'react-icons/im'
import { IoMdClose } from 'react-icons/io'
import { IoIosExpand } from 'react-icons/io'
import { MdCancelScheduleSend } from 'react-icons/md'
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
import { canTransitionOrderStatus, orderStatusOptions } from '@/app/lib/orders'
import { useFavoritesStore } from '@/app/lib/favorites-store'
import { useOrderNotesStore } from '@/app/lib/order-notes-store'

import { columns, type Order } from '@/app/types/orders'

type OrdersDataTableProps = {
    data: Order[]
    onChangeStatus: (orderId: string, nextStatus: Order['status']) => void
    onUpdateOrder: (orderId: string, updates: Partial<Order>) => Promise<boolean>
    selectedOrderIds: string[]
    onToggleOrderSelection: (orderId: string) => void
    onToggleSelectAllVisible: () => void
    areAllVisibleSelected: boolean
}

export function OrdersDataTable({
    data,
    onChangeStatus,
    onUpdateOrder,
    selectedOrderIds,
    onToggleOrderSelection,
    onToggleSelectAllVisible,
    areAllVisibleSelected,
}: OrdersDataTableProps) {
    'use no memo'
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
    const [sorting, setSorting] = useState<SortingState>([])
    const [activeNoteOrderId, setActiveNoteOrderId] = useState<string | null>(null)
    const [noteDraft, setNoteDraft] = useState('')
    const [activeViewOrder, setActiveViewOrder] = useState<Order | null>(null)
    const [isSavingOrderEdit, setIsSavingOrderEdit] = useState(false)
    const [orderEditDraft, setOrderEditDraft] = useState<{
        oa_number: string
        account_code: string
        account_name: string
        client_po: string
        status: Order['status']
        order_date: string
        req_pick_date: string
        req_ship_date: string
        req_del_date: string
        wh_pick_date: string
        wh_ship_date: string
        wh_del_date: string
        created_at: string
    } | null>(null)
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

    const toDateInputValue = (dateValue: string | null | undefined) => {
        if (!dateValue) {
            return ''
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue
        }

        const parsedDate = new Date(dateValue)

        if (Number.isNaN(parsedDate.getTime())) {
            return ''
        }

        return parsedDate.toISOString().slice(0, 10)
    }

    const openOrderViewModal = (order: Order) => {
        setActiveViewOrder(order)
        setOrderEditDraft({
            oa_number: order.oa_number ?? '',
            account_code: order.account_code,
            account_name: order.account_name ?? '',
            client_po: order.client_po ?? '',
            status: order.status,
            order_date: toDateInputValue(order.order_date),
            req_pick_date: toDateInputValue(order.req_pick_date),
            req_ship_date: toDateInputValue(order.req_ship_date),
            req_del_date: toDateInputValue(order.req_del_date),
            wh_pick_date: toDateInputValue(order.wh_pick_date),
            wh_ship_date: toDateInputValue(order.wh_ship_date),
            wh_del_date: toDateInputValue(order.wh_del_date),
            created_at: formatDate(order.created_at),
        })
    }

    const getComparableDraftFromOrder = (order: Order) => ({
        oa_number: order.oa_number ?? '',
        account_name: order.account_name ?? '',
        client_po: order.client_po ?? '',
        status: order.status,
        order_date: toDateInputValue(order.order_date),
        req_pick_date: toDateInputValue(order.req_pick_date),
        req_ship_date: toDateInputValue(order.req_ship_date),
        req_del_date: toDateInputValue(order.req_del_date),
        wh_pick_date: toDateInputValue(order.wh_pick_date),
        wh_ship_date: toDateInputValue(order.wh_ship_date),
        wh_del_date: toDateInputValue(order.wh_del_date),
    })

    const hasUnsavedOrderChanges = Boolean(
        activeViewOrder &&
        orderEditDraft &&
        JSON.stringify(getComparableDraftFromOrder(activeViewOrder)) !==
        JSON.stringify({
            oa_number: orderEditDraft.oa_number,
            account_name: orderEditDraft.account_name,
            client_po: orderEditDraft.client_po,
            status: orderEditDraft.status,
            order_date: orderEditDraft.order_date,
            req_pick_date: orderEditDraft.req_pick_date,
            req_ship_date: orderEditDraft.req_ship_date,
            req_del_date: orderEditDraft.req_del_date,
            wh_pick_date: orderEditDraft.wh_pick_date,
            wh_ship_date: orderEditDraft.wh_ship_date,
            wh_del_date: orderEditDraft.wh_del_date,
        }),
    )

    const attemptCloseOrderViewModal = () => {
        if (isSavingOrderEdit) {
            return
        }

        if (hasUnsavedOrderChanges) {
            const shouldClose = window.confirm('You have unsaved changes. Discard them?')

            if (!shouldClose) {
                return
            }
        }

        closeOrderViewModal()
    }

    const closeOrderViewModal = () => {
        setActiveViewOrder(null)
        setOrderEditDraft(null)
    }

    const handleOrderDraftFieldChange = (
        field: 'oa_number' | 'account_name' | 'client_po' | 'status' | 'order_date' | 'req_pick_date' | 'req_ship_date' | 'req_del_date' | 'wh_pick_date' | 'wh_ship_date' | 'wh_del_date',
        value: string,
    ) => {
        setOrderEditDraft((prev) => {
            if (!prev) {
                return prev
            }

            if (field === 'status') {
                return {
                    ...prev,
                    status: value as Order['status'],
                }
            }

            return {
                ...prev,
                [field]: value,
            }
        })
    }

    const submitOrderEdits = async () => {
        if (!activeViewOrder || !orderEditDraft) {
            return
        }

        const updates: Partial<Order> = {}

        const nextOaNumber = orderEditDraft.oa_number.trim() || null
        if ((activeViewOrder.oa_number ?? null) !== nextOaNumber) {
            updates.oa_number = nextOaNumber
        }

        const nextAccountName = orderEditDraft.account_name.trim() || null
        if ((activeViewOrder.account_name ?? null) !== nextAccountName) {
            updates.account_name = nextAccountName
        }

        const nextClientPo = orderEditDraft.client_po.trim() || null
        if ((activeViewOrder.client_po ?? null) !== nextClientPo) {
            updates.client_po = nextClientPo
        }

        if (activeViewOrder.status !== orderEditDraft.status) {
            updates.status = orderEditDraft.status
        }

        const nextOrderDate = orderEditDraft.order_date || null
        if ((activeViewOrder.order_date ?? null) !== nextOrderDate) {
            updates.order_date = nextOrderDate
        }

        const nextReqPickDate = orderEditDraft.req_pick_date || null
        if ((activeViewOrder.req_pick_date ?? null) !== nextReqPickDate) {
            updates.req_pick_date = nextReqPickDate
        }

        const nextReqShipDate = orderEditDraft.req_ship_date || null
        if ((activeViewOrder.req_ship_date ?? null) !== nextReqShipDate) {
            updates.req_ship_date = nextReqShipDate
        }

        const nextReqDelDate = orderEditDraft.req_del_date || null
        if ((activeViewOrder.req_del_date ?? null) !== nextReqDelDate) {
            updates.req_del_date = nextReqDelDate
        }

        const nextWhPickDate = orderEditDraft.wh_pick_date || null
        if ((activeViewOrder.wh_pick_date ?? null) !== nextWhPickDate) {
            updates.wh_pick_date = nextWhPickDate
        }

        const nextWhShipDate = orderEditDraft.wh_ship_date || null
        if ((activeViewOrder.wh_ship_date ?? null) !== nextWhShipDate) {
            updates.wh_ship_date = nextWhShipDate
        }

        const nextWhDelDate = orderEditDraft.wh_del_date || null
        if ((activeViewOrder.wh_del_date ?? null) !== nextWhDelDate) {
            updates.wh_del_date = nextWhDelDate
        }

        if (Object.keys(updates).length === 0) {
            closeOrderViewModal()
            return
        }

        setIsSavingOrderEdit(true)

        const didUpdate = await onUpdateOrder(activeViewOrder.id, updates)

        setIsSavingOrderEdit(false)

        if (didUpdate) {
            closeOrderViewModal()
        }
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
            case 'cancelled':
                return 'status-pill status-pill--cancelled'
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
            case 'cancelled':
                return 'orders-data-row orders-data-row--cancelled'
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
                        <TableHead className="orders-expand-head">
                            <input
                                type="checkbox"
                                className="orders-select-checkbox"
                                checked={areAllVisibleSelected && data.length > 0}
                                onChange={onToggleSelectAllVisible}
                                aria-label="Select all visible orders"
                            />
                        </TableHead>
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
                            const canSetCancelled = canTransitionOrderStatus(row.original.status, 'cancelled')
                            const isFavorite = favoriteOrderIds.includes(row.original.id)
                            const hasOrderNote = (notesByOrderId[row.original.id] ?? '').trim().length > 0
                            const isSelected = selectedOrderIds.includes(row.original.id)

                            return (
                                <Fragment key={row.id}>
                                    <TableRow className={getStatusRowClassName(row.original.status)}>
                                        <TableCell className="orders-expand-cell">
                                            <div className="orders-row-actions">
                                                <input
                                                    type="checkbox"
                                                    className="orders-select-checkbox"
                                                    checked={isSelected}
                                                    onChange={() => onToggleOrderSelection(row.original.id)}
                                                    aria-label={`Select order ${row.original.oa_number ?? row.original.id}`}
                                                />
                                                <div className="orders-row-action-icons">
                                                    <button
                                                        type="button"
                                                        className="orders-view-toggle"
                                                        onClick={() => openOrderViewModal(row.original)}
                                                        aria-label="View full order details"
                                                        title="View details"
                                                    >
                                                        <ImEnlarge2 size={12} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="orders-expand-toggle"
                                                        onClick={() => toggleRow(row.id)}
                                                        aria-expanded={expandedRows[row.id] ? 'true' : 'false'}
                                                        aria-label={expandedRows[row.id] ? 'Collapse order details' : 'Expand order details'}
                                                    >
                                                        <span className="orders-expand-icon" aria-hidden="true">
                                                            <IoIosExpand size={15} />
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
                                            </div>
                                        </TableCell>
                                        <TableCell>{row.original.oa_number ?? '-'}</TableCell>
                                        <TableCell>{row.original.account_code}</TableCell>
                                        <TableCell>{row.original.account_name ?? '-'}</TableCell>
                                        <TableCell>{formatDate(row.original.req_del_date)}</TableCell>
                                        <TableCell className="orders-status-cell">
                                            <div className="orders-status-cell-content">
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
                                                    <button
                                                        type="button"
                                                        className="orders-status-icon-button"
                                                        onClick={() => onChangeStatus(row.original.id, 'cancelled')}
                                                        disabled={!canSetCancelled}
                                                        aria-label="Set status to cancelled"
                                                        title="Set to cancelled"
                                                    >
                                                        <MdCancelScheduleSend size={16} />
                                                    </button>
                                                </div>
                                                <span className={getStatusClassName(row.original.status)}>
                                                    {formatStatusLabel(row.original.status)}
                                                </span>
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

            {activeViewOrder ? (
                <div className="add-order-modal-overlay" role="dialog" aria-modal="true" onClick={attemptCloseOrderViewModal}>
                    <div className="order-view-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="order-view-modal-header">
                            <h3 className="order-view-modal-title">Order Details</h3>
                            <button
                                type="button"
                                className="add-order-close-button"
                                onClick={attemptCloseOrderViewModal}
                                aria-label="Close order details modal"
                            >
                                <IoMdClose size={20} />
                            </button>
                        </div>

                        <div className="order-view-modal-content">
                            {orderEditDraft ? (
                                <form
                                    className="order-view-form"
                                    onSubmit={async (event) => {
                                        event.preventDefault()
                                        await submitOrderEdits()
                                    }}
                                >
                                    <label className="order-view-field">
                                        <span>OA Number</span>
                                        <input
                                            type="text"
                                            value={orderEditDraft.oa_number}
                                            onChange={(event) =>
                                                handleOrderDraftFieldChange('oa_number', event.target.value)
                                            }
                                        />
                                    </label>
                                    <label className="order-view-field">
                                        <span>Account Code</span>
                                        <input
                                            type="text"
                                            value={orderEditDraft.account_code}
                                            disabled
                                            readOnly
                                        />
                                    </label>
                                    <label className="order-view-field">
                                        <span>Account Name</span>
                                        <input
                                            type="text"
                                            value={orderEditDraft.account_name}
                                            onChange={(event) =>
                                                handleOrderDraftFieldChange('account_name', event.target.value)
                                            }
                                        />
                                    </label>
                                    <label className="order-view-field">
                                        <span>Client PO</span>
                                        <input
                                            type="text"
                                            value={orderEditDraft.client_po}
                                            onChange={(event) =>
                                                handleOrderDraftFieldChange('client_po', event.target.value)
                                            }
                                        />
                                    </label>
                                    <label className="order-view-field">
                                        <span>Status</span>
                                        <select
                                            value={orderEditDraft.status}
                                            onChange={(event) =>
                                                handleOrderDraftFieldChange('status', event.target.value)
                                            }
                                        >
                                            {orderStatusOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="order-view-field">
                                        <span>Order Date</span>
                                        <input
                                            type="date"
                                            value={orderEditDraft.order_date}
                                            onChange={(event) =>
                                                handleOrderDraftFieldChange('order_date', event.target.value)
                                            }
                                        />
                                    </label>
                                    <label className="order-view-field">
                                        <span>Req. Pick Date</span>
                                        <input
                                            type="date"
                                            value={orderEditDraft.req_pick_date}
                                            onChange={(event) =>
                                                handleOrderDraftFieldChange('req_pick_date', event.target.value)
                                            }
                                        />
                                    </label>
                                    <label className="order-view-field">
                                        <span>Req. Ship Date</span>
                                        <input
                                            type="date"
                                            value={orderEditDraft.req_ship_date}
                                            onChange={(event) =>
                                                handleOrderDraftFieldChange('req_ship_date', event.target.value)
                                            }
                                        />
                                    </label>
                                    <label className="order-view-field">
                                        <span>Req. Del Date</span>
                                        <input
                                            type="date"
                                            value={orderEditDraft.req_del_date}
                                            onChange={(event) =>
                                                handleOrderDraftFieldChange('req_del_date', event.target.value)
                                            }
                                        />
                                    </label>
                                    <label className="order-view-field">
                                        <span>WH Pick Date</span>
                                        <input
                                            type="date"
                                            value={orderEditDraft.wh_pick_date}
                                            onChange={(event) =>
                                                handleOrderDraftFieldChange('wh_pick_date', event.target.value)
                                            }
                                        />
                                    </label>
                                    <label className="order-view-field">
                                        <span>WH Ship Date</span>
                                        <input
                                            type="date"
                                            value={orderEditDraft.wh_ship_date}
                                            onChange={(event) =>
                                                handleOrderDraftFieldChange('wh_ship_date', event.target.value)
                                            }
                                        />
                                    </label>
                                    <label className="order-view-field">
                                        <span>WH Del Date</span>
                                        <input
                                            type="date"
                                            value={orderEditDraft.wh_del_date}
                                            onChange={(event) =>
                                                handleOrderDraftFieldChange('wh_del_date', event.target.value)
                                            }
                                        />
                                    </label>
                                    <label className="order-view-field">
                                        <span>Created At</span>
                                        <input type="text" value={orderEditDraft.created_at} disabled readOnly />
                                    </label>

                                    <div className="order-view-actions">
                                        <button
                                            type="button"
                                            className="order-view-cancel-button"
                                            onClick={attemptCloseOrderViewModal}
                                            disabled={isSavingOrderEdit}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="order-view-submit-button" disabled={isSavingOrderEdit}>
                                            {isSavingOrderEdit ? 'Submitting...' : 'Submit'}
                                        </button>
                                    </div>
                                </form>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}