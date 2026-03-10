import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type OrderNotesState = {
    notesByOrderId: Record<string, string>
    setOrderNote: (orderId: string, note: string) => void
    getOrderNote: (orderId: string) => string
}

export const useOrderNotesStore = create<OrderNotesState>()(
    persist(
        (set, get) => ({
            notesByOrderId: {},
            setOrderNote: (orderId, note) => {
                set((state) => ({
                    notesByOrderId: {
                        ...state.notesByOrderId,
                        [orderId]: note,
                    },
                }))
            },
            getOrderNote: (orderId) => get().notesByOrderId[orderId] ?? '',
        }),
        {
            name: 'order-tracker-order-notes',
            partialize: (state) => ({
                notesByOrderId: state.notesByOrderId,
            }),
        },
    ),
)
