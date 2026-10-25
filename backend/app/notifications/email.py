
import os

import resend
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
EMAIL_FROM = os.getenv("EMAIL_FROM", "onboarding@resend.dev")


def send_email(
    recipient: str,
    subject: str,
    body: str,
) -> None:
    """
    Send an email using the Resend API.

    Used for:
    - NGO approval requests to admins
    - Admin approval/rejection responses to NGOs
    """

    if not RESEND_API_KEY:
        raise RuntimeError(
            "Email service is not configured. "
            "Set RESEND_API_KEY in your environment."
        )

    resend.api_key = RESEND_API_KEY

    params = {
        "from": EMAIL_FROM,
        "to": [recipient],
        "subject": subject,
        "text": body,
    }

    resend.Emails.send(params)
