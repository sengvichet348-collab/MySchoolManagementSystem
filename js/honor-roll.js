/**
 * Chinese Kindergarten Score Management System
 * Official Class Honor Roll Module (班级荣誉榜)
 * Generates an elegant, printable A4 Landscape Honor Roll with student photos, podium badges, scores & signatures.
 */

const HonorRollModule = {
  currentClass: 'K1',
  currentTerm: 'term1',
  topLimit: 5, // default show Top 5 students
  currentTheme: 'royal',
  currentCategory: 'overall',

  init() {
    this.bindEvents();
    this.renderHonorRoll();

    window.addEventListener('subjects-changed', () => this.renderHonorRoll());
    window.addEventListener('scores-changed', () => this.renderHonorRoll());
  },

  bindEvents() {
    const classSelect = document.getElementById('honor-class-select');
    if (classSelect) {
      classSelect.value = this.currentClass;
      classSelect.addEventListener('change', (e) => {
        this.currentClass = e.target.value;
        this.renderHonorRoll();
      });
    }

    const termSelect = document.getElementById('honor-term-select');
    if (termSelect) {
      termSelect.value = this.currentTerm;
      termSelect.addEventListener('change', (e) => {
        this.currentTerm = e.target.value;
        this.renderHonorRoll();
      });
    }

    const limitSelect = document.getElementById('honor-limit-select');
    if (limitSelect) {
      limitSelect.value = this.topLimit;
      limitSelect.addEventListener('change', (e) => {
        this.topLimit = parseInt(e.target.value, 10) || 5;
        this.renderHonorRoll();
      });
    }

    const themeSelect = document.getElementById('honor-theme-select');
    if (themeSelect) {
      themeSelect.value = this.currentTheme;
      themeSelect.addEventListener('change', (e) => {
        this.currentTheme = e.target.value;
        this.renderHonorRoll();
      });
    }

    const categorySelect = document.getElementById('honor-category-select');
    if (categorySelect) {
      categorySelect.value = this.currentCategory;
      categorySelect.addEventListener('change', (e) => {
        this.currentCategory = e.target.value;
        this.renderHonorRoll();
      });
    }

    const printBtn = document.getElementById('btn-print-honor');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        if (typeof ElectronBridge !== 'undefined') {
          ElectronBridge.printDocument();
        } else {
          window.print();
        }
      });
    }

    const exportPdfBtn = document.getElementById('btn-export-pdf-honor');
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', () => {
        const fileName = `HonorRoll-${this.currentClass}-${this.currentTerm}.pdf`;
        if (typeof ElectronBridge !== 'undefined') {
          ElectronBridge.exportPDF(fileName, true);
        } else {
          window.print();
        }
      });
    }
  },

  renderHonorRoll() {
    const container = document.getElementById('honor-roll-sheet');
    if (!container) return;

    const settings = Storage.getSettings();
    const students = Storage.getStudents().filter(s => s.classGrade === this.currentClass);
    const subjects = Storage.getSubjects();

    // Ensure rankings are freshly calculated
    Storage.calculateAndSaveClassRankings(this.currentClass, this.currentTerm);

    const scores = Storage.getAllScores();
    const termScores = scores.filter(s => s.term === this.currentTerm);

    // Map students with their scores and rank
    const rankedStudents = [];
    students.forEach(student => {
      const sc = termScores.find(s => s.studentId === student.id);
      if (sc && sc.average && parseFloat(sc.average) > 0) {
        rankedStudents.push({
          student,
          score: sc,
          rank: sc.rank || 99,
          average: parseFloat(sc.average) || 0,
          total: parseFloat(sc.total) || 0,
          grade: sc.grade || 'A'
        });
      }
    });

    // Sort logic based on category
    if (this.currentCategory === 'chinese') {
      rankedStudents.sort((a, b) => (parseFloat(b.score.chinese || b.score.huawen || 0)) - (parseFloat(a.score.chinese || a.score.huawen || 0)));
    } else if (this.currentCategory === 'math') {
      rankedStudents.sort((a, b) => (parseFloat(b.score.math || b.score.shuxue || 0)) - (parseFloat(a.score.math || a.score.shuxue || 0)));
    } else if (this.currentCategory === 'art') {
      rankedStudents.sort((a, b) => (parseFloat(b.score.art || b.score.changyou || 0)) - (parseFloat(a.score.art || a.score.changyou || 0)));
    } else {
      rankedStudents.sort((a, b) => a.rank - b.rank || b.average - a.average);
    }

    const displayList = this.topLimit >= 99 ? rankedStudents : rankedStudents.slice(0, this.topLimit);
    const termLabel = this.currentTerm === 'term2' ? 'ឆមាសទី ២ / 第二学期' : 'ឆមាសទី ១ / 第一学期';
    const classLabel = this.currentClass;

    const bannerTitleMap = {
      'overall': 'តារាងកិត្តិយសសិស្សឆ្នើមប្រចាំថ្នាក់ | 班级优秀学生荣誉榜',
      'chinese': 'តារាងកិត្តិយសសិស្សឆ្នើមភាសាចិន | 华语之星荣誉榜',
      'math': 'តារាងកិត្តិយសសិស្សឆ្នើមគណិតវិទ្យា | 算术智慧之星荣誉榜',
      'art': 'តារាងកិត្តិយសសិស្សឆ្នើមសិល្បៈ | 艺术创意之星荣誉榜'
    };
    const bannerTitle = bannerTitleMap[this.currentCategory] || bannerTitleMap.overall;

    const maxScorePossible = subjects.reduce((acc, s) => acc + (Number(s.maxScore) || 100), 0);

    // Render HTML for the Landscape A4 Sheet
    container.innerHTML = `
      <div class="honor-roll-landscape honor-theme-${this.currentTheme}">
        <!-- Ornate Border Frame -->
        <div class="honor-frame-inner">
          <!-- Header -->
          <div class="honor-header">
            <div class="honor-logo-box">
              <img src="${settings.schoolLogo || 'assets/images/school-logo.png'}" alt="School Logo" class="honor-school-logo">
            </div>
            <div class="honor-title-center">
              <h1 class="honor-school-khmer">${settings.schoolNameKm || 'សាលារៀន ខ្មែរ-ចិន ភៃហួរ'}</h1>
              <h2 class="honor-school-chinese">${settings.schoolNameCn || '磅湛省公立培华学校'}</h2>
              <div class="honor-banner">
                <span class="honor-star">★</span>
                <span class="honor-banner-text">${bannerTitle}</span>
                <span class="honor-star">★</span>
              </div>
              <div class="honor-meta">
                <span>ថ្នាក់ / 班级: <strong>${classLabel}</strong></span>
                <span>•</span>
                <span>${termLabel}</span>
                <span>•</span>
                <span>ឆ្នាំសិក្សា / 学年: <strong>${settings.academicYear || '2025 - 2026'}</strong></span>
              </div>
            </div>
            <div class="honor-seal-box">
              <img src="${settings.schoolSeal || 'assets/images/school-seal.png'}" alt="School Seal" class="honor-school-seal">
            </div>
          </div>

          <!-- Podium / Top 3 Cards Grid -->
          <div class="honor-podium-grid">
            ${displayList.map((item, idx) => {
              const rank = item.rank;
              let medalIcon = '🎖️';
              let badgeColorClass = 'badge-other';
              let rankTitle = `ចំណាត់ថ្នាក់ទី ${rank} / 第 ${rank} 名`;

              if (rank === 1) {
                medalIcon = '🥇';
                badgeColorClass = 'badge-gold';
                rankTitle = 'ជើងឯកឆ្នើមលេខ ១ / 第一名';
              } else if (rank === 2) {
                medalIcon = '🥈';
                badgeColorClass = 'badge-silver';
                rankTitle = 'សិស្សឆ្នើមលេខ ២ / 第二名';
              } else if (rank === 3) {
                medalIcon = '🥉';
                badgeColorClass = 'badge-bronze';
                rankTitle = 'សិស្សឆ្នើមលេខ ៣ / 第三名';
              }

              const photoHtml = item.student.photo
                ? `<img src="${item.student.photo}" alt="${item.student.khmerName}" class="honor-student-photo">`
                : `<div class="honor-student-avatar">${AVATAR_MAP[item.student.avatar] || '👧'}</div>`;

              return `
                <div class="honor-student-card ${badgeColorClass}">
                  <div class="honor-card-ribbon">
                    <span class="ribbon-medal">${medalIcon}</span>
                    <span class="ribbon-title">${rankTitle}</span>
                  </div>
                  <div class="honor-photo-wrapper">
                    ${photoHtml}
                  </div>
                  <div class="honor-student-info">
                    <div class="honor-student-km">${item.student.khmerName}</div>
                    <div class="honor-student-cn">${item.student.chineseName || ''}</div>
                    <div class="honor-student-id">ID: ${item.student.id}</div>
                  </div>
                  <div class="honor-scores-box">
                    <div class="score-pill">
                      <span class="lbl">ពិន្ទុសរុប (总分):</span>
                      <strong class="val">${item.total.toFixed(1)} / ${maxScorePossible}</strong>
                    </div>
                    <div class="score-pill">
                      <span class="lbl">មធ្យមភាគ (平均):</span>
                      <strong class="val avg-val">${item.average.toFixed(2)}</strong>
                    </div>
                    <div class="score-pill">
                      <span class="lbl">និទ្ទេស (等级):</span>
                      <span class="badge badge-grade-excellent">优 / ល្អប្រសើរ</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          ${displayList.length === 0 ? `
            <div style="text-align: center; padding: 40px; color: var(--text-muted); font-size: 16px;">
              មិនទាន់មានទិន្នន័យពិន្ទុសម្រាប់ថ្នាក់នេះនៅឡើយទេ។ សូមចូលទៅកាន់ទំព័រ "បញ្ចូលពិន្ទុ" ដើម្បីបញ្ចូលពិន្ទុសិន!
            </div>
          ` : ''}

          <!-- Footer with Signatures & Seal -->
          <div class="honor-footer">
            <div class="sig-block">
              <div class="sig-role">គ្រូបន្ទុកថ្នាក់ / 班主任</div>
              <div class="sig-space">
                ${settings.teacherSignature ? `<img src="${settings.teacherSignature}" alt="Signature" class="sig-img">` : ''}
              </div>
              <div class="sig-name"><strong>${settings.teacherNameKm || 'អ្នកគ្រូ ចាង មីលីង'}</strong></div>
              <div class="sig-cn">${settings.teacherNameCn || '江美玲 老师'}</div>
            </div>

            <div class="honor-quote-box">
              <div class="honor-quote-text">« ការខិតខំប្រឹងប្រែងនៅថ្ងៃនេះ គឺជាគ្រឹះនៃភាពជោគជ័យនៅថ្ងៃអនាគត »</div>
              <div class="honor-quote-cn">今日勤奋笃学，明日展翅高飞！</div>
            </div>

            <div class="sig-block principal-block">
              <div class="sig-role">នាយិកាសាលា / 校长</div>
              <div class="sig-space">
                <img src="${settings.schoolSeal || 'assets/images/school-seal.png'}" alt="Official Seal" class="footer-seal-stamp">
                ${settings.principalSignature ? `<img src="${settings.principalSignature}" alt="Principal Signature" class="sig-img">` : ''}
              </div>
              <div class="sig-name"><strong>${settings.principalNameKm || 'លោកស្រី ថេង សោភា'}</strong></div>
              <div class="sig-cn">${settings.principalNameCn || '秦少萍 校长'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

window.HonorRollModule = HonorRollModule;
