import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase.from("material").select("*");

    if (error) {
      console.log(error);
      return new NextResponse("DB Error", { status: 500 });
    }

    const materials = data;
    console.log(data);

    return NextResponse.json(materials, { status: 200 });
  } catch (error) {
    console.log("[MATERIALS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
