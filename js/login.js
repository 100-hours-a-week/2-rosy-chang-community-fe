// login.js - 로그인 페이지 관련 기능

/**
 * 로그인 페이지 초기화 및 이벤트 설정
 */
document.addEventListener('DOMContentLoaded', function() {
    // 이미 로그인되어 있는 경우 메인 페이지로 이동
    if (isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }
    
    // DOM 요소 참조
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');
    const passwordHelperText = document.getElementById('passwordHelperText');
    
    // 입력값 유효성 상태 객체
    const formValidity = {
        email: false,
        password: false
    };
    
    // 이벤트 리스너 초기화
    initEventListeners();
    
    /**
     * 이벤트 리스너 초기화 함수
     */
    function initEventListeners() {
        // 이메일 입력 변경 이벤트
        emailInput.addEventListener('input', validateEmailInput);
        
        // 비밀번호 입력 변경 이벤트
        passwordInput.addEventListener('input', validatePasswordInput);
        
        // 입력 필드에 포커스되면 에러 메시지 숨기기
        emailInput.addEventListener('focus', function() {
            hideErrorMessage(passwordHelperText);
        });
        
        passwordInput.addEventListener('focus', function() {
            hideErrorMessage(passwordHelperText);
        });
        
        // 로그인 폼 제출 이벤트
        loginForm.addEventListener('submit', handleLogin);
        
        // 회원가입 버튼 클릭 이벤트
        signupButton.addEventListener('click', function() {
            window.location.href = 'signup.html';
        });
    }
    
    /**
     * 이메일 입력 검증 함수
     */
    function validateEmailInput() {
        const email = emailInput.value.trim();
        
        if (!email) {
            formValidity.email = false;
        } else {
            formValidity.email = validateEmail(email);
        }
        
        updateLoginButtonState();
    }
    
    /**
     * 비밀번호 입력 검증 함수
     */
    function validatePasswordInput() {
        const password = passwordInput.value.trim();
        
        if (!password) {
            formValidity.password = false;
        } else {
            // 로그인 시에는 간단히 길이만 체크
            formValidity.password = password.length > 0;
        }
        
        updateLoginButtonState();
    }
    
    /**
     * 로그인 폼 제출 핸들러
     */
    async function handleLogin(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        // 이메일 유효성 검사
        if (!email) {
            showErrorMessage(passwordHelperText, '* 이메일을 입력해주세요.');
            emailInput.focus();
            return;
        }
        
        if (!validateEmail(email)) {
            showErrorMessage(passwordHelperText, '* 올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)');
            emailInput.focus();
            return;
        }
        
        // 비밀번호 유효성 검사
        if (!password) {
            showErrorMessage(passwordHelperText, '* 비밀번호를 입력해주세요.');
            passwordInput.focus();
            return;
        }
        
        try {
            // 로그인 API 호출
            const result = await loginUser(email, password);
            
            if (result.success) {
                // 로그인 성공 시 게시글 목록 페이지로 이동
                window.location.href = 'index.html';
            } else {
                // 로그인 실패
                showErrorMessage(passwordHelperText, `* ${result.message}`);
                passwordInput.value = '';
                passwordInput.focus();
            }
        } catch (error) {
            console.error('로그인 요청 오류:', error);
            showErrorMessage(passwordHelperText, '* 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    }
    
    /**
     * 로그인 버튼 상태 업데이트 함수
     */
    function updateLoginButtonState() {
        if (formValidity.email && formValidity.password) {
            loginButton.classList.add('active');
        } else {
            loginButton.classList.remove('active');
        }
    }
});