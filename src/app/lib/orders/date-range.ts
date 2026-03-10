export type DateRangeFilter = 'week' | '2-weeks' | 'month' | 'next-month'

export function parseOrderDateValue(dateValue: string | null | undefined) {
    if (!dateValue) {
        return null
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return new Date(`${dateValue}T00:00:00`)
    }

    const parsed = new Date(dateValue)
    return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function getDateRangeBounds(range: DateRangeFilter, now: Date = new Date()) {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(start)

    if (range === 'week') {
        end.setDate(end.getDate() + 7)
        return { start, end }
    }

    if (range === '2-weeks') {
        end.setDate(end.getDate() + 14)
        return { start, end }
    }

    if (range === 'month') {
        const currentMonthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0)
        return { start, end: currentMonthEnd }
    }

    const nextMonthStart = new Date(start.getFullYear(), start.getMonth() + 1, 1)
    const nextMonthEnd = new Date(start.getFullYear(), start.getMonth() + 2, 0)
    return { start: nextMonthStart, end: nextMonthEnd }
}
