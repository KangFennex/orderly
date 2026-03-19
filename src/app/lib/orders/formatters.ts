import type { Order } from '@/app/types/orders'

export const formatDate = (dateValue: string | null | undefined): string => {
    if (!dateValue) {
        return '-'
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        const [year, month, day] = dateValue.split('-')
        return `${month}/${day}/${year.slice(-2)}`
    }

    const parsedDate = new Date(dateValue)

    if (Number.isNaN(parsedDate.getTime())) {
        return dateValue
    }

    return new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
    }).format(parsedDate)
}

export const toDateInputValue = (dateValue: string | null | undefined): string => {
    if (!dateValue) {
        return ''
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue
    }

    const parsedDate = new Date(dateValue)

    if (Number.isNaN(parsedDate.getTime())) {
        return ''
    }

    return parsedDate.toISOString().slice(0, 10)
}

export const getStatusClassName = (status: Order['status']): string => {
    switch (status) {
        case 'cancelled':
            return 'status-pill status-pill--cancelled'
        case 'backorder':
            return 'status-pill status-pill--backorder'
        case 'shipped':
            return 'status-pill status-pill--shipped'
        case 'picking':
            return 'status-pill status-pill--picking'
        case 'pending':
            return 'status-pill status-pill--pending'
        default:
            return 'status-pill'
    }
}

export const formatStatusLabel = (status: Order['status']): string => {
    return status.charAt(0).toUpperCase() + status.slice(1)
}

export const getStatusRowClassName = (status: Order['status']): string => {
    switch (status) {
        case 'cancelled':
            return 'orders-data-row orders-data-row--cancelled'
        case 'shipped':
            return 'orders-data-row orders-data-row--shipped'
        case 'picking':
            return 'orders-data-row orders-data-row--picking'
        case 'pending':
            return 'orders-data-row orders-data-row--pending'
        case 'backorder':
            return 'orders-data-row orders-data-row--backorder'
        default:
            return 'orders-data-row'
    }
}