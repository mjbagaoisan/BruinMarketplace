import Link from "next/link"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export default function Header() {
    return(
        <NavigationMenu>
        <NavigationMenuList>
            <NavigationMenuItem>
            <NavigationMenuTrigger>Browse Listings</NavigationMenuTrigger>
            <NavigationMenuContent>
                <NavigationMenuLink>Clothing</NavigationMenuLink>
                <NavigationMenuLink>Shoes</NavigationMenuLink>
            </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
            <NavigationMenuLink asChild>
                <Link href="/home">Home</Link>
            </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
            <NavigationMenuLink asChild>
                <Link href="/docs">Sell Item</Link>
            </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
            <NavigationMenuLink asChild>
                <Link href="/listings">My Listings</Link>
            </NavigationMenuLink>
            </NavigationMenuItem>
        </NavigationMenuList>
        </NavigationMenu>
    )
}