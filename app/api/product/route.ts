import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      price,
      stock,
      material_id,
      category_id,
      isFeatured,
      isArchived,
      images,
    } = body;

    if (!name || !price || !stock || !category_id || !material_id) {
      return new NextResponse("Faltan campos obligatorios", { status: 400 });
    }

    const { data, error } = await supabase
      .from("product")
      .insert([
        {
          name,
          price,
          stock,
          isFeatured: isFeatured || false,
          isArchived: isArchived || false,
          images: images || [],
          category_id,
          material_id,
        },
      ])
      .select();

    if (error) {
      console.log(error);
      return new NextResponse("DB Error", { status: 500 });
    }

    console.log(data);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.log("[PRODUCT_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
