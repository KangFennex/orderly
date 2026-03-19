import { useState } from 'react'
import Image from 'next/image'
import { FaRegCopy } from 'react-icons/fa'
import { IoMdAdd, IoMdCheckmark } from 'react-icons/io';
import { IoIosRefresh } from "react-icons/io";
import { MdStarBorder } from "react-icons/md";
import kitsuneLogo from '@/app/assets/logo/kitsune-logo.png'
import {
    orderDateFieldOptions,
    orderDateRangeOptions,
    orderStatusOptions,
    type DateFilterField,
    type DateRangeFilter,
    type FilterStatus,
} from '@/app/lib/orders'

type OrdersHeroProps = {
    searchValue: string
    selectedStatuses: FilterStatus[]
    selectedDateField: DateFilterField
    selectedDateRange: DateRangeFilter | null
    onSearchChange: (value: string) => void
    onToggleStatus: (status: FilterStatus) => void
    onSelectDateField: (dateField: DateFilterField) => void
    onSelectDateRange: (dateRange: DateRangeFilter | null) => void
    onClearFilters: () => void
    onOpenAddOrderModal: () => void
    onOpenFavoritesModal: () => void
    onCopySelected: () => void
    onCopySelectedCsv: () => void
    selectedOrderCount: number
}

export function OrdersHero({
    searchValue,
    selectedStatuses,
    selectedDateField,
    selectedDateRange,
    onSearchChange,
    onToggleStatus,
    onSelectDateField,
    onSelectDateRange,
    onClearFilters,
    onOpenAddOrderModal,
    onOpenFavoritesModal,
    onCopySelected,
    onCopySelectedCsv,
    selectedOrderCount,
}: OrdersHeroProps) {
    const [isClearing, setIsClearing] = useState(false)
    const isSearchActive = searchValue.trim().length > 0

    const handleClearFilters = () => {
        onClearFilters()
        setIsClearing(true)

        window.setTimeout(() => {
            setIsClearing(false)
        }, 450)
    }

    return (
        <div className="orders-hero">
            <Image
                src={kitsuneLogo}
                alt="Orderly logo"
                className="orders-hero-logo-centered"
                priority
            />
            <div className="orders-hero-content">
                <div className="orders-filter-row">
                    <span className="orders-filter-label">Status</span>
                    <div className="orders-status-filters" role="group" aria-label="Filter orders by status">
                        {orderStatusOptions.map((option) => {
                            const isActive = selectedStatuses.includes(option.value)

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={isActive ? 'orders-filter-button is-active' : 'orders-filter-button'}
                                    onClick={() => onToggleStatus(option.value)}
                                    aria-pressed={isActive}
                                    disabled={isSearchActive}
                                >
                                    <span className="orders-filter-tick" aria-hidden="true">
                                        {isActive ? <IoMdCheckmark size={16} /> : null}
                                    </span>
                                    <span>{option.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="orders-filter-row">
                    <span className="orders-filter-label">Date</span>
                    <div className="orders-date-filters">
                        <label className="orders-date-select-wrapper">
                            <select
                                className="orders-date-select"
                                value={selectedDateField}
                                onChange={(event) => onSelectDateField(event.target.value as DateFilterField)}
                                aria-label="Date field"
                                disabled={isSearchActive}
                            >
                                {orderDateFieldOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="orders-status-filters" role="group" aria-label="Filter orders by date range">
                            {orderDateRangeOptions.map((option) => {
                                const isActive = selectedDateRange === option.value

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={isActive ? 'orders-filter-button is-active' : 'orders-filter-button'}
                                        onClick={() => onSelectDateRange(isActive ? null : option.value)}
                                        aria-pressed={isActive}
                                        disabled={isSearchActive}
                                    >
                                        <span className="orders-filter-tick" aria-hidden="true">
                                            {isActive ? <IoMdCheckmark size={16} /> : null}
                                        </span>
                                        <span>{option.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="orders-filter-row">
                    <span className="orders-filter-label">Search</span>
                    <input
                        type="search"
                        className="orders-search-input"
                        value={searchValue}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Search orders"
                        aria-label="Search orders"
                    />
                </div>
            </div>
            <div className="orders-hero-actions">
                <div className="orders-hero-actions-grid">
                    <button
                        className="orders-clear-filters-button"
                        type="button"
                        onClick={handleClearFilters}
                        aria-label="Clear filters"
                        disabled={
                            searchValue.trim().length === 0 &&
                            selectedStatuses.length === 0 &&
                            selectedDateRange === null
                        }
                    >
                        <IoIosRefresh
                            size={20}
                            className={isClearing ? 'orders-refresh-icon is-rotating' : 'orders-refresh-icon'}
                        />
                    </button>
                    <button
                        className="orders-clear-filters-button"
                        type="button"
                        onClick={onOpenFavoritesModal}
                        aria-label="Open favorites modal"
                    >
                        <MdStarBorder size={20} />
                    </button>
                    <button
                        className="orders-clear-filters-button"
                        type="button"
                        onClick={onCopySelected}
                        aria-label="Copy selected orders"
                        disabled={selectedOrderCount === 0}
                    >
                        <FaRegCopy size={16} />
                        <span>{selectedOrderCount}</span>
                    </button>
                    <button
                        className="orders-clear-filters-button"
                        type="button"
                        onClick={onCopySelectedCsv}
                        aria-label="Copy selected orders as CSV"
                        disabled={selectedOrderCount === 0}
                    >
                        CSV
                    </button>
                </div>
                <div className="orders-hero-add-action">
                    <button
                        className="add-order-button"
                        type="button"
                        onClick={onOpenAddOrderModal}
                        aria-label="Open add order modal"
                    >
                        <IoMdAdd size={30} color="#f8fafc" />
                    </button>
                </div>
            </div>
        </div>
    )
}
