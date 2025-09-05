import React from "react";
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
} from "@/components/ui/sidebar";
import {
  Calendar,
  Home,
  Inbox,
  Megaphone,
  Search,
  Settings,
  Wallet,
  Wallet2,
} from "lucide-react";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthContext } from "../provider";
import ProfileAvatar from "./ProfileAvatar";

const items = [
  {
    title: "Home",
    url: "/app",
    icon: Home,
  },
  {
    title: "Creative Tools",
    url: "/creative-tools",
    icon: Inbox,
  },
  {
    title: "My Ads",
    url: "#",
    icon: Megaphone,
  },
  {
    title: "Upgrade",
    url: "#",
    icon: Wallet2,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
  const path = usePathname();
  const { user } = useAuthContext();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4">
          <Image
            src={"./logo.svg"}
            alt="logo"
            width={100}
            height={100}
            className="w-full h-full"
          />
          <h2 className="text-sm text-gray-400 text-center">Build Awesome</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="mt-5">
              {items.map((item, index) => (
                // <SidebarMenuItem key={item.title} className='p-2'>
                //     <SidebarMenuButton asChild className=''>
                <a
                  href={item.url}
                  key={index}
                  className={`p-2 text-lg flex gap-2 items-center
                                 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg
                                 ${
                                   path == item.url &&
                                   "bg-gray-100 dark:bg-zinc-800"
                                 }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </a>
                //     </SidebarMenuButton>
                // </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {!user ? (
          <Button>
            <Link href={"/login"} className="w-full h-full">
              Login
            </Link>
          </Button>
        ) : (
          <div className="flex justify-between items-center py-2 px-4 bg-zinc-800 rounded-sm">
            <h2>Profile</h2>
            <ProfileAvatar />
          </div>
        )}
        <h2 className="p-2 text-gray-600 text-sm">
          &copy; 2025 Ok-Perspectives
        </h2>
      </SidebarFooter>
    </Sidebar>
  );
}
