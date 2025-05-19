const { Permission } = require("../../db/models/index");
const response = require("../../utils/response");

module.exports = {
    get_permissions: async (req, res) => {
        try {
            const rawPermissions = await Permission.findAll({
                attributes: ["slug"],
                raw: true,
            });

            const slugs = rawPermissions
                .map((p) => p.slug)
                .filter((slug) => slug !== "admin");
            const groupLabels = {
                admin:      "Quản trị viên",
                dashboard:  "Bảng thống kê",
                role:       "Vai trò",
                account:    "Tài khoản",
                event:      "Sự kiện",
                coupon:     "Phiếu giảm giá",
                color:      "Màu sắc",
                size:       "Kích thước",
                product:    "Sản phẩm",
                order:      "Đơn hàng",
                inventory:  "Kho hàng",
            };

            const temp = {};
            slugs.forEach((slug) => {
                const match = slug.match(/-(\w+)$/);
                const group = match ? match[1] : slug;

                if (!temp[group]) {
                    temp[group] = {
                        label: groupLabels[group] || group,
                        array: [],
                    };
                }
                temp[group].array.push(slug);
            });

            return response(res, 200, {
                success: true,
                message: "Đã thành công lấy ra các quyền!",
                data: {
                    permissions: Object.values(temp),
                },
            });
        }
        catch (error) {
            console.error(error);
            
            return response(res, 500, {
                success: false,
                message: "Lỗi server!",
            });
        }
    },
};