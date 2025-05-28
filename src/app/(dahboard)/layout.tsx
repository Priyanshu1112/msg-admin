"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import useAppStore from "@/store/app";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data } = useSession();
  const { setUser } = useAppStore();
  const pathname = usePathname();
  
  // State for sidebar behavior
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userToggled, setUserToggled] = useState(false);
  
  // Check if current route is a mind-map route
  const isMindMapRoute = pathname.includes('/mind-map');

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    }
  }, [data, setUser]);

  // Handle automatic collapse for mind-map routes
  useEffect(() => {
    if (isMindMapRoute) {
      // Auto-collapse when entering mind-map route (unless user manually expanded it)
      if (!userToggled) {
        setSidebarOpen(false);
      }
    } else {
      // Reset to expanded when leaving mind-map routes
      if (!userToggled) {
        setSidebarOpen(true);
      }
      // Reset user toggle state when leaving mind-map routes
      setUserToggled(false);
    }
  }, [isMindMapRoute, userToggled]);

  // Handle sidebar toggle changes
  const handleSidebarOpenChange = (open: boolean) => {
    setSidebarOpen(open);
    
    // Mark that user manually toggled the sidebar
    if (isMindMapRoute) {
      setUserToggled(true);
    }
  };

  // Reset user toggle when route changes away from mind-map
  useEffect(() => {
    if (!isMindMapRoute) {
      setUserToggled(false);
    }
  }, [isMindMapRoute]);

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <SidebarProvider 
        open={sidebarOpen} 
        onOpenChange={handleSidebarOpenChange}
        defaultOpen={!isMindMapRoute}
      >
        <AppSidebar isMindMapRoute={isMindMapRoute} />
        <SidebarInset>
          <div className="px-4 py-2">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}