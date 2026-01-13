import { forwardRef } from "react";

interface ShareImageProps {
  planPreview: string;
  blindSpotsCount: number;
  failureModesCount: number;
  variant?: "square" | "landscape";
}

export const ShareImage = forwardRef<HTMLDivElement, ShareImageProps>(
  ({ planPreview, blindSpotsCount, failureModesCount, variant = "square" }, ref) => {
    const isLandscape = variant === "landscape";
    const width = isLandscape ? 1200 : 1080;
    const height = isLandscape ? 627 : 1080;
    
    // Truncate plan to 80 characters
    const truncatedPlan = planPreview.length > 80 
      ? planPreview.slice(0, 80) + "..." 
      : planPreview;

    const stats = [
      `${blindSpotsCount} blind spot${blindSpotsCount !== 1 ? "s" : ""} found`,
      `${failureModesCount} failure mode${failureModesCount !== 1 ? "s" : ""} identified`,
      "1 uncomfortable question asked",
    ];

    return (
      <div
        ref={ref}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          background: "white",
          fontFamily: "Inter, system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
        }}
      >
        {/* TRC Gradient Bar */}
        <div
          style={{
            height: "8px",
            background: "linear-gradient(90deg, #0047AB 0%, #DC2626 100%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: isLandscape ? "40px 60px" : "60px 48px",
            gap: isLandscape ? "24px" : "32px",
          }}
        >
          {/* Icon - Simple crosshair/target */}
          <div
            style={{
              width: isLandscape ? "56px" : "72px",
              height: isLandscape ? "56px" : "72px",
              borderRadius: "50%",
              background: "#0047AB15",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width={isLandscape ? "28" : "36"}
              height={isLandscape ? "28" : "36"}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0047AB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: isLandscape ? "36px" : "42px",
              fontWeight: 700,
              color: "#1A1A1A",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            I SNAGGED IT
          </h1>

          {/* Plan Preview */}
          <p
            style={{
              fontSize: isLandscape ? "18px" : "22px",
              fontWeight: 400,
              color: "#333333",
              margin: 0,
              textAlign: "center",
              maxWidth: isLandscape ? "800px" : "700px",
              lineHeight: 1.5,
            }}
          >
            "{truncatedPlan}"
          </p>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: isLandscape ? "10px" : "14px",
              marginTop: isLandscape ? "8px" : "16px",
            }}
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: isLandscape ? "16px" : "18px",
                    fontWeight: 500,
                    color: "#666666",
                  }}
                >
                  {stat}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "#E5E5E5", margin: "0 48px" }} />

        {/* Footer */}
        <div
          style={{
            padding: isLandscape ? "20px 48px" : "28px 48px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <p
            style={{
              fontSize: isLandscape ? "14px" : "16px",
              fontWeight: 500,
              color: "#0047AB",
              margin: 0,
            }}
          >
            Stress-test your plan → snag.app
          </p>
          <p
            style={{
              fontSize: isLandscape ? "12px" : "14px",
              fontWeight: 600,
              color: "#999999",
              margin: 0,
              letterSpacing: "0.02em",
            }}
          >
            SNAG
          </p>
        </div>
      </div>
    );
  }
);

ShareImage.displayName = "ShareImage";
