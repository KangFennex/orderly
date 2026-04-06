'use client'

import { IoMdClose } from 'react-icons/io'
import type { Order } from '@/app/types/orders'

type FavouritesModalProps = {
    isOpen: boolean
    favouriteOrders: Order[]
    onClose: () => void
    onSelectOrder: (order: Order) => void
}

export function FavouritesModal({
    isOpen,
    favouriteOrders,
    onClose,
    onSelectOrder,
}: FavouritesModalProps) {
    if (!isOpen) {
        return null
    }

    return (
        <div
            className="add-order-modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div className="add-order-modal" onClick={(event) => event.stopPropagation()}>
                <div className="add-order-modal-header">
                    <h2 className="add-order-modal-title">Favourite Orders</h2>
                    <button
                        type="button"
                        className="add-order-close-button"
                        onClick={onClose}
                        aria-label="Close favourites modal"
                    >
                        <IoMdClose size={24} />
                    </button>
                </div>

                <div className="favourites-modal-content">
                    {favouriteOrders.length === 0 ? (
                        <p className="favourites-empty-state">No favourite orders yet.</p>
                    ) : (
                        <ul className="favourites-list" aria-label="Favourite orders list">
                            {favouriteOrders.map((order) => (
                                <li
                                    key={order.id}
                                    className="favourites-list-item"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => onSelectOrder(order)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault()
                                            onSelectOrder(order)
                                        }
                                    }}
                                >
                                    <span>{order.oa_number ?? '-'}</span>
                                    <span>{order.account_code}</span>
                                    <span>{order.account_name ?? '-'}</span>
                                    <span>{order.status}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}
