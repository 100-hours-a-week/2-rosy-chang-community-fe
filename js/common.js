// 공통 유틸리티 함수

// API 기본 URL (서버 주소로 변경 필요)
const API_BASE_URL = 'http://localhost:8080';

// API 호출 함수
async function fetchAPI(endpoint, options = {}) {
    try {
        // 기본 헤더 설정
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        // 인증 토큰이 있는 경우 헤더에 추가
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // API 요청
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        return response;
    } catch (error) {
        console.error('API 요청 오류:', error);
        throw error;
    }
}

// 로그인 상태 확인
function isLoggedIn() {
    return !!localStorage.getItem('token');
}

// 이메일 유효성 검사
function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
}

// 비밀번호 유효성 검사
function validatePassword(password) {
    // 비밀번호 길이 체크 (8-20자)
    if (password.length < 8 || password.length > 20) {
        return false;
    }
    
    // 대문자, 소문자, 숫자, 특수문자 각각 1개 이상 포함 확인
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}

// 폼 입력값 검증 후 버튼 활성화 함수
function validateFormAndToggleButton(formInputs, button) {
    const allValid = Object.values(formInputs).every(value => value === true);
    
    if (allValid) {
        button.classList.add('active');
    } else {
        button.classList.remove('active');
    }
    
    return allValid;
}

// 에러 메시지 표시 함수
function showErrorMessage(element, message) {
    element.textContent = message;
    element.style.visibility = 'visible';
}

// 에러 메시지 숨김 함수
function hideErrorMessage(element) {
    element.style.visibility = 'hidden';
}