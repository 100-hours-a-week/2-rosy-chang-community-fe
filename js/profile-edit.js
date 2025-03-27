// profile-edit.js - 회원정보 수정 페이지 관련 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 참조
    const profilePreview = document.getElementById('profilePreview');
    const profileImage = document.getElementById('profileImage');
    const profileImagePreview = document.getElementById('profileImagePreview');
    const emailDisplay = document.getElementById('emailDisplay');
    const nicknameInput = document.getElementById('nickname');
    const nicknameHelperText = document.getElementById('nicknameHelperText');
    const profileEditForm = document.getElementById('profileEditForm');
    const withdrawButton = document.getElementById('withdrawButton');
    const withdrawModal = document.getElementById('withdrawModal');
    const cancelWithdraw = document.getElementById('cancelWithdraw');
    const confirmWithdraw = document.getElementById('confirmWithdraw');
    const toastMessage = document.getElementById('toastMessage');
    
    // 로그인 상태 확인 및 유저 정보 로드
    if (!checkLoginStatus()) {
        return; // checkLoginStatus 함수 내에서 리다이렉트 처리
    }
    
    // 사용자 정보 로드
    loadUserInfo();
    
    // 이벤트 리스너 초기화
    initEventListeners();
    
    /**
     * 이벤트 리스너 초기화 함수
     */
    function initEventListeners() {
        // 프로필 이미지 클릭 이벤트 (이미지 업로드)
        profilePreview.addEventListener('click', function() {
            profileImage.click();
        });
        
        // 프로필 이미지 변경 이벤트
        profileImage.addEventListener('change', handleProfileImageChange);
        
        // 닉네임 입력 및 포커스 아웃 이벤트
        nicknameInput.addEventListener('input', validateNickname);
        nicknameInput.addEventListener('focusout', validateNickname);
        
        // 회원정보 수정 폼 제출 이벤트
        profileEditForm.addEventListener('submit', handleProfileUpdate);
        
        // 회원 탈퇴 버튼 클릭 이벤트
        withdrawButton.addEventListener('click', function() {
            withdrawModal.style.display = 'flex';
        });
        
        // 탈퇴 취소 버튼 클릭 이벤트
        cancelWithdraw.addEventListener('click', function() {
            withdrawModal.style.display = 'none';
        });
        
        // 탈퇴 확인 버튼 클릭 이벤트
        confirmWithdraw.addEventListener('click', handleUserWithdraw);
    }
    
    /**
     * 사용자 정보 로드 함수
     */
    async function loadUserInfo() {
        try {
            // 토큰 가져오기
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = 'login.html';
                return;
            }
    
            // 사용자 정보 조회 API 직접 호출
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                displayUserInfo(data.data);
            } else {
                alert('사용자 정보를 불러올 수 없습니다.');
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('사용자 정보 로드 오류:', error);
            
            // 로컬 스토리지의 기본 정보로 표시
            displayUserInfo({
                email: localStorage.getItem('email') || 'example@example.com',
                nickname: localStorage.getItem('nickname') || '사용자',
                profileImageUrl: localStorage.getItem('profileImageUrl') || null
            });
        }
    }
    
    /**
     * 사용자 정보 표시 함수
     */
    function displayUserInfo(userData) {
        emailDisplay.textContent = userData.email || '';
        nicknameInput.value = userData.nickname || '';
        
        // 프로필 이미지가 있는 경우 표시
        if (userData.profileImageUrl) {
            profileImagePreview.src = userData.profileImageUrl;
        }
    }
    
    /**
     * 프로필 이미지 변경 처리 함수
     */
    function handleProfileImageChange(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            const reader = new FileReader();
            reader.onload = function(e) {
                profileImagePreview.src = e.target.result;
                
                // 헤더의 프로필 이미지도 업데이트
                const headerProfileImage = document.getElementById('headerProfileImage');
                if (headerProfileImage) {
                    headerProfileImage.src = e.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
    }
    
    /**
     * 닉네임 유효성 검사 함수
     */
    function validateNickname() {
        const nickname = nicknameInput.value.trim();
        
        if (!nickname) {
            showHelperText(nicknameHelperText, '* 닉네임을 입력해주세요.');
            return false;
        }
        
        if (nickname.length > 10) {
            showHelperText(nicknameHelperText, '* 닉네임은 최대 10자까지 작성 가능합니다.');
            return false;
        }
        
        if (nickname.includes(' ')) {
            showHelperText(nicknameHelperText, '* 띄어쓰기를 없애주세요.');
            return false;
        }
        
        // 닉네임 중복 검사는 서버 통신이 필요하지만 여기서는 생략
        hideHelperText(nicknameHelperText);
        return true;
    }

    /**
     * 회원정보 수정 요청 처리 함수
     */
    // profile-edit.js 파일에서 handleProfileUpdate 함수 수정
    async function handleProfileUpdate(e) {
        e.preventDefault();
        
        // 닉네임 유효성 검사
        if (!validateNickname()) {
            return;
        }
    
        try {
            // 프로필 이미지와 닉네임 정보 가져오기
            const nickname = nicknameInput.value.trim();
            const profileImageFile = profileImage.files[0]; // 새로 선택한 파일이 있으면 사용
        
            // FormData 객체 사용
            const formData = new FormData();
            if (nickname) {
                formData.append('nickname', nickname);
            }
            if (profileImageFile) {
                formData.append('profileImage', profileImageFile);
            }
        
            // API 직접 호출 (multipart/form-data 문제 해결)
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Content-Type 헤더를 지정하지 않음
                },
                body: formData
            });
        
            const data = await response.json();
        
            if (response.ok) {
                // 수정 성공 시 토스트 메시지 표시
                showToastMessage();
            
                // 로컬 스토리지 정보 업데이트
                if (data.data) {
                    if (data.data.nickname) {
                        localStorage.setItem('nickname', data.data.nickname);
                    }
                
                    if (data.data.profileImageUrl) {
                        localStorage.setItem('profileImageUrl', data.data.profileImageUrl);
                    }
                }
            } else {
                // 수정 실패 시 오류 처리
                alert(data.message || '회원정보 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('회원정보 수정 요청 오류:', error);
            alert('서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    }
    
    /**
     * 회원정보 수정 오류 처리 함수
     */
    function handleProfileUpdateError(result) {
        if (result.errors && result.errors.length > 0) {
            result.errors.forEach(error => {
                if (error.field === 'nickname') {
                    showHelperText(nicknameHelperText, error.message);
                } else {
                    alert(error.message);
                }
            });
        } else {
            alert(result.message || '회원정보 수정에 실패했습니다.');
        }
    }
    
    /**
     * 회원 탈퇴 처리 함수
     */
    async function handleUserWithdraw() {
        try {
            // 토큰 가져오기
            const token = localStorage.getItem('token');
            if (!token) {
                alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
                window.location.href = 'login.html';
                return;
            }
    
            // 회원 탈퇴 API 직접 호출
            const response = await fetch(`${API_BASE_URL}/user`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // 응답 데이터 확인
            const data = await response.json();
            console.log('회원 탈퇴 응답:', data);
            
            if (response.ok) {
                // 회원 탈퇴 성공 시 로그아웃 처리
                alert('회원 탈퇴가 완료되었습니다.');
                
                // 로컬 스토리지에서 사용자 데이터 삭제
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('nickname');
                localStorage.removeItem('profileImageUrl');
                
                // 로그인 페이지로 이동
                window.location.href = 'login.html';
            } else {
                // 회원 탈퇴 실패 시 오류 메시지 표시
                alert(data.message || '회원 탈퇴에 실패했습니다.');
                withdrawModal.style.display = 'none';
            }
        } catch (error) {
            console.error('회원 탈퇴 요청 오류:', error);
            alert('서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            withdrawModal.style.display = 'none';
        }
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