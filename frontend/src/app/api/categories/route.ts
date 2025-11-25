import { CATEGORIES } from "../_lib/mockData";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json(CATEGORIES, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}