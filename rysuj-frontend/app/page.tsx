import React from "react";
import createServerClient from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;

  return user?.email ? (
    <>You are logged in as {user.email}.</>
  ) : (
    <>
      You are not logged in but you can still play. Make an account if you want
      to keep your points.
    </>
  );
}
