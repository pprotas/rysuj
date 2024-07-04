"use client";

import React, { useEffect, useState } from "react";
import Canvas from "@/components/canvas";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://orphoozhzjsswxbivfrz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycGhvb3poempzc3d4Yml2ZnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk5MzIwNDcsImV4cCI6MjAzNTUwODA0N30._tgfi91E8PPjELQycKDskOk5vNa1zH-tMtw_Iw3a_Mw",
);

export default function Home() {
  const [drawing, setDrawing] = useState("{}");

  const handleUpdate = async (json: string) => {
    const { error } = await supabase
      .from("drawings")
      .update({ json })
      .eq("id", 1);
    console.error(error);
  };

  useEffect(() => {
    const fetchDrawing = async () => {
      const { data, error } = await supabase
        .from("drawings")
        .select("*")
        .eq("id", 1)
        .single(); // Assuming you only expect one result

      if (error) {
        console.error(error);
      } else {
        setDrawing(data.json);
      }
    };

    fetchDrawing();
  }, []);

  useEffect(() => {
    supabase
      .channel("drawings")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "drawings" },
        (payload) => {
          setDrawing(JSON.stringify(payload.new.json));
        },
      )
      .subscribe();
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full h-full items-center">
      <Canvas drawing={drawing} onUpdate={handleUpdate} />
      <Button>Get JSON</Button>
    </div>
  );
}
