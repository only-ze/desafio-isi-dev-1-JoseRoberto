import { cn } from "@/lib/utils";

interface ClubCrestProps {
  acronym: string;
  size?: "sm" | "lg";
}

export function ClubCrest({ acronym, size = "sm" }: ClubCrestProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center border bg-muted font-mono font-semibold",
        size === "lg" ? "size-12 rounded-xl text-sm" : "size-8 rounded-lg text-[10px]",
      )}
    >
      {acronym}
    </div>
  );
}
