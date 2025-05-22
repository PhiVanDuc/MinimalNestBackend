require("dotenv").config();

const { Event, Coupon } = require("../../db/models/index");
const { Op } = require("sequelize");

const slugify = require("slugify");
const response = require("../../utils/response");
const { cloudinary } = require("../../utils/cloudinary");
const { extractPublicId } = require("cloudinary-build-url");

const LIMIT = process.env.LIMIT

module.exports = {
    get_events: async (req, res) => {
        try {
            const all = req.query?.all;
            const page = req.query?.page || 1;
            const event = (req.query?.event)?.trim() || "";

            if (!all) {
                // Tính toán cần lấy dữ liệu bắt đầu từ index nào.
                const limit = +LIMIT;
                const offset = (+page - 1) * limit;

                const whereCondition = event ?
                {
                    event: {
                        [Op.iLike]: `%${event}%`
                    }
                } :
                {};

                const { count, rows } = await Event.findAndCountAll({
                    limit,
                    offset,
                    where: whereCondition,
                    order: [['created_at', 'DESC']],
                    include: {
                        model: Coupon,
                        as: "coupons"
                    }
                });

                return response(res, 200, {
                    success: true,
                    message: "Lấy danh sách sự kiện thành công!",
                    data: {
                        totalItems: count,
                        pageSize: limit,
                        totalPages: Math.ceil(count / limit),
                        currentPage: +page,
                        rows
                    }
                });
            }
            else {
                const allEvents = await Event.findAll();
                return response(res, 200, {
                    success: true,
                    message: "Lấy danh sách sự kiện thành công!",
                    data: {
                        events: allEvents
                    }
                })
            }
        }
        catch(error) {
            console.log(error);
            
            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            });
        }
    },

    get_event: async (req, res) => {
        try {
            const slug = req.params.slug;

            // Kiểm tra dữ liệu
            if (!slug) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                });
            }

            // Tìm sự kiện
            const findEvent = await Event.findOne({
                where: { slug },
            });

            if (!findEvent) {
                return response(res, 404, {
                    success: false,
                    message: "Không tìm thấy sự kiện!"
                });
            }

            return response(res, 200, {
                success: true,
                message: "Lấy sự kiện thành công!",
                data: {
                    event: findEvent
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

    add_event: async (req, res) => {
        try {
            const { image, event, desc, startDate, endDate } = req.body;

            // Kiểm tra dữ liệu
            if (!image || !event || !desc || !startDate || !endDate) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                })
            }

            // Kiểm tra xem tiêu đề có bị trùng không
            const slug = slugify(event, {
                lower: true,
                locale: 'vi',
                remove: /[*+~.()'"!:@]/g
            });

            const existingEvent = await Event.findOne({
                where: { slug }
            });

            if (existingEvent) {
                return response(res, 400, {
                    success: false,
                    message: "Tên sự kiện đã tồn tại!"
                })
            }

            // Tải ảnh lên cloudinary
            let uploadImage;
            try {
                uploadImage = await cloudinary.uploader.upload(image, {
                    folder: `events`,
                    public_id: slug,
                    use_filename: true,
                    unique_filename: false
                });
            } catch (err) {
                console.error(err);

                return response(res, 500, {
                    success: false,
                    message: "Tải ảnh lên Cloudinary thất bại!"
                });
            }

            if (!uploadImage || !uploadImage.secure_url) {
                return response(res, 500, {
                    success: false,
                    message: "Không thể tải ảnh lên Cloudinary!",
                });
            }

            // Tạo mới event
            const newEvent = await Event.create({
                image: uploadImage.secure_url,
                slug,
                event,
                desc,
                start_date: new Date(startDate),
                end_date: new Date(endDate),
            });

            return response(res, 200, {
                success: true,
                message: "Thêm mới sự kiện thành công!",
                data: {
                    event: newEvent
                }
            })
        }
        catch(error) {
            console.log(error);
            
            return response(res, 500, {
                success: false,
                message: "Lỗi server!"
            });
        }
    },

    edit_event: async (req, res) => {
        try {
            const paramSlug = req.params.slug;
            const { image, event, desc, startDate, endDate } = req.body;

            // Kiểm tra dữ liệu
            if (!image || !event || !desc || !startDate || !endDate) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                })
            }

            // Kiểm tra xem có tìm thấy event hiện tại không
            const existingEvent = await Event.findOne({
                where: { slug: paramSlug }
            });

            if (!existingEvent) {
                return response(res, 400, {
                    success: false,
                    message: "Không thể cập nhật một sự kiện không tồn tại!"
                });
            }
            const oldImage = existingEvent?.image;

            // Kiểm tra xem event đã tồn tại chưa
            const slug = slugify(event, {
                lower: true,
                locale: 'vi',
                remove: /[*+~.()'"!:@]/g
            });

            const findEvent = await Event.findOne({
                where: { slug }
            });

            if (findEvent && (findEvent.id !== existingEvent.id)) {
                return response(res, 400, {
                    success: false,
                    message: "Tiêu đề sự kiện đã tồn tại!"
                });
            }

            // Xóa ảnh cũ
            const oldPublicId = extractPublicId(oldImage);
            await cloudinary.uploader.destroy(oldPublicId);

            // Tải ảnh lên cloudinary
            let uploadImage;
            try {
                uploadImage = await cloudinary.uploader.upload(image, {
                    folder: `events`,
                    public_id: slug,
                    use_filename: true,
                    unique_filename: false
                });
            } catch (err) {
                console.error(err);

                return response(res, 500, {
                    success: false,
                    message: "Tải ảnh lên Cloudinary thất bại!"
                });
            }

            if (!uploadImage || !uploadImage.secure_url) {
                return response(res, 500, {
                    success: false,
                    message: "Không thể tải ảnh lên Cloudinary!",
                });
            }

            // Cập nhật Event
            const updateEvent = await existingEvent.update(
                {
                    image: uploadImage.secure_url,
                    slug,
                    event,
                    desc,
                    start_date: new Date(startDate),
                    end_date: new Date(endDate),
                }
            );

            return response(res, 200, {
                success: true,
                message: "Chỉnh sửa sự kiện thành công!",
                data: {
                    event: updateEvent
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

    delete_event: async (req, res) => {
        try {
            const slug = req.params.slug;

            // Kiểm tra dữ liệu
            if (!slug) {
                return response(res, 400, {
                    success: false,
                    message: "Vui lòng cung cấp đủ dữ liệu!"
                });
            }

            const findEvent = await Event.findOne({
                where: { slug }
            });

            if (!findEvent) {
                return response(res, 404, {
                    success: false,
                    message: "Sự kiện không tồn tại!"
                })
            }

            // Xóa ảnh trên cloudinary
            const image = findEvent?.image;
            const imagePublicId = extractPublicId(image);
            await cloudinary.uploader.destroy(imagePublicId);

            // Xóa sự kiện
            await findEvent.destroy();

            return response(res, 200, {
                success: true,
                message: "Xóa sự kiện thành công!"
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