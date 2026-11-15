import { useMemo, useRef, useState } from "react";

// Styled autocomplete input replacing native <datalist>, which browsers
// render with unstyleable system chrome. Free text is still allowed; the
// dropdown suggests matches and keyboard navigation picks them.
export function AutocompleteInput({
  id,
  value,
  onChange,
  suggestions,
  placeholder,
  disabled = false,
  required = false,
  onPick,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  onPick?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase();
    return suggestions
      .filter((item) => item.toLowerCase().includes(query))
      .filter((item) => item.toLowerCase() !== query)
      .slice(0, 8);
  }, [suggestions, value]);

  const show = open && filtered.length > 0;

  function pick(item: string) {
    onChange(item);
    setOpen(false);
    onPick?.(item);
  }

  return (
    <div className="autocomplete-wrap">
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        required={required && !filtered.includes(value)}
        autoComplete="off"
        role="combobox"
        aria-expanded={show}
        aria-controls={`${id}-list`}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => {
          if (blurTimer.current) clearTimeout(blurTimer.current);
          setOpen(true);
        }}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={(event) => {
          if (!show) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((current) => (current + 1) % filtered.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive(
              (current) => (current - 1 + filtered.length) % filtered.length,
            );
          } else if (event.key === "Enter") {
            if (filtered[active]) {
              event.preventDefault();
              pick(filtered[active]);
            }
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {show && (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="autocomplete-pop"
        >
          {filtered.map((item, index) => (
            <li key={item}>
              <button
                type="button"
                role="option"
                aria-selected={index === active}
                data-active={index === active}
                onMouseDown={(event) => {
                  event.preventDefault();
                  pick(item);
                }}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
