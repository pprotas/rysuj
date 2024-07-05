"use client";

import React, { useEffect, useRef, useState } from "react";
import Canvas, { CanvasRef } from "@/components/canvas";
import { Button } from "@/components/ui/button";
import createClient from "@/lib/supabase/client";
import { v7 } from "uuid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DrawPage() {
  const supabase = createClient();

  const canvasRef = useRef<CanvasRef>(null);

  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [nickname, setNickname] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      if (user) setUserId(user.id);
    };

    fetchUser().catch((error) => {
      throw error;
    });
  }, [supabase.auth]);

  useEffect(() => {
    const fetchNickname = async () => {
      if (userId) {
        const { data, error } = await supabase
          .from("nicknames")
          .select("nickname")
          .eq("user_id", userId)
          .maybeSingle();
        if (error) throw new Error(error.message, { cause: error });
        if (data) setNickname(data.nickname);
      }
    };
    fetchNickname().catch((error) => {
      throw error;
    });
  }, [supabase, userId]);

  const saveNickname = async () => {
    if (userId) {
      const { error } = await supabase
        .from("nicknames")
        .upsert(
          { nickname: nickname ?? "picasso", user_id: userId },
          { onConflict: "user_id" },
        )
        .eq("user_id", userId);
      if (error) throw new Error(error.message, { cause: error });
    }
  };

  const handleSubmit = async () => {
    await saveNickname();

    const ref = canvasRef.current;
    if (!ref) throw new Error("Canvas ref not found");

    ref.exportImage(async (blob) => {
      if (!blob) throw new Error("Failed to get blob");

      const { error } = await supabase.storage
        .from("images")
        .upload(`${v7()}.png`, blob);

      if (error) throw error;
    });
  };

  return (
    <div className="flex flex-col gap-2 w-full h-full items-center justify-center p-2">
      <h1 className="text-2xl">
        Your prompt: <b className="underline">banana</b>
      </h1>
      <p>
        Draw your prompt, fill out a nickname and submit your artwork so that
        others can guess what it is!
      </p>
      <Canvas ref={canvasRef} />
      <div>
        <Label htmlFor="nickname">Nickname</Label>
        <Input
          id="nickname"
          placeholder="picasso"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}
