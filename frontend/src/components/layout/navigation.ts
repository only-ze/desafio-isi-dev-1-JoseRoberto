import { ListOrdered, Shield, Swords, Users, type LucideIcon } from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Mercado",
    items: [
      { to: "/players", label: "Jogadores", icon: Users },
      { to: "/clubs", label: "Clubes", icon: Shield },
    ],
  },
  {
    label: "Liga",
    items: [
      { to: "/matches", label: "Partidas", icon: Swords },
      { to: "/standings", label: "Classificação", icon: ListOrdered },
    ],
  },
];