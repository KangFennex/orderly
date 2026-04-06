'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IoIosExpand } from 'react-icons/io'
import { FaRegNoteSticky } from 'react-icons/fa6'
import { MdDataSaverOn } from 'react-icons/md'
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md'
import { AiFillBell, AiOutlineBell } from 'react-icons/ai'
import { TableCell } from '@/components/ui/table'
import type { Order } from '@/app/types/orders'

type OrderRowActionsCellProps = {
    orderId: string
    rowId: string
    oaNumber: string | null
    isSelected: boolean
    isFavourite: boolean
    isFavouriteActionPending: boolean
    hasCustomReminder: boolean
    hasOrderNote: boolean
    isExpanded: boolean
    onToggleSelection: (orderId: string) => void
    onOpenViewModal: (order: Order) => void
    onToggleExpand: (rowId: string) => void
    onOpenNoteModal: (order: Order) => void
    onToggleFavourite: (orderId: string) => void
    onSetCustomReminder: (order: Order, remindAt: string) => void
    onClearCustomReminder: (orderId: string) => void
    order: Order
}

const toUsDateFromIso = (isoDate: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
        return ''
    }

    const [year, month, day] = isoDate.split('-')
    return `${month}/${day}/${year}`
}

const toIsoDateFromUs = (usDate: string) => {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(usDate.trim())

    if (!match) {
        return ''
    }

    const [, month, day, year] = match
    return `${year}-${month}-${day}`
}

export function OrderRowActionsCell({
    orderId,
    rowId,
    oaNumber,
    isSelected,
    isFavourite,
    isFavouriteActionPending,
    hasCustomReminder,
    hasOrderNote,
    isExpanded,
    onToggleSelection,
    onOpenViewModal,
    onToggleExpand,
    onOpenNoteModal,
    onToggleFavourite,
    onSetCustomReminder,
    onClearCustomReminder,
    order,
}: OrderRowActionsCellProps) {
    const [isReminderEditorOpen, setIsReminderEditorOpen] = useState(false)
    const [reminderDateInput, setReminderDateInput] = useState('')
    const reminderDateInputRef = useRef<HTMLInputElement | null>(null)
    const nativeReminderDateInputRef = useRef<HTMLInputElement | null>(null)
    const reminderToggleButtonRef = useRef<HTMLButtonElement | null>(null)
    const reminderEditorRef = useRef<HTMLDivElement | null>(null)
    const [reminderEditorPosition, setReminderEditorPosition] = useState<{ top: number; left: number } | null>(null)

    const updateReminderEditorPosition = () => {
        const anchor = reminderToggleButtonRef.current

        if (!anchor) {
            return
        }

        const rect = anchor.getBoundingClientRect()
        const editorWidth = 142
        const preferredLeft = rect.right - editorWidth
        const maxLeft = Math.max(8, window.innerWidth - editorWidth - 8)

        setReminderEditorPosition({
            top: rect.bottom + 6,
            left: Math.max(8, Math.min(preferredLeft, maxLeft)),
        })
    }

    useEffect(() => {
        if (!isReminderEditorOpen) {
            return
        }

        updateReminderEditorPosition()
        reminderDateInputRef.current?.focus()
        reminderDateInputRef.current?.select()
    }, [isReminderEditorOpen])

    useEffect(() => {
        if (!isReminderEditorOpen) {
            return
        }

        const handleReposition = () => {
            updateReminderEditorPosition()
        }

        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as Node

            if (reminderEditorRef.current?.contains(target)) {
                return
            }

            if (reminderToggleButtonRef.current?.contains(target)) {
                return
            }

            setIsReminderEditorOpen(false)
            setReminderDateInput('')
        }

        window.addEventListener('resize', handleReposition)
        window.addEventListener('scroll', handleReposition, true)
        window.addEventListener('mousedown', handleOutsideClick)

        return () => {
            window.removeEventListener('resize', handleReposition)
            window.removeEventListener('scroll', handleReposition, true)
            window.removeEventListener('mousedown', handleOutsideClick)
        }
    }, [isReminderEditorOpen])

    const openCalendar = () => {
        const nativeInputElement = nativeReminderDateInputRef.current

        if (!nativeInputElement) {
            return
        }

        const currentIsoDate = toIsoDateFromUs(reminderDateInput)
        nativeInputElement.value = currentIsoDate

        if (typeof nativeInputElement.showPicker === 'function') {
            nativeInputElement.showPicker()
            return
        }

        nativeInputElement.focus()
        nativeInputElement.click()
    }

    const handleNativeDateChange = () => {
        const nativeInputElement = nativeReminderDateInputRef.current

        if (!nativeInputElement) {
            return
        }

        setReminderDateInput(toUsDateFromIso(nativeInputElement.value))
    }

    const submitCustomReminder = () => {
        const remindAt = toIsoDateFromUs(reminderDateInput)

        if (!remindAt) {
            return
        }

        onSetCustomReminder(order, remindAt)
        setIsReminderEditorOpen(false)
        setReminderDateInput('')
    }

    return (
        <TableCell className="orders-expand-cell">
            <div className="orders-row-actions">
                <input
                    type="checkbox"
                    className="orders-select-checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelection(orderId)}
                    aria-label={`Select order ${oaNumber ?? orderId}`}
                />
                <div className="orders-row-action-stack">
                    <div className="orders-row-action-icons">
                        <button
                            type="button"
                            className="orders-view-toggle"
                            onClick={() => onOpenViewModal(order)}
                            aria-label="View full order details"
                            title="View details"
                        >
                            <IoIosExpand size={15} />
                        </button>
                        <button
                            type="button"
                            className={
                                hasOrderNote
                                    ? 'orders-note-toggle is-active'
                                    : 'orders-note-toggle'
                            }
                            onClick={() => onOpenNoteModal(order)}
                            aria-label="Open order note"
                            title="Order note"
                        >
                            <FaRegNoteSticky size={14} />
                        </button>
                        <button
                            type="button"
                            className={
                                isFavourite
                                    ? 'orders-save-toggle is-active'
                                    : 'orders-save-toggle'
                            }
                            onClick={() => onToggleFavourite(orderId)}
                            disabled={isFavouriteActionPending}
                            aria-label={
                                isFavourite
                                    ? 'Remove order from favourites'
                                    : 'Add order to favourites'
                            }
                            aria-busy={isFavouriteActionPending ? 'true' : 'false'}
                            title={
                                isFavourite
                                    ? 'Remove from favourites'
                                    : 'Add to favourites'
                            }
                        >
                            <MdDataSaverOn size={14} />
                        </button>
                        <div className="orders-reminder-control">
                            <button
                                ref={reminderToggleButtonRef}
                                type="button"
                                className={
                                    hasCustomReminder
                                        ? 'orders-reminder-toggle is-active'
                                        : 'orders-reminder-toggle'
                                }
                                onClick={() => {
                                    if (hasCustomReminder) {
                                        onClearCustomReminder(orderId)
                                        return
                                    }

                                    setIsReminderEditorOpen((prev) => !prev)
                                }}
                                aria-label={
                                    hasCustomReminder
                                        ? 'Clear custom reminder'
                                        : 'Set custom reminder'
                                }
                                title={
                                    hasCustomReminder
                                        ? 'Clear custom reminder'
                                        : 'Set custom reminder'
                                }
                            >
                                {hasCustomReminder ? <AiFillBell size={14} /> : <AiOutlineBell size={14} />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="orders-expand-toggle orders-expand-toggle--row"
                        onClick={() => onToggleExpand(rowId)}
                        aria-expanded={isExpanded ? 'true' : 'false'}
                        aria-label={
                            isExpanded
                                ? 'Collapse order details'
                                : 'Expand order details'
                        }
                    >
                        <span className="orders-expand-icon" aria-hidden="true">
                            {isExpanded ? <MdKeyboardArrowUp size={16} /> : <MdKeyboardArrowDown size={16} />}
                        </span>
                    </button>
                </div>
            </div>
            {isReminderEditorOpen && reminderEditorPosition
                ? createPortal(
                    <div
                        ref={reminderEditorRef}
                        className="orders-reminder-editor"
                        style={{
                            position: 'fixed',
                            top: `${reminderEditorPosition.top}px`,
                            left: `${reminderEditorPosition.left}px`,
                        }}
                    >
                        <label className="orders-reminder-editor-label">
                            Reminder Date
                            <div className="orders-reminder-editor-date-row">
                                <input
                                    ref={reminderDateInputRef}
                                    type="text"
                                    value={reminderDateInput}
                                    onChange={(event) => setReminderDateInput(event.target.value)}
                                    placeholder="MM/DD/YYYY"
                                    className="orders-reminder-editor-input"
                                />
                                <button
                                    type="button"
                                    className="orders-reminder-editor-calendar-button"
                                    onClick={openCalendar}
                                    aria-label="Open reminder calendar"
                                >
                                    📅
                                </button>
                                <input
                                    ref={nativeReminderDateInputRef}
                                    type="date"
                                    tabIndex={-1}
                                    aria-hidden="true"
                                    className="orders-reminder-editor-native-input"
                                    onChange={handleNativeDateChange}
                                />
                            </div>
                        </label>
                        <div className="orders-reminder-editor-actions">
                            <button
                                type="button"
                                className="orders-reminder-editor-button"
                                onClick={submitCustomReminder}
                            >
                                Set
                            </button>
                            <button
                                type="button"
                                className="orders-reminder-editor-button is-muted"
                                onClick={() => {
                                    setIsReminderEditorOpen(false)
                                    setReminderDateInput('')
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>,
                    document.body,
                )
                : null}
        </TableCell>
    )
}
