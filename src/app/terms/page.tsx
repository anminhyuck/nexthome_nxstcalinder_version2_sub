'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { useBookmarkContext } from '@/contexts/BookmarkContext';

// 임시 IT 용어 데이터
const TEMP_TERMS = [
  { id: '1', term: 'e - 마켓 플레이스' },
  { id: '2', term: '드랍쉬핑 (Dropshipping)' },
  { id: '3', term: 'AI 파일' },
  { id: '4', term: 'O2O (online to offline)' },
  { id: '5', term: '고객 구매 여정 (Consumer Decision Journey)' },
  { id: '6', term: 'NCP (Network Control Protocol)' },
  { id: '7', term: '스핀오프 (Spinoff)' },
  { id: '8', term: '킬러 콘텐츠 (Killer Contents)' },
  { id: '9', term: '라이브러리' },
  { id: '10', term: '목업' },
  { id: '11', term: '정보구조도 (IA)' },
  { id: '12', term: 'API 문서' },
  { id: '13', term: '데이터 전처리 (Data Preprocessing)' },
  { id: '14', term: 'J커브(J-curve effect)' },
  { id: '15', term: '메타포' },
  { id: '16', term: '모달' },
  { id: '17', term: '패딩' },
  { id: '18', term: '제플린' },
  { id: '19', term: '와이어프레임' },
  { id: '20', term: '마진' },
  { id: '21', term: '프리 머니' },
  { id: '22', term: '공유경제 (Sharing Economy)' },
  { id: '23', term: 'S3' },
  { id: '24', term: 'PV (Page View)' },
  { id: '25', term: 'CEO' },
  { id: '26', term: 'UX Writing' },
  { id: '27', term: 'SBA(Seoul Business Agency)' },
  { id: '28', term: '로우 데이터(Raw data)' },
  { id: '29', term: 'AWS Credit' },
  { id: '30', term: '해커톤 (Hackathon)' },
  { id: '31', term: '썸네일' },
  { id: '32', term: 'GUI' },
  { id: '33', term: '하이브리드 앱(Hybrid app)' },
  { id: '34', term: 'R&R (Role&Responsibility)' },
  { id: '35', term: '마일스톤' },
  { id: '36', term: '누끼' },
  { id: '37', term: '리엑트 네이티브' },
  { id: '38', term: '이슈 티켓' },
  { id: '39', term: '마일스톤 (Milestone)' },
  { id: '40', term: 'CPO(Chief Product Officer)' },
  { id: '41', term: '베타 서비스(Beta Service)' },
  { id: '42', term: 'VR(Virtual Reality)' },
  { id: '43', term: 'RDS' },
  { id: '44', term: '시드머니' },
  { id: '45', term: '레퍼런스' },
  { id: '46', term: '이커머스' },
  { id: '47', term: '피봇 (Pivot)' },
  { id: '48', term: '스콥 (scope)' },
  { id: '49', term: '그리드' },
  { id: '50', term: '토스트 메세지' },
  { id: '51', term: 'forwarding' },
  { id: '52', term: '배포(Software Distribution)' },
  { id: '53', term: 'BX' },
  { id: '54', term: '임팩트 투자 (Impact Investment)' },
  { id: '55', term: '인스턴스(AWS)' },
  { id: '56', term: '푸터' },
  { id: '57', term: 'MAU (Monthly Active Users)' },
  { id: '58', term: '애자일(Agile)' },
  { id: '59', term: 'VOC(Voice Of Customer)' },
  { id: '60', term: 'NPS' },
  { id: '61', term: '하이브리드 강연' },
  { id: '62', term: '자금조달' },
  { id: '63', term: 'APK' },
  { id: '64', term: 'CTA (Call To Action)' },
  { id: '65', term: 'CFO(Chief Financial Officer)' },
  { id: '66', term: '스프린트(Sprint)' },
  { id: '67', term: '데모데이' },
  { id: '68', term: '넛지' },
  { id: '69', term: 'Node.js' },
  { id: '70', term: '세그먼테이션 (segmentation)' },
  { id: '71', term: 'SI (System Integration)' },
  { id: '72', term: 'UI' },
  { id: '73', term: '턴키 방식' },
  { id: '74', term: '퍼포먼스 마케팅' },
  { id: '75', term: 'PoC(Proof Of Concept)' },
  { id: '76', term: '라이브러리(Library)' },
  { id: '77', term: 'Azure' },
  { id: '78', term: 'Nest.js' },
  { id: '79', term: '어레인지 (arrange)' },
  { id: '80', term: 'Request for Proposal (RFP)' },
  { id: '81', term: 'PL(피엘)' },
  { id: '82', term: 'CX(Customer Experience)' },
  { id: '83', term: '스프링 (Spring)' },
  { id: '84', term: '인스턴트(Instant)' },
  { id: '85', term: '유효성 검사' },
  { id: '86', term: '텍스트 박스' },
  { id: '87', term: '플러터 (Flutter)' },
  { id: '88', term: '피치 덱 (Pitch Deck)' },
  { id: '89', term: '전략적 투자 (SI, Strategic Investment)' },
  { id: '90', term: '랜딩 페이지' },
  { id: '91', term: '디자인 토큰' },
  { id: '92', term: '아이콘' },
  { id: '93', term: '얼라인 (align)' },
  { id: '94', term: 'CPA (Cost per Action)' },
  { id: '95', term: 'PSD 파일' },
  { id: '96', term: '스톡옵션' },
  { id: '97', term: '온보딩 (Onboarding)' },
  { id: '98', term: '사용성 테스트' },
  { id: '99', term: 'CS율' },
  { id: '100', term: 'SaaS(Software-as-a-Service)' },
  { id: '101', term: '데이터베이스(Database) 서버' },
  { id: '102', term: '밸류에이션 (Valuation)' },
  { id: '103', term: '온디맨드 (on demand)' },
  { id: '104', term: '페이드미디어 (Paid Media)' },
  { id: '105', term: 'Design-Font(디자인 폰트)' },
  { id: '106', term: '펀딩' },
  { id: '107', term: '백엔드(Back-end)' },
  { id: '108', term: '이탈률' },
  { id: '109', term: '인큐베이션(Incubation)' },
  { id: '110', term: 'WBS (Work Breakdown Structure)' },
  { id: '111', term: 'CV (Consumer value)' },
  { id: '112', term: 'F/U (Follow Up)' },
  { id: '113', term: '팝업' },
  { id: '114', term: '데스벨리' },
  { id: '115', term: 'RTB (Real Time Bidding)' },
  { id: '116', term: 'Request for Quotation (RFQ)' },
  { id: '117', term: '리드(Lead)' },
  { id: '118', term: 'SSL' },
  { id: '119', term: '써드파티' },
  { id: '120', term: 'QC (Quality Control)' },
  { id: '121', term: '컬럼' },
  { id: '122', term: 'System-Font(시스템폰트)' },
  { id: '123', term: '레거시' },
  { id: '124', term: 'STP' },
  { id: '125', term: '가비아' },
  { id: '126', term: '피그마' },
  { id: '127', term: 'PIC (Person In Charge)' },
  { id: '128', term: '컨펌' },
  { id: '129', term: 'MySQL' },
  { id: '130', term: '서버(Server)' },
  { id: '131', term: '액셀러레이션(Acceleration)' },
  { id: '132', term: 'CMYK' },
  { id: '133', term: '코즈 마케팅' },
  { id: '134', term: 'COO(Chief operating office)' },
  { id: '135', term: '린하게 하자' },
  { id: '136', term: 'R&D' },
  { id: '137', term: '토큰' },
  { id: '138', term: '후이즈' },
  { id: '139', term: 'LNB' },
  { id: '140', term: 'GNB' },
  { id: '141', term: 'BMC' },
  { id: '142', term: 'CR(Change Request)' },
  { id: '143', term: 'UAT (User Acceptance Testing)' },
  { id: '144', term: 'QA (Quality Assurance)' },
  { id: '145', term: 'CMO(Chief Marketing Officer)' },
  { id: '146', term: '얼럼나이' },
  { id: '147', term: 'ICE Score Framework' },
  { id: '148', term: '시리즈 A' },
  { id: '149', term: '프로그레스 바' },
  { id: '150', term: 'B2G (business-to-government)' },
  { id: '151', term: '프로토타입' },
  { id: '152', term: '톤앤매너 (tone & manner)' },
  { id: '153', term: '파이썬(Python)' },
  { id: '154', term: 'SQL(Structured Query Language)' },
  { id: '155', term: 'Repo' },
  { id: '156', term: '네이티브앱 (Native app)' },
  { id: '157', term: 'CPC(Cost per Click)' },
  { id: '158', term: 'B2B(business-to-business)' },
  { id: '159', term: 'CS' },
  { id: '160', term: 'GCP' },
  { id: '161', term: '킥오프 (kickoff)' },
  { id: '162', term: 'SEO (검색 엔진 최적화)' },
  { id: '163', term: '타입스크립트(Typescript)' },
  { id: '164', term: 'SMB(Server Message Block)' },
  { id: '165', term: '파트너사' },
  { id: '166', term: '워크플로 (Workflow)' },
  { id: '167', term: 'BNB(바텀 네비게이션 바)' },
  { id: '168', term: '릴리즈 (release)' },
  { id: '169', term: 'SA (Search Advertising)' },
  { id: '170', term: 'Role' },
  { id: '171', term: 'AR(Augmented Reality)' },
  { id: '172', term: '도커 (Docker)' },
  { id: '173', term: '라우팅' },
  { id: '174', term: '라이센싱 (Licensing)' },
  { id: '175', term: '맨먼스 방식' },
  { id: '176', term: '라이센스 비즈니스' },
  { id: '177', term: '개발서버' },
  { id: '178', term: '스위프트(Swift)' },
  { id: '179', term: '칸반보드' },
  { id: '180', term: 'JWT' },
  { id: '181', term: 'CSV (Creating Shared Value)' },
  { id: '182', term: 'CPM(Cost per Mille)' },
  { id: '183', term: '자바스크립트(Javascript)' },
  { id: '184', term: '백로그(backlog)' },
  { id: '185', term: '스프린트 백로그(Sprint Backlog)' },
  { id: '186', term: 'CRUD' },
  { id: '187', term: 'OKR(Objective and Key results)' },
  { id: '188', term: '도메인' },
  { id: '189', term: 'ERD(Entity Relationship Diagram)' },
  { id: '190', term: '어피니티 다이어그램 (Affinity Diagram)' },
  { id: '191', term: 'D2C (Direct to Customer)' },
  { id: '192', term: 'PaaS(Platform as a Service)' },
  { id: '193', term: '어드민' },
  { id: '194', term: '호스팅' },
  { id: '195', term: 'README' },
  { id: '196', term: '타이포그래피' },
  { id: '197', term: '인바운드' },
  { id: '198', term: '잡스토리(Job story)' },
  { id: '199', term: '오픈소스(Open Source)' },
  { id: '200', term: '리드 타임 (Lead Time)' },
  { id: '201', term: '클라이언트 개발자' },
  { id: '202', term: '재무적 투자 (FI, Financial Investment)' },
  { id: '203', term: '스테이지 서버' },
  { id: '204', term: '머지' },
  { id: '205', term: '테스트플라이트' },
  { id: '206', term: 'IR' },
  { id: '207', term: '웹 브라우저' },
  { id: '208', term: '부트스트래핑' },
  { id: '209', term: '니치 마케팅 (Niche Marketing)' },
  { id: '210', term: '코워킹 스페이스 (Co-Working Space)' },
  { id: '211', term: '스토리보드 (Story Board)' },
  { id: '212', term: '에셋' },
  { id: '213', term: '핵토콘' },
  { id: '214', term: '백엔드 프로그래머' },
  { id: '215', term: 'CDO(Chief Digital Officer)' },
  { id: '216', term: '컴포넌트(component)' },
  { id: '217', term: 'IaaS(Infrastructure as a Service)' },
  { id: '218', term: '모객' },
  { id: '219', term: '레이아웃' },
  { id: '220', term: 'DA (Display Ad)' },
  { id: '221', term: 'CPV (Cost Per View)' },
  { id: '222', term: 'DAU (Daily Active Users)' },
  { id: '223', term: 'B2C(business-to-customer)' },
  { id: '224', term: '코딩 테스트' },
  { id: '225', term: '스케일업 (Scale-Up)' },
  { id: '226', term: 'RGB' },
  { id: '227', term: 'IPO (Initial Public Offering)' },
  { id: '228', term: '운영서버' },
  { id: '229', term: '카피라이팅' },
  { id: '230', term: 'Redis' },
  { id: '231', term: 'IP 주소' },
  { id: '232', term: '레거시 (legacy)' },
  { id: '233', term: 'involve' },
  { id: '234', term: '컨버젼 (Conversion)' },
  { id: '235', term: '데이터파이프라인(Data Pipeline)' },
  { id: '236', term: '펌웨어(Firmware)' },
  { id: '237', term: 'AWS' },
  { id: '238', term: '보통주' },
  { id: '239', term: 'parallel' },
  { id: '240', term: 'PMF (Product/Market Fit)' },
  { id: '241', term: '리젝 사유' },
  { id: '242', term: '제품 백로그(Product Backlog)' },
  { id: '243', term: 'API(Application Programming Interface)' },
  { id: '244', term: '딥다이브' },
  { id: '245', term: '구독경제 (Subscription Economy)' },
  { id: '246', term: '데카콘' },
  { id: '247', term: '구독 결제' },
  { id: '248', term: 'TBD (To be determined)' },
  { id: '249', term: 'CRM 마케팅' },
  { id: '250', term: 'CTR (Click Through Rate)' },
  { id: '251', term: 'CPI (Cost Per Installation)' },
  { id: '252', term: '로아스 (ROAS)' },
  { id: '253', term: 'ROI' },
  { id: '254', term: '오가닉트래픽 (Organic Traffic)' },
  { id: '255', term: '온드 미디어 (Owned Media)' },
  { id: '256', term: '컴포넌트' },
  { id: '257', term: '유니콘' },
  { id: '258', term: 'CC' },
  { id: '259', term: '비즈니스 피봇' },
  { id: '260', term: '코호트' },
  { id: '261', term: '블록체인(Blockchain)' },
  { id: '262', term: 'UX' },
  { id: '263', term: '유니버설 디자인' },
  { id: '264', term: 'UV (Unique Visitor)' },
  { id: '265', term: '프론트엔드 프로그래머' },
  { id: '266', term: '게임 프로그래머' },
  { id: '267', term: '데이터베이스관리자(Database Administrator)' },
  { id: '268', term: '데이터사이언티스트(Data Scientist)' },
  { id: '269', term: '데브옵스 엔지니어 (DevOps Engineer)' },
  { id: '270', term: '자바(Java)' },
  { id: '271', term: '코틀린(Kotlin)' },
  { id: '272', term: '오브젝티브씨(Objective-C)' },
  { id: '273', term: 'CTO(Chief Technology Officer)' },
  { id: '274', term: '워터폴 모델(Waterfall Model)' },
  { id: '275', term: '스크럼(Scrum)' },
  { id: '276', term: 'PM(피엠)' },
  { id: '277', term: 'TFT(티 에프 티)' },
  { id: '278', term: '어도비 XD' },
  { id: '279', term: '오픈마켓' },
  { id: '280', term: '자간,행간' },
  { id: '281', term: '언드미디어 (Earned Media)' },
  { id: '282', term: '풀스택 프로그래머(Full-Stack Programmer)' },
  { id: '283', term: 'AS-IS(에즈이즈), TO-BE(투비)' },
  { id: '284', term: '아웃바운드' },
  { id: '285', term: '404 ERROR(사공사 에러)' },
  { id: '286', term: 'Web-Font(웹 폰트)' },
  { id: '287', term: '올라운더' },
  { id: '288', term: '프로토타이핑(Prototyping)' },
  { id: '289', term: '프레임워크(Framework)' },
  { id: '290', term: '포스트 머니' },
  { id: '291', term: '소셜커머스' },
  { id: '292', term: '알파 출시' },
  { id: '293', term: '사용자스토리(User Story)' },
  { id: '294', term: '모듈(Module)' },
  { id: '295', term: '스타트업(start-up)' },
  { id: '296', term: 'KPI' },
  { id: '297', term: 'R&R' },
  { id: '298', term: '피드백' },
  { id: '299', term: '회고' },
  { id: '300', term: '클라우드(Cloud) 컴퓨팅' },
  { id: '301', term: '프론트엔드(Front-end)' },
  { id: '302', term: '운영체제(Operating System)' },
  { id: '303', term: '관계형데이터베이스(Relational Database Management System)' },
  { id: '304', term: '테이블(Table)' },
  { id: '305', term: 'NoSQL' },
  { id: '306', term: 'Git' },
  { id: '307', term: 'EC2' },
  { id: '308', term: '메모리' },
  { id: '309', term: 'SG' },
  { id: '310', term: '그로스 해킹' },
  { id: '311', term: '맨먼스' },
  { id: '312', term: 'BEP (Break-Even Point)' },
  { id: '313', term: '시리즈 B' },
  { id: '314', term: '투자 회수(Exit)' },
  { id: '315', term: '인수합병(Merger and Acquisition, M&A)' },
  { id: '316', term: '랜딩페이지 (Landing Page)' },
  { id: '317', term: '스타일가이드' },
  { id: '318', term: '서드파티' },
  { id: '319', term: '그로스 해킹' },
  { id: '320', term: '스켈레톤' },
  { id: '321', term: 'SM(에스엠)' },
  { id: '322', term: '클라이언트(Client)' },
  { id: '323', term: '아웃소싱 (Outsourcing)' },
  { id: '324', term: 'static' },
  { id: '325', term: '애프터마켓 (After Market)' },
  { id: '326', term: '업사이클 (Up-cycle)' },
  { id: '327', term: 'MCN (Multi Channel Network)' },
  { id: '328', term: '캐즘 (Chasm)' },
  { id: '329', term: '맨파워' }
];

interface Term {
  id: string;
  term: string;
}

export default function TermsPage() {
  const { bookmarks, addBookmark, removeBookmark } = useBookmarkContext();
  const [searchTerm, setSearchTerm] = useState('');

  // 북마크 여부 확인
  const isBookmarked = (term: string) => {
    return bookmarks.some(bookmark => bookmark.term === term);
  };

  // 북마크 토글
  const toggleBookmark = async (term: string) => {
    try {
      if (isBookmarked(term)) {
        const bookmark = bookmarks.find(b => b.term === term);
        if (bookmark) {
          await removeBookmark(bookmark.id);
        }
      } else {
        await addBookmark(term);
      }
    } catch (error: any) {
      console.error('북마크 토글 실패:', error);
      alert(error.message || '북마크 처리 중 오류가 발생했습니다.');
    }
  };

  // 검색어로 필터링된 용어 목록
  const filteredTerms = TEMP_TERMS.filter(term =>
    term.term.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-r from-[#4C83FF] to-[#8B5CF6] min-h-screen">
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">IT 용어 사전</h1>
            <div className="flex gap-4">
              <Link
                href="/bookmarks"
                className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white"
              >
                <BsBookmarkFill />
                <span>즐겨찾기</span>
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white"
              >
                홈으로
              </Link>
            </div>
          </div>

          {/* 검색 입력 */}
          <div className="mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="용어 검색..."
              className="w-full px-4 py-2 bg-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          {/* 용어 목록 */}
          <div className="grid gap-2">
            {filteredTerms.map((term) => (
              <div
                key={term.id}
                className="flex justify-between items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="text-white">{term.term}</span>
                <button
                  onClick={() => toggleBookmark(term.term)}
                  className="text-xl hover:scale-110 transition-transform"
                >
                  {isBookmarked(term.term) ? (
                    <BsBookmarkFill className="text-yellow-400" />
                  ) : (
                    <BsBookmark className="text-white" />
                  )}
                </button>
              </div>
            ))}
            {filteredTerms.length === 0 && (
              <p className="text-center text-white/60 py-8">
                {searchTerm ? '검색 결과가 없습니다.' : '등록된 용어가 없습니다.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 