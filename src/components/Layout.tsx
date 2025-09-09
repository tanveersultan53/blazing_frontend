import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useDispatch } from "react-redux"
import { Outlet } from "react-router-dom"
import { queryKeys } from "@/helpers/constants"
import { useQuery } from '@tanstack/react-query';
import { useEffect } from "react"
import { setCurrentUser } from "@/redux/features/userSlice"
import { userProfile } from "@/services/authService"
import Loading from "./Loading"
import { Toaster } from "@/components/ui/sonner"
import { Separator } from "@radix-ui/react-separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb"
import { BreadcrumbProvider, useBreadcrumb } from "@/contexts/BreadcrumbContext"

function LayoutContent() {
  const dispatch = useDispatch();
  const { pageTitle, breadcrumbs } = useBreadcrumb();

  const getUserProfileQuery = useQuery({
    queryKey: [queryKeys.userProfile],
    queryFn: userProfile,
  });

  useEffect(() => {
    if (getUserProfileQuery.data?.data) {
      dispatch(setCurrentUser(getUserProfileQuery.data?.data));
    }
  }, [getUserProfileQuery.data]);

  if (getUserProfileQuery.isLoading) {
    return <Loading />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator  
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="">
                    Blazing Social
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                {breadcrumbs.length > 0 ? (
                  breadcrumbs.map((breadcrumb, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        {breadcrumb.path ? (
                          <BreadcrumbLink href={breadcrumb.path}>
                            {breadcrumb.label}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator />
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <BreadcrumbItem>
                    <BreadcrumbPage>{pageTitle || 'Dashboard'}</BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="h-[calc(100vh-63.99px)] p-4">
          <Outlet />
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}

export default function Layout() {
  return (
    <BreadcrumbProvider>
      <LayoutContent />
    </BreadcrumbProvider>
  );
}
