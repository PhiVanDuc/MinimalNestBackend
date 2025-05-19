const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "phivanduc325@gmail.com",
        pass: "adyo wdeo xdwf srzg",
    },
});

const emailService = async (data) => {
    try {
        const { to, subject, html } = data || {};
        if (!to || !subject || !html) {
            return {
                success: false,
                code: 400,
                message: "Vui lòng cung cấp để thông tin khi gửi email!"
            }
        }

        const mailOptions = {
            from: {
                name: "Minimal Nest",
                address: "phivanduc325@gmail.com"
            },
            to,
            subject,
            html
        }

        const info = await transporter.sendMail(mailOptions);

        return {
            success: true,
            info
        }
    }
    catch(error) {
        if (error.code === 'EAUTH') {
            return {
                success: false,
                code: 401,
                message: 'Lỗi xác thực SMTP: kiểm tra email hoặc app password.'
            }
        }
        else if (error.responseCode === 550) {
            return {
                success: false,
                code: 400,
                message: 'Email không tồn tại hoặc bị từ chối.'
            }
        }
        else if (error.code === 'ECONNECTION') {
            return {
                success: false,
                code: 503,
                message: 'Không kết nối được tới SMTP server.'
            }
        }
        else {
            return {
                success: false,
                code: 500,
                message: `Lỗi gửi email: ${error.message}`
            }
        }
    }
}

module.exports = emailService;