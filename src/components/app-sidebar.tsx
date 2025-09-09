import * as React from "react"
import {
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { IconHelp, IconSearch, IconSettings } from "@tabler/icons-react"
import { NavSecondary } from "./nav-secondary"
import { useSelector } from "react-redux"
import type { User } from "@/redux/features/userSlice"
import BlazingIcon from "@/assets/blazing-icon.png"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const currentUser = useSelector((state: { user: { currentUser: User } }) => state.user.currentUser);
  
  const { first_name, last_name, email } = currentUser || {};

  const data = {
    user: {
      name: `${first_name} ${last_name}`,
      email: email,
      avatar: "https://www.tadpole.co.nz/wp-content/uploads/2021/02/team-1.jpg",
      first_name: first_name,
      last_name: last_name,
    },
    teams: {
      name: "Blazing Social",
      logo: BlazingIcon,
      plan: "Digital Mortgage Marketing Companies",
    },
    navMain: [
      {
        title: "Users",
        url: ["/", "/users"],
        icon: Users,
        items: [],
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: ["/settings"],
        icon: IconSettings,
      },
      {
        title: "Get Help",
        url: [ "/help"],
        icon: IconHelp,
      },
      {
        title: "Search",
        url: [ "/search"],
        icon: IconSearch,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
