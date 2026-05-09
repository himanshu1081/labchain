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

    // Generate barcode bars as inline HTML
    const bars = Array.from({ length: 32 }, (_, i) => {
      const h = 10 + ((i * 37) % 14);
      const w = i % 5 === 0 ? 3 : i % 3 === 0 ? 1 : 2;
      return `<span style="display:inline-block;width:${w}px;height:${h}px;background:#1A1814;margin-right:2px;vertical-align:bottom;"></span>`;
    }).join("");

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#F2EDE0;background-image:radial-gradient(circle at 1px 1px,rgba(26,24,20,.08) 1px,transparent 0);background-size:22px 22px;font-family:'Space Grotesk',system-ui,sans-serif;color:#1A1814;">

  <!-- Ticker Strip -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A1814;">
    <tr>
      <td style="padding:10px 24px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.06em;color:#F2EDE0;text-align:center;">
        <span style="color:#C8FF3D;">◆</span>&nbsp; LABCHAIN &nbsp;·&nbsp; BOOKING CONFIRMATION &nbsp;·&nbsp; ON-CHAIN &nbsp;·&nbsp; <span style="color:#FF7A59;">VERIFIED</span> &nbsp;·&nbsp; <span style="color:#C8FF3D;">◆</span>
      </td>
    </tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 20px 40px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Brand -->
          <tr>
            <td style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:34px;height:34px;border-radius:10px;background:#1A1814;color:#C8FF3D;text-align:center;font-family:'Instrument Serif',serif;font-style:italic;font-size:22px;line-height:34px;box-shadow:3px 3px 0 #C8FF3D;transform:rotate(-4deg);">L</td>
                  <td style="padding-left:12px;font-family:'Instrument Serif',serif;font-size:24px;line-height:1;">Lab<span style="font-style:italic;color:#FF7A59;">Chain</span></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Ticket Card -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF7EC;border:2px solid #1A1814;border-radius:16px;box-shadow:6px 6px 0 #1A1814;overflow:hidden;">

                <!-- Ticket Header -->
                <tr>
                  <td style="background:#1A1814;color:#F2EDE0;padding:14px 22px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#C8FF3D;margin-right:4px;vertical-align:middle;"></span>
                          <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#46423b;margin-right:4px;vertical-align:middle;"></span>
                          <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#46423b;vertical-align:middle;"></span>
                        </td>
                        <td style="text-align:center;">BOOKING TICKET</td>
                        <td style="text-align:right;color:#C8FF3D;">CONFIRMED</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Perforation -->
                <tr>
                  <td style="height:16px;border-bottom:2px dashed rgba(26,24,20,.3);position:relative;"></td>
                </tr>

                <!-- Ticket Body -->
                <tr>
                  <td style="padding:28px 28px 24px;">

                    <!-- Success + Title -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <div style="font-family:'Instrument Serif',serif;font-size:32px;line-height:1;margin:0 0 4px;">Booking <span style="font-style:italic;color:#FF7A59;">Confirmed</span></div>
                          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#7A736A;margin-bottom:20px;">YOUR · RESERVATION · IS · ON-CHAIN</div>
                        </td>
                        <td style="text-align:right;vertical-align:top;">
                          <div style="width:72px;height:72px;border-radius:50%;border:2px dashed #1A1814;display:inline-block;text-align:center;line-height:1;">
                            <div style="width:54px;height:54px;border-radius:50%;border:2px solid #1A1814;background:#C8FF3D;display:inline-block;margin-top:7px;text-align:center;">
                              <div style="font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700;padding-top:12px;line-height:1;">✓</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Booking ID Badge -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td align="center">
                          <div style="display:inline-block;background:#C8FF3D;border:2px solid #1A1814;border-radius:12px;padding:14px 36px;box-shadow:4px 4px 0 #1A1814;text-align:center;">
                            <div style="font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#3A3630;margin-bottom:4px;">Booking ID</div>
                            <div style="font-family:'Instrument Serif',serif;font-size:36px;line-height:1;color:#1A1814;font-weight:400;">#${args.bookingId}</div>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #1A1814;border-radius:12px;overflow:hidden;background:#F2EDE0;margin-bottom:20px;">
                      <tr>
                        <td style="padding:14px 18px;border-bottom:1px solid rgba(26,24,20,.15);">
                          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#7A736A;margin-bottom:3px;">Equipment</div>
                          <div style="font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:600;color:#1A1814;">${args.equipmentId}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px;border-bottom:1px solid rgba(26,24,20,.15);">
                          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#7A736A;margin-bottom:3px;">Duration</div>
                          <div style="font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:600;color:#1A1814;">${args.duration} hour${args.duration !== 1 ? "s" : ""}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px;border-bottom:1px solid rgba(26,24,20,.15);">
                          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#7A736A;margin-bottom:3px;">Security Deposit</div>
                          <div style="font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:600;color:#1A1814;">50 LAB Tokens</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px;">
                          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#7A736A;margin-bottom:3px;">Transaction Hash</div>
                          <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#FF7A59;word-break:break-all;">${args.txHash}</div>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${etherscanUrl}" target="_blank"
                             style="display:inline-block;background:#C8FF3D;color:#1A1814;text-decoration:none;padding:16px 32px;border:2px solid #1A1814;border-radius:12px;font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;box-shadow:4px 4px 0 #1A1814;">
                            View on Etherscan →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Deposit note -->
                    <div style="font-family:'JetBrains Mono',monospace;font-size:10.5px;color:#7A736A;letter-spacing:.04em;margin-top:18px;text-align:center;">
                      ↳ Deposit refunded on-chain when equipment is returned in spec.
                    </div>

                  </td>
                </tr>

                <!-- Ticket Footer with barcode -->
                <tr>
                  <td style="padding:0 28px 20px;">
                    <div style="border-top:2px dashed rgba(26,24,20,.3);padding-top:14px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#7A736A;letter-spacing:.04em;">
                            NO. #${args.bookingId} · SEPOLIA
                          </td>
                          <td style="text-align:right;line-height:0;">
                            ${bars}
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#7A736A;letter-spacing:.04em;">
                © 2026 LabChain Labs · Built with smart contracts, not spreadsheets.
              </div>
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
