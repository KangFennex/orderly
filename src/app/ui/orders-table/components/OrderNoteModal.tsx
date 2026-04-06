'use client'

import { IoMdClose } from 'react-icons/io'

type OrderNoteModalProps = {
    orderId: string | null
    accountCode: string
    oaNumber: string | null
    noteDraft: string
    isSaving: boolean
    onNoteDraftChange: (value: string) => void
    onSave: () => void
    onClose: () => void
}

export function OrderNoteModal({
    orderId,
    accountCode,
    oaNumber,
    noteDraft,
    isSaving,
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
        >
            <div
                className="order-note-modal"
            >
                <div className="order-note-modal-header">
                    <div className="order-note-modal-header-text">
                        <h3 className="order-note-modal-title">Order Note</h3>
                        <div className="order-note-modal-order-id">
                            <span className="order-note-modal-account-code">{accountCode}</span>
                            {oaNumber && (
                                <span className="order-note-modal-oa-number">OA {oaNumber}</span>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        className="add-order-close-button"
                        onClick={onClose}
                        aria-label="Close order note modal"
                        disabled={isSaving}
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
                        disabled={isSaving}
                        rows={5}
                    />
                    <button
                        type="button"
                        className="order-note-save-button"
                        onClick={onSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    )
}
