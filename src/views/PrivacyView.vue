<script setup lang="ts">
const contact = {
  company: '모든시스템즈',
  email: 'allsys2687@gmail.com',
  address: '부산광역시 연제구 고분로112번길 23, 현대아파트 102동 109호',
}
</script>

<template>
  <div class="privacy-page">
    <header class="privacy-top">
      <RouterLink class="privacy-brand" to="/">moden<span class="dot">.</span>systems</RouterLink>
      <RouterLink class="privacy-home" to="/">홈으로</RouterLink>
    </header>

    <main class="privacy-main">
      <h1>개인정보처리방침</h1>
      <p class="privacy-date">시행일 2026-11-20</p>
      <p>
        {{ contact.company }}(이하 “회사”)는 홈페이지 제작·운영 상담 서비스를 제공하면서
        「개인정보 보호법」 등 관련 법령을 지키며, 문의하신 분의 개인정보를 아래와 같이 처리합니다.
      </p>

      <h2>1. 수집하는 개인정보 항목 및 수집 방법</h2>
      <p>
        회사는 회원가입 없이 상담 문의 양식으로 서비스를 제공하며, 아래 정보를 수집합니다.
      </p>
      <div class="privacy-table" role="table" aria-label="수집 항목">
        <div class="row head" role="row">
          <span role="columnheader">수집 시점</span>
          <span role="columnheader">수집 항목</span>
        </div>
        <div class="row" role="row">
          <span role="cell">상담 문의 시</span>
          <span role="cell"
            >휴대폰 번호, 희망 연락 방법(문자·전화), (선택) 만들고 싶은 사이트 설명, (선택)
            참고 사이트</span
          >
        </div>
      </div>

      <h2>2. 개인정보의 이용 목적</h2>
      <ul>
        <li>상담 신청 내용 확인 및 연락</li>
        <li>홈페이지 제작·운영 상담 응대</li>
        <li>문의에 대한 안내 및 회신</li>
        <li>부정 이용 방지</li>
      </ul>

      <h2>3. 보유 및 이용 기간</h2>
      <p>
        개인정보는 이용 목적을 달성하면 지체 없이 파기합니다. 다만 관련 법령에 따라 보관이 필요한
        경우 해당 기간 동안 분리하여 보관한 뒤 파기합니다.
      </p>
      <ul>
        <li>상담·문의 기록: 상담 종료 후 1년 (또는 동의 철회·삭제 요청 시 지체 없이 파기)</li>
      </ul>

      <h2>4. 처리 위탁</h2>
      <p>
        회사는 문의 메일 전달을 위해 이메일 전송 서비스(FormSubmit 등)를 이용할 수 있으며, 이 과정에서
        입력하신 정보가 처리될 수 있습니다. 고지한 경우를 제외하고 제3자에게 개인정보를 제공하지
        않습니다.
      </p>

      <h2>5. 파기 절차 및 방법</h2>
      <p>
        보유 기간이 지나거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일은 복구할
        수 없는 방법으로 삭제합니다.
      </p>

      <h2>6. 이용자의 권리와 행사 방법</h2>
      <p>
        문의하신 분은 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지를 요구하고 동의를
        철회할 수 있습니다. 아래 연락처로 요청하시면 지체 없이 처리합니다.
      </p>

      <h2>7. 만 14세 미만 아동의 개인정보</h2>
      <p>
        회사는 만 14세 미만 아동의 개인정보를 수집하지 않으며, 만 14세 미만 아동은 본 상담 서비스를
        이용할 수 없습니다. 수집된 사실이 확인되면 지체 없이 파기합니다.
      </p>

      <h2>8. 개인정보의 안전성 확보 조치</h2>
      <ul>
        <li>전송 구간 암호화(HTTPS)</li>
        <li>개인정보 취급자 최소화 및 접근 권한 관리</li>
      </ul>

      <h2>9. 개인정보 보호책임자 및 사업자 정보</h2>
      <ul>
        <li>상호: {{ contact.company }}</li>
        <li>문의: {{ contact.email }}</li>
        <li>주소: {{ contact.address }}</li>
      </ul>
      <p>
        개인정보 침해에 대한 신고·상담이 필요한 경우 개인정보침해신고센터(privacy.kisa.or.kr,
        국번없이 118) 등에 문의하실 수 있습니다.
      </p>

      <h2>10. 방침의 변경</h2>
      <p>
        본 방침의 내용이 변경되는 경우, 변경 사항을 시행일 최소 7일 전부터 서비스 화면에 공지합니다.
        다만 법령 준수 또는 이용자 보호를 위해 필요한 변경은 즉시 시행하고 사후에 공지할 수 있습니다.
      </p>
      <ul>
        <li>2026-11-20: 제정</li>
      </ul>
    </main>
  </div>
</template>

<style scoped>
.privacy-page {
  min-height: 100vh;
  background: #f7f7f5;
  color: #15181e;
}
.privacy-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 820px;
  margin: 0 auto;
  padding: 22px 20px;
}
.privacy-brand {
  font-family: KakaoBig, 'Pretendard Variable', Pretendard, sans-serif;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: #191919;
}
.privacy-brand .dot {
  color: #fee500;
}
.privacy-home {
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
}
.privacy-home:hover {
  color: #191919;
}
.privacy-main {
  max-width: 820px;
  margin: 0 auto;
  padding: 8px 20px 80px;
}
.privacy-main h1 {
  margin: 0 0 8px;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 700;
  letter-spacing: -0.04em;
}
.privacy-date {
  margin: 0 0 24px;
  font-size: 14px;
  color: #6b7280;
}
.privacy-main h2 {
  margin: 36px 0 12px;
  font-size: 18px;
  font-weight: 700;
}
.privacy-main p,
.privacy-main li {
  font-size: 15px;
  line-height: 1.7;
  color: #374151;
}
.privacy-main ul {
  margin: 0;
  padding-left: 18px;
  list-style: disc;
}
.privacy-main li + li {
  margin-top: 6px;
}
.privacy-table {
  margin-top: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}
.privacy-table .row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px;
  padding: 14px 16px;
  border-top: 1px solid #eee;
  font-size: 14px;
  line-height: 1.55;
}
.privacy-table .row.head {
  border-top: 0;
  background: #f3f1ec;
  font-weight: 700;
  color: #191919;
}
@media (max-width: 640px) {
  .privacy-table .row {
    grid-template-columns: 1fr;
  }
}
</style>
