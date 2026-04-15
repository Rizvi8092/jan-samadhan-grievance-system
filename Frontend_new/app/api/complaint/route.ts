import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()

  try {
    const res = await fetch("http://127.0.0.1:5000/submit_complaint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Backend error:", error)
    return NextResponse.json(
      { message: "Backend not reachable" },
      { status: 500 }
    )
  }
}