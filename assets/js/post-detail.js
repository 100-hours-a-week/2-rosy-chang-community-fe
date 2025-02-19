// 뒤로 가기 버튼
function goBack() {
    window.history.back();
}

// 좋아요 버튼 기능
document.getElementById("like-btn").addEventListener("click", function() {
    let btn = this;
    let likeCount = parseInt(btn.innerText.split(" ")[0]);
    if (btn.style.backgroundColor === "rgb(169, 160, 235)") {
        btn.style.backgroundColor = "#D9D9D9";
        btn.innerText = (likeCount - 1) + " 좋아요";
    } else {
        btn.style.backgroundColor = "#ACA0EB";
        btn.innerText = (likeCount + 1) + " 좋아요";
    }
});

// 댓글 추가 기능
document.getElementById("comment-submit").addEventListener("click", function() {
    let commentText = document.getElementById("comment-input").value.trim();
    if (commentText.length === 0) return;

    let commentList = document.getElementById("comment-list");
    let li = document.createElement("li");

    li.innerHTML = `
        <span class="comment-author">사용자</span>
        <span class="comment-text">${commentText}</span>
        <button class="comment-edit">수정</button>
        <button class="comment-delete">삭제</button>
    `;

    commentList.appendChild(li);
    document.getElementById("comment-input").value = "";
});

// 게시글 삭제 모달 기능
document.getElementById("delete-btn").addEventListener("click", function() {
    document.getElementById("delete-modal").classList.remove("hidden");
});

document.getElementById("cancel-delete").addEventListener("click", function() {
    document.getElementById("delete-modal").classList.add("hidden");
});
