import { PRODUCTS } from "../../_lib/mockData";
import { NextRequest, NextResponse } from "next/server";

type ParamsLike = Record<string, string | Promise<string>>;
type Context = { params: ParamsLike | Promise<ParamsLike> };

export async function GET(request: NextRequest, context: Context) {
  try {
    const params = await context.params; // await params before using
    const idRaw = params.id;
    const idStr = typeof idRaw === "string" ? idRaw : await idRaw;
    const id = parseInt(idStr, 10);

    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const product = PRODUCTS.find((p) => p.id === id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}