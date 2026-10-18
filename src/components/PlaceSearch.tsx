import { useRef, type KeyboardEvent } from "react";
import type { SearchResult } from "../map";

interface Props {
  query: string;
  open: boolean;
  disabled: boolean;
  results: SearchResult[];
  onQueryChange: (query: string) => void;
  onOpenChange: (open: boolean) => void;
  onSelect: (result: SearchResult) => void;
}

export function PlaceSearch({
  query,
  open,
  disabled,
  results,
  onQueryChange,
  onOpenChange,
  onSelect,
}: Props) {
  const input = useRef<HTMLInputElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const handleInputKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      onOpenChange(false);
      input.current?.blur();
    }
    if (event.key === "Enter" && results[0]) {
      event.preventDefault();
      onSelect(results[0]);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      onOpenChange(true);
      requestAnimationFrame(() => buttons.current[0]?.focus());
    }
  };
  const handleResultKey = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next =
        (index + (event.key === "ArrowDown" ? 1 : -1) + results.length) %
        results.length;
      buttons.current[next]?.focus();
    }
    if (event.key === "Escape") {
      input.current?.focus();
      onOpenChange(false);
    }
  };
  return (
    <div className="search-control">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10" cy="10" r="6.5" />
        <path d="m15 15 5 5" />
      </svg>
      <input
        ref={input}
        id="place-search"
        aria-label="定位省份、城市或区县"
        placeholder="定位省份、城市或区县"
        autoComplete="off"
        role="combobox"
        aria-controls="place-results"
        aria-expanded={open}
        value={query}
        disabled={disabled}
        onFocus={() => onOpenChange(true)}
        onKeyDown={handleInputKey}
        onChange={(event) => {
          onQueryChange(event.target.value);
          onOpenChange(true);
        }}
      />
      <button
        id="clear-search"
        title="清空定位"
        aria-label="清空定位"
        hidden={!query}
        onClick={() => {
          onQueryChange("");
          onOpenChange(true);
          input.current?.focus();
        }}
      >
        ×
      </button>
      <div id="place-results" role="listbox" hidden={!open}>
        {results.map((result, index) => (
          <button
            key={result.key}
            type="button"
            role="option"
            aria-selected={false}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            onClick={() => onSelect(result)}
            onKeyDown={(event) => handleResultKey(event, index)}
          >
            <span>{result.name}</span>
            <small>{result.description}</small>
          </button>
        ))}
        {!results.length && <div className="empty-result">暂未找到该地点</div>}
      </div>
    </div>
  );
}
