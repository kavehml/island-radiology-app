# Email Configuration Guide

This application sends confirmation emails to users when they submit requisitions. To enable email functionality, you need to configure SMTP settings.

## Environment Variables

Add the following environment variables to your Railway backend service (or `.env` file for local development):

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com          # Your SMTP server hostname
SMTP_PORT=587                     # SMTP port (587 for TLS, 465 for SSL)
SMTP_USER=your-email@gmail.com    # Your SMTP username/email
SMTP_PASSWORD=your-app-password   # Your SMTP password or app password
```

## Gmail Setup (Recommended)

If you're using Gmail:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this app password as `SMTP_PASSWORD`

3. **Configure in Railway**:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   ```

## Other Email Providers

### Outlook/Office365
```
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

### SendGrid
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### Mailgun
```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASSWORD=your-mailgun-password
```

## Testing

1. Submit a requisition with a valid email address in the "Submitted By Email" field
2. Check the email inbox for the confirmation message
3. Check Railway logs if email doesn't arrive (look for "Confirmation email sent" or error messages)

## Notes

- If SMTP is not configured, the application will continue to work but emails won't be sent
- Email failures are logged but don't prevent requisition submission
- The confirmation email includes:
  - Requisition number
  - Patient name
  - Order type
  - Submission details
  - Instructions for tracking status
