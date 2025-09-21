import * as React from "react";
import { ChevronRight, File, Folder, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarRail,
} from "@/components/ui/sidebar";

import { navbar as data } from "@/data/navbar";
import Link from "next/link";
import { handleLogout } from "@/utils/database";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const router = useRouter();

    return (
        <Sidebar {...props} style={{ marginTop: "48px" }}>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>General</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {data.general.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url} prefetch>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                {/* <SidebarGroup>
                    <SidebarGroupLabel>Documents</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {data.tree.map((item, index) => (
                                <Tree key={index} item={item} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup> */}
            </SidebarContent>
            <SidebarFooter className="mb-12">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="cursor-pointer">
                            <Link href="/settings" prefetch>
                                <Settings />
                                <span>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => {
                                void handleLogout().then(() => {
                                    router.push("/login");
                                });
                            }}
                            className="cursor-pointer"
                        >
                            <LogOut />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}

// function Tree({ item }: { item: string | any[] }) {
//   const [name, ...items] = Array.isArray(item) ? item : [item];

//   if (!items.length) {
//     return (
//       <SidebarMenuButton className="data-[active=true]:bg-transparent">
//         <File />
//         {name}
//       </SidebarMenuButton>
//     );
//   }

//   return (
//     <SidebarMenuItem>
//       <Collapsible className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90">
//         <CollapsibleTrigger asChild>
//           <SidebarMenuButton>
//             <ChevronRight className="transition-transform" />
//             <Folder />
//             {name}
//           </SidebarMenuButton>
//         </CollapsibleTrigger>
//         <CollapsibleContent>
//           <SidebarMenuSub>
//             {items.map((subItem, index) => (
//               <Tree key={index} item={subItem} />
//             ))}
//           </SidebarMenuSub>
//         </CollapsibleContent>
//       </Collapsible>
//     </SidebarMenuItem>
//   );
// }
