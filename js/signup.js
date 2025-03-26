// signup.js - 회원가입 페이지 관련 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 참조
    const backButton = document.getElementById('backButton');
    const profilePreview = document.getElementById('profilePreview');
    const profileImage = document.getElementById('profileImage');
    const profileHelperText = document.getElementById('profileHelperText');
    const signupForm = document.getElementById('signupForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordCheckInput = document.getElementById('passwordCheck');
    const nicknameInput = document.getElementById('nickname');
    const signupButton = document.getElementById('signupButton');
    const loginButton = document.getElementById('loginButton');
    
    // 헬퍼 텍스트 참조
    const emailHelperText = document.getElementById('emailHelperText');
    const passwordHelperText = document.getElementById('passwordHelperText');
    const passwordCheckHelperText = document.getElementById('passwordCheckHelperText');
    const nicknameHelperText = document.getElementById('nicknameHelperText');
    
    // 폼 유효성 상태 객체
    const formValidity = {
        profileImage: false,
        email: false,
        password: false,
        passwordCheck: false,
        nickname: false
    };
    
    // 업로드한 이미지 파일 저장 변수
    let uploadedImage = null;
    
    // 이벤트 리스너 초기화
    initEventListeners();
    
    /**
     * 이벤트 리스너 초기화 함수
     */
    function initEventListeners() {
        // 뒤로가기 버튼 클릭 이벤트
        backButton.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
        
        // 로그인하러 가기 버튼 클릭 이벤트
        loginButton.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
        
        // 프로필 이미지 클릭 이벤트
        profilePreview.addEventListener('click', function() {
            profileImage.click();
        });
        
        // 프로필 이미지 변경 이벤트
        profileImage.addEventListener('change', handleProfileImageChange);
        
        // 이메일 입력 및 포커스 아웃 이벤트
        emailInput.addEventListener('input', validateEmail);
        emailInput.addEventListener('focusout', validateEmail);
        
        // 비밀번호 입력 및 포커스 아웃 이벤트
        passwordInput.addEventListener('input', validatePassword);
        passwordInput.addEventListener('focusout', validatePassword);
        
        // 비밀번호 확인 입력 및 포커스 아웃 이벤트
        passwordCheckInput.addEventListener('input', validatePasswordCheck);
        passwordCheckInput.addEventListener('focusout', validatePasswordCheck);
        
        // 닉네임 입력 및 포커스 아웃 이벤트
        nicknameInput.addEventListener('input', validateNickname);
        nicknameInput.addEventListener('focusout', validateNickname);
        
        // 회원가입 폼 제출 이벤트
        signupForm.addEventListener('submit', handleSignup);
    }
    
    /**
     * 프로필 이미지 변경 처리 함수
     */
    function handleProfileImageChange(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            uploadedImage = file;
            
            // 이미지 파일 검증
            if (!isValidImageFile(file)) {
                showHelperText(profileHelperText, '* 이미지 파일만 업로드 가능합니다.');
                formValidity.profileImage = false;
                updateSignupButtonState();
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                profilePreview.innerHTML = '';
                const img = document.createElement('img');
                img.src = e.target.result;
                profilePreview.appendChild(img);
                
                // 유효성 상태 업데이트
                formValidity.profileImage = true;
                hideHelperText(profileHelperText);
                updateSignupButtonState();
            };
            reader.readAsDataURL(file);
        } else if (!uploadedImage) {
            // 이미지를 선택하지 않았고 기존에도 없는 경우
            profilePreview.innerHTML = '<span class="plus-icon">+</span>';
            formValidity.profileImage = false;
            showHelperText(profileHelperText, '* 프로필 사진을 추가해주세요.');
            updateSignupButtonState();
        }
    }

    /**
     * 이메일 유효성 검사 함수
     */
    function validateEmail() {
        const email = emailInput.value.trim();
        
        if (!email) {
            showHelperText(emailHelperText, '* 이메일을 입력해주세요.');
            formValidity.email = false;
        } else if (!validateEmailFormat(email)) {
            showHelperText(emailHelperText, '* 올바른 이메일 주소 형식을 입력해주세요.(예: example@example.com)');
            formValidity.email = false;
        } else {
            // 이메일 중복 검사는 서버 통신이 필요하지만 여기서는 생략
            hideHelperText(emailHelperText);
            formValidity.email = true;
        }
        
        updateSignupButtonState();
    }
    
    /**
     * 이메일 형식 검사 함수
     */
    function validateEmailFormat(email) {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(email);
    }
    
    /**
     * 비밀번호 유효성 검사 함수
     */
    function validatePassword() {
        const password = passwordInput.value;
        
        if (!password) {
            showHelperText(passwordHelperText, '* 비밀번호를 입력해주세요.');
            formValidity.password = false;
        } else if (!validatePasswordFormat(password)) {
            showHelperText(passwordHelperText, '* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.');
            formValidity.password = false;
        } else {
            hideHelperText(passwordHelperText);
            formValidity.password = true;
        }
        
        // 비밀번호가 변경되면 비밀번호 확인도 재검증
        if (passwordCheckInput.value) {
            validatePasswordCheck();
        }
        
        updateSignupButtonState();
    }
    
    /**
     * 비밀번호 형식 검사 함수
     */
    function validatePasswordFormat(password) {
        if (password.length < 8 || password.length > 20) return false;
        
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        
        return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    }
    
    /**
     * 비밀번호 확인 유효성 검사 함수
     */
    function validatePasswordCheck() {
        const passwordCheck = passwordCheckInput.value;
        const password = passwordInput.value;
        
        if (!passwordCheck) {
            showHelperText(passwordCheckHelperText, '* 비밀번호를 한번 더 입력해주세요.');
            formValidity.passwordCheck = false;
        } else if (password !== passwordCheck) {
            showHelperText(passwordCheckHelperText, '* 비밀번호가 다릅니다.');
            formValidity.passwordCheck = false;
        } else {
            hideHelperText(passwordCheckHelperText);
            formValidity.passwordCheck = true;
        }
        
        updateSignupButtonState();
    }
    
    /**
     * 닉네임 유효성 검사 함수
     */
    function validateNickname() {
        const nickname = nicknameInput.value.trim();
        
        if (!nickname) {
            showHelperText(nicknameHelperText, '* 닉네임을 입력해주세요.');
            formValidity.nickname = false;
        } else if (nickname.length > 10) {
            showHelperText(nicknameHelperText, '* 닉네임은 최대 10자까지 작성 가능합니다.');
            formValidity.nickname = false;
        } else if (nickname.includes(' ')) {
            showHelperText(nicknameHelperText, '* 띄어쓰기를 없애주세요.');
            formValidity.nickname = false;
        } else {
            // 닉네임 중복 검사는 서버 통신이 필요하지만 여기서는 생략
            hideHelperText(nicknameHelperText);
            formValidity.nickname = true;
        }
        
        updateSignupButtonState();
    }

    /**
     * 회원가입 폼 제출 핸들러
     */
    async function handleSignup(e) {
        e.preventDefault();
        
        // 모든 필드 유효성 검사
        validateEmail();
        validatePassword();
        validatePasswordCheck();
        validateNickname();
        
        if (!formValidity.profileImage) {
            showHelperText(profileHelperText, '* 프로필 사진을 추가해주세요.');
        }
        
        // 모든 필드가 유효하면 회원가입 진행
        if (Object.values(formValidity).every(value => value === true)) {
            // JSON 객체로 데이터 생성
            const signupData = {
                email: emailInput.value.trim(),
                password: passwordInput.value,
                passwordCheck: passwordCheckInput.value,
                nickname: nicknameInput.value.trim(),
                // 프로필 이미지는 백엔드가 JSON 형식으로 처리할 수 없으므로 제외
                // 이미지는 별도 API로 처리하거나 백엔드를 수정해야 함
            };
            
            try {
                // 회원가입 API 호출
                const result = await signupUser(signupData);
                
                if (result.success) {
                    // 회원가입 성공
                    alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
                    window.location.href = 'login.html';
                } else {
                    // 회원가입 실패 - 필드별 오류 메시지 표시
                    if (result.errors && result.errors.length > 0) {
                        handleSignupErrors(result.errors);
                    } else {
                        // 일반 오류 메시지
                        alert(result.message || '회원가입에 실패했습니다.');
                    }
                }
            } catch (error) {
                console.error('회원가입 요청 오류:', error);
                alert('서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
        }
    }
    
    /**
     * 회원가입 에러 처리 함수
     */
    function handleSignupErrors(errors) {
        errors.forEach(error => {
            if (error.field === 'email') {
                showHelperText(emailHelperText, error.message);
            } else if (error.field === 'password') {
                showHelperText(passwordHelperText, error.message);
            } else if (error.field === 'passwordCheck') {
                showHelperText(passwordCheckHelperText, error.message);
            } else if (error.field === 'nickname') {
                showHelperText(nicknameHelperText, error.message);
            } else if (error.field === 'profileImage') {
                showHelperText(profileHelperText, error.message);
            }
        });
    }
    
    /**
     * 헬퍼 텍스트 표시 함수
     */
    function showHelperText(element, message) {
        element.textContent = message;
        element.style.visibility = 'visible';
    }
    
    /**
     * 헬퍼 텍스트 숨김 함수
     */
    function hideHelperText(element) {
        element.style.visibility = 'hidden';
    }
    
    /**
     * 회원가입 버튼 상태 업데이트 함수
     */
    function updateSignupButtonState() {
        const isValid = Object.values(formValidity).every(value => value === true);
        
        if (isValid) {
            signupButton.classList.add('active');
        } else {
            signupButton.classList.remove('active');
        }
    }
});