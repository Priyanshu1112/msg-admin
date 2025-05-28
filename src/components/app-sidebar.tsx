"use client";

import * as React from "react";
import { IconInnerShadowTop } from "@tabler/icons-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChartColumnStacked, HomeIcon, ShieldEllipsis } from "lucide-react";
import useAppStore from "@/store/app";
import { Button } from "@/components/ui/button";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: HomeIcon,
    },
    {
      title: "Category",
      url: "/category",
      icon: ChartColumnStacked,
    },
    {
      title: "Admin",
      url: "/admins",
      icon: ShieldEllipsis,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isMindMapRoute?: boolean;
}

export function AppSidebar({
  isMindMapRoute = false,
  ...props
}: AppSidebarProps) {
  const { user } = useAppStore();
  const { open, setOpen, state } = useSidebar();

  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <div className="relative">
      <Sidebar
        collapsible={isMindMapRoute ? "icon" : "offcanvas"}
        {...props}
        className={`
          transition-all duration-300 ease-in-out
          ${isMindMapRoute ? "hover:shadow-lg" : ""}
        `}
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <a href="#">
                  <IconInnerShadowTop className="!size-5" />
                  <span className="text-base font-semibold">MSG</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <NavMain items={data.navMain} />
        </SidebarContent>

        <SidebarFooter>
          <NavUser
            user={{
              name: user?.name ?? "",
              email: user?.email ?? "",
              avatar: "",
            }}
          />
        </SidebarFooter>
      </Sidebar>

      {/* Toggle Button on Sidebar Border */}
      {/* <Button
        variant="outline"
        size="icon"
        onClick={handleToggle}
        className={`
          sidebar-toggle-btn group
          ${state === 'expanded' ? 'sidebar-expanded' : 'sidebar-collapsed'}
          ${state === 'expanded' 
            ? 'left-[var(--sidebar-width)] -translate-x-full' 
            : 'left-[var(--sidebar-width-icon)] -translate-x-full'
          }
        `}
        title={open ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        <div className="flex items-center justify-center">
          {open ? (
            <ChevronLeft className="h-3 w-3 toggle-icon" />
          ) : (
            <ChevronRight className="h-3 w-3 toggle-icon" />
          )}
        </div> */}

      {/* Visual indicator line */}
      {/* <div className={`
          sidebar-toggle-indicator
          ${open ? 'sidebar-expanded' : 'sidebar-collapsed'}
        `} />
      </Button> */}
    </div>
  );
}
