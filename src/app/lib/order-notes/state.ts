import type { OrderNotesMap } from './actions'

export const getOrderNoteValue = (notesByOrderId: OrderNotesMap, orderId: string) => {
    return notesByOrderId[orderId] ?? ''
}

export const upsertOrderNoteValue = (
    notesByOrderId: OrderNotesMap,
    orderId: string,
    note: string,
): OrderNotesMap => {
    return {
        ...notesByOrderId,
        [orderId]: note,
    }
}
