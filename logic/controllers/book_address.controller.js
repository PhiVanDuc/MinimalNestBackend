const { BookAddress } = require("../../db/models/index");

const response = require("../../utils/response");

module.exports = {
    get_book_addresses: async (req, res) => {
        try {
            const accountId = req.params?.accountId;

            if (!accountId) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                });
            }

            const bookAddresses = await BookAddress.findAll({
                where: {
                    account_id: accountId
                },
                order: [["created_at", "DESC"]] 
            });

            return response(res, 200, {
                success: true,
                message: "Đã lấy ra danh sách sổ địa chỉ!",
                data: {
                    book_addresses: bookAddresses
                }
            });
        }
        catch(error) {
            console.log(error);
            
            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            });
        }
    },

    add_book_address: async (req, res) => {
        try {
            const { fullName, phoneNumber, address, defaultAddress } = req.body;
            const accountId = req.params?.accountId;

            if (!fullName || !phoneNumber || !address || !accountId) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đầy đủ thông tin!"
                });
            }

            const existingAddresses = await BookAddress.findAll({
                where: { account_id: accountId }
            });

            let isDefault = false;
            if (existingAddresses.length === 0) {
                isDefault = true;
            }
            else if (defaultAddress === true) {
                await BookAddress.update(
                    { default_address: false },
                    { where: { account_id: accountId } }
                );
                isDefault = true;
            }

            const newAddress = await BookAddress.create({
                full_name: fullName,
                phone_number: phoneNumber,
                address: address,
                default_address: defaultAddress || false,
                account_id: accountId
            });

            return response(res, 200, {
                success: true,
                message: "Đã thêm địa chỉ mới!",
                data: {
                    address: newAddress
                }
            });
        }
        catch (error) {
            console.log(error);

            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            });
        }
    },

    edit_book_address: async (req, res) => {
        try {
            const { id: addressId, fullName, phoneNumber, address, defaultAddress } = req.body;
            const accountId = req.params?.accountId;

            if (!fullName || !phoneNumber || !address || !accountId || !addressId) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đầy đủ thông tin!"
                });
            }

            const existingAddress = await BookAddress.findOne({
                where: {
                    id: addressId,
                    account_id: accountId
                }
            });

            if (!existingAddress) {
                return response(res, 404, {
                    success: false,
                    message: "Không tìm thấy địa chỉ cần sửa!"
                });
            }

            // Nếu chọn là mặc định → bỏ default của các địa chỉ khác
            if (defaultAddress === true) {
                await BookAddress.update(
                    { default_address: false },
                    { where: { account_id: accountId } }
                );
            }

            await existingAddress.update({
                full_name: fullName,
                phone_number: phoneNumber,
                address: address,
                default_address: defaultAddress
            });

            return response(res, 200, {
                success: true,
                message: "Cập nhật địa chỉ thành công!",
                data: {
                    address: existingAddress
                }
            });
        }
        catch (error) {
            console.log(error);
            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            });
        }
    },

    delete_book_address: async (req, res) => {
        try {
            const addressId = req.params?.addressId;

            if (!addressId) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đầy đủ thông tin!"
                });
            }

            const address = await BookAddress.findOne({
                where: {
                    id: addressId
                }
            });

            if (!address) {
                return response(res, 404, {
                    success: false,
                    message: "Không tìm thấy địa chỉ cần xoá!"
                });
            }

            await address.destroy();

            return response(res, 200, {
                success: true,
                message: "Đã xoá địa chỉ thành công!"
            });
        }
        catch (error) {
            console.log(error);
            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            });
        }
    }
}