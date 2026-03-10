"use client"

import { useEffect, useState } from 'react'
import { useFavoritesStore } from '@/app/lib/favorites-store'
import {
    filterOrders,
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

export function OrdersPageClient({ initialOrders }: OrdersPageClientProps) {
    const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false)
    const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false)
    const [orders, setOrders] = useState(initialOrders)
    const [searchValue, setSearchValue] = useState('')
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [selectedStatuses, setSelectedStatuses] = useState<FilterStatus[]>(['pending', 'picking', 'backorder'])
    const [selectedDateField, setSelectedDateField] = useState<DateFilterField>('req_ship_date')
    const [selectedDateRange, setSelectedDateRange] = useState<DateRangeFilter | null>(null)
    const favoriteOrderIds = useFavoritesStore((state) => state.favoriteOrderIds)

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

    const handleChangeOrderStatus = (orderId: string, nextStatus: FilterStatus) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) => {
                if (order.id !== orderId) {
                    return order
                }

                const result = updateOrderStatus(order, nextStatus)
                return result.ok ? result.order : order
            }),
        )
    }

    const filteredOrders = filterOrders({
        orders,
        selectedStatuses,
        selectedDateField,
        selectedDateRange,
        searchTerm: debouncedSearchTerm,
    })

    const favoriteOrders = orders.filter((order) => favoriteOrderIds.includes(order.id))

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setDebouncedSearchTerm(searchValue)
        }, 500)

        return () => {
            window.clearTimeout(timeout)
        }
    }, [searchValue])

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
                />

                <OrdersDataTable
                    data={filteredOrders}
                    onChangeStatus={handleChangeOrderStatus}
                />
                <AddOrderModal
                    isOpen={isAddOrderModalOpen}
                    onClose={() => setIsAddOrderModalOpen(false)}
                />
                <FavoritesModal
                    isOpen={isFavoritesModalOpen}
                    favoriteOrders={favoriteOrders}
                    onClose={() => setIsFavoritesModalOpen(false)}
                />
            </section>
        </main>
    )
}
