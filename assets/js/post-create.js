document.addEventListener("DOMContentLoaded", function () {
    const backBtn = document.getElementById("back-btn");
    const postForm = document.getElementById("post-form");
    const titleInput = document.getElementById("title");
    const contentInput = document.getElementById("content");
    const imageInput = document.getElementById("image");
    const imagePreview = document.getElementById("image-preview");
    const submitBtn = document.getElementById("submit-btn");
    const errorTitle = document.getElementById("error-title");
    const errorContent = document.getElementById("error-content");

    // 뒤로 가기 버튼
    backBtn.addEventListener("click", () => {
        window.history.back();
    });

    // 입력값 확인하여 버튼 활성화
    function validateForm() {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        let valid = true;

        if (!title) {
            errorTitle.textContent = "* 제목을 입력해주세요.";
            valid = false;
        } else {
            errorTitle.textContent = "";
        }

        if (!content) {
            errorContent.textContent = "* 내용을 입력해주세요.";
            valid = false;
        } else {
            errorContent.textContent = "";
        }

        if (valid) {
            submitBtn.classList.remove("disabled-btn");
            submitBtn.classList.add("enabled-btn");
        } else {
            submitBtn.classList.remove("enabled-btn");
            submitBtn.classList.add("disabled-btn");
        }
    }

    titleInput.addEventListener("input", validateForm);
    contentInput.addEventListener("input", validateForm);

    // 이미지 업로드 미리보기
    imageInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="이미지 미리보기">`;
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.innerHTML = "";
        }
    });

    // 게시글 저장
    postForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!titleInput.value.trim() || !contentInput.value.trim()) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }

        alert("게시글이 등록되었습니다!");
        window.location.href = "board.html";
    });
});