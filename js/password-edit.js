// password-edit.js - 비밀번호 수정 페이지 관련 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 참조
    const passwordEditForm = document.getElementById('passwordEditForm');
    const passwordInput = document.getElementById('password');
    const passwordCheckInput = document.getElementById('passwordCheck');
    const passwordHelperText = document.getElementById('passwordHelperText');
    const passwordCheckHelperText = document.getElementById('passwordCheckHelperText');
    const submitButton = document.getElementById('submitButton');
    const toastMessage = document.getElementById('toastMessage');
    
    // 로그인 상태 확인
    if (!checkLoginStatus()) {
        return; // checkLoginStatus 함수 내에서 리다이렉트 처리
    }
    
    // 초기 오류 메시지 숨김
    hideErrorMessage(passwordHelperText);
    hideErrorMessage(passwordCheckHelperText);
    
    // 이벤트 리스너 초기화
    initEventListeners();
    
    /**
     * 이벤트 리스너 초기화 함수
     */
    function initEventListeners() {
        // 비밀번호 입력 이벤트
        passwordInput.addEventListener('input', function() {
            validatePassword();
            updateSubmitButtonState();
        });
        
        // 비밀번호 확인 입력 이벤트
        passwordCheckInput.addEventListener('input', function() {
            validatePasswordCheck();
            updateSubmitButtonState();
        });
        
        // 비밀번호 포커스 아웃 이벤트
        passwordInput.addEventListener('focusout', validatePassword);
        
        // 비밀번호 확인 포커스 아웃 이벤트
        passwordCheckInput.addEventListener('focusout', validatePasswordCheck);
        
        // 비밀번호 수정 폼 제출 이벤트
        passwordEditForm.addEventListener('submit', handlePasswordUpdate);
    }
    
    /**
     * 비밀번호 유효성 검사 함수
     */
    function validatePassword() {
        const password = passwordInput.value;
        
        if (!password) {
            showErrorMessage(passwordHelperText, '* 비밀번호를 입력해주세요');
            return false;
        }
        
        if (!isValidPassword(password)) {
            showErrorMessage(passwordHelperText, '* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.');
            return false;
        }
        
        hideErrorMessage(passwordHelperText);
        return true;
    }
    
    /**
     * 비밀번호 확인 유효성 검사 함수
     */
    function validatePasswordCheck() {
        const password = passwordInput.value;
        const passwordCheck = passwordCheckInput.value;
        
        if (!passwordCheck) {
            showErrorMessage(passwordCheckHelperText, '* 비밀번호를 한번 더 입력해주세요');
            return false;
        }
        
        if (password !== passwordCheck) {
            showErrorMessage(passwordCheckHelperText, '* 비밀번호와 다릅니다.');
            return false;
        }
        
        hideErrorMessage(passwordCheckHelperText);
        return true;
    }
    
    /**
     * 비밀번호 형식 검사 함수
     */
    function isValidPassword(password) {
        // 8-20자, 대문자, 소문자, 숫자, 특수문자 각 1개 이상 포함
        if (password.length < 8 || password.length > 20) return false;
        
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        
        return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    }
    
    /**
     * 수정하기 버튼 상태 업데이트 함수
     */
    function updateSubmitButtonState() {
        if (passwordInput.value && passwordCheckInput.value && 
            passwordInput.value === passwordCheckInput.value && 
            isValidPassword(passwordInput.value)) {
            submitButton.classList.add('active');
        } else {
            submitButton.classList.remove('active');
        }
    }
    
    /**
     * 비밀번호 수정 요청 처리 함수
     */
    // password-edit.js 파일에서 handlePasswordUpdate 함수 수정
    async function handlePasswordUpdate(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = passwordInput.value;
        const passwordCheck = passwordCheckInput.value;
        
        // 유효성 검사
        if (!currentPassword) {
            showErrorMessage(document.getElementById('currentPasswordHelperText'), '* 현재 비밀번호를 입력해주세요');
            return;
        }
        
        if (!validatePassword() || !validatePasswordCheck()) {
            return;
        }
        
        try {
            // 비밀번호 수정 API 직접 호출
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/users/password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                    passwordCheck: passwordCheck
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // 비밀번호 수정 성공
                resetForm();
                showToastMessage();
            } else {
                // 비밀번호 수정 실패
                if (data.errors && data.errors.length > 0) {
                    data.errors.forEach(error => {
                        if (error.field === 'currentPassword') {
                            showErrorMessage(document.getElementById('currentPasswordHelperText'), error.message);
                        } else if (error.field === 'newPassword') {
                            showErrorMessage(passwordHelperText, error.message);
                        } else if (error.field === 'passwordCheck') {
                            showErrorMessage(passwordCheckHelperText, error.message);
                        }
                    });
                } else {
                    alert(data.message || '비밀번호 수정에 실패했습니다.');
                }
            }
        } catch (error) {
            console.error('비밀번호 수정 요청 오류:', error);
            alert('서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    }
    
    /**
     * 비밀번호 수정 오류 처리 함수
     */
    function handlePasswordUpdateError(result) {
        if (result.errors && result.errors.length > 0) {
            result.errors.forEach(error => {
                if (error.field === 'currentPassword') {
                    showErrorMessage(passwordHelperText, error.message);
                } else if (error.field === 'newPassword') {
                    showErrorMessage(passwordHelperText, error.message);
                } else if (error.field === 'passwordCheck') {
                    showErrorMessage(passwordCheckHelperText, error.message);
                }
            });
        } else {
            alert(result.message || '비밀번호 수정에 실패했습니다.');
        }
    }
    
    /**
     * 폼 초기화 함수
     */
    function resetForm() {
        document.getElementById('currentPassword').value = '';
        passwordInput.value = '';
        passwordCheckInput.value = '';
        hideErrorMessage(document.getElementById('currentPasswordHelperText'));
        hideErrorMessage(passwordHelperText);
        hideErrorMessage(passwordCheckHelperText);
        submitButton.classList.remove('active');
    }
    
    /**
     * 토스트 메시지 표시 함수
     */
    function showToastMessage() {
        toastMessage.style.display = 'block';
        
        // 3초 후 토스트 메시지 자동 숨김
        setTimeout(function() {
            toastMessage.style.display = 'none';
        }, 3000);
    }
});