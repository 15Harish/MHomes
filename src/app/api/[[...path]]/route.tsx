import { guestReviews } from "@/lib/guest-reviews";
import { googleReviewsUrl } from "@/lib/google-review-links";
import { NextRequest, NextResponse } from "next/server";

// Simple route handler for basic API functionality
export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);

  try {
    // Root API endpoint
    if (pathname === "/api/" || pathname === "/api") {
      return NextResponse.json({
        message: "MHOMES Resort API is running",
        status: "success",
        timestamp: new Date().toISOString(),
        endpoints: {
          contact: "/api/contact",
          booking: "/api/booking",
          rooms: "/api/rooms",
          reviews: "/api/reviews",
        },
      });
    }

    // Contact endpoint
    if (pathname === "/api/contact") {
      return NextResponse.json({
        phone: "+1 (555) 123-4567",
        email: "info@MHOMESresort.com",
        address: "Tropical Paradise Island, Maldives",
        hours: {
          "Monday - Friday": "9:00 AM - 6:00 PM",
          Saturday: "10:00 AM - 4:00 PM",
          Sunday: "12:00 PM - 4:00 PM",
        },
      });
    }

    // Rooms endpoint
    if (pathname === "/api/rooms") {
      return NextResponse.json({
        rooms: [
          {
            id: "ocean-villa",
            name: "Ocean Villa",
            price: 1200,
            features: [
              "Private Pool",
              "Ocean View",
              "150 sqm",
              "Butler Service",
            ],
            available: true,
          },
          {
            id: "beach-suite",
            name: "Beach Suite",
            price: 800,
            features: ["Beach Access", "King Bed", "80 sqm", "Balcony"],
            available: true,
          },
          {
            id: "premium-room",
            name: "Premium Room",
            price: 450,
            features: ["Pool View", "Queen Bed", "45 sqm", "Mini Bar"],
            available: true,
          },
          {
            id: "deluxe-studio",
            name: "Premium Plus Room",
            price: 320,
            features: ["Garden View", "Double Bed", "30 sqm", "Work Desk"],
            available: true,
          },
        ],
      });
    }

    // Compatibility endpoint: static reviews only; no Google API calls.
    if (pathname === "/api/reviews") {
      return NextResponse.json({
        reviews: guestReviews,
        averageRating: 5,
        totalReviews: guestReviews.length,
        source: "static",
        businessUrl: googleReviewsUrl,
      });
    }

    // Booking placeholder endpoint
    if (pathname === "/api/booking") {
      return NextResponse.json({
        message: "Booking system coming soon!",
        status: "placeholder",
        contact: {
          phone: "+1 (555) 123-4567",
          email: "reservations@MHOMESresort.com",
        },
        note: "Please contact us directly for reservations until our online booking system is ready.",
      });
    }

    // Default 404 for unknown endpoints
    // Letterhead/Images endpoint for bill printing
    if (pathname === "/api/letterhead") {
      const url = new URL(request.url);
      const type = url.searchParams.get("type") || "header";

      try {
        const fs = await import("fs").then((m) => m.promises);
        const path = await import("path");

        const assetPath =
          type === "footer"
            ? path.join(process.cwd(), "backend/assets/letterhead_footer.png")
            : path.join(process.cwd(), "backend/assets/letterhead_header.png");

        try {
          const imageBuffer = await fs.readFile(assetPath);
          return new Response(new Uint8Array(imageBuffer), {
            headers: {
              "Content-Type": "image/png",
              "Cache-Control": "public, max-age=3600",
            },
          });
        } catch (e) {
          // If footer doesn't exist, generate an SVG fallback
          if (type === "footer") {
            const svgFooter = `
              <svg width="1200" height="120" xmlns="http://www.w3.org/2000/svg">
                <rect width="1200" height="120" fill="#FAFAF8"/>
                <line x1="0" y1="0" x2="1200" y2="0" stroke="#C9A84C" stroke-width="3"/>
                <text x="50" y="50" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#6B2D1F">MHOMES Resort</text>
                <text x="600" y="45" font-family="Arial, sans-serif" font-size="12" fill="#7A6A5A" text-anchor="middle">S-37, Foreigners Road, Madurai - 625001</text>
                <text x="600" y="65" font-family="Arial, sans-serif" font-size="11" fill="#7A6A5A" text-anchor="middle">📧 karthikeyan@mhomes.co.in | 📱 +91-9765555346</text>
                <line x1="0" y1="115" x2="1200" y2="115" stroke="#D4C5B9" stroke-width="1"/>
              </svg>
            `;
            return new Response(svgFooter, {
              headers: {
                "Content-Type": "image/svg+xml",
                "Cache-Control": "public, max-age=3600",
              },
            });
          }

          // For header, file should exist
          console.warn(`Letterhead image not found: ${assetPath}`);
          return NextResponse.json(
            {
              error: "Image not found",
              message: "The requested letterhead image could not be found",
              type: type,
              path: assetPath,
            },
            { status: 404 },
          );
        }
      } catch (e) {
        console.error("Error reading letterhead:", e);
        return NextResponse.json(
          {
            error: "Error reading image",
            message: "Could not process the letterhead image",
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      {
        error: "Endpoint not found",
        message: `The endpoint ${pathname} does not exist`,
        availableEndpoints: [
          "/api/",
          "/api/contact",
          "/api/rooms",
          "/api/reviews",
          "/api/booking",
          "/api/letterhead",
        ],
      },
      { status: 404 },
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Something went wrong processing your request",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url);

  try {
    // Contact form submission
    if (pathname === "/api/contact") {
      const body = await request.json();

      // In a real application, you would:
      // 1. Validate the input data
      // 2. Save to database
      // 3. Send email notification
      // 4. Return appropriate response

      console.log("Contact form submission:", body);

      return NextResponse.json({
        message:
          "Thank you for your message! We will get back to you within 24 hours.",
        status: "success",
        timestamp: new Date().toISOString(),
      });
    }

    // Review submission
    if (pathname === "/api/reviews") {
      const body = await request.json();

      console.log("Review submission:", body);

      return NextResponse.json({
        message:
          "Thank you for your review! It will be published after moderation.",
        status: "success",
        timestamp: new Date().toISOString(),
      });
    }

    // Booking inquiry
    if (pathname === "/api/booking") {
      const body = await request.json();

      console.log("Booking inquiry:", body);

      return NextResponse.json({
        message:
          "Booking inquiry received! Our team will contact you within 2 hours to confirm your reservation.",
        status: "success",
        timestamp: new Date().toISOString(),
        inquiryId: `INQ-${Date.now()}`,
      });
    }

    return NextResponse.json(
      {
        error: "Method not supported",
        message: `POST method not supported for ${pathname}`,
      },
      { status: 405 },
    );
  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json(
      {
        error: "Invalid request",
        message: "Please check your request format and try again",
      },
      { status: 400 },
    );
  }
}

// Handle PATCH requests (admin operations)
export async function PATCH(request: NextRequest) {
  const { pathname } = new URL(request.url);

  try {
    return NextResponse.json(
      {
        success: false,
        error: "Method not supported",
        message: `PATCH method not supported for ${pathname}`,
      },
      { status: 405 },
    );
  } catch (error) {
    console.error("API PATCH Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message:
          error instanceof Error
            ? error.message
            : "Could not process your request",
      },
      { status: 500 },
    );
  }
}

// Handle other HTTP methods
export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: "Method not allowed", message: "PUT method not supported" },
    { status: 405 },
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: "Method not allowed", message: "DELETE method not supported" },
    { status: 405 },
  );
}
