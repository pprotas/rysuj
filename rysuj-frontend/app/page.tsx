import React from "react";
import createServerClient from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createServerClient();

  const { data, error } = await supabase.auth.getUser();

  return <>hi {data?.user?.id}</>;
}
