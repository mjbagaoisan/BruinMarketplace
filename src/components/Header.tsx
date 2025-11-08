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
        <div className="flex w-full justify-center border-b border-gray-200 px-4 py-3">
            <div className="flex w-130 justify-center border border-gray-200 rounded-full px-1 py-2">
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

                    <NavigationMenuItem>
                    <NavigationMenuTrigger>Account</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <NavigationMenuLink>Settings</NavigationMenuLink>
                        <NavigationMenuLink>Logout</NavigationMenuLink>
                    </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
                </NavigationMenu>
            </div>
        </div>
    )
}