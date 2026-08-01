import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Shown as a hover tooltip — useful for explaining why an option is disabled. */
  title?: string;
  /** Persistent emerald checkmark (independent of "currently selected") — e.g. flagging
   * an option already assigned elsewhere, so it stays marked even when not the active value. */
  tick?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  /** Shows a rose validation ring/text, matching the app's other error-state form fields. */
  error?: boolean;
  /** 'md' (default) matches standard form fields; 'sm' fits tight inline contexts like a table-cell popover. */
  size?: 'sm' | 'md';
  /** A trailing action item (e.g. "+ Add New"), set off by a divider below the option list. */
  extraOption?: { value: string; label: string };
  className?: string;
  id?: string;
}

/**
 * The app's standard dropdown — use this instead of a native <select> everywhere.
 * Renders its panel through a portal at viewport coordinates computed from the
 * trigger's position, so ancestor overflow-x-auto/overflow-hidden containers
 * (tables, cards) never clip it, and it flips upward near the bottom of the screen.
 */
export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled,
  required,
  error,
  size = 'md',
  extraOption,
  className = '',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected =
    options.find((o) => o.value === value) ?? (extraOption?.value === value ? extraOption : undefined);
  const sizeClasses = size === 'sm' ? 'px-2 py-1.5 text-xs' : 'px-4 py-3 text-sm';
  const optionSizeClasses = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm';

  const closeMenu = () => setIsOpen(false);

  const openMenu = () => {
    if (disabled) return;
    const rect = triggerRef.current!.getBoundingClientRect();
    const menuHeight = Math.min((options.length + (extraOption ? 1 : 0)) * 40 + 12, 260);
    const opensUpward = rect.bottom + menuHeight > window.innerHeight;
    setMenuPos({
      top: opensUpward ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        id={id}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        disabled={disabled}
        aria-required={required}
        className={`w-full flex items-center justify-between gap-2 bg-slate-50 border rounded-xl text-left outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses} ${
          error
            ? 'border-rose-300 ring-2 ring-rose-100'
            : isOpen
            ? 'ring-2 ring-brand-500/20 border-brand-300'
            : 'border-slate-200 focus:ring-2 focus:ring-brand-500/20'
        } ${className}`}
      >
        <span className={`truncate ${selected ? 'text-slate-800' : 'text-slate-400'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen &&
        menuPos &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[9998]" onClick={closeMenu} />
            <div
              style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
              className="fixed z-[9999] bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 max-h-64 overflow-y-auto"
            >
              {options.length === 0 ? (
                <p className="px-4 py-2 text-sm text-slate-400">No options</p>
              ) : (
                options.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    disabled={o.disabled}
                    title={o.title}
                    onClick={() => {
                      if (o.disabled) return;
                      onChange(o.value);
                      closeMenu();
                    }}
                    className={`w-full flex items-center justify-between gap-2 text-left transition-colors ${optionSizeClasses} ${
                      o.disabled
                        ? 'text-slate-300 cursor-not-allowed'
                        : o.value === value
                        ? 'bg-brand-50 text-brand-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{o.label}</span>
                    {o.value === value ? (
                      <Check size={14} className="shrink-0" />
                    ) : (
                      o.tick && <Check size={14} className="shrink-0 text-emerald-500" />
                    )}
                  </button>
                ))
              )}
              {extraOption && (
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onChange(extraOption.value);
                      closeMenu();
                    }}
                    className={`w-full flex items-center justify-between gap-2 text-left transition-colors ${optionSizeClasses} ${
                      extraOption.value === value ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{extraOption.label}</span>
                  </button>
                </div>
              )}
            </div>
          </>,
          document.body
        )}
    </>
  );
};
