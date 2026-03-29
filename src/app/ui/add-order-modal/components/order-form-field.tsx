import { type ComponentProps, type ReactNode, useRef } from 'react'

type OrderFormFieldProps = {
    label: string
    children: ReactNode
}

function OrderFormField({ label, children }: OrderFormFieldProps) {
    return (
        <label className="add-order-field">
            <span>{label}</span>
            {children}
        </label>
    )
}

type OrderFormInputFieldProps = {
    label: string
} & ComponentProps<'input'>

export function OrderFormInputField({
    label,
    ...inputProps
}: OrderFormInputFieldProps) {
    return (
        <OrderFormField label={label}>
            <input {...inputProps} />
        </OrderFormField>
    )
}

type OrderFormSelectFieldProps = {
    label: string
    children: ReactNode
} & ComponentProps<'select'>

export function OrderFormSelectField({
    label,
    children,
    ...selectProps
}: OrderFormSelectFieldProps) {
    return (
        <OrderFormField label={label}>
            <select {...selectProps}>{children}</select>
        </OrderFormField>
    )
}

const toUsDateFromIso = (isoDate: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
        return ''
    }

    const [year, month, day] = isoDate.split('-')
    return `${month}/${day}/${year}`
}

const toIsoDateFromUs = (usDate: string) => {
    const trimmedDate = usDate.trim()

    if (!trimmedDate) {
        return ''
    }

    let match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmedDate)

    if (match) {
        const [, month, day, year] = match
        return `${year}-${month}-${day}`
    }

    match = /^(\d{2})\/(\d{2})$/.exec(trimmedDate)

    if (match) {
        const [, month, day] = match
        return `2026-${month}-${day}`
    }

    return ''
}

type OrderFormDateFieldProps = {
    label: string
} & Omit<ComponentProps<'input'>, 'type'>

export function OrderFormDateField({
    label,
    ...inputProps
}: OrderFormDateFieldProps) {
    const textInputRef = useRef<HTMLInputElement | null>(null)
    const nativeDateInputRef = useRef<HTMLInputElement | null>(null)

    const openCalendar = () => {
        const textInputElement = textInputRef.current
        const nativeInputElement = nativeDateInputRef.current

        if (!textInputElement || !nativeInputElement) {
            return
        }

        nativeInputElement.value = toIsoDateFromUs(textInputElement.value)

        if (typeof nativeInputElement.showPicker === 'function') {
            nativeInputElement.showPicker()
            return
        }

        nativeInputElement.focus()
        nativeInputElement.click()
    }

    const handleNativeDateChange = () => {
        const textInputElement = textInputRef.current
        const nativeInputElement = nativeDateInputRef.current

        if (!textInputElement || !nativeInputElement) {
            return
        }

        textInputElement.value = toUsDateFromIso(nativeInputElement.value)
        textInputElement.setCustomValidity('')
        textInputElement.dispatchEvent(new Event('input', { bubbles: true }))
    }

    return (
        <OrderFormField label={label}>
            <div className="add-order-date-input-group">
                <input ref={textInputRef} {...inputProps} />
                <button
                    type="button"
                    className="add-order-date-picker-button"
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
                    className="add-order-date-native-input"
                    onChange={handleNativeDateChange}
                />
            </div>
        </OrderFormField>
    )
}