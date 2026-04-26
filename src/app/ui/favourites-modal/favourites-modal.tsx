'use client'

import { IoMdClose } from 'react-icons/io'
import { formatStatusLabel, getStatusClassName } from '@/app/lib/orders'
import type { Order } from '@/app/types/orders'

type FavouritesModalProps = {
    isOpen: boolean
    favouriteOrders: Order[]
    pendingFavouriteOrderIds: string[]
    onClose: () => void
    onSelectOrder: (order: Order) => void
    onRemoveFavourite: (orderId: string) => void
    onClearFavourites: () => void
}

export function FavouritesModal({
    isOpen,
    favouriteOrders,
    pendingFavouriteOrderIds,
    onClose,
    onSelectOrder,
    onRemoveFavourite,
    onClearFavourites,
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
                    <div className="favourites-modal-header-actions">
                        <button
                            type="button"
                            className="favourites-modal-clear-button"
                            onClick={onClearFavourites}
                            disabled={favouriteOrders.length === 0}
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            className="add-order-close-button"
                            onClick={onClose}
                            aria-label="Close favourites modal"
                        >
                            <IoMdClose size={24} />
                        </button>
                    </div>
                </div>

                <div className="favourites-modal-content">
                    {favouriteOrders.length === 0 ? (
                        <p className="favourites-empty-state">No favourite orders yet.</p>
                    ) : (
                        <ul className="favourites-list" aria-label="Favourite orders list">
                            {favouriteOrders.map((order) => (
                                <li key={order.id} className="favourites-list-item">
                                    <button
                                        type="button"
                                        className="favourites-list-item-button"
                                        onClick={() => onSelectOrder(order)}
                                    >
                                        <span>{order.oa_number ?? '-'}</span>
                                        <span>{order.account_code}</span>
                                        <span>{order.account_name ?? '-'}</span>
                                        <span className={getStatusClassName(order.status)}>
                                            {formatStatusLabel(order.status)}
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        className="favourites-list-remove-button"
                                        aria-label={`Remove favourite order ${order.oa_number ?? order.id}`}
                                        title="Remove favourite"
                                        disabled={pendingFavouriteOrderIds.includes(order.id)}
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            onRemoveFavourite(order.id)
                                        }}
                                    >
                                        <IoMdClose size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}
