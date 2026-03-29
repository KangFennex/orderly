"use client"

import { useEffect, useState } from 'react'
import {
    addPendingFavoriteOrderId,
    fetchFavoriteOrderIdsByOrderIds,
    hasFavoriteOrderId,
    removePendingFavoriteOrderId,
    setOrderFavorite,
    upsertFavoriteOrderId,
} from '@/app/lib/order-favorites'
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
import { FavoritesModal } from '@/app/ui/favorites-modal'
import { OrdersHero } from '@/app/ui/hero'
import type { Order } from '@/app/types/orders'

type OrdersPageClientProps = {
    initialOrders: Order[]
}

type FeedbackMessage = {
    type: 'success' | 'error'
    text: string
}

export function OrdersPageClient({ initialOrders }: OrdersPageClientProps) {
    const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false)
    const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false)
    const [pendingFavoriteOrderToView, setPendingFavoriteOrderToView] = useState<Order | null>(null)
    const [activeFavoriteOrderToView, setActiveFavoriteOrderToView] = useState<Order | null>(null)
    const [orders, setOrders] = useState(initialOrders)
    const [searchValue, setSearchValue] = useState('')
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [feedbackMessage, setFeedbackMessage] = useState<FeedbackMessage | null>(null)
    const [favoriteOrderIds, setFavoriteOrderIds] = useState<string[]>([])
    const [pendingFavoriteOrderIds, setPendingFavoriteOrderIds] = useState<string[]>([])
    const [notesByOrderId, setNotesByOrderId] = useState<OrderNotesMap>({})
    const [selectedStatuses, setSelectedStatuses] = useState<FilterStatus[]>(['pending', 'picking', 'backorder'])
    const [selectedDateField, setSelectedDateField] = useState<DateFilterField>('req_ship_date')
    const [selectedDateRange, setSelectedDateRange] = useState<DateRangeFilter | null>(null)
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])

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

    const handleToggleFavorite = async (orderId: string) => {
        if (pendingFavoriteOrderIds.includes(orderId)) {
            return
        }

        const isAlreadyFavorite = hasFavoriteOrderId(favoriteOrderIds, orderId)
        const nextIsFavorite = !isAlreadyFavorite

        setPendingFavoriteOrderIds((prev) => addPendingFavoriteOrderId(prev, orderId))

        setFavoriteOrderIds((prev) => upsertFavoriteOrderId(prev, orderId, nextIsFavorite))

        try {
            const savedAsFavorite = await setOrderFavorite(orderId, nextIsFavorite)

            setFavoriteOrderIds((prev) => upsertFavoriteOrderId(prev, orderId, savedAsFavorite))
        } catch (error) {
            setFavoriteOrderIds((prev) => upsertFavoriteOrderId(prev, orderId, isAlreadyFavorite))

            const message = error instanceof Error ? error.message : 'Unable to update favorite.'
            setFeedbackMessage({ type: 'error', text: message })
        } finally {
            setPendingFavoriteOrderIds((prev) => removePendingFavoriteOrderId(prev, orderId))
        }
    }

    const handleToggleOrderSelection = (orderId: string) => {
        setSelectedOrderIds((prev) => toggleOrderSelectionIds(prev, orderId))
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

    const favoriteOrders = orders.filter((order) => favoriteOrderIds.includes(order.id))

    const handleSelectFavoriteOrder = (order: Order) => {
        setIsFavoritesModalOpen(false)

        if (order.status === 'pending') {
            setPendingFavoriteOrderToView(order)
            setActiveFavoriteOrderToView(null)
            return
        }

        setActiveFavoriteOrderToView(order)
        setPendingFavoriteOrderToView(null)
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
            setFavoriteOrderIds([])
            return
        }

        let isCancelled = false

        const loadFavorites = async () => {
            try {
                const favoriteIds = await fetchFavoriteOrderIdsByOrderIds(orderIds)

                if (isCancelled) {
                    return
                }

                setFavoriteOrderIds(favoriteIds)
            } catch (error) {
                if (isCancelled) {
                    return
                }

                const message = error instanceof Error ? error.message : 'Unable to load favorites.'
                setFeedbackMessage({ type: 'error', text: message })
            }
        }

        void loadFavorites()

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
                    onOpenFavoritesModal={() => setIsFavoritesModalOpen(true)}
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

                <section className="orders-table-section" aria-label="Pending orders">
                    <h2 className="orders-table-section-title">Pending Orders</h2>
                    <OrdersDataTable
                        data={pendingOrders}
                        onChangeStatus={handleChangeOrderStatus}
                        onUpdateOrder={handleUpdateOrderLocally}
                        favoriteOrderIds={favoriteOrderIds}
                        pendingFavoriteOrderIds={pendingFavoriteOrderIds}
                        onToggleFavorite={handleToggleFavorite}
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
                        externalOrderToView={pendingFavoriteOrderToView}
                        onExternalOrderToViewHandled={() => setPendingFavoriteOrderToView(null)}
                    />
                </section>

                <section className="orders-table-section" aria-label="Active orders">
                    <h2 className="orders-table-section-title">Active Orders</h2>
                    <OrdersDataTable
                        data={activeOrders}
                        onChangeStatus={handleChangeOrderStatus}
                        onUpdateOrder={handleUpdateOrderLocally}
                        favoriteOrderIds={favoriteOrderIds}
                        pendingFavoriteOrderIds={pendingFavoriteOrderIds}
                        onToggleFavorite={handleToggleFavorite}
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
                        externalOrderToView={activeFavoriteOrderToView}
                        onExternalOrderToViewHandled={() => setActiveFavoriteOrderToView(null)}
                    />
                </section>
                <AddOrderModal
                    isOpen={isAddOrderModalOpen}
                    onClose={() => setIsAddOrderModalOpen(false)}
                    onOrderCreated={handleOrderCreated}
                    onOrderCreateError={handleOrderCreateError}
                />
                <FavoritesModal
                    isOpen={isFavoritesModalOpen}
                    favoriteOrders={favoriteOrders}
                    onClose={() => setIsFavoritesModalOpen(false)}
                    onSelectOrder={handleSelectFavoriteOrder}
                />
            </section>
        </main>
    )
}
