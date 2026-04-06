'use client'

import { useEffect, useState } from 'react'
import {
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from '@tanstack/react-table'

import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { toDateInputValue, formatDate } from '@/app/lib/orders'
import type { OrderNotesMap } from '@/app/lib/order-notes'

import { columns, type Order } from '@/app/types/orders'
import {
    OrderNoteModal,
    OrderViewModal,
    type OrderEditDraft,
    OrderTableHeader,
    OrderTableRow,
} from './components'

type OrdersDataTableProps = {
    data: Order[]
    onChangeStatus: (orderId: string, nextStatus: Order['status']) => void
    onUpdateOrder: (orderId: string, updates: Partial<Order>) => Promise<boolean>
    favouriteOrderIds: string[]
    pendingFavouriteOrderIds: string[]
    onToggleFavourite: (orderId: string) => void
    customReminderOrderIds: string[]
    onSetCustomReminder: (order: Order, remindAt: string) => void
    onClearCustomReminder: (orderId: string) => void
    notesByOrderId: OrderNotesMap
    onSaveOrderNote: (orderId: string, note: string) => Promise<boolean>
    selectedOrderIds: string[]
    onToggleOrderSelection: (orderId: string) => void
    onToggleSelectAllVisible: () => void
    areAllVisibleSelected: boolean
    externalOrderToView?: Order | null
    onExternalOrderToViewHandled?: () => void
}

export function OrdersDataTable({
    data,
    onChangeStatus,
    onUpdateOrder,
    favouriteOrderIds,
    pendingFavouriteOrderIds,
    onToggleFavourite,
    customReminderOrderIds,
    onSetCustomReminder,
    onClearCustomReminder,
    notesByOrderId,
    onSaveOrderNote,
    selectedOrderIds,
    onToggleOrderSelection,
    onToggleSelectAllVisible,
    areAllVisibleSelected,
    externalOrderToView,
    onExternalOrderToViewHandled,
}: OrdersDataTableProps) {
    'use no memo'
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
    const [sorting, setSorting] = useState<SortingState>([])
    const [activeNoteOrder, setActiveNoteOrder] = useState<Order | null>(null)
    const [noteDraft, setNoteDraft] = useState('')
    const [isSavingNote, setIsSavingNote] = useState(false)
    const [activeViewOrder, setActiveViewOrder] = useState<Order | null>(null)
    const [isSavingOrderEdit, setIsSavingOrderEdit] = useState(false)
    const [orderEditDraft, setOrderEditDraft] = useState<OrderEditDraft | null>(null)

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

    const closeOrderNoteModal = () => {
        setActiveNoteOrder(null)
        setNoteDraft('')
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
        field:
            | 'oa_number'
            | 'account_name'
            | 'client_po'
            | 'status'
            | 'order_date'
            | 'req_pick_date'
            | 'req_ship_date'
            | 'req_del_date'
            | 'wh_pick_date'
            | 'wh_ship_date'
            | 'wh_del_date',
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

    const submitOrderEdits = async (event: React.FormEvent) => {
        event.preventDefault()

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

    const saveOrderNote = async () => {
        if (!activeNoteOrder || isSavingNote) {
            return
        }

        setIsSavingNote(true)

        let didSave = false

        try {
            didSave = await onSaveOrderNote(activeNoteOrder.id, noteDraft)
        } finally {
            setIsSavingNote(false)
        }

        if (didSave) {
            closeOrderNoteModal()
        }
    }

    const openOrderNoteModal = (order: Order) => {
        setActiveNoteOrder(order)
        setNoteDraft(notesByOrderId[order.id] ?? '')
    }

    useEffect(() => {
        if (!externalOrderToView) {
            return
        }

        openOrderViewModal(externalOrderToView)
        onExternalOrderToViewHandled?.()
    }, [externalOrderToView, onExternalOrderToViewHandled])

    const handleSortChange = (columnId: keyof Order, direction: false | 'asc' | 'desc') => {
        const newSorting: SortingState =
            direction === false
                ? []
                : [{ id: columnId, desc: direction === 'desc' }]
        setSorting(newSorting)
    }

    return (
        <div className="orders-table-card">
            <Table className="orders-table">
                <OrderTableHeader
                    table={table}
                    onSortChange={handleSortChange}
                    areAllVisibleSelected={areAllVisibleSelected}
                    dataLength={data.length}
                    onToggleSelectAll={onToggleSelectAllVisible}
                />
                <TableBody>
                    {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => {
                            const isFavourite = favouriteOrderIds.includes(row.original.id)
                            const isFavouriteActionPending = pendingFavouriteOrderIds.includes(row.original.id)
                            const hasCustomReminder = customReminderOrderIds.includes(row.original.id)
                            const hasOrderNote =
                                (notesByOrderId[row.original.id] ?? '').trim().length > 0
                            const isSelected = selectedOrderIds.includes(row.original.id)
                            const isExpanded = expandedRows[row.id] ?? false

                            return (
                                <OrderTableRow
                                    key={row.id}
                                    order={row.original}
                                    rowId={row.id}
                                    isExpanded={isExpanded}
                                    isSelected={isSelected}
                                    isFavourite={isFavourite}
                                    isFavouriteActionPending={isFavouriteActionPending}
                                    hasCustomReminder={hasCustomReminder}
                                    hasOrderNote={hasOrderNote}
                                    onToggleExpand={toggleRow}
                                    onToggleSelection={onToggleOrderSelection}
                                    onToggleFavourite={onToggleFavourite}
                                    onSetCustomReminder={onSetCustomReminder}
                                    onClearCustomReminder={onClearCustomReminder}
                                    onOpenNoteModal={openOrderNoteModal}
                                    onOpenViewModal={openOrderViewModal}
                                    onChangeStatus={onChangeStatus}
                                />
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

            <OrderNoteModal
                orderId={activeNoteOrder?.id ?? null}
                accountCode={activeNoteOrder?.account_code ?? ''}
                oaNumber={activeNoteOrder?.oa_number ?? null}
                noteDraft={noteDraft}
                isSaving={isSavingNote}
                onNoteDraftChange={setNoteDraft}
                onSave={saveOrderNote}
                onClose={closeOrderNoteModal}
            />

            <OrderViewModal
                order={activeViewOrder}
                orderEditDraft={orderEditDraft}
                isSaving={isSavingOrderEdit}
                onFieldChange={handleOrderDraftFieldChange}
                onSubmit={submitOrderEdits}
                onClose={attemptCloseOrderViewModal}
            />
        </div>
    )
}