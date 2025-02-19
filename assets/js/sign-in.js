document.addEventListener("DOMContentLoaded", function() {
    const backBtn = document.getElementById("back-btn");
    const registerForm = document.getElementById("register-form");
    const profileImage = document.getElementById("profile-image");
    const profilePreview = document.getElementById("profile-preview");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const toLoginBtn = document.getElementById("to-login");

    const emailError = document.getElementById("error_mail"); // 이메일 오류 메시지 표시
    const passwordError = document.getElementById("error_password"); // 비밀번호 오류 메시지 표시

    // 뒤로 가기 버튼
    backBtn.addEventListener("click", () => {
        window.history.back();
    });

    // 이메일 유효성 검사 함수
    function validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    // 비밀번호 유효성 검사 함수
    function validatePassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;
        return passwordRegex.test(password);
    }

    // 입력값 유효성 검사
    function validateInputs() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        let valid = true;

        // 이메일 유효성 검사
        if (!email) {
            emailError.textContent = "* 이메일을 입력해주세요";
            valid = false;
        } else if (!validateEmail(email)) {
            emailError.textContent = "* 올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
            valid = false;
        } else {
            emailError.textContent = "";
        }

        // 비밀번호 유효성 검사
        if (!password) {
            passwordError.textContent = "* 비밀번호를 입력해주세요";
            valid = false;
        } else if (!validatePassword(password)) {
            passwordError.textContent = "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
            valid = false;
        } else {
            passwordError.textContent = "";
        }

        // 로그인 버튼 활성화/비활성화
        registerForm.disabled = !valid;
        registerForm.style.backgroundColor = valid ? "#76A6EE" : "#ACA0EB";
    }
    

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

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        alert("회원가입 완료! 로그인 페이지로 이동합니다.");
        window.location.href = "login.html";
    });
});