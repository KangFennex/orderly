'use client'

import { type FormEvent } from 'react'
import { IoMdClose } from 'react-icons/io'
import {
    OrderFormInputField,
    OrderFormSelectField,
} from '@/app/ui/add-order-modal/components/order-form-field'

type AddOrderModalProps = {
    isOpen: boolean
    onClose: () => void
}

const DATE_FIELD_NAMES = [
    'order_date',
    'req_pick_date',
    'requested_ship_date',
    'requested_delivery_date',
    'wh_pick_date',
    'wh_ship_date',
    'wh_del_date',
] as const

function formatUsDateInput(value: string) {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 8)

    if (digitsOnly.length <= 2) {
        return digitsOnly
    }

    if (digitsOnly.length <= 4) {
        return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`
    }

    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4)}`
}

function isValidUsDate(dateValue: string) {
    const trimmedDate = dateValue.trim()
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmedDate)

    if (!match) {
        return false
    }

    const month = Number(match[1])
    const day = Number(match[2])
    const year = Number(match[3])

    if (month < 1 || month > 12) {
        return false
    }

    const parsed = new Date(year, month - 1, day)

    return (
        parsed.getFullYear() === year &&
        parsed.getMonth() === month - 1 &&
        parsed.getDate() === day
    )
}

export function AddOrderModal({ isOpen, onClose }: AddOrderModalProps) {
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        const formElement = event.currentTarget
        let hasInvalidDate = false

        for (const fieldName of DATE_FIELD_NAMES) {
            const inputElement = formElement.elements.namedItem(fieldName)

            if (!(inputElement instanceof HTMLInputElement)) {
                continue
            }

            const value = inputElement.value.trim()

            if (!value) {
                inputElement.setCustomValidity('')
                continue
            }

            if (!isValidUsDate(value)) {
                inputElement.setCustomValidity('Use a valid date in MM/DD/YYYY format.')
                hasInvalidDate = true
                continue
            }

            inputElement.setCustomValidity('')
        }

        if (hasInvalidDate) {
            event.preventDefault()
            formElement.reportValidity()
        }
    }

    const handleInput = (event: FormEvent<HTMLFormElement>) => {
        const target = event.target

        if (!(target instanceof HTMLInputElement)) {
            return
        }

        if ((DATE_FIELD_NAMES as readonly string[]).includes(target.name)) {
            target.value = formatUsDateInput(target.value)
            target.setCustomValidity('')
        }
    }

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
                    <h2 className="add-order-modal-title">Add Order</h2>
                    <button
                        type="button"
                        className="add-order-close-button"
                        onClick={onClose}
                        aria-label="Close add order modal"
                    >
                        <IoMdClose size={24} />
                    </button>
                </div>

                <form className="add-order-form" onSubmit={handleSubmit} onInput={handleInput}>
                    <OrderFormInputField
                        label="OA Number"
                        type="text"
                        name="oa_number"
                        placeholder="Enter OA number"
                    />

                    <OrderFormInputField
                        label="Account Code"
                        type="text"
                        name="account_code"
                        placeholder="Enter account code"
                    />

                    <OrderFormInputField
                        label="Account Name"
                        type="text"
                        name="account_name"
                        placeholder="Enter account name"
                    />

                    <OrderFormInputField
                        label="Customer PO"
                        type="text"
                        name="customer_po"
                        placeholder="Enter customer PO"
                    />

                    <OrderFormInputField
                        label="Order Date"
                        type="text"
                        name="order_date"
                        placeholder="MM/DD/YYYY"
                        inputMode="numeric"
                    />

                    <OrderFormInputField
                        label="Req. Pick Date"
                        type="text"
                        name="req_pick_date"
                        placeholder="MM/DD/YYYY"
                        inputMode="numeric"
                    />

                    <OrderFormInputField
                        label="Req. Ship Date"
                        type="text"
                        name="requested_ship_date"
                        placeholder="MM/DD/YYYY"
                        inputMode="numeric"
                    />

                    <OrderFormInputField
                        label="Req. Delivery Date"
                        type="text"
                        name="requested_delivery_date"
                        placeholder="MM/DD/YYYY"
                        inputMode="numeric"
                    />

                    <OrderFormInputField
                        label="WH Pick Date"
                        type="text"
                        name="wh_pick_date"
                        placeholder="MM/DD/YYYY"
                        inputMode="numeric"
                    />

                    <OrderFormInputField
                        label="WH Ship Date"
                        type="text"
                        name="wh_ship_date"
                        placeholder="MM/DD/YYYY"
                        inputMode="numeric"
                    />

                    <OrderFormInputField
                        label="WH Del Date"
                        type="text"
                        name="wh_del_date"
                        placeholder="MM/DD/YYYY"
                        inputMode="numeric"
                    />

                    <OrderFormSelectField label="Status" name="status" defaultValue="pending">
                        <option value="pending">Pending</option>
                        <option value="picking">Picking</option>
                        <option value="shipped">Shipped</option>
                        <option value="backorder">Backorder</option>
                    </OrderFormSelectField>

                    <div className="add-order-actions">
                        <button type="reset" className="add-order-clear-button">
                            Clear
                        </button>
                        <button type="submit" className="add-order-submit-button">
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}