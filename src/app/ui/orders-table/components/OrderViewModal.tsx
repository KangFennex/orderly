'use client'

import { useEffect, useRef, useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import { formatUsDateInput, orderStatusOptions, toIsoDate } from '@/app/lib/orders'
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

const toUsDateFromIso = (isoDate: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
        return ''
    }

    const [year, month, day] = isoDate.split('-')
    return `${month}/${day}/${year}`
}

type OrderViewDateFieldProps = {
    label: string
    value: string
    onChange: (value: string) => void
}

function OrderViewDateField({ label, value, onChange }: OrderViewDateFieldProps) {
    const [textValue, setTextValue] = useState(toUsDateFromIso(value))
    const nativeDateInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        setTextValue(toUsDateFromIso(value))
    }, [value])

    const handleTextInputChange = (nextRawValue: string) => {
        const formattedValue = formatUsDateInput(nextRawValue)
        setTextValue(formattedValue)

        if (!formattedValue.trim()) {
            onChange('')
            return
        }

        const isoDate = toIsoDate(formattedValue)

        if (isoDate) {
            onChange(isoDate)
        }
    }

    const openCalendar = () => {
        const nativeInputElement = nativeDateInputRef.current

        if (!nativeInputElement) {
            return
        }

        nativeInputElement.value = value

        if (typeof nativeInputElement.showPicker === 'function') {
            nativeInputElement.showPicker()
            return
        }

        nativeInputElement.focus()
        nativeInputElement.click()
    }

    const handleNativeDateChange = () => {
        const nativeInputElement = nativeDateInputRef.current

        if (!nativeInputElement) {
            return
        }

        const selectedIsoDate = nativeInputElement.value
        onChange(selectedIsoDate)
        setTextValue(toUsDateFromIso(selectedIsoDate))
    }

    return (
        <label className="order-view-field">
            <span>{label}</span>
            <div className="order-view-date-input-group">
                <input
                    type="text"
                    value={textValue}
                    placeholder="MM/DD/YYYY"
                    inputMode="numeric"
                    onChange={(event) => handleTextInputChange(event.target.value)}
                />
                <button
                    type="button"
                    className="order-view-date-picker-button"
                    aria-label={`Open calendar for ${label}`}
                    onClick={openCalendar}
                >
                    📅
                </button>
                <input
                    ref={nativeDateInputRef}
                    type="date"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="order-view-date-native-input"
                    onChange={handleNativeDateChange}
                />
            </div>
        </label>
    )
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
                        <OrderViewDateField
                            label="Order Date"
                            value={orderEditDraft.order_date}
                            onChange={(value) => onFieldChange('order_date', value)}
                        />
                        <div className="order-view-date-grid">
                            <OrderViewDateField
                                label="Req. Pick Date"
                                value={orderEditDraft.req_pick_date}
                                onChange={(value) => onFieldChange('req_pick_date', value)}
                            />
                            <OrderViewDateField
                                label="WH Pick Date"
                                value={orderEditDraft.wh_pick_date}
                                onChange={(value) => onFieldChange('wh_pick_date', value)}
                            />
                            <OrderViewDateField
                                label="Req. Ship Date"
                                value={orderEditDraft.req_ship_date}
                                onChange={(value) => onFieldChange('req_ship_date', value)}
                            />
                            <OrderViewDateField
                                label="WH Ship Date"
                                value={orderEditDraft.wh_ship_date}
                                onChange={(value) => onFieldChange('wh_ship_date', value)}
                            />
                            <OrderViewDateField
                                label="Req. Del Date"
                                value={orderEditDraft.req_del_date}
                                onChange={(value) => onFieldChange('req_del_date', value)}
                            />
                            <OrderViewDateField
                                label="WH Del Date"
                                value={orderEditDraft.wh_del_date}
                                onChange={(value) => onFieldChange('wh_del_date', value)}
                            />
                        </div>
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
