import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// app/api/notifications/register/route.ts
export async function POST(request: NextRequest) {
  try {
    const { expoPushToken} = await request.json();

    // Store in database
    await prisma.pushNotificationToken.upsert({
      where: { token: expoPushToken },
      update: { 
       
       
       token: expoPushToken,
      },
      create: {
        token: expoPushToken,
        user_name: "default_user", // Replace with actual user identification logic
        device_type: "app", // or 'ios', 'android' based on actual device type
        
       
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}