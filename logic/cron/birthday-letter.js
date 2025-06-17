const cron = require('node-cron');

const { Account } = require('../../db/models/index');
const emailService = require('../../utils/mailer');

const getTodayInfo = () => {
    const now = new Date();
    return {
        day: now.getDate(),
        month: now.getMonth() + 1,
    };
};

cron.schedule('0 0 * * *', async () => {
    const { day, month } = getTodayInfo();

    try {
        const vipAccounts = await Account.findAll({
            where: {
            customer_type: 'vip_customer',
            },
        });

        for (const acc of vipAccounts) {
            if (!acc.date_of_birth) continue;

            const dob = new Date(acc.date_of_birth);
            if (dob.getDate() === day && dob.getMonth() + 1 === month) {
                await emailService({
                    to: acc.email,
                    subject: '🎉 Chúc mừng sinh nhật quý khách!',
                    html: birthdayTemplate(acc.full_name),
                });
            }
        }
    } catch (err) {
        console.error('Birthday job error:', err);
    }
});

const birthdayTemplate = (fullName) => `
  <div style="background-color: #f9f9f9; padding: 40px 20px; font-family: 'Segoe UI', sans-serif; color: #333; border-radius: 8px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); padding: 40px;">
            <tr>
              <td align="center">
                <h2 style="margin-bottom: 10px; color: #2c3e50;">Chúc mừng sinh nhật</h2>
                <h1 style="margin: 0; color: #34495e;">${fullName}</h1>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
              </td>
            </tr>
            <tr>
              <td align="center">
                <p style="font-size: 16px; line-height: 32px; max-width: 500px;">
                  Nhân dịp đặc biệt này, <span style="padding: 6px 12px; border-radius: 5px; background-color: #F29E50; color: #FFFFFF; font-weight: 500;">Minimal Nest</span> xin gửi tới quý khách lời chúc sức khỏe, hạnh phúc và thành công.
                </p>
                <p style="font-size: 16px; line-height: 1.6; max-width: 500px; margin-top: 10px;">
                  Chúng tôi trân trọng sự đồng hành của quý khách và hy vọng sẽ tiếp tục phục vụ quý khách trong tương lai.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top: 30px;">
                <img src="https://cdn-icons-png.flaticon.com/512/1139/1139982.png" alt="Gift Icon" width="80" style="margin-bottom: 20px;" />
              </td>
            </tr>
            <tr>
              <td align="center">
                <p style="font-size: 14px; color: #888;">Trân trọng,<br/>Đội ngũ Minimal Nest</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
`;


const testBirthdayNow = async () => {
    const testAccount = {
        full_name: "Phí Văn Đức",
        email: "phivanduc325@gmail.com"
    };

    try {
        const result = await emailService({
            to: testAccount.email,
            subject: '🎉 [TEST] Chúc mừng sinh nhật quý khách hàng!',
            html: birthdayTemplate(testAccount.full_name),
        });

        console.log(`Đã gửi email test tới ${testAccount.email}:`, result.success ? 'Thành công' : 'Thất bại');
    } catch (err) {
        console.error('Lỗi khi test birthday email:', err);
    }
};

module.exports = { testBirthdayNow }