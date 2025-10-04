class BookDetailPage {
    constructor() {
        this.btn = document.getElementById("btn-summarize");
        this.bindEvents();
    }

    bindEvents() {
        this.btn.addEventListener("click", async () => {
            const slug = this.btn.getAttribute('data-slug')
            this.btn.disabled = true;
            this.btn.textContent = "Đang mô tả vui lòng đợi...";
            const desc = document.getElementById("book-review").innerText;
            const res = await fetch("/api/ai/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug })
            });
            const data = await res.json();
            document.getElementById("ai-summary").innerText = data.summary || "Không tóm tắt được";
            this.btn.textContent = "Tóm tắt bằng AI";
            this.btn.disabled = false;
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new BookDetailPage();
});

export default BookDetailPage;


// <script>
//     document.addEventListener('DOMContentLoaded', () => {
//         const btn = document.getElementById("btn-summarize");
//     const slug = btn.getAttribute('data-slug')
//     console.log(slug)
//     if (btn) {
//         btn.addEventListener("click", async () => {
//             btn.disabled = true;
//             btn.textContent = "Đang mô tả vui lòng đợi...";
//             const desc = document.getElementById("book-review").innerText;
//             const res = await fetch("/api/ai/summarize", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ slug })
//             });
//             const data = await res.json();
//             document.getElementById("ai-summary").innerText = data.summary || "Không tóm tắt được";
//             btn.textContent = "Tóm tắt bằng AI";
//             btn.disabled = false;
//         });
//         }

//     })
// </script>