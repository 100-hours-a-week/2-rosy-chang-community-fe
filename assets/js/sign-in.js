document.addEventListener("DOMContentLoaded", function() {
    const backBtn = document.getElementById("back-btn");
    const registerForm = document.getElementById("register-form");
    const profileImage = document.getElementById("profile-image");
    const profilePreview = document.getElementById("profile-preview");
    const toLoginBtn = document.getElementById("to-login");

    // 뒤로 가기 버튼
    backBtn.addEventListener("click", () => {
        window.history.back();
    });

    // 로그인 페이지 이동
    toLoginBtn.addEventListener("click", () => {
        window.location.href = "login.html";
    });

    // 프로필 사진 업로드
    profileImage.addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            profilePreview.src = URL.createObjectURL(file);
        }
    });

    // 회원가입 버튼 클릭 시 검증 및 처리
    registerForm.addEventListener("submit", function(event) {
        event.preventDefault();
        alert("회원가입 완료! 로그인 페이지로 이동합니다.");
        window.location.href = "login.html";
    });
});