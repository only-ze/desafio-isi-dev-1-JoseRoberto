import { Fragment } from "react";
import { useLocation } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NAV_GROUPS } from "./navigation";

function trailFor(pathname: string): string[] {
  for (const group of NAV_GROUPS) {
    const item = group.items.find(({ to }) => pathname.startsWith(to));
    if (item) return [group.label, item.label];
  }
  return [];
}

export function AppBreadcrumb() {
  const trail = trailFor(useLocation().pathname);
  if (trail.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {trail.map((label, index) => {
          const isLast = index === trail.length - 1;
          return (
            <Fragment key={label}>
              <BreadcrumbItem>
                {isLast ? <BreadcrumbPage>{label}</BreadcrumbPage> : <span>{label}</span>}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
