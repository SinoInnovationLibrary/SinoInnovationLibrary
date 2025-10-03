
const slugify = require('slugify');

const fs = require('fs');
const path = require('path');
const os = require('os');
const util = require('util');

const Book = require('../models/book.model');

class ApiController {
    async streamImage(req, res) {
        const id = req.params.id;

        // Xác định cache path trước
        const cacheDir = path.join(os.tmpdir(), 'cache', 'images');

        // File extension tạm mặc định .jpg, vì chưa biết URL
        const filePathJpg = path.join(cacheDir, `${id}.jpg`);

        try {
            // Nếu ảnh đã cache → trả luôn, tránh DB
            if (fs.existsSync(filePathJpg)) {
                return res.sendFile(filePathJpg);
            }

            // Nếu chưa cache → lấy book từ DB
            const book = await Book.findById(id);
            if (!book || !book.coverImage) {
                return res.status(404).send('Không tìm thấy ảnh bìa');
            }

            const url = book.coverImage;
            const fileExt = path.extname(new URL(url).pathname).split('?')[0] || '.jpg';
            const filePath = path.join(cacheDir, `${id}${fileExt}`);

            // Nếu filePath khác filePathJpg (extension khác) và tồn tại → trả luôn
            if (fs.existsSync(filePath)) {
                return res.sendFile(filePath);
            }

            // Tải ảnh từ Cloudinary
            const response = await fetch(url);
            if (!response.ok) return res.status(500).send('Không thể tải ảnh từ Cloudinary');

            const contentType = response.headers.get('content-type');
            const buffer = Buffer.from(await response.arrayBuffer());

            fs.mkdirSync(cacheDir, { recursive: true });
            fs.writeFileSync(filePath, buffer);

            res.set('Content-Type', contentType);
            res.set('Cache-Control', 'public, max-age=21600'); // browser cache 6h
            res.send(buffer);
        } catch (err) {
            console.error('Lỗi khi tải/ghi ảnh:', err);
            res.status(500).send('Lỗi xử lý ảnh');
        }
    }

    async summarize(req, res) {
        try {
            const { slug } = req.body;
            if (!slug) return res.status(400).json({ summary: "Thiếu slug" });

            const book = await Book.findOne({ slug }).populate('categoryId');
            if (!book) return res.status(404).json({ summary: "Không tìm thấy sách" });
            // const description = book.description || "";

            let prompt = `Bạn là một chuyên gia viết giới thiệu sách.
Hãy viết một đoạn mô tả chi tiết và hấp dẫn cho cuốn sách/truyện sau:
- Tên sách: ${book.title}
- Thể loại: ${book.categoryId?.name || "Không rõ"}

Yêu cầu:
1. Chỉ viết duy nhất 1 đoạn văn, không chia mục hoặc xuống dòng.
2. Độ dài từ 8 đến 20 câu.
3. Nội dung phải gợi mở, khơi gợi sự tò mò, nhưng không tiết lộ toàn bộ cốt truyện.
4. Văn phong truyền cảm, dễ đọc, hấp dẫn độc giả.
5. Không đưa ra nhiều lựa chọn, không thêm tiêu đề, không giải thích ngoài mô tả.`;


            const response = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            { role: "user", parts: [{ text: prompt }] }
                        ]
                    })
                }
            );


            const data = await response.json();
            console.log(data);
            let summary = "Không tạo được tóm tắt.";
            if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                summary = data.candidates[0].content.parts[0].text;
            }

            res.json({ summary });
        } catch (err) {
            console.error("Lỗi summarize:", err);
            res.status(500).json({ summary: "Có lỗi khi tóm tắt" });
        }
    }
}

module.exports = new ApiController();