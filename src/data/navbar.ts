import { Grid2X2, ScrollText, User, Folder, Settings } from "lucide-react";

export const navbar = {
    general: [
        {
            title: "Dashboard",
            url: "/",
            icon: Grid2X2,
        },
        {
            title: "Listings",
            url: "/listings",
            icon: ScrollText,
        },
        {
            title: "Profile",
            url: "/profile",
            icon: User,
        },
        {
            title: "Documents",
            url: "/documents",
            icon: Folder,
        },
    ],
    // tree: [
    //   [
    //     "Profile",
    //     [
    //       "Income Proof",
    //       ["hello", ["route.ts"]],
    //       "page.tsx",
    //       "layout.tsx",
    //       ["blog", ["page.tsx"]],
    //     ],
    //     ["References", "logo.png", "background.jpg"],
    //   ],
    //   ["Listing", ["ui", "button.tsx", "card.tsx"], "header.tsx", "footer.tsx"],
    //   ["General", "favicon.ico", "vercel.svg"],
    //   // ["Insurance", "robots.txt", "sitemap.xml"],
    // ],
};

export default navbar;
