import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { initials } from "@/utils/format";

const PALETTE = [
  "bg-slate-100 text-slate-700",
  "bg-teal-50 text-teal-700",
  "bg-violet-50 text-violet-700",
  "bg-pink-50 text-pink-700",
  "bg-sky-50 text-sky-700",
  "bg-amber-50 text-amber-800",
];

export function PlayerAvatar({ id, name }: { id: number; name: string }) {
  return (
    <Avatar className="size-8">
      <AvatarFallback className={cn("text-xs font-medium", PALETTE[id % PALETTE.length])}>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
