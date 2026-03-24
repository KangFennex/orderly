'use client'

import { ImEnlarge2 } from 'react-icons/im'
import { IoIosExpand } from 'react-icons/io'
import { FaRegNoteSticky } from 'react-icons/fa6'
import { MdDataSaverOn } from 'react-icons/md'
import { TableCell } from '@/components/ui/table'
import type { Order } from '@/app/types/orders'

type OrderRowActionsCellProps = {
    orderId: string
    rowId: string
    oaNumber: string | null
    isSelected: boolean
    isFavorite: boolean
    isFavoriteActionPending: boolean
    hasOrderNote: boolean
    isExpanded: boolean
    onToggleSelection: (orderId: string) => void
    onOpenViewModal: (order: Order) => void
    onToggleExpand: (rowId: string) => void
    onOpenNoteModal: (orderId: string) => void
    onToggleFavorite: (orderId: string) => void
    order: Order
}

export function OrderRowActionsCell({
    orderId,
    rowId,
    oaNumber,
    isSelected,
    isFavorite,
    isFavoriteActionPending,
    hasOrderNote,
    isExpanded,
    onToggleSelection,
    onOpenViewModal,
    onToggleExpand,
    onOpenNoteModal,
    onToggleFavorite,
    order,
}: OrderRowActionsCellProps) {
    return (
        <TableCell className="orders-expand-cell">
            <div className="orders-row-actions">
                <input
                    type="checkbox"
                    className="orders-select-checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelection(orderId)}
                    aria-label={`Select order ${oaNumber ?? orderId}`}
                />
                <div className="orders-row-action-icons">
                    <button
                        type="button"
                        className="orders-view-toggle"
                        onClick={() => onOpenViewModal(order)}
                        aria-label="View full order details"
                        title="View details"
                    >
                        <IoIosExpand size={15} />
                    </button>
                    <button
                        type="button"
                        className="orders-expand-toggle"
                        onClick={() => onToggleExpand(rowId)}
                        aria-expanded={isExpanded ? 'true' : 'false'}
                        aria-label={
                            isExpanded
                                ? 'Collapse order details'
                                : 'Expand order details'
                        }
                    >
                        <span className="orders-expand-icon" aria-hidden="true">
                            <ImEnlarge2 size={15} />
                        </span>
                    </button>
                    <button
                        type="button"
                        className={
                            hasOrderNote
                                ? 'orders-note-toggle is-active'
                                : 'orders-note-toggle'
                        }
                        onClick={() => onOpenNoteModal(orderId)}
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
                        onClick={() => onToggleFavorite(orderId)}
                        disabled={isFavoriteActionPending}
                        aria-label={
                            isFavorite
                                ? 'Remove order from favorites'
                                : 'Add order to favorites'
                        }
                        aria-busy={isFavoriteActionPending ? 'true' : 'false'}
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
    )
}
