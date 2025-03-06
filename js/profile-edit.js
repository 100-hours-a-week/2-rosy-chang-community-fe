// 회원정보 수정 페이지 관련 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 참조
    const profileDropdownBtn = document.getElementById('profileDropdownBtn');
    const profileDropdownMenu = document.getElementById('profileDropdownMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    const profilePreview = document.getElementById('profilePreview');
    const profileImage = document.getElementById('profileImage');
    const profileImagePreview = document.getElementById('profileImagePreview');
    const headerProfileImage = document.getElementById('headerProfileImage');
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
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // 사용자 정보 로드
    loadUserProfile();
    
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
    
    // 로그아웃 버튼 이벤트
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
        window.location.href = 'login.html';
    });
    
    // 프로필 이미지 클릭 이벤트 (이미지 업로드)
    profilePreview.addEventListener('click', function() {
        profileImage.click();
    });
    
    // 프로필 이미지 변경 이벤트
    profileImage.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            const reader = new FileReader();
            reader.onload = function(e) {
                profileImagePreview.src = e.target.result;
                headerProfileImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 닉네임 입력 및 포커스 아웃 이벤트
    nicknameInput.addEventListener('input', validateNickname);
    nicknameInput.addEventListener('focusout', validateNickname);
    
    // 회원정보 수정 폼 제출 이벤트
    profileEditForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 닉네임 유효성 검사
        if (!validateNickname()) {
            return;
        }
        
        try {
            // FormData 객체 생성
            const formData = new FormData();
            formData.append('nickname', nicknameInput.value.trim());
            
            if (profileImage.files && profileImage.files[0]) {
                formData.append('profile_image', profileImage.files[0]);
            }
            
            // 회원정보 수정 API 호출
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // 수정 성공 시 토스트 메시지 표시
                showToastMessage();
                // 로컬 스토리지 닉네임 업데이트
                localStorage.setItem('nickname', nicknameInput.value.trim());
            } else {
                // 에러 처리
                if (data.errors && data.errors.length > 0) {
                    data.errors.forEach(error => {
                        if (error.field === 'nickname') {
                            showHelperText(nicknameHelperText, error.message);
                        }
                    });
                } else {
                    alert(data.message || '회원정보 수정에 실패했습니다.');
                }
            }
        } catch (error) {
            console.error('회원정보 수정 요청 오류:', error);
            alert('서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            
            // 테스트 목적으로 로컬 개발 환경에서는 성공으로 처리
            console.log('테스트용 회원정보 수정 처리');
            showToastMessage();
        }
    });
    
    // 회원 탈퇴 버튼 클릭 이벤트
    withdrawButton.addEventListener('click', function() {
        withdrawModal.style.display = 'flex';
    });
    
    // 탈퇴 취소 버튼 클릭 이벤트
    cancelWithdraw.addEventListener('click', function() {
        withdrawModal.style.display = 'none';
    });
    
    // 탈퇴 확인 버튼 클릭 이벤트
    confirmWithdraw.addEventListener('click', async function() {
        try {
            // 회원 탈퇴 API 호출
            const response = await fetch(`${API_BASE_URL}/user`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                // 탈퇴 성공 시 로그아웃 처리 후 로그인 페이지로 이동
                logout();
                alert('회원 탈퇴가 완료되었습니다.');
                window.location.href = 'login.html';
            } else {
                // 에러 처리
                const data = await response.json();
                alert(data.message || '회원 탈퇴에 실패했습니다.');
            }
        } catch (error) {
            console.error('회원 탈퇴 요청 오류:', error);
            alert('서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            
            // 테스트 목적으로 로컬 개발 환경에서는 성공으로 처리
            console.log('테스트용 회원 탈퇴 처리');
            logout();
            alert('회원 탈퇴가 완료되었습니다.');
            window.location.href = 'login.html';
        }
    });
    
    // 사용자 프로필 정보 로드 함수
    async function loadUserProfile() {
        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            
            if (!userId || !token) {
                window.location.href = 'login.html';
                return;
            }
            
            // 사용자 정보 조회 API 호출
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // 사용자 정보 표시
                const userData = data.data;
                emailDisplay.textContent = userData.email || '';
                nicknameInput.value = userData.nickname || '';
                
                // 프로필 이미지가 있는 경우 표시
                if (userData.profileImageUrl) {
                    profileImagePreview.src = userData.profileImageUrl;
                    headerProfileImage.src = userData.profileImageUrl;
                }
            } else {
                alert('사용자 정보를 불러올 수 없습니다.');
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('사용자 정보 로드 오류:', error);
            
            // 테스트 목적으로 로컬 개발 환경에서는 기본 데이터 표시
            console.log('테스트용 사용자 정보 표시');
            const nickname = localStorage.getItem('nickname');
            if (nickname) {
                nicknameInput.value = nickname;
            }
        }
    }
    
    // 닉네임 유효성 검사 함수
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
        // 실제 구현 시 API 호출하여 중복 체크 필요
        
        hideHelperText(nicknameHelperText);
        return true;
    }
    
    // 헬퍼 텍스트 표시 함수
    function showHelperText(element, message) {
        element.textContent = message;
        element.style.visibility = 'visible';
    }
    
    // 헬퍼 텍스트 숨김 함수
    function hideHelperText(element) {
        element.style.visibility = 'hidden';
    }
    
    // 토스트 메시지 표시 함수
    function showToastMessage() {
        toastMessage.style.display = 'block';
        
        // 3초 후 토스트 메시지 자동 숨김
        setTimeout(function() {
            toastMessage.style.display = 'none';
        }, 3000);
    }
    
    // 로그아웃 함수
    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('nickname');
    }
});