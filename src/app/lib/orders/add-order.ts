import type { Order } from '@/app/types/orders'

export const addOrderDateFieldNames = [
    'order_date',
    'req_pick_date',
    'requested_ship_date',
    'requested_delivery_date',
    'wh_pick_date',
    'wh_ship_date',
    'wh_del_date',
] as const

export function formatUsDateInput(value: string) {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 8)

    if (digitsOnly.length <= 2) {
        return digitsOnly
    }


    if (digitsOnly.length === 4) {
        // Auto-complete to MM/DD/2026 when user enters MM/DD
        return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}/2026`
    }

    if (digitsOnly.length <= 6) {
        return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4)}`
    }

    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4)}`
}

export function isValidUsDate(dateValue: string) {
    const trimmedDate = dateValue.trim()

    // Try MM/DD/YYYY format first
    let match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmedDate)
    let year = 2026

    if (!match) {
        // Try MM/DD format (assume 2026)
        match = /^(\d{2})\/(\d{2})$/.exec(trimmedDate)
        if (!match) {
            return false
        }
    } else {
        year = Number(match[3])
    }

    const month = Number(match[1])
    const day = Number(match[2])

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

export function toIsoDate(dateValue: string) {
    const trimmedDate = dateValue.trim()

    if (!trimmedDate) {
        return null
    }

    // Try MM/DD/YYYY format first
    let match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmedDate)

    if (match) {
        return `${match[3]}-${match[1]}-${match[2]}`
    }

    // Try MM/DD format (assume 2026)
    match = /^(\d{2})\/(\d{2})$/.exec(trimmedDate)

    if (match) {
        return `2026-${match[1]}-${match[2]}`
    }

    return null
}
export type CreateOrderPayload = {
    oa_number: string | null
    account_code: string
    account_name: string | null
    client_po: string | null
    order_date: string | null
    req_pick_date: string | null
    req_ship_date: string | null
    req_del_date: string | null
    wh_pick_date: string | null
    wh_ship_date: string | null
    wh_del_date: string | null
    status: Order['status']
}

export function buildCreateOrderPayload(formData: FormData): CreateOrderPayload {
    return {
        oa_number: String(formData.get('oa_number') ?? '').trim() || null,
        account_code: String(formData.get('account_code') ?? '').trim(),
        account_name: String(formData.get('account_name') ?? '').trim() || null,
        client_po: String(formData.get('customer_po') ?? '').trim() || null,
        order_date: toIsoDate(String(formData.get('order_date') ?? '').trim()),
        req_pick_date: toIsoDate(String(formData.get('req_pick_date') ?? '').trim()),
        req_ship_date: toIsoDate(String(formData.get('requested_ship_date') ?? '').trim()),
        req_del_date: toIsoDate(String(formData.get('requested_delivery_date') ?? '').trim()),
        wh_pick_date: toIsoDate(String(formData.get('wh_pick_date') ?? '').trim()),
        wh_ship_date: toIsoDate(String(formData.get('wh_ship_date') ?? '').trim()),
        wh_del_date: toIsoDate(String(formData.get('wh_del_date') ?? '').trim()),
        status: String(formData.get('status') ?? 'pending') as Order['status'],
    }
}