import { type ComponentProps, type ReactNode } from 'react'

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