document.addEventListener("DOMContentLoaded", function () {
    const postList = document.getElementById("post-list");
    const postCreateBtn = document.getElementById("post-create-btn");

    // 게시글 작성 버튼 클릭 시 작성 페이지로 이동
    postCreateBtn.addEventListener("click", function () {
        window.location.href = "post-create.html";
    });

    // 더미 데이터
    let posts = [
        { title: "제목 1", likes: 1500, comments: 200, views: 30500, date: "2024-02-19 14:30:00", author: "더미 작성자 1" },
        { title: "제목 2", likes: 450, comments: 30, views: 9000, date: "2024-02-18 11:10:00", author: "더미 작성자 2" },
        { title: "제목 3", likes: 120, comments: 12, views: 870, date: "2024-02-17 08:20:00", author: "더미 작성자 3" }
    ];

    // 숫자 변환 (1k, 10k 형식)
    function formatNumber(number) {
        if (number >= 100000) return (number / 1000).toFixed(0) + "k";
        if (number >= 10000) return (number / 1000).toFixed(0) + "k";
        if (number >= 1000) return (number / 1000).toFixed(1) + "k";
        return number;
    }

    // 게시물 추가 함수
    function addPost(post) {
        let postCard = document.createElement("div");
        postCard.className = "post-card";

        postCard.innerHTML = `
            <div class="post-title">${post.title.length > 26 ? post.title.substring(0, 26) + "..." : post.title}</div>
            <div class="post-meta">
                좋아요 ${formatNumber(post.likes)} · 댓글 ${formatNumber(post.comments)} · 조회수 ${formatNumber(post.views)}
            </div>
            <div class="post-meta">${post.date}</div>
            <div class="profile">
                <img src="assets/images/profile_img.webp" alt="프로필 이미지">
                <span>${post.author}</span>
            </div>
        `;

        postCard.addEventListener("click", function () {
            window.location.href = "post-detail.html";
        });

        postList.appendChild(postCard);
    }

    // 초기 게시물 로드
    posts.forEach(addPost);

    // 무한 스크롤 적용
    window.addEventListener("scroll", function () {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            let newPost = { title: "새로운 게시글", likes: 320, comments: 50, views: 8000, date: "2024-02-19 15:00:00", author: "더미 작성자 4" };
            addPost(newPost);
        }
    });
});