import { Link } from "react-router-dom";

export function ClubTag({ acronym }: { acronym: string | undefined }) {
  return <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{acronym ?? "—"}</span>;
}

interface ClubLinkProps {
  clubId: number;
  name: string;
  acronym: string | undefined;
}

export function ClubLink({ clubId, name, acronym }: ClubLinkProps) {
  return (
    <div className="flex items-center gap-2">
      <ClubTag acronym={acronym} />
      <Link
        to={`/clubs/${clubId}`}
        className="whitespace-nowrap underline decoration-muted-foreground/40 underline-offset-4 hover:decoration-foreground"
      >
        {name}
      </Link>
    </div>
  );
}
