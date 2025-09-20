import { Grid2X2, ScrollText, User } from "lucide-react";

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
  ],
  tree: [
    [
      "Applications & Personal",
      [
        "Income Proof",
        ["hello", ["route.ts"]],
        "page.tsx",
        "layout.tsx",
        ["blog", ["page.tsx"]],
      ],
      ["References", "logo.png", "background.jpg"],
    ],
    [
      "Moving & Logistics",
      ["ui", "button.tsx", "card.tsx"],
      "header.tsx",
      "footer.tsx",
    ],
    ["Utilities & Services", "favicon.ico", "vercel.svg"],
    ["Insurance", "robots.txt", "sitemap.xml"],
  ],
};

export default navbar;
