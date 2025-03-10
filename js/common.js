// 공통 유틸리티 함수

// API 기본 URL (실제 서버 주소로 변경 필요)
const API_BASE_URL = '';

// API 요청 함수
async function fetchAPI(endpoint, options = {}) {
    try {
        // 기본 헤더 설정
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        // 인증 토큰이 있는 경우 헤더에 추가
        const token = localStorage.getItem('token');
        if (token && !endpoint.includes('/login') && !endpoint.includes('/signup') && !endpoint.includes('/refresh')) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // API 요청
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        // 토큰 만료 시 자동 갱신 처리
        if (response.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/refresh')) {
            const refreshed = await refreshToken();
            if (refreshed) {
                // 토큰 갱신 성공 시 원래 요청 재시도
                headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
                return fetchAPI(endpoint, options);
            } else {
                // 토큰 갱신 실패 시 로그인 페이지로 이동
                logout();
                window.location.href = 'login.html';
                return null;
            }
        }
        
        return response;
    } catch (error) {
        console.error('API 요청 오류:', error);
        throw error;
    }
}

// 토큰 갱신 함수
async function refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        return false;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refreshToken
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('토큰 갱신 오류:', error);
        return false;
    }
}

// 로그인 상태 확인 함수
function isLoggedIn() {
    return !!localStorage.getItem('token');
}

// 로그아웃 함수
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('nickname');
    
    // 서버에 로그아웃 요청 (선택적)
    try {
        fetchAPI('/users/logout', { method: 'POST' });
    } catch (error) {
        console.error('로그아웃 요청 오류:', error);
    }
}

// 에러 메시지 표시 함수
function showErrorMessage(element, message) {
    if (!element) return;
    element.textContent = message;
    element.style.visibility = 'visible';
}

// 에러 메시지 숨김 함수
function hideErrorMessage(element) {
    if (!element) return;
    element.style.visibility = 'hidden';
}

// 토스트 메시지 표시 함수
function showToastMessage(element, duration = 3000) {
    if (!element) return;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, duration);
}

// 날짜 포맷팅 함수
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '';
    
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 숫자 포맷 함수 (1k, 10k, 100k 등)
function formatCount(count) {
    if (count >= 100000) {
        return Math.floor(count / 1000) + 'k';
    } else if (count >= 10000) {
        return Math.floor(count / 1000) + 'k';
    } else if (count >= 1000) {
        return Math.floor(count / 1000) + 'k';
    }
    return count.toString();
}

// URL 쿼리 파라미터 파싱 함수
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// 비밀번호 유효성 검사 함수
function isValidPassword(password) {
    // 8-20자, 대문자, 소문자, 숫자, 특수문자 각 1개 이상 포함
    if (password.length < 8 || password.length > 20) return false;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}

// 이메일 형식 검사 함수
function isValidEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
}