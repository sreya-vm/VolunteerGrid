import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv

load_dotenv()


SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
EMAIL_FROM = os.getenv("EMAIL_FROM", SMTP_USERNAME)


def send_email(
    recipient: str,
    subject: str,
    body: str,
) -> None:
    """
    Send an email using Gmail SMTP.

    Used for:
    - NGO approval requests to admins
    - Admin approval/rejection responses to NGOs
    """

    if not all([
        SMTP_HOST,
        SMTP_USERNAME,
        SMTP_PASSWORD,
        EMAIL_FROM,
    ]):
        raise RuntimeError(
            "Email service is not configured. "
            "Check SMTP_HOST, SMTP_USERNAME, "
            "SMTP_PASSWORD and EMAIL_FROM in .env."
        )

    message = EmailMessage()
    message["From"] = EMAIL_FROM
    message["To"] = recipient
    message["Subject"] = subject
    message.set_content(body)

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(message)