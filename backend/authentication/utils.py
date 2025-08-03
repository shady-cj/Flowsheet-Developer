from django.core.mail import EmailMultiAlternatives, send_mail
from django.template.loader import render_to_string
from datetime import timedelta

from rest_framework_simplejwt.tokens import AccessToken


def send_password_reset_email(user, reset_link):
    """
    Send a password reset email to the user.
    """
    subject = "Password Reset Request"
    text_content = f"Hello {user.email},\n\nTo reset your password, please click the link below:\n{reset_link}\n\nIf you did not request this, please ignore this email."
    from_email = None  # Use the default from email configured in settings
    recipient_list = [user.email]
    html_content = render_to_string(
        "password_reset_email.html",
        context={"user": user, "reset_link": reset_link},
    )
    try:
        msg = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
        msg.attach_alternative(html_content, "text/html")
        msg.send()
    except Exception as e:
        # Handle any errors that occur during the email sending process
        print(f"Error sending password reset email: {e}")


def create_reset_link(host, user):
    """
    Create a password reset link for the user.
    """
    token = AccessToken()
    token["email"] = user.email
    token.set_exp(lifetime=timedelta(minutes=10))  # Set token expiration time
    user.password_reset_token = str(token)
    user.save()
    return f"{host}/reset-password?token={token}"


def validate_reset_token(token):
    """
    Validate the password reset token.
    """
    try:
        token = AccessToken(token)

        return token

    except Exception as e:
        # If the token is invalid or expired, return False
        print(f"Invalid token: {e}")
        return False
