import { useRef } from "react";
import { cn } from "@/lib/utils";

// When2meet-style weekly availability grid. Tokens are "day-hour" pairs
// (e.g. "mon-9"), hours run 9 AM through 8 PM. Students toggle cells
// (click or click-drag); professors view them read-only.
const SCHEDULE_DAYS: { key: string; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const SCHEDULE_HOURS: { hour: number; label: string }[] = [
  { hour: 9, label: "9 AM" },
  { hour: 10, label: "10 AM" },
  { hour: 11, label: "11 AM" },
  { hour: 12, label: "12 PM" },
  { hour: 13, label: "1 PM" },
  { hour: 14, label: "2 PM" },
  { hour: 15, label: "3 PM" },
  { hour: 16, label: "4 PM" },
  { hour: 17, label: "5 PM" },
  { hour: 18, label: "6 PM" },
  { hour: 19, label: "7 PM" },
  { hour: 20, label: "8 PM" },
];

function parseTokens(value: string | undefined): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean),
  );
}

export function scheduleHourCount(value: string | undefined) {
  return parseTokens(value).size;
}

export function ScheduleGrid({
  value,
  onChange,
  readOnly = false,
}: {
  value: string | undefined;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  const selected = parseTokens(value);
  const painting = useRef<null | boolean>(null);

  function emit(next: Set<string>) {
    onChange?.([...next].join(","));
  }

  function toggle(day: string, hour: number) {
    if (readOnly) return;
    const token = `${day}-${hour}`;
    const next = new Set(selected);
    if (next.has(token)) next.delete(token);
    else next.add(token);
    painting.current = next.has(token);
    emit(next);
  }

  function paint(day: string, hour: number) {
    if (readOnly || painting.current === null) return;
    const token = `${day}-${hour}`;
    const next = new Set(selected);
    if (painting.current) next.add(token);
    else next.delete(token);
    emit(next);
  }

  return (
    <div
      className="schedule-grid"
      onMouseUp={() => (painting.current = null)}
      onMouseLeave={() => (painting.current = null)}
    >
      <div className="schedule-row">
        <span className="schedule-label" />
        {SCHEDULE_DAYS.map((day) => (
          <span key={day.key} className="schedule-label schedule-day">
            {day.label}
          </span>
        ))}
      </div>
      {SCHEDULE_HOURS.map((slot) => (
        <div className="schedule-row" key={slot.hour}>
          <span className="schedule-label">{slot.label}</span>
          {SCHEDULE_DAYS.map((day) => {
            const on = selected.has(`${day.key}-${slot.hour}`);
            return (
              <button
                key={day.key}
                type="button"
                disabled={readOnly}
                aria-label={`${day.label} ${slot.label} — ${on ? "available" : "unavailable"}`}
                aria-pressed={on}
                onMouseDown={() => toggle(day.key, slot.hour)}
                onMouseEnter={() => paint(day.key, slot.hour)}
                className={cn(
                  "schedule-cell",
                  on && "schedule-cell-on",
                  readOnly && "schedule-cell-readonly",
                )}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
