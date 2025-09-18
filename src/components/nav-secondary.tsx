import * as React from "react"
import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";
import { useSelector } from "react-redux";
import type { User } from "@/redux/features/userSlice";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string[]
    icon: Icon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const currentUser = useSelector((state: { user: { currentUser: User } }) => state.user.currentUser);

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url[0]}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {!currentUser?.is_superuser && <Button size="default">
            <Sparkles />
            Upgrade
          </Button>}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
