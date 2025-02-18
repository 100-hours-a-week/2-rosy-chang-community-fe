document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginBtn = document.getElementById("login-btn");
    const registerBtn = document.getElementById("register-btn");

    const emailError = document.getElementById("error_mail"); // 이메일 오류 메시지 표시
    const passwordError = document.getElementById("error_password"); // 비밀번호 오류 메시지 표시

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
        loginBtn.disabled = !valid;
        loginBtn.style.backgroundColor = valid ? "#76A6EE" : "#ACA0EB";
    }

    emailInput.addEventListener("input", validateInputs);
    passwordInput.addEventListener("input", validateInputs);

    // 로그인 버튼 클릭 시
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // 유효성 검사
        if (!validateEmail(email) || !validatePassword(password)) {
            alert("아이디 또는 비밀번호를 확인해주세요.");
            return;
        }

        // 임시 로그인 검증 (실제 서비스에서는 API와 연동 필요)
        if (email === "test@example.com" && password === "Test1234!") {
            alert("로그인 성공!");
            window.location.href = "board.html"; // 게시판 페이지로 이동
        } else {
            alert("아이디 또는 비밀번호를 확인해주세요.");
        }
    });

    // 회원가입 버튼 클릭 시 회원가입 페이지 이동
    registerBtn.addEventListener("click", function() {
        window.location.href = "sign-in.html";
    });
});