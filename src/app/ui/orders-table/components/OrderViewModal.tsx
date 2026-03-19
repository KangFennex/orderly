'use client'

import { IoMdClose } from 'react-icons/io'
import { orderStatusOptions } from '@/app/lib/orders'
import type { Order } from '@/app/types/orders'

export type OrderEditDraft = {
    oa_number: string
    account_code: string
    account_name: string
    client_po: string
    status: Order['status']
    order_date: string
    req_pick_date: string
    req_ship_date: string
    req_del_date: string
    wh_pick_date: string
    wh_ship_date: string
    wh_del_date: string
    created_at: string
}

type OrderViewModalProps = {
    order: Order | null
    orderEditDraft: OrderEditDraft | null
    isSaving: boolean
    onFieldChange: (
        field: keyof Omit<OrderEditDraft, 'account_code' | 'created_at'>,
        value: string
    ) => void
    onSubmit: (event: React.FormEvent) => Promise<void>
    onClose: () => void
}

export function OrderViewModal({
    order,
    orderEditDraft,
    isSaving,
    onFieldChange,
    onSubmit,
    onClose,
}: OrderViewModalProps) {
    if (!order || !orderEditDraft) {
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
                className="order-view-modal"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="order-view-modal-header">
                    <h3 className="order-view-modal-title">Order Details</h3>
                    <button
                        type="button"
                        className="add-order-close-button"
                        onClick={onClose}
                        aria-label="Close order details modal"
                    >
                        <IoMdClose size={20} />
                    </button>
                </div>

                <div className="order-view-modal-content">
                    <form
                        className="order-view-form"
                        onSubmit={onSubmit}
                    >
                        <label className="order-view-field">
                            <span>OA Number</span>
                            <input
                                type="text"
                                value={orderEditDraft.oa_number}
                                onChange={(event) =>
                                    onFieldChange('oa_number', event.target.value)
                                }
                            />
                        </label>
                        <label className="order-view-field">
                            <span>Account Code</span>
                            <input
                                type="text"
                                value={orderEditDraft.account_code}
                                disabled
                                readOnly
                            />
                        </label>
                        <label className="order-view-field">
                            <span>Account Name</span>
                            <input
                                type="text"
                                value={orderEditDraft.account_name}
                                onChange={(event) =>
                                    onFieldChange('account_name', event.target.value)
                                }
                            />
                        </label>
                        <label className="order-view-field">
                            <span>Client PO</span>
                            <input
                                type="text"
                                value={orderEditDraft.client_po}
                                onChange={(event) =>
                                    onFieldChange('client_po', event.target.value)
                                }
                            />
                        </label>
                        <label className="order-view-field">
                            <span>Status</span>
                            <select
                                value={orderEditDraft.status}
                                onChange={(event) =>
                                    onFieldChange('status', event.target.value)
                                }
                            >
                                {orderStatusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="order-view-field">
                            <span>Order Date</span>
                            <input
                                type="date"
                                value={orderEditDraft.order_date}
                                onChange={(event) =>
                                    onFieldChange('order_date', event.target.value)
                                }
                            />
                        </label>
                        <label className="order-view-field">
                            <span>Req. Pick Date</span>
                            <input
                                type="date"
                                value={orderEditDraft.req_pick_date}
                                onChange={(event) =>
                                    onFieldChange('req_pick_date', event.target.value)
                                }
                            />
                        </label>
                        <label className="order-view-field">
                            <span>Req. Ship Date</span>
                            <input
                                type="date"
                                value={orderEditDraft.req_ship_date}
                                onChange={(event) =>
                                    onFieldChange('req_ship_date', event.target.value)
                                }
                            />
                        </label>
                        <label className="order-view-field">
                            <span>Req. Del Date</span>
                            <input
                                type="date"
                                value={orderEditDraft.req_del_date}
                                onChange={(event) =>
                                    onFieldChange('req_del_date', event.target.value)
                                }
                            />
                        </label>
                        <label className="order-view-field">
                            <span>WH Pick Date</span>
                            <input
                                type="date"
                                value={orderEditDraft.wh_pick_date}
                                onChange={(event) =>
                                    onFieldChange('wh_pick_date', event.target.value)
                                }
                            />
                        </label>
                        <label className="order-view-field">
                            <span>WH Ship Date</span>
                            <input
                                type="date"
                                value={orderEditDraft.wh_ship_date}
                                onChange={(event) =>
                                    onFieldChange('wh_ship_date', event.target.value)
                                }
                            />
                        </label>
                        <label className="order-view-field">
                            <span>WH Del Date</span>
                            <input
                                type="date"
                                value={orderEditDraft.wh_del_date}
                                onChange={(event) =>
                                    onFieldChange('wh_del_date', event.target.value)
                                }
                            />
                        </label>
                        <label className="order-view-field">
                            <span>Created At</span>
                            <input
                                type="text"
                                value={orderEditDraft.created_at}
                                disabled
                                readOnly
                            />
                        </label>

                        <div className="order-view-actions">
                            <button
                                type="button"
                                className="order-view-cancel-button"
                                onClick={onClose}
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="order-view-submit-button"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
