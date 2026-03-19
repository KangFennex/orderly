'use client'

import { type FormEvent, useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import type { Order } from '@/app/types/orders'
import {
    addOrderDateFieldNames,
    buildCreateOrderPayload,
    formatUsDateInput,
    isValidUsDate,
    orderStatusOptions,
} from '@/app/lib/orders'
import {
    OrderFormInputField,
    OrderFormSelectField,
} from '@/app/ui/add-order-modal/components/order-form-field'

type AddOrderModalProps = {
    isOpen: boolean
    onClose: () => void
    onOrderCreated: (order: Order) => void
    onOrderCreateError: (message: string) => void
}

export function AddOrderModal({
    isOpen,
    onClose,
    onOrderCreated,
    onOrderCreateError,
}: AddOrderModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        const formElement = event.currentTarget
        let hasInvalidDate = false

        for (const fieldName of addOrderDateFieldNames) {
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
                inputElement.setCustomValidity('Use a valid date in MM/DD or MM/DD/YYYY format.')
                hasInvalidDate = true
                continue
            }

            inputElement.setCustomValidity('')
        }

        if (hasInvalidDate) {
            event.preventDefault()
            formElement.reportValidity()
            return
        }

        event.preventDefault()

        if (isSubmitting) {
            return
        }

        const formData = new FormData(formElement)
        const payload = buildCreateOrderPayload(formData)

        setIsSubmitting(true)

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorJson = (await response.json().catch(() => null)) as
                    | { error?: string }
                    | null
                throw new Error(
                    errorJson?.error?.trim() || 'Unable to create order. Please try again.',
                )
            }

            const json = (await response.json()) as { order: Order }
            onOrderCreated(json.order)
            formElement.reset()
            onClose()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to create order.'
            onOrderCreateError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInput = (event: FormEvent<HTMLFormElement>) => {
        const target = event.target

        if (!(target instanceof HTMLInputElement)) {
            return
        }

        if ((addOrderDateFieldNames as readonly string[]).includes(target.name)) {
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
                        label="Account Code"
                        type="text"
                        name="account_code"
                        placeholder="Enter account code"
                        required
                    />

                    <OrderFormInputField
                        label="OA Number"
                        type="text"
                        name="oa_number"
                        placeholder="Enter OA number"
                    />

                    <OrderFormInputField
                        label="Customer PO"
                        type="text"
                        name="customer_po"
                        placeholder="Enter customer PO"
                    />

                    <OrderFormInputField
                        label="Account Name"
                        type="text"
                        name="account_name"
                        placeholder="Enter account name"
                    />

                    <OrderFormInputField
                        label="Order Date"
                        type="text"
                        name="order_date"
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
                        {orderStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </OrderFormSelectField>

                    <div className="add-order-actions">
                        <button type="reset" className="add-order-clear-button">
                            Clear
                        </button>
                        <button type="submit" className="add-order-submit-button" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}