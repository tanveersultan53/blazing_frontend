import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronsUpDown, Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-provider";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: string
    plan: string
  }
}) {
  const { theme, setTheme } = useTheme();
  const themes: { name: "red" | "rose" | "orange" | "green" | "blue" | "yellow" | "violet", logo: React.ElementType | null }[] = [
    {
      name: "red",
      logo: null,
    },
    {
      name: "rose",
      logo: null,
    },
    {
      name: "orange",
      logo: null,
    },
    {
      name: "green",
      logo: null,
    },
    {
      name: "blue",
      logo: null,
    },
    {
      name: "yellow",
      logo: null,
    },
    {
      name: "violet",
      logo: null,
    },
  ]
  const activeTeam = teams;
  const { isMobile } = useSidebar()

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <img src={activeTeam.logo as string} alt={activeTeam.name} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Change Theme
            </DropdownMenuLabel>
            {themes.map((themeOption, index) => (
              <DropdownMenuItem
                key={themeOption.name}
                className="gap-2 p-2"
                onClick={() => {
                  setTheme(themeOption.name);
                }}
              >
                {themeOption.logo && (
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <themeOption.logo className="size-3.5 shrink-0" />
                  </div>
                )}
                {themeOption.name.charAt(0).toUpperCase() + themeOption.name.slice(1)}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" onClick={() => {
              setTheme(theme === "dark" ? "light" : "dark");
            }}>
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </div>
              <div className="text-muted-foreground font-medium">{theme === "dark" ? "Light Theme" : "Dark Theme"}</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
