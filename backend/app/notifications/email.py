
import os
import html
import resend

from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
EMAIL_FROM = os.getenv("EMAIL_FROM", "onboarding@resend.dev")

BRAND_GREEN = "#176B50"
DARK_GREEN = "#123C32"
LIGHT_GREEN = "#EAF5EF"
TEXT_COLOR = "#26352F"
MUTED_COLOR = "#64736B"


def _email_template(
    title: str,
    greeting: str,
    message: str,
    label: str,
    action_text: str = "",
    action_url: str = "",
) -> str:
    safe_title = html.escape(title)
    safe_greeting = html.escape(greeting)
    safe_message = html.escape(message).replace("\n", "<br>")
    safe_label = html.escape(label)

    action_html = ""

    if action_text and action_url:
        safe_action_text = html.escape(action_text)
        safe_action_url = html.escape(action_url, quote=True)

        action_html = f"""
        <div style="text-align:center;margin:28px 0;">
          <a href="{safe_action_url}"
             style="background:{BRAND_GREEN};color:#ffffff;
                    padding:14px 24px;text-decoration:none;
                    border-radius:8px;font-weight:bold;
                    display:inline-block;">
            {safe_action_text}
          </a>
        </div>
        """

    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>{safe_title}</title>
    </head>
    <body style="margin:0;padding:0;background:#F3F7F4;
                 font-family:Arial,Helvetica,sans-serif;color:{TEXT_COLOR};">
      <div style="display:none;max-height:0;overflow:hidden;">
        {safe_title} — VolunteerGrid
      </div>

      <table role="presentation" width="100%" cellspacing="0"
             cellpadding="0" style="background:#F3F7F4;padding:28px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellspacing="0"
                   cellpadding="0"
                   style="max-width:600px;width:100%;background:#ffffff;
                          border-radius:14px;overflow:hidden;">

              <tr>
                <td style="background:{DARK_GREEN};padding:30px 24px;
                           text-align:center;">
                  <div style="font-size:28px;font-weight:bold;color:#ffffff;">
                    VolunteerGrid
                  </div>
                  <div style="font-size:13px;color:#D5E9DE;margin-top:8px;">
                    Connecting communities. Creating impact.
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:32px 28px;">
                  <div style="display:inline-block;background:{LIGHT_GREEN};
                              color:{BRAND_GREEN};padding:7px 12px;
                              border-radius:20px;font-size:12px;
                              font-weight:bold;">
                    {safe_label}
                  </div>

                  <h1 style="font-size:25px;line-height:1.35;
                             color:{DARK_GREEN};margin:22px 0 16px;">
                    {safe_title}
                  </h1>

                  <p style="font-size:16px;line-height:1.7;margin:0 0 14px;">
                    Hello {safe_greeting},
                  </p>

                  <p style="font-size:15px;line-height:1.8;margin:0;">
                    {safe_message}
                  </p>

                  {action_html}

                  <p style="font-size:15px;line-height:1.8;margin:24px 0 0;">
                    Warm regards,<br>
                    <strong style="color:{DARK_GREEN};">
                      The VolunteerGrid Team
                    </strong>
                  </p>
                </td>
              </tr>

              <tr>
                <td style="background:#F8FAF8;border-top:1px solid #E5ECE7;
                           padding:20px 24px;text-align:center;">
                  <p style="font-size:12px;line-height:1.7;color:{MUTED_COLOR};
                            margin:0;">
                    Making volunteering easier and communities stronger.
                    <br>
                    This is an automated message from VolunteerGrid.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """


def send_email(
    recipient: str,
    subject: str,
    body: str,
) -> None:
    """Send a branded HTML email using the Resend API."""

    if not RESEND_API_KEY:
        raise RuntimeError(
            "Email service is not configured. "
            "Set RESEND_API_KEY in your environment."
        )

    resend.api_key = RESEND_API_KEY

    # Existing router calls pass plain-text content in body.
    # Convert that content into a branded HTML email.
    lines = body.split("\n\n", 1)
    greeting = lines[0].replace("Hello ", "").strip().rstrip(",")
    message = lines[1] if len(lines) > 1 else body

    title = subject.replace("VolunteerGrid - ", "").strip()

    if "Approved" in subject:
        label = "APPLICATION APPROVED"
    elif "Rejected" in subject:
        label = "APPLICATION UPDATE"
    elif "Resubmitted" in subject:
        label = "APPLICATION RESUBMITTED"
    else:
        label = "ACTION REQUIRED"

    frontend_url = os.getenv(
        "FRONTEND_URL",
        "https://volunteer-grid-one.vercel.app",
    ).rstrip("/")

    html_body = _email_template(
        title=title,
        greeting=greeting or "there",
        message=message,
        label=label,
        action_text="Visit VolunteerGrid",
        action_url=frontend_url,
    )

    resend.Emails.send({
        "from": EMAIL_FROM,
        "to": [recipient],
        "subject": subject,
        "html": html_body,
        "text": body,
    })
