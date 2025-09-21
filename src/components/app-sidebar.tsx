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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.general.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
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
