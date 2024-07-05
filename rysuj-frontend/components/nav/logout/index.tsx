"use client";

import React from "react";
import createClient from "@/lib/supabase/client";
import {
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Logout() {
  const router = useRouter();

  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    router.refresh();
  };

  return (
    <NavigationMenuLink
      className={cn(navigationMenuTriggerStyle(), "cursor-pointer")}
      onClick={handleLogout}
    >
      Log Out
    </NavigationMenuLink>
  );
}
