"use client"

import { useEffect, useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import {
    addPendingFavouriteOrderId,
    fetchFavouriteOrderIdsByOrderIds,
    hasFavouriteOrderId,
    removePendingFavouriteOrderId,
    setOrderFavourite,
    upsertFavouriteOrderId,
} from '@/app/lib/order-favourites'
import {
    fetchOrderNotesByOrderIds,
    getOrderNoteValue,
    saveOrderNote,
    type OrderNotesMap,
    upsertOrderNoteValue,
} from '@/app/lib/order-notes'
import { getApiErrorMessage } from '@/app/lib/http/errors'
import {
    areAllVisibleOrderIdsSelected,
    buildSelectedOrdersCsv,
    buildSelectedOrdersPlainText,
    filterOrders,
    getSelectedOrdersByIds,
    toggleOrderSelectionIds,
    toggleSelectAllVisibleOrderIds,
    updateOrderStatus,
    type DateFilterField,
    type DateRangeFilter,
    type FilterStatus,
} from '@/app/lib/orders'
import { OrdersDataTable } from '@/app/ui/orders-table'
import { AddOrderModal } from '@/app/ui/add-order-modal'
import { FavouritesModal } from '@/app/ui/favourites-modal'
import { OrdersHero } from '@/app/ui/hero'
import type { Order } from '@/app/types/orders'

type OrdersPageClientProps = {
    initialOrders: Order[]
}

type FeedbackMessage = {
    type: 'success' | 'error'
    text: string
}

type CustomReminderByOrderId = Record<string, string>

type ReminderCard = {
    id: string
    orderId: string
    oaNumber: string | null
    accountCode: string
    type: 'urgent' | 'custom'
    message: string
    dateLabel: string
}

const CUSTOM_REMINDERS_STORAGE_KEY = 'orders.custom-reminders'
const DISMISSED_REMINDERS_STORAGE_KEY = 'orders.dismissed-reminders'

const MS_PER_DAY = 24 * 60 * 60 * 1000

const getStartOfToday = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
}

const getDateFromIso = (value: string) => {
    const date = new Date(`${value}T00:00:00`)

    if (Number.isNaN(date.getTime())) {
        return null
    }

    date.setHours(0, 0, 0, 0)
    return date
}

const getDaysBetween = (dateA: Date, dateB: Date) => {
    return Math.floor((dateA.getTime() - dateB.getTime()) / MS_PER_DAY)
}

export function OrdersPageClient({ initialOrders }: OrdersPageClientProps) {
    const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false)
    const [isFavouritesModalOpen, setIsFavouritesModalOpen] = useState(false)
    const [isReminderTrayOpen, setIsReminderTrayOpen] = useState(false)
    const [pendingFavouriteOrderToView, setPendingFavouriteOrderToView] = useState<Order | null>(null)
    const [activeFavouriteOrderToView, setActiveFavouriteOrderToView] = useState<Order | null>(null)
    const [orders, setOrders] = useState(initialOrders)
    const [searchValue, setSearchValue] = useState('')
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [feedbackMessage, setFeedbackMessage] = useState<FeedbackMessage | null>(null)
    const [favouriteOrderIds, setFavouriteOrderIds] = useState<string[]>([])
    const [pendingFavouriteOrderIds, setPendingFavouriteOrderIds] = useState<string[]>([])
    const [notesByOrderId, setNotesByOrderId] = useState<OrderNotesMap>({})
    const [selectedStatuses, setSelectedStatuses] = useState<FilterStatus[]>(['pending', 'picking', 'backorder'])
    const [selectedDateField, setSelectedDateField] = useState<DateFilterField>('wh_ship_date')
    const [selectedDateRange, setSelectedDateRange] = useState<DateRangeFilter | null>(null)
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
    const [customReminderByOrderId, setCustomReminderByOrderId] = useState<CustomReminderByOrderId>({})
    const [dismissedReminderIds, setDismissedReminderIds] = useState<string[]>([])

    const toggleStatus = (status: FilterStatus) => {
        setSelectedStatuses((prev) =>
            prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status],
        )
    }

    const clearFilters = () => {
        setSearchValue('')
        setDebouncedSearchTerm('')
        setSelectedStatuses([])
        setSelectedDateRange(null)
    }

    const handleChangeOrderStatus = async (orderId: string, nextStatus: FilterStatus) => {
        const currentOrder = orders.find((order) => order.id === orderId)

        if (!currentOrder) {
            return
        }

        const result = updateOrderStatus(currentOrder, nextStatus)

        if (!result.ok) {
            return
        }

        setOrders((prevOrders) =>
            prevOrders.map((order) => (order.id === orderId ? result.order : order)),
        )

        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: nextStatus }),
            })

            if (!response.ok) {
                throw new Error(
                    await getApiErrorMessage(response, 'Unable to update order status. Please try again.'),
                )
            }

            const json = (await response.json()) as { order: Order }

            setOrders((prevOrders) =>
                prevOrders.map((order) => (order.id === orderId ? json.order : order)),
            )
        } catch (error) {
            setOrders((prevOrders) =>
                prevOrders.map((order) => (order.id === orderId ? currentOrder : order)),
            )

            const message = error instanceof Error ? error.message : 'Unable to update order status.'
            setFeedbackMessage({ type: 'error', text: message })
        }
    }

    const handleOrderCreated = (order: Order) => {
        setOrders((prevOrders) => [order, ...prevOrders])
        setFeedbackMessage({ type: 'success', text: 'Order created successfully.' })
    }

    const handleOrderCreateError = (message: string) => {
        setFeedbackMessage({ type: 'error', text: message })
    }

    const handleUpdateOrderLocally = async (orderId: string, updates: Partial<Order>) => {
        if (Object.keys(updates).length === 0) {
            return true
        }

        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            })

            if (!response.ok) {
                throw new Error(
                    await getApiErrorMessage(response, 'Unable to update order. Please try again.'),
                )
            }

            const json = (await response.json()) as { order: Order }

            setOrders((prevOrders) =>
                prevOrders.map((order) => (order.id === orderId ? json.order : order)),
            )
            setFeedbackMessage({ type: 'success', text: 'Order updated successfully.' })
            return true
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to update order.'
            setFeedbackMessage({ type: 'error', text: message })
            return false
        }
    }

    const handleSaveOrderNote = async (orderId: string, note: string) => {
        const previousNote = getOrderNoteValue(notesByOrderId, orderId)

        setNotesByOrderId((prev) => upsertOrderNoteValue(prev, orderId, note))

        try {
            const savedNote = await saveOrderNote(orderId, note)

            setNotesByOrderId((prev) => upsertOrderNoteValue(prev, orderId, savedNote))

            return true
        } catch (error) {
            setNotesByOrderId((prev) => upsertOrderNoteValue(prev, orderId, previousNote))

            const message = error instanceof Error ? error.message : 'Unable to save order note.'
            setFeedbackMessage({ type: 'error', text: message })
            return false
        }
    }

    const handleToggleFavourite = async (orderId: string) => {
        if (pendingFavouriteOrderIds.includes(orderId)) {
            return
        }

        const isAlreadyFavourite = hasFavouriteOrderId(favouriteOrderIds, orderId)
        const nextIsFavourite = !isAlreadyFavourite

        setPendingFavouriteOrderIds((prev) => addPendingFavouriteOrderId(prev, orderId))

        setFavouriteOrderIds((prev) => upsertFavouriteOrderId(prev, orderId, nextIsFavourite))

        try {
            const savedAsFavourite = await setOrderFavourite(orderId, nextIsFavourite)

            setFavouriteOrderIds((prev) => upsertFavouriteOrderId(prev, orderId, savedAsFavourite))
        } catch (error) {
            setFavouriteOrderIds((prev) => upsertFavouriteOrderId(prev, orderId, isAlreadyFavourite))

            const message = error instanceof Error ? error.message : 'Unable to update favourite.'
            setFeedbackMessage({ type: 'error', text: message })
        } finally {
            setPendingFavouriteOrderIds((prev) => removePendingFavouriteOrderId(prev, orderId))
        }
    }

    const handleToggleOrderSelection = (orderId: string) => {
        setSelectedOrderIds((prev) => toggleOrderSelectionIds(prev, orderId))
    }

    const handleDismissReminderCard = (reminderId: string) => {
        setDismissedReminderIds((prev) => (prev.includes(reminderId) ? prev : [...prev, reminderId]))
    }

    const handleSetCustomReminder = (order: Order, remindAt: string) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(remindAt)) {
            setFeedbackMessage({ type: 'error', text: 'Select a valid reminder date.' })
            return
        }

        setCustomReminderByOrderId((prev) => ({
            ...prev,
            [order.id]: remindAt,
        }))

        setDismissedReminderIds((prev) => prev.filter((id) => !id.startsWith(`${order.id}:custom:`)))

        setFeedbackMessage({ type: 'success', text: `Reminder set for OA ${order.oa_number ?? order.id}.` })
        setIsReminderTrayOpen(true)
    }

    const handleClearCustomReminder = (orderId: string) => {
        setCustomReminderByOrderId((prev) => {
            if (!(orderId in prev)) {
                return prev
            }

            const next = { ...prev }
            delete next[orderId]
            return next
        })

        setDismissedReminderIds((prev) => prev.filter((id) => !id.startsWith(`${orderId}:custom:`)))
    }

    const filteredOrders = filterOrders({
        orders,
        selectedStatuses,
        selectedDateField,
        selectedDateRange,
        searchTerm: debouncedSearchTerm,
    })

    const pendingOrders = filteredOrders.filter((order) => order.status === 'pending')
    const activeOrders = filteredOrders.filter((order) => order.status !== 'pending')

    const pendingVisibleOrderIds = pendingOrders.map((order) => order.id)
    const areAllPendingVisibleSelected = areAllVisibleOrderIdsSelected(
        selectedOrderIds,
        pendingVisibleOrderIds,
    )

    const activeVisibleOrderIds = activeOrders.map((order) => order.id)
    const areAllActiveVisibleSelected = areAllVisibleOrderIdsSelected(
        selectedOrderIds,
        activeVisibleOrderIds,
    )

    const customReminderOrderIds = Object.keys(customReminderByOrderId).filter((orderId) =>
        orders.some((order) => order.id === orderId && order.status !== 'shipped'),
    )

    const today = getStartOfToday()
    const ordersById = new Map(orders.map((order) => [order.id, order]))

    const urgentCards: ReminderCard[] = orders
        .filter((order) => order.status !== 'shipped' && Boolean(order.wh_pick_date))
        .flatMap((order) => {
            const whPickDate = getDateFromIso(order.wh_pick_date ?? '')

            if (!whPickDate) {
                return []
            }

            const daysUntilPick = getDaysBetween(whPickDate, today)

            if (daysUntilPick < 0 || daysUntilPick > 3) {
                return []
            }

            const reminderId = `${order.id}:auto-wh-pick:${order.wh_pick_date}`
            const dayText = daysUntilPick === 0 ? 'today' : `in ${daysUntilPick} day${daysUntilPick === 1 ? '' : 's'}`

            return [
                {
                    id: reminderId,
                    orderId: order.id,
                    oaNumber: order.oa_number,
                    accountCode: order.account_code,
                    type: 'urgent' as const,
                    message: `WH Pick is ${dayText}`,
                    dateLabel: order.wh_pick_date ?? '',
                },
            ]
        })

    const customCards: ReminderCard[] = Object.entries(customReminderByOrderId).flatMap(([orderId, remindAt]) => {
        const order = orders.find((item) => item.id === orderId)

        if (!order || order.status === 'shipped') {
            return []
        }

        const remindDate = getDateFromIso(remindAt)

        if (!remindDate || remindDate.getTime() > today.getTime()) {
            return []
        }

        return [
            {
                id: `${order.id}:custom:${remindAt}`,
                orderId: order.id,
                oaNumber: order.oa_number,
                accountCode: order.account_code,
                type: 'custom' as const,
                message: 'Custom reminder',
                dateLabel: remindAt,
            },
        ]
    })

    const getReminderSortDaysUntilWhShip = (reminder: ReminderCard) => {
        const order = ordersById.get(reminder.orderId)
        const whShipDate = getDateFromIso(order?.wh_ship_date ?? '')

        if (!whShipDate) {
            return Number.MAX_SAFE_INTEGER
        }

        return getDaysBetween(whShipDate, today)
    }

    const visibleReminderCards = [...urgentCards, ...customCards]
        .filter((reminder) => !dismissedReminderIds.includes(reminder.id))
        .sort((a, b) => {
            const dayDifference = getReminderSortDaysUntilWhShip(a) - getReminderSortDaysUntilWhShip(b)

            if (dayDifference !== 0) {
                return dayDifference
            }

            return (a.oaNumber ?? '').localeCompare(b.oaNumber ?? '', undefined, {
                numeric: true,
                sensitivity: 'base',
            })
        })
        .slice(0, 5)

    const visibleReminderOrderIds = Array.from(new Set(visibleReminderCards.map((reminder) => reminder.orderId)))
    const areAllVisibleReminderOrdersSelected = areAllVisibleOrderIdsSelected(
        selectedOrderIds,
        visibleReminderOrderIds,
    )

    const handleToggleReminderOrderSelection = (orderId: string) => {
        setSelectedOrderIds((prev) => toggleOrderSelectionIds(prev, orderId))
    }

    const handleToggleSelectAllReminderOrders = () => {
        setSelectedOrderIds((prev) =>
            toggleSelectAllVisibleOrderIds(prev, visibleReminderOrderIds, areAllVisibleReminderOrdersSelected),
        )
    }

    const handleCopySelected = async () => {
        const selectedOrders = getSelectedOrdersByIds(orders, selectedOrderIds)

        if (selectedOrders.length === 0) {
            setFeedbackMessage({ type: 'error', text: 'No orders selected to copy.' })
            return
        }

        const plainText = buildSelectedOrdersPlainText(selectedOrders)

        try {
            await navigator.clipboard.writeText(plainText)
            setFeedbackMessage({ type: 'success', text: `${selectedOrders.length} order(s) copied.` })
        } catch {
            setFeedbackMessage({ type: 'error', text: 'Unable to copy selected orders.' })
        }
    }

    const handleCopySelectedCsv = async () => {
        const selectedOrders = getSelectedOrdersByIds(orders, selectedOrderIds)

        if (selectedOrders.length === 0) {
            setFeedbackMessage({ type: 'error', text: 'No orders selected to copy.' })
            return
        }

        const csvText = buildSelectedOrdersCsv(selectedOrders)

        try {
            await navigator.clipboard.writeText(csvText)
            setFeedbackMessage({ type: 'success', text: `${selectedOrders.length} order(s) copied as CSV.` })
        } catch {
            setFeedbackMessage({ type: 'error', text: 'Unable to copy selected orders as CSV.' })
        }
    }

    const favouriteOrders = orders.filter((order) => favouriteOrderIds.includes(order.id))

    const handleSelectFavouriteOrder = (order: Order) => {
        setIsFavouritesModalOpen(false)

        if (order.status === 'pending') {
            setPendingFavouriteOrderToView(order)
            setActiveFavouriteOrderToView(null)
            return
        }

        setActiveFavouriteOrderToView(order)
        setPendingFavouriteOrderToView(null)
    }

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setDebouncedSearchTerm(searchValue)
        }, 500)

        return () => {
            window.clearTimeout(timeout)
        }
    }, [searchValue])

    useEffect(() => {
        try {
            const customRaw = window.localStorage.getItem(CUSTOM_REMINDERS_STORAGE_KEY)

            if (customRaw) {
                const parsed = JSON.parse(customRaw) as CustomReminderByOrderId
                setCustomReminderByOrderId(parsed)
            }

            const dismissedRaw = window.localStorage.getItem(DISMISSED_REMINDERS_STORAGE_KEY)

            if (dismissedRaw) {
                const parsed = JSON.parse(dismissedRaw) as string[]
                setDismissedReminderIds(parsed)
            }
        } catch {
            setCustomReminderByOrderId({})
            setDismissedReminderIds([])
        }
    }, [])

    useEffect(() => {
        window.localStorage.setItem(CUSTOM_REMINDERS_STORAGE_KEY, JSON.stringify(customReminderByOrderId))
    }, [customReminderByOrderId])

    useEffect(() => {
        window.localStorage.setItem(DISMISSED_REMINDERS_STORAGE_KEY, JSON.stringify(dismissedReminderIds))
    }, [dismissedReminderIds])

    useEffect(() => {
        setCustomReminderByOrderId((prev) => {
            const next: CustomReminderByOrderId = {}

            for (const [orderId, remindAt] of Object.entries(prev)) {
                const order = orders.find((item) => item.id === orderId)

                if (!order || order.status === 'shipped') {
                    continue
                }

                next[orderId] = remindAt
            }

            return JSON.stringify(next) === JSON.stringify(prev) ? prev : next
        })
    }, [orders])

    useEffect(() => {
        const orderIds = orders.map((order) => order.id)

        if (orderIds.length === 0) {
            setNotesByOrderId({})
            return
        }

        let isCancelled = false

        const loadOrderNotes = async () => {
            try {
                const notes = await fetchOrderNotesByOrderIds(orderIds)

                if (isCancelled) {
                    return
                }

                setNotesByOrderId((prev) => ({
                    ...prev,
                    ...notes,
                }))
            } catch (error) {
                if (isCancelled) {
                    return
                }

                const message = error instanceof Error ? error.message : 'Unable to load order notes.'
                setFeedbackMessage({ type: 'error', text: message })
            }
        }

        void loadOrderNotes()

        return () => {
            isCancelled = true
        }
    }, [orders])

    useEffect(() => {
        const orderIds = orders.map((order) => order.id)

        if (orderIds.length === 0) {
            setFavouriteOrderIds([])
            return
        }

        let isCancelled = false

        const loadFavourites = async () => {
            try {
                const favouriteIds = await fetchFavouriteOrderIdsByOrderIds(orderIds)

                if (isCancelled) {
                    return
                }

                setFavouriteOrderIds(favouriteIds)
            } catch (error) {
                if (isCancelled) {
                    return
                }

                const message = error instanceof Error ? error.message : 'Unable to load favourites.'
                setFeedbackMessage({ type: 'error', text: message })
            }
        }

        void loadFavourites()

        return () => {
            isCancelled = true
        }
    }, [orders])

    useEffect(() => {
        if (!feedbackMessage) {
            return
        }

        const timeout = window.setTimeout(() => {
            setFeedbackMessage(null)
        }, 3200)

        return () => {
            window.clearTimeout(timeout)
        }
    }, [feedbackMessage])

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const targetElement = event.target as HTMLElement | null
            const isTypingField =
                targetElement?.tagName === 'INPUT' ||
                targetElement?.tagName === 'TEXTAREA' ||
                targetElement?.tagName === 'SELECT' ||
                targetElement?.isContentEditable

            if (isTypingField) {
                return
            }

            if (event.ctrlKey && event.key.toLowerCase() === 'k') {
                event.preventDefault()
                setIsAddOrderModalOpen(true)
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    return (
        <main className="orders-page">
            <section className="orders-shell">
                <OrdersHero
                    searchValue={searchValue}
                    selectedStatuses={selectedStatuses}
                    selectedDateField={selectedDateField}
                    selectedDateRange={selectedDateRange}
                    onSearchChange={setSearchValue}
                    onToggleStatus={toggleStatus}
                    onSelectDateField={setSelectedDateField}
                    onSelectDateRange={setSelectedDateRange}
                    onClearFilters={clearFilters}
                    onOpenAddOrderModal={() => setIsAddOrderModalOpen(true)}
                    onOpenFavouritesModal={() => setIsFavouritesModalOpen(true)}
                    onOpenReminderTray={() => setIsReminderTrayOpen(true)}
                    onCopySelected={handleCopySelected}
                    onCopySelectedCsv={handleCopySelectedCsv}
                    selectedOrderCount={selectedOrderIds.length}
                />

                {feedbackMessage ? (
                    <div
                        className={
                            feedbackMessage.type === 'success'
                                ? 'orders-feedback-banner is-success'
                                : 'orders-feedback-banner is-error'
                        }
                        role="status"
                        aria-live="polite"
                    >
                        {feedbackMessage.text}
                    </div>
                ) : null}

                {isReminderTrayOpen ? (
                    <aside className="orders-reminder-tray" role="dialog" aria-label="Reminders tray">
                        <div className="orders-reminder-tray-header">
                            <h3 className="orders-reminder-tray-title">Reminders</h3>
                            <label className="orders-reminder-tray-select-all">
                                <input
                                    type="checkbox"
                                    className="orders-reminder-checkbox"
                                    checked={
                                        visibleReminderOrderIds.length > 0 &&
                                        areAllVisibleReminderOrdersSelected
                                    }
                                    onChange={handleToggleSelectAllReminderOrders}
                                    aria-label="Select all reminder orders"
                                />
                                <span>Select all</span>
                            </label>
                            <button
                                type="button"
                                className="orders-reminder-tray-close"
                                onClick={() => setIsReminderTrayOpen(false)}
                                aria-label="Close reminders tray"
                            >
                                <IoMdClose size={16} />
                            </button>
                        </div>
                        <div className="orders-reminder-tray-list" aria-live="polite">
                            {visibleReminderCards.length > 0 ? (
                                visibleReminderCards.map((reminder) => (
                                    <article
                                        key={reminder.id}
                                        className={
                                            reminder.type === 'urgent'
                                                ? 'orders-reminder-card is-urgent'
                                                : 'orders-reminder-card is-custom'
                                        }
                                    >
                                        <input
                                            type="checkbox"
                                            className="orders-reminder-checkbox"
                                            checked={selectedOrderIds.includes(reminder.orderId)}
                                            onChange={() => handleToggleReminderOrderSelection(reminder.orderId)}
                                            aria-label={`Select order ${reminder.oaNumber ?? reminder.orderId}`}
                                        />
                                        <div className="orders-reminder-card-text">
                                            <p className="orders-reminder-card-title">OA {reminder.oaNumber ?? '-'}</p>
                                            <p className="orders-reminder-card-meta">{reminder.accountCode}</p>
                                            <p className="orders-reminder-card-message">{reminder.message}</p>
                                            <p className="orders-reminder-card-date">{reminder.dateLabel}</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="orders-reminder-card-close"
                                            onClick={() => handleDismissReminderCard(reminder.id)}
                                            aria-label="Dismiss reminder"
                                        >
                                            <IoMdClose size={16} />
                                        </button>
                                    </article>
                                ))
                            ) : (
                                <p className="orders-reminder-tray-empty">No reminders right now.</p>
                            )}
                        </div>
                    </aside>
                ) : null}

                <section className="orders-table-section" aria-label="Pending orders">
                    <h2 className="orders-table-section-title">Pending Orders</h2>
                    <OrdersDataTable
                        data={pendingOrders}
                        onChangeStatus={handleChangeOrderStatus}
                        onUpdateOrder={handleUpdateOrderLocally}
                        favouriteOrderIds={favouriteOrderIds}
                        pendingFavouriteOrderIds={pendingFavouriteOrderIds}
                        onToggleFavourite={handleToggleFavourite}
                        customReminderOrderIds={customReminderOrderIds}
                        onSetCustomReminder={handleSetCustomReminder}
                        onClearCustomReminder={handleClearCustomReminder}
                        notesByOrderId={notesByOrderId}
                        onSaveOrderNote={handleSaveOrderNote}
                        selectedOrderIds={selectedOrderIds}
                        onToggleOrderSelection={handleToggleOrderSelection}
                        onToggleSelectAllVisible={() =>
                            setSelectedOrderIds((prev) =>
                                toggleSelectAllVisibleOrderIds(
                                    prev,
                                    pendingVisibleOrderIds,
                                    areAllPendingVisibleSelected,
                                ),
                            )
                        }
                        areAllVisibleSelected={areAllPendingVisibleSelected}
                        externalOrderToView={pendingFavouriteOrderToView}
                        onExternalOrderToViewHandled={() => setPendingFavouriteOrderToView(null)}
                    />
                </section>

                <section className="orders-table-section" aria-label="Active orders">
                    <h2 className="orders-table-section-title">Active Orders</h2>
                    <OrdersDataTable
                        data={activeOrders}
                        onChangeStatus={handleChangeOrderStatus}
                        onUpdateOrder={handleUpdateOrderLocally}
                        favouriteOrderIds={favouriteOrderIds}
                        pendingFavouriteOrderIds={pendingFavouriteOrderIds}
                        onToggleFavourite={handleToggleFavourite}
                        customReminderOrderIds={customReminderOrderIds}
                        onSetCustomReminder={handleSetCustomReminder}
                        onClearCustomReminder={handleClearCustomReminder}
                        notesByOrderId={notesByOrderId}
                        onSaveOrderNote={handleSaveOrderNote}
                        selectedOrderIds={selectedOrderIds}
                        onToggleOrderSelection={handleToggleOrderSelection}
                        onToggleSelectAllVisible={() =>
                            setSelectedOrderIds((prev) =>
                                toggleSelectAllVisibleOrderIds(
                                    prev,
                                    activeVisibleOrderIds,
                                    areAllActiveVisibleSelected,
                                ),
                            )
                        }
                        areAllVisibleSelected={areAllActiveVisibleSelected}
                        externalOrderToView={activeFavouriteOrderToView}
                        onExternalOrderToViewHandled={() => setActiveFavouriteOrderToView(null)}
                    />
                </section>
                <AddOrderModal
                    isOpen={isAddOrderModalOpen}
                    onClose={() => setIsAddOrderModalOpen(false)}
                    onOrderCreated={handleOrderCreated}
                    onOrderCreateError={handleOrderCreateError}
                />
                <FavouritesModal
                    isOpen={isFavouritesModalOpen}
                    favouriteOrders={favouriteOrders}
                    onClose={() => setIsFavouritesModalOpen(false)}
                    onSelectOrder={handleSelectFavouriteOrder}
                />
            </section>
        </main>
    )
}
