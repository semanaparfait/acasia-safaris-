"use client";

import React, { useState, useEffect, useRef } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, startOfWeek, endOfWeek, isBefore, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DateRange {
    from: Date | undefined;
    to?: Date | undefined;
}

interface DatePickerProps {
    date?: DateRange;
    onSelect?: (range: DateRange | undefined) => void;
    className?: string;
    placeholder?: string;
}

export function DateRangePicker({ date, onSelect, className, placeholder = "Select dates" }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(date?.from || new Date());
    const [hoverDate, setHoverDate] = useState<Date | null>(null);

    // Local state to manage selection before applying, if needed, but direct is fine too.
    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(date);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSelectedRange(date);
        if (date?.from) {
            setCurrentMonth(date.from);
        }
    }, [date]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const nextMonth = addMonths(currentMonth, 1);

    const handleDayClick = (day: Date) => {
        if (isBefore(day, startOfDay(new Date()))) return; // Prevent selecting past dates

        if (!selectedRange?.from || (selectedRange.from && selectedRange.to)) {
            // Start a new range
            const newRange = { from: day, to: undefined };
            setSelectedRange(newRange);
            onSelect?.(newRange);
        } else {
            // Complete the range
            if (isBefore(day, selectedRange.from)) {
                // If selected day is before 'from', make it the new 'from'
                const newRange = { from: day, to: undefined };
                setSelectedRange(newRange);
                onSelect?.(newRange);
            } else {
                const newRange = { from: selectedRange.from, to: day };
                setSelectedRange(newRange);
                onSelect?.(newRange);
                // Optional: auto-close upon complete selection after a short delay
                setTimeout(() => setIsOpen(false), 300);
            }
        }
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedRange(undefined);
        onSelect?.(undefined);
    };

    const renderMonth = (monthTarget: Date) => {
        const monthStart = startOfMonth(monthTarget);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

        const dateFormat = "d";
        const days = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div className="flex-1 w-full sm:w-[280px]">
                <div className="flex justify-between items-center mb-4 px-2">
                    {monthTarget === currentMonth ? (
                        <button
                            onClick={(e) => { e.preventDefault(); setCurrentMonth(subMonths(currentMonth, 1)); }}
                            className="p-1 hover:bg-[#0a120b]/5 rounded-full transition-colors"
                        >
                            <ChevronLeft size={18} className="text-[#0a120b]/60" />
                        </button>
                    ) : <div className="w-7" />}

                    <div className="font-sans font-bold uppercase tracking-widest text-[11px] text-[#0a120b]">
                        {format(monthTarget, "MMMM yyyy")}
                    </div>

                    {monthTarget === nextMonth ? (
                        <button
                            onClick={(e) => { e.preventDefault(); setCurrentMonth(addMonths(currentMonth, 1)); }}
                            className="p-1 hover:bg-[#0a120b]/5 rounded-full transition-colors"
                        >
                            <ChevronRight size={18} className="text-[#0a120b]/60" />
                        </button>
                    ) : <div className="w-7" />}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                        <div key={day} className="text-[10px] font-sans font-bold text-[#0a120b]/40 uppercase">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-y-1 gap-x-0 relative">
                    {days.map((day, i) => {
                        const isSelectedFrom = selectedRange?.from && isSameDay(day, selectedRange.from);
                        const isSelectedTo = selectedRange?.to && isSameDay(day, selectedRange.to);
                        const isHoveredRange = hoverDate && selectedRange?.from && !selectedRange.to
                            && isBefore(selectedRange.from, hoverDate)
                            && isWithinInterval(day, { start: selectedRange.from, end: hoverDate });

                        const isInRange = selectedRange?.from && selectedRange?.to && isWithinInterval(day, { start: selectedRange.from, end: selectedRange.to });
                        const isPast = isBefore(day, startOfDay(new Date()));

                        const isSelected = isSelectedFrom || isSelectedTo;
                        const isMiddle = (isInRange || isHoveredRange) && !isSelected;

                        return (
                            <div
                                key={day.toString()}
                                className={`relative p-0.5 flex justify-center items-center h-10 w-full`}
                                onMouseEnter={() => !isPast && setHoverDate(day)}
                                onMouseLeave={() => setHoverDate(null)}
                            >
                                {/* Background for range highlighting */}
                                {isMiddle && (
                                    <div className="absolute inset-0 bg-[var(--primary-dark)]/10" />
                                )}
                                {isSelectedFrom && (selectedRange?.to || hoverDate) && (
                                    <div className="absolute inset-y-0 right-0 w-1/2 bg-[var(--primary-dark)]/10" />
                                )}
                                {isSelectedTo && (
                                    <div className="absolute inset-y-0 left-0 w-1/2 bg-[var(--primary-dark)]/10" />
                                )}

                                <button
                                    onClick={(e) => { e.preventDefault(); handleDayClick(day); }}
                                    disabled={isPast || !isSameMonth(day, monthTarget)}
                                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 transition-all duration-200
                    ${!isSameMonth(day, monthTarget) ? 'text-transparent pointer-events-none' : ''}
                    ${isPast && isSameMonth(day, monthTarget) ? 'text-[#0a120b]/20 cursor-not-allowed' : ''}
                    ${isSelected ? 'bg-[var(--primary-dark)] text-white shadow-md scale-105 font-bold' : ''}
                    ${!isSelected && !isPast && isSameMonth(day, monthTarget) ? 'hover:border hover:border-[var(--primary-dark)] hover:text-[var(--primary-dark)] text-[#0a120b]' : ''}
                    ${isMiddle ? 'text-[var(--primary-dark)] font-medium' : ''}
                  `}
                                >
                                    {format(day, dateFormat)}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const displayText = selectedRange?.from
        ? selectedRange.to
            ? `${format(selectedRange.from, "MMM d, yyyy")} - ${format(selectedRange.to, "MMM d, yyyy")}`
            : `${format(selectedRange.from, "MMM d, yyyy")}`
        : placeholder;

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between border-b border-[#0a120b]/20 py-3 bg-transparent font-serif text-lg outline-none hover:border-[var(--primary-dark)] transition-colors group"
            >
                <span className={`transition-colors ${selectedRange?.from ? 'text-[#0a120b]' : 'text-[#0a120b]/50 italic'}`}>
                    {displayText}
                </span>
                <div className="flex items-center gap-3">
                    {selectedRange?.from && (
                        <X
                            size={16}
                            className="text-[#0a120b]/30 hover:text-[#0a120b] transition-colors"
                            onClick={clearSelection}
                        />
                    )}
                    <CalendarIcon size={18} className="text-[#0a120b]/40 group-hover:text-[var(--primary-dark)] transition-colors" />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full mt-4 left-0 z-50 bg-white p-6 shadow-2xl rounded-3xl border border-[#0a120b]/5"
                    >
                        <div className="flex flex-col sm:flex-row gap-8">
                            {renderMonth(currentMonth)}
                            <div className="hidden sm:block w-px bg-[#0a120b]/5" />
                            <div className="hidden sm:block">
                                {renderMonth(nextMonth)}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[#0a120b]/5 flex justify-between items-center">
                            <span className="text-[11px] font-sans uppercase tracking-widest text-[#0a120b]/40">
                                {selectedRange?.from && selectedRange?.to ? (
                                    `${Math.round(Math.abs((selectedRange.to.getTime() - selectedRange.from.getTime()) / (24 * 60 * 60 * 1000)))} nights`
                                ) : (
                                    "Select dates"
                                )}
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="bg-[#0a120b] text-white px-6 py-2.5 text-[9px] font-sans font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[var(--primary-dark)] transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
