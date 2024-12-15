import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { data, error } = await supabase.from("category").select("*");

    if (error) {
      console.log(error);
      return new NextResponse("DB Error", { status: 500 });
    }

    const categories = data;
    console.log(data);

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.log("[CATEGORIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
