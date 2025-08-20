import { Home, Settings, User, LogOut, Users, FileText, Mail, BarChart3, Download, HelpCircle, Shield, Upload, ChevronRight } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "./ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

// Menu items for the main navigation
const mainItems = [
  {
    title: "Records",
    url: "/records",
    icon: FileText,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "Email",
    url: "/email",
    icon: Mail,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Import/Export",
    url: "/import-export",
    icon: Download,
  },
  {
    title: "Support",
    url: "/support",
    icon: HelpCircle,
  },
  {
    title: "Control",
    url: "/control",
    icon: Shield,
  },
  {
    title: "Load",
    url: "/load",
    icon: Upload,
  },
]

// Admin-specific menu items
const adminItems = [
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
]

interface AppSidebarProps {
  collapsible?: "offcanvas" | "icon" | "none"
  userEmail?: string
}

export function AppSidebar({ collapsible = "icon", userEmail = "john.doe@example.com" }: AppSidebarProps) {
  const location = useLocation();
  const isAdmin = userEmail === "admin@blazing.com";

  return (
    <Sidebar collapsible={collapsible}>
      <SidebarHeader className="border-b border-sidebar-border/50 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-12 px-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <span className="text-lg font-bold text-primary-foreground">B</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-lg font-bold text-sidebar-foreground">BlazingSocial</span>
                <span className="text-xs text-sidebar-foreground/60">
                  {isAdmin ? "Admin Dashboard" : "Customer Dashboard"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.slice(0, 4).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className={`group relative transition-all duration-200 hover:bg-sidebar-accent/80 ${
                      location.pathname === item.url 
                        ? 'bg-primary/10 border-l-2 border-primary text-primary font-semibold' 
                        : ''
                    }`}
                  >
                    <Link to={item.url}>
                      <item.icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                        location.pathname === item.url ? 'text-primary' : ''
                      }`} />
                      <span className={`font-medium ${
                        location.pathname === item.url ? 'text-primary' : ''
                      }`}>{item.title}</span>
                      {location.pathname === item.url && (
                        <div className="absolute right-2 h-2 w-2 rounded-full bg-primary shadow-sm" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin-specific Users section */}
        {isAdmin && (
          <>
            <SidebarSeparator className="my-4" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                Admin Management
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.pathname === item.url}
                        tooltip={item.title}
                        className={`group relative transition-all duration-200 hover:bg-sidebar-accent/80 ${
                          location.pathname === item.url 
                            ? 'bg-primary/10 border-l-2 border-primary text-primary font-semibold' 
                            : ''
                        }`}
                      >
                        <Link to={item.url}>
                          <item.icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                            location.pathname === item.url ? 'text-primary' : ''
                          }`} />
                          <span className={`font-medium ${
                            location.pathname === item.url ? 'text-primary' : ''
                          }`}>{item.title}</span>
                          {location.pathname === item.url && (
                            <div className="absolute right-2 h-2 w-2 rounded-full bg-primary shadow-sm" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        <SidebarSeparator className="my-4" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Tools & Reports
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.slice(4, 7).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className={`group relative transition-all duration-200 hover:bg-sidebar-accent/80 ${
                      location.pathname === item.url 
                        ? 'bg-primary/10 border-l-2 border-primary text-primary font-semibold' 
                        : ''
                    }`}
                  >
                    <Link to={item.url}>
                      <item.icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                        location.pathname === item.url ? 'text-primary' : ''
                      }`} />
                      <span className={`font-medium ${
                        location.pathname === item.url ? 'text-primary' : ''
                      }`}>{item.title}</span>
                      {location.pathname === item.url && (
                        <div className="absolute right-2 h-2 w-2 rounded-full bg-primary shadow-sm" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.slice(7).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className={`group relative transition-all duration-200 hover:bg-sidebar-accent/80 ${
                      location.pathname === item.url 
                        ? 'bg-primary/10 border-l-2 border-primary text-primary font-semibold' 
                        : ''
                    }`}
                  >
                    <Link to={item.url}>
                      <item.icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                        location.pathname === item.url ? 'text-primary' : ''
                      }`} />
                      <span className={`font-medium ${
                        location.pathname === item.url ? 'text-primary' : ''
                      }`}>{item.title}</span>
                      {location.pathname === item.url && (
                        <div className="absolute right-2 h-2 w-2 rounded-full bg-primary shadow-sm" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12 px-3 hover:bg-sidebar-accent/80">
                  <Avatar className="h-8 w-8 ring-2 ring-sidebar-border/50">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {isAdmin ? "A" : "JD"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sidebar-foreground">
                      {isAdmin ? "Admin User" : "John Doe"}
                    </span>
                    <span className="text-xs text-sidebar-foreground/60">
                      {isAdmin ? "Administrator" : userEmail}
                    </span>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 text-sidebar-foreground/40" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}
