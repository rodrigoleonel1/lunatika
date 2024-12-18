import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
  { params }: { params: { productId: string } }
) {
  try {

    console.log(params.productId)

    const { data, error } = await supabase
      .from("product")
      .select("*")
      .eq("id", params.productId)
      .single();

    if (error) {
      console.log(error);
      return new NextResponse("DB Error", { status: 500 });
    }

    const product = data;
    console.log(data);

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
