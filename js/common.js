// common.js - 공통 유틸리티 함수

/**
 * 공통 설정 및 상수
 */
const API_BASE_URL = 'http://localhost:8080';

/**
 * API 통신 관련 함수
 */

// 기본 API 호출 함수
async function fetchAPI(endpoint, options = {}) {
    try {
        // 기본 헤더 설정
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        // 인증 토큰 추가
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // API 요청 시작
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        // 인증 실패(401) 처리
        if (response.status === 401) {
            // 토큰 갱신 시도
            const refreshResult = await refreshToken();
            if (refreshResult) {
                // 토큰 갱신 성공 시 원래 요청 재시도
                return fetchAPI(endpoint, options);
            } else {
                // 토큰 갱신 실패 시 로그인 페이지로 이동
                logout();
                window.location.href = 'login.html';
                throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
            }
        }
        
        return response;
    } catch (error) {
        console.error('API 요청 오류:', error);
        
        // 네트워크 오류 처리
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            showErrorToast('서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.');
        }
        
        throw error;
    }
}

// 토큰 갱신 함수
async function refreshToken() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return false;
        
        const response = await fetch(`${API_BASE_URL}/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('토큰 갱신 오류:', error);
        return false;
    }
}

/**
 * 인증 관련 함수
 */

// 로그인 상태 확인
function isLoggedIn() {
    return !!localStorage.getItem('token');
}

// 로그아웃 함수
function logout() {
    try {
        // 로그아웃 API 호출 (비동기로 처리)
        fetch(`${API_BASE_URL}/users/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }).catch(error => console.error('로그아웃 API 호출 오류:', error));
    } finally {
        // 로컬 스토리지에서 사용자 데이터 삭제
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('nickname');
        localStorage.removeItem('profileImageUrl');
    }
}

// 현재 사용자 정보 가져오기
function getCurrentUser() {
    return {
        userId: localStorage.getItem('userId'),
        nickname: localStorage.getItem('nickname'),
        profileImageUrl: localStorage.getItem('profileImageUrl')
    };
}

/**
 * 유효성 검사 관련 함수
 */

// 이메일 유효성 검사
function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
}

// 비밀번호 유효성 검사
function validatePassword(password) {
    // 8-20자, 대문자, 소문자, 숫자, 특수문자 각각 1개 이상 포함
    if (password.length < 8 || password.length > 20) {
        return false;
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}

// 이미지 파일 유효성 검사
function isValidImageFile(file) {
    return file && file.type.startsWith('image/');
}

// 폼 입력값 검증 후 버튼 활성화 함수
function validateFormAndToggleButton(formInputs, button, activeClass = 'active') {
    const allValid = Object.values(formInputs).every(value => value === true);
    
    if (allValid) {
        button.classList.add(activeClass);
        button.disabled = false;
    } else {
        button.classList.remove(activeClass);
        button.disabled = true;
    }
    
    return allValid;
}

/**
 * UI 관련 함수
 */

// 에러 메시지 표시 함수
function showErrorMessage(element, message) {
    element.textContent = message;
    element.style.visibility = 'visible';
}

// 에러 메시지 숨김 함수
function hideErrorMessage(element) {
    element.style.visibility = 'hidden';
}

// 토스트 메시지 표시 함수
function showToast(message, duration = 3000, type = 'success') {
    // 기존 토스트가 있으면 제거
    const existingToast = document.querySelector('.custom-toast');
    if (existingToast) {
        document.body.removeChild(existingToast);
    }
    
    // 새 토스트 생성
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.textContent = message;
    
    // 스타일 적용
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = type === 'success' ? '#B197FC' : '#FF4949';
    toast.style.color = 'white';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '20px';
    toast.style.zIndex = '1000';
    
    // 문서에 추가
    document.body.appendChild(toast);
    
    // 설정 시간 후 제거
    setTimeout(() => {
        if (document.body.contains(toast)) {
            document.body.removeChild(toast);
        }
    }, duration);
}

// 성공 토스트 메시지 표시
function showSuccessToast(message) {
    showToast(message, 3000, 'success');
}

// 에러 토스트 메시지 표시
function showErrorToast(message) {
    showToast(message, 3000, 'error');
}

// 확인 모달 표시 함수
function showConfirmModal(title, message, confirmCallback, cancelCallback) {
    // 기존 모달이 있으면 제거
    const existingModal = document.querySelector('.confirm-modal-overlay');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // 모달 오버레이 생성
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'confirm-modal-overlay';
    
    // 모달 컨텐츠 생성
    const modalContent = document.createElement('div');
    modalContent.className = 'confirm-modal-content';
    
    // 제목 생성
    const modalTitle = document.createElement('h3');
    modalTitle.className = 'confirm-modal-title';
    modalTitle.textContent = title;
    
    // 메시지 생성
    const modalMessage = document.createElement('p');
    modalMessage.className = 'confirm-modal-description';
    modalMessage.textContent = message;
    
    // 버튼 컨테이너 생성
    const modalButtons = document.createElement('div');
    modalButtons.className = 'confirm-modal-buttons';
    
    // 취소 버튼 생성
    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-button';
    cancelButton.textContent = '취소';
    
    // 확인 버튼 생성
    const confirmButton = document.createElement('button');
    confirmButton.className = 'confirm-button';
    confirmButton.textContent = '확인';
    
    // 이벤트 리스너 추가
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
        if (cancelCallback) cancelCallback();
    });
    
    confirmButton.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
        if (confirmCallback) confirmCallback();
    });
    
    // 스타일 적용
    applyModalStyles(modalOverlay, modalContent, modalTitle, modalMessage, modalButtons, cancelButton, confirmButton);
    
    // 요소 조립
    modalButtons.appendChild(cancelButton);
    modalButtons.appendChild(confirmButton);
    
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(modalMessage);
    modalContent.appendChild(modalButtons);
    
    modalOverlay.appendChild(modalContent);
    
    // 문서에 추가
    document.body.appendChild(modalOverlay);
}

// 모달 스타일 적용 함수
function applyModalStyles(overlay, content, title, message, buttons, cancelBtn, confirmBtn) {
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';
    
    content.style.backgroundColor = 'white';
    content.style.borderRadius = '10px';
    content.style.width = '80%';
    content.style.maxWidth = '400px';
    content.style.padding = '30px';
    content.style.textAlign = 'center';
    
    title.style.fontSize = '18px';
    title.style.fontWeight = 'bold';
    title.style.marginTop = '0';
    title.style.marginBottom = '10px';
    
    message.style.fontSize = '14px';
    message.style.color = '#666';
    message.style.marginBottom = '20px';
    
    buttons.style.display = 'flex';
    buttons.style.justifyContent = 'space-between';
    buttons.style.gap = '10px';
    
    cancelBtn.style.flex = '1';
    cancelBtn.style.padding = '10px';
    cancelBtn.style.borderRadius = '4px';
    cancelBtn.style.fontSize = '16px';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.style.backgroundColor = '#333';
    cancelBtn.style.color = 'white';
    cancelBtn.style.border = 'none';
    
    confirmBtn.style.flex = '1';
    confirmBtn.style.padding = '10px';
    confirmBtn.style.borderRadius = '4px';
    confirmBtn.style.fontSize = '16px';
    confirmBtn.style.cursor = 'pointer';
    confirmBtn.style.backgroundColor = '#B197FC';
    confirmBtn.style.color = 'white';
    confirmBtn.style.border = 'none';
}

/**
 * 공통 UI 요소 초기화 
 */

// 프로필 드롭다운 초기화
function initProfileDropdown() {
    const profileDropdownBtn = document.getElementById('profileDropdownBtn');
    const profileDropdownMenu = document.getElementById('profileDropdownMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (profileDropdownBtn && profileDropdownMenu) {
        // 프로필 드롭다운 토글
        profileDropdownBtn.addEventListener('click', function() {
            profileDropdownMenu.classList.toggle('show');
        });
        
        // 드롭다운 외부 클릭 시 닫기
        window.addEventListener('click', function(event) {
            if (!event.target.matches('.profile-button') && !event.target.matches('#headerProfileImage')) {
                if (profileDropdownMenu.classList.contains('show')) {
                    profileDropdownMenu.classList.remove('show');
                }
            }
        });
    }
    
    // 로그아웃 버튼 이벤트
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
            window.location.href = 'login.html';
        });
    }
}

// 헤더 프로필 이미지 설정
function setHeaderProfileImage() {
    const headerProfileImage = document.getElementById('headerProfileImage');
    if (headerProfileImage) {
        // 로컬 스토리지에서 프로필 이미지 URL 가져오기
        const profileImageUrl = localStorage.getItem('profileImageUrl');
        if (profileImageUrl) {
            headerProfileImage.src = profileImageUrl;
        }
    }
}

// 페이지 로드 시 로그인 상태 확인
function checkLoginStatus() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    
    // 헤더 프로필 이미지 설정
    setHeaderProfileImage();
    
    // 프로필 드롭다운 초기화
    initProfileDropdown();
    
    return true;
}

/**
 * 포맷팅 관련 함수
 */

// 날짜 포맷 함수
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

// 텍스트 자르기 함수
function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) : text;
}

// 쿼리 파라미터에서 값 가져오기
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}