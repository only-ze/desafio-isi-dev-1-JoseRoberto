import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  placeholder: string;
  onSearch: (text: string) => void;
}

export function SearchInput({ value, placeholder, onSearch }: SearchInputProps) {
  const [text, setText] = useState(value);

  useEffect(() => {
    if (text === value) return;
    const timer = setTimeout(() => onSearch(text), 400);
    return () => clearTimeout(timer);
  }, [text, value, onSearch]);

  return (
    <div className="min-w-55 flex-1">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="pl-9"
        />
      </div>
      {text.trim().length === 1 && (
        <p className="mt-1 px-1 text-xs text-muted-foreground">Digite ao menos 2 caracteres para buscar.</p>
      )}
    </div>
  );
}