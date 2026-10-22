import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function SuccessHeader({ title, description }: { title: string; description: ReactNode }) {
  return (
    <>
      <div className="flex size-9 items-center justify-center rounded-full bg-green-50 text-green-700">
        <CheckCircle2 className="size-5" />
      </div>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
    </>
  );
}
