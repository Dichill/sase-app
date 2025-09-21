/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as React from "react";
import { ChevronRight, File, Folder } from "lucide-react";

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
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-center p-2">
              <ThemeToggle />
            </div>
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
