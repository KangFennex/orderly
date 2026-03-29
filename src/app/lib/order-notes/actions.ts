import { getApiErrorMessage } from '@/app/lib/http/errors'

export type OrderNotesMap = Record<string, string>

type OrderNoteResponse = {
    order_id: string
    note: string
}

export async function fetchOrderNotesByOrderIds(orderIds: string[]): Promise<OrderNotesMap> {
    if (orderIds.length === 0) {
        return {}
    }

    const response = await fetch(`/api/orders/notes?orderIds=${encodeURIComponent(orderIds.join(','))}`)

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Unable to load order notes.'))
    }

    const json = (await response.json()) as { notes?: OrderNoteResponse[] }
    const notes = json.notes ?? []

    return notes.reduce<OrderNotesMap>((accumulator, entry) => {
        accumulator[entry.order_id] = entry.note ?? ''
        return accumulator
    }, {})
}

export async function saveOrderNote(orderId: string, note: string): Promise<string> {
    const response = await fetch(`/api/orders/${orderId}/note`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
    })

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Unable to save order note.'))
    }

    const json = (await response.json()) as { note?: OrderNoteResponse }
    return json.note?.note ?? ''
}
