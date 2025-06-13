"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/constants";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@/components/ui/sidebar";
import { ChevronDown } from "lucide-react";
import React from "react";


interface SidebarNavProps {
  items: NavItem[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();

  if (!items?.length) {
    return null;
  }

  return (
    <SidebarMenu>
      {items.map((item, index) => {
        const Icon = item.icon;
        const isActive = item.href ? pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) : false;
        
        if (item.items && item.items.length > 0) {
          const isParentActive = item.items.some(subItem => subItem.href && pathname.startsWith(subItem.href));
          return (
             <SidebarMenuItem key={index}>
                <SidebarMenuButton
                  isActive={isParentActive}
                  className="justify-between"
                  // onClick={() => {}} // Handle dropdown toggle if needed, or use Radix Collapsible
                >
                  <div className="flex items-center gap-2">
                    <Icon />
                    <span>{item.title}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isParentActive ? 'rotate-180' : ''}`} />
                </SidebarMenuButton>
                {/* For actual dropdown functionality, would integrate with Radix Collapsible or similar state management */}
                {/* This is a visual representation for now as Sidebar component doesn't inherently handle sub-menu toggling */}
                {isParentActive && (
                  <SidebarMenuSub>
                    {item.items.map((subItem, subIndex) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = subItem.href ? pathname === subItem.href || pathname.startsWith(subItem.href) : false;
                      return (
                        <SidebarMenuSubItem key={subIndex}>
                          <Link href={subItem.disabled ? "#" : subItem.href} passHref legacyBehavior>
                            <SidebarMenuSubButton isActive={isSubActive} disabled={subItem.disabled} aria-disabled={subItem.disabled}>
                              {SubIcon && <SubIcon />}
                              <span>{subItem.title}</span>
                              {subItem.label && (
                                <span className="ml-auto text-xs text-background bg-muted-foreground px-1.5 py-0.5 rounded-sm">
                                  {subItem.label}
                                </span>
                              )}
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                )}
            </SidebarMenuItem>
          );
        }

        return (
          <SidebarMenuItem key={index}>
            <Link href={item.disabled ? "#" : item.href} passHref legacyBehavior>
              <SidebarMenuButton
                isActive={isActive}
                disabled={item.disabled}
                aria-disabled={item.disabled}
                tooltip={item.title}
              >
                <Icon />
                <span>{item.title}</span>
                {item.label && (
                  <span className="ml-auto text-xs text-background bg-muted-foreground px-1.5 py-0.5 rounded-sm">
                    {item.label}
                  </span>
                )}
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
