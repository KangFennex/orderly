'use client'

import { IoMdClose } from 'react-icons/io'
import type { Order } from '@/app/types/orders'

type FavoritesModalProps = {
    isOpen: boolean
    favoriteOrders: Order[]
    onClose: () => void
}

export function FavoritesModal({ isOpen, favoriteOrders, onClose }: FavoritesModalProps) {
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
                    <h2 className="add-order-modal-title">Favorite Orders</h2>
                    <button
                        type="button"
                        className="add-order-close-button"
                        onClick={onClose}
                        aria-label="Close favorites modal"
                    >
                        <IoMdClose size={24} />
                    </button>
                </div>

                <div className="favorites-modal-content">
                    {favoriteOrders.length === 0 ? (
                        <p className="favorites-empty-state">No favorite orders yet.</p>
                    ) : (
                        <ul className="favorites-list" aria-label="Favorite orders list">
                            {favoriteOrders.map((order) => (
                                <li key={order.id} className="favorites-list-item">
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
