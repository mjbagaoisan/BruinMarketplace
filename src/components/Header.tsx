"use client"

import React from "react"
import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import LogoutButton from "./LogoutButton"
import CreateListing from "./CreateListing"
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"

const Header = React.memo(() => {
    return(
        <div className="flex w-full justify-center border-b border-gray-200 px-4 py-3">
            <div className="inline-flex w-fit justify-center items-center border border-gray-200 rounded-3xl px-6 py-3">
                <NavigationMenu viewport={false}>
                <NavigationMenuList>
                    <NavigationMenuItem>
                   <NavigationMenuLink asChild>
                        <Link href="/listings">Browse Listings</Link>
                    </NavigationMenuLink>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                        <Link href="/home" className="block px-3 py-2 rounded-md hover:bg-accent transition-colors" >Home</Link>
                    </NavigationMenuLink>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                    <CreateListing>
                        <button className={navigationMenuTriggerStyle()}>
                            Sell Item
                        </button>
                    </CreateListing>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                        <Link href="/listings/me">My Listings</Link>
                    </NavigationMenuLink>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                    <NavigationMenuTrigger>Account</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <div className="flex flex-col p-3 min-w-[200px]">
                          <Link href="/profile/settings" className="block px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm">
                            Settings
                          </Link>
                          <div>
                            <LogoutButton className="block px-3 py-2 rounded-md hover:bg-accent transition-colors text-med text-red-600 hover:text-red-700 cursor-pointer"/>
                          </div>
                        </div>
                    </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
                </NavigationMenu>
            </div>
        </div>
    )
})

Header.displayName = "Header"

export default Header