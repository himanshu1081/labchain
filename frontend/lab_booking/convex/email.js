import { action } from "./_generated/server";
import { v } from "convex/values";

export const sendBookingEmail = action({
  args: {
    to: v.string(),
    bookingId: v.string(),
    txHash: v.string(),
    equipmentId: v.string(),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const etherscanUrl = `https://sepolia.etherscan.io/tx/${args.txHash}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b1120; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 30px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; letter-spacing: -0.5px;">LabChain</h1>
              <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">Smart Equipment Booking</p>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background-color: #111827; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 40px;">

              <!-- Success Icon -->
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; width: 64px; height: 64px; line-height: 64px; border-radius: 50%; background-color: rgba(34,197,94,0.15); color: #4ade80; font-size: 28px;">✓</div>
              </div>

              <h2 style="color: #ffffff; text-align: center; font-size: 24px; margin: 0 0 8px;">Booking Confirmed</h2>
              <p style="color: #94a3b8; text-align: center; font-size: 14px; margin: 0 0 32px;">Your lab equipment has been successfully booked on the blockchain.</p>

              <!-- Booking ID Badge -->
              <div style="text-align: center; margin-bottom: 28px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 12px 32px; border-radius: 16px;">
                  <p style="color: #93c5fd; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px;">Booking ID</p>
                  <p style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0;">#${args.bookingId}</p>
                </div>
              </div>

              <!-- Details Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <p style="color: #64748b; font-size: 12px; margin: 0 0 4px;">Equipment</p>
                    <p style="color: #e2e8f0; font-size: 15px; font-weight: 600; margin: 0;">${args.equipmentId}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <p style="color: #64748b; font-size: 12px; margin: 0 0 4px;">Duration</p>
                    <p style="color: #e2e8f0; font-size: 15px; font-weight: 600; margin: 0;">${args.duration} hour${args.duration !== 1 ? "s" : ""}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <p style="color: #64748b; font-size: 12px; margin: 0 0 4px;">Security Deposit</p>
                    <p style="color: #e2e8f0; font-size: 15px; font-weight: 600; margin: 0;">50 LAB Tokens</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="color: #64748b; font-size: 12px; margin: 0 0 4px;">Transaction Hash</p>
                    <p style="color: #93c5fd; font-size: 13px; word-break: break-all; margin: 0;">${args.txHash}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 28px;">
                <a href="${etherscanUrl}" target="_blank"
                   style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 600;">
                  View on Etherscan →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding-top: 24px;">
              <p style="color: #475569; font-size: 12px; margin: 0;">This is an automated confirmation from LabChain.</p>
              <p style="color: #334155; font-size: 11px; margin: 8px 0 0;">Powered by Ethereum Smart Contracts</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LabChain <noreply@insyd.in>",
        to: [args.to],
        subject: `Booking Confirmed — #${args.bookingId} | LabChain`,
        html,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend error:", result);
      throw new Error(result.message || "Failed to send email");
    }

    return { success: true, id: result.id };
  },
});
