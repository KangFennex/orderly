import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type FavoritesState = {
    favoriteOrderIds: string[]
    toggleFavorite: (orderId: string) => void
    isFavorite: (orderId: string) => boolean
}

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set, get) => ({
            favoriteOrderIds: [],
            toggleFavorite: (orderId) => {
                set((state) => {
                    const isAlreadyFavorite = state.favoriteOrderIds.includes(orderId)

                    if (isAlreadyFavorite) {
                        return {
                            favoriteOrderIds: state.favoriteOrderIds.filter((id) => id !== orderId),
                        }
                    }

                    return {
                        favoriteOrderIds: [...state.favoriteOrderIds, orderId],
                    }
                })
            },
            isFavorite: (orderId) => get().favoriteOrderIds.includes(orderId),
        }),
        {
            name: 'order-tracker-favorites',
            partialize: (state) => ({
                favoriteOrderIds: state.favoriteOrderIds,
            }),
        },
    ),
)
