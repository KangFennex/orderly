'use client'

import { IoMdClose } from 'react-icons/io'

type OrderNoteModalProps = {
    orderId: string | null
    noteDraft: string
    onNoteDraftChange: (value: string) => void
    onSave: () => void
    onClose: () => void
}

export function OrderNoteModal({
    orderId,
    noteDraft,
    onNoteDraftChange,
    onSave,
    onClose,
}: OrderNoteModalProps) {
    if (!orderId) {
        return null
    }

    return (
        <div
            className="add-order-modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div
                className="order-note-modal"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="order-note-modal-header">
                    <h3 className="order-note-modal-title">Order Note</h3>
                    <button
                        type="button"
                        className="add-order-close-button"
                        onClick={onClose}
                        aria-label="Close order note modal"
                    >
                        <IoMdClose size={20} />
                    </button>
                </div>
                <div className="order-note-modal-content">
                    <textarea
                        className="order-note-textarea"
                        value={noteDraft}
                        onChange={(event) => onNoteDraftChange(event.target.value)}
                        placeholder="Write a note for this order"
                        aria-label="Order note"
                        rows={5}
                    />
                    <button
                        type="button"
                        className="order-note-save-button"
                        onClick={onSave}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}
