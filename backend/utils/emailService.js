// =========================================================
// MEDICORE — EMAIL SERVICE
// =========================================================

const nodemailer = require("nodemailer");


// =========================================================
// SMTP TRANSPORTER
// =========================================================

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,

    secure:
        String(process.env.SMTP_SECURE).toLowerCase() === "true",

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});


// =========================================================
// VERIFY SMTP CONFIGURATION
// =========================================================

const verifyEmailTransporter = async () => {

    try {

        await transporter.verify();

        console.log("Email Service: SMTP connection ready ✅");

        return true;

    } catch (error) {

        console.error(
            "Email Service: SMTP connection failed ❌",
            error.message
        );

        return false;
    }
};


// =========================================================
// SEND EMAIL
// =========================================================

const sendEmail = async ({
    to,
    subject,
    html,
    text
}) => {

    if (!to) {
        throw new Error("Recipient email address is required.");
    }

    if (!process.env.SMTP_USER ||
        !process.env.SMTP_PASSWORD) {

        throw new Error(
            "SMTP email credentials are not configured."
        );
    }


    const mailOptions = {
        from:
            process.env.MAIL_FROM ||
            process.env.SMTP_USER,

        to,

        subject,

        text:
            text ||
            "Please view this email in an HTML-compatible email client.",

        html
    };


    const info =
        await transporter.sendMail(
            mailOptions
        );


    console.log(
        `Email sent successfully to ${to} | Message ID: ${info.messageId}`
    );


    return info;
};


// =========================================================
// SEND VERIFICATION EMAIL
// =========================================================

const sendVerificationEmail = async ({
    name,
    email,
    verificationUrl
}) => {

    const safeName =
        name || "there";


    const subject =
        "Verify your MediCore email address";


    const text = `
Hello ${safeName},

Welcome to MediCore — Connected Healthcare. Smarter Operations.

Please verify your email address by opening the link below:

${verificationUrl}

This verification link will expire soon.

If you did not create a MediCore account, you can safely ignore this email.

Regards,
MediCore
Connected Healthcare. Smarter Operations.
`;


    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Verify your MediCore email</title>
</head>

<body
    style="
        margin:0;
        padding:0;
        background:#f7fafb;
        font-family:Arial,Helvetica,sans-serif;
        color:#243746;
    "
>

    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background:#f7fafb;padding:40px 15px;"
    >

        <tr>
            <td align="center">

                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        max-width:620px;
                        background:#ffffff;
                        border:1px solid #dbe5ea;
                        border-radius:16px;
                        overflow:hidden;
                    "
                >

                    <!-- Header -->

                    <tr>
                        <td
                            style="
                                background:#0f766e;
                                padding:28px 35px;
                            "
                        >

                            <div
                                style="
                                    font-size:25px;
                                    font-weight:700;
                                    letter-spacing:1px;
                                    color:#ffffff;
                                "
                            >
                                MEDICORE
                            </div>

                            <div
                                style="
                                    margin-top:7px;
                                    font-size:13px;
                                    color:#ccfbf1;
                                "
                            >
                                Connected Healthcare. Smarter Operations.
                            </div>

                        </td>
                    </tr>


                    <!-- Content -->

                    <tr>
                        <td
                            style="
                                padding:42px 35px;
                            "
                        >

                            <div
                                style="
                                    width:52px;
                                    height:52px;
                                    line-height:52px;
                                    text-align:center;
                                    border-radius:50%;
                                    background:#ccfbf1;
                                    color:#0f766e;
                                    font-size:24px;
                                    font-weight:700;
                                    margin-bottom:24px;
                                "
                            >
                                ✓
                            </div>


                            <h1
                                style="
                                    margin:0 0 14px;
                                    font-size:28px;
                                    line-height:1.3;
                                    color:#12304a;
                                "
                            >
                                Verify your email address
                            </h1>


                            <p
                                style="
                                    margin:0 0 18px;
                                    font-size:16px;
                                    line-height:1.7;
                                    color:#6b7c8f;
                                "
                            >
                                Hello ${safeName},
                            </p>


                            <p
                                style="
                                    margin:0 0 28px;
                                    font-size:16px;
                                    line-height:1.7;
                                    color:#6b7c8f;
                                "
                            >
                                Welcome to MediCore. Please verify your
                                email address to activate your account
                                and continue setting up your healthcare
                                workspace.
                            </p>


                            <!-- Button -->

                            <table
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="margin-bottom:28px;"
                            >

                                <tr>

                                    <td
                                        align="center"
                                        style="
                                            border-radius:8px;
                                            background:#0f766e;
                                        "
                                    >

                                        <a
                                            href="${verificationUrl}"
                                            target="_blank"
                                            style="
                                                display:inline-block;
                                                padding:14px 25px;
                                                color:#ffffff;
                                                font-size:15px;
                                                font-weight:700;
                                                text-decoration:none;
                                                border-radius:8px;
                                            "
                                        >
                                            Verify My Email
                                        </a>

                                    </td>

                                </tr>

                            </table>


                            <!-- Link fallback -->

                            <p
                                style="
                                    margin:0 0 10px;
                                    font-size:13px;
                                    font-weight:600;
                                    color:#243746;
                                "
                            >
                                Or copy and paste this link into your browser:
                            </p>


                            <div
                                style="
                                    padding:13px;
                                    background:#f7fafb;
                                    border:1px solid #dbe5ea;
                                    border-radius:8px;
                                    word-break:break-all;
                                    font-size:12px;
                                    line-height:1.6;
                                    color:#0f766e;
                                "
                            >
                                ${verificationUrl}
                            </div>


                            <p
                                style="
                                    margin:25px 0 0;
                                    font-size:13px;
                                    line-height:1.6;
                                    color:#6b7c8f;
                                "
                            >
                                If you did not create a MediCore account,
                                you can safely ignore this email.
                            </p>

                        </td>
                    </tr>


                    <!-- Footer -->

                    <tr>

                        <td
                            style="
                                padding:22px 35px;
                                background:#f7fafb;
                                border-top:1px solid #dbe5ea;
                                text-align:center;
                            "
                        >

                            <p
                                style="
                                    margin:0;
                                    font-size:12px;
                                    color:#6b7c8f;
                                "
                            >
                                © ${new Date().getFullYear()} MediCore.
                                All rights reserved.
                            </p>

                            <p
                                style="
                                    margin:6px 0 0;
                                    font-size:12px;
                                    color:#6b7c8f;
                                "
                            >
                                Connected Healthcare. Smarter Operations.
                            </p>

                        </td>

                    </tr>

                </table>

            </td>
        </tr>

    </table>

</body>
</html>
`;


    return sendEmail({
        to: email,
        subject,
        text,
        html
    });
};


module.exports = {
    sendEmail,
    sendVerificationEmail,
    verifyEmailTransporter
};