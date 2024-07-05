"use client";

import React, { useEffect, useState } from "react";
import createClient from "@/lib/supabase/client";
import Image from "next/image";

export default function GuessPage() {
  const supabase = createClient();

  const [imageData, setImageData] = useState<
    Array<{ name: string; nicknames: { nickname: string } }>
  >([]);

  const handleInserts = (payload: any) => {
    const data = {
      name: payload.new.name,
      nicknames: payload.new.nicknames,
    };
    setImageData((old) => [data, ...old]);
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .schema("public")
        .from("images")
        .select("name, user_id, nicknames (nickname)")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message, { cause: error });
      const castedData = data as unknown as [
        {
          name: string;
          nicknames: { nickname: string };
        },
      ];
      setImageData(castedData);
    };

    fetchData().catch((error) => {
      throw error;
    });
  }, [supabase]);

  useEffect(() => {
    supabase
      .channel("images")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "images" },
        handleInserts,
      )
      .subscribe();
  }, [supabase]);

  return (
    <div className="flex flex-col gap-2 p-2">
      {imageData.length > 0 &&
        imageData.map((data) => (
          <div key={data.name} className="flex flex-col gap-2 items-center">
            <Image
              src={
                supabase.storage.from("images").getPublicUrl(data.name).data
                  .publicUrl
              }
              alt="test"
              width={1024}
              height={1024}
              className="border rounded-md"
            />
            &quot;banana&quot;, made by {data?.nicknames?.nickname}
          </div>
        ))}
    </div>
  );
}
