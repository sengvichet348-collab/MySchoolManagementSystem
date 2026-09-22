/**
 * Chinese Kindergarten Score Management System
 * Attendance Tracking & Evaluation Module (考勤管理系统)
 * Manages daily, monthly, and semester attendance records with automatic syncing to Report Cards
 */

const AttendanceModule = {
  currentClass: 'K1',
  currentTerm: 'term1',
  currentMonth: 'all',
  currentViewMode: 'summary',
  dailyData: null,

  init() {
    this.bindEvents();
    this.renderAttendanceTable();

    window.addEventListener('attendance-changed', () => {
      this.renderAttendanceTable();
    });
  },

  bindEvents() {
    const classSelect = document.getElementById('attendance-class-select');
    if (classSelect) {
      classSelect.value = this.currentClass;
      classSelect.addEventListener('change', (e) => {
        this.currentClass = e.target.value;
        this.renderAttendanceTable();
      });
    }

    const termSelect = document.getElementById('attendance-term-select');
    if (termSelect) {
      termSelect.value = this.currentTerm;
      termSelect.addEventListener('change', (e) => {
        this.currentTerm = e.target.value;
        this.renderAttendanceTable();
      });
    }

    const monthSelect = document.getElementById('attendance-month-select');
    if (monthSelect) {
      monthSelect.value = this.currentMonth;
      monthSelect.addEventListener('change', (e) => {
        this.currentMonth = e.target.value;
        this.renderAttendanceTable();
      });
    }

    const saveBtn = document.getElementById('btn-save-attendance');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveCurrentAttendance();
      });
    }

    const markAllBtn = document.getElementById('btn-mark-all-present');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => {
        this.markAllStudentsPresent();
      });
    }

    const printAttBtn = document.getElementById('btn-print-attendance');
    if (printAttBtn) {
      printAttBtn.addEventListener('click', () => {
        this.printAttendanceSheet();
      });
    }

    const exportCsvBtn = document.getElementById('btn-export-attendance-csv');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        this.exportAttendanceCSV();
      });
    }

    // View Mode Toggle (Summary vs Day-by-Day)
    const btnSummary = document.getElementById('btn-att-view-summary');
    const btnDaily = document.getElementById('btn-att-view-daily');
    const summaryContainer = document.getElementById('att-summary-table-container');
    const summaryStats = document.getElementById('att-summary-stats-strip');
    const dailyContainer = document.getElementById('att-daily-table-container');

    if (btnSummary && btnDaily) {
      btnSummary.addEventListener('click', () => {
        this.currentViewMode = 'summary';
        btnSummary.classList.add('active');
        btnDaily.classList.remove('active');
        if (summaryContainer) summaryContainer.style.display = 'block';
        if (summaryStats) summaryStats.style.display = 'grid';
        if (dailyContainer) dailyContainer.style.display = 'none';
        this.renderAttendanceTable();
      });

      btnDaily.addEventListener('click', () => {
        this.currentViewMode = 'daily';
        btnDaily.classList.add('active');
        btnSummary.classList.remove('active');
        if (summaryContainer) summaryContainer.style.display = 'none';
        if (summaryStats) summaryStats.style.display = 'none';
        if (dailyContainer) dailyContainer.style.display = 'block';
        this.renderDailyAttendance();
      });
    }

    const btnDailyAllPresent = document.getElementById('btn-daily-mark-today-present');
    if (btnDailyAllPresent) {
      btnDailyAllPresent.addEventListener('click', () => {
        this.markDailyAllPresent();
      });
    }

    const btnDailySave = document.getElementById('btn-daily-save');
    if (btnDailySave) {
      btnDailySave.addEventListener('click', () => {
        this.saveDailyAttendance();
      });
    }
  },

  renderAttendanceTable() {
    const classSelect = document.getElementById('attendance-class-select');
    const termSelect = document.getElementById('attendance-term-select');
    const monthSelect = document.getElementById('attendance-month-select');
    if (classSelect) this.currentClass = classSelect.value;
    if (termSelect) this.currentTerm = termSelect.value;
    if (monthSelect) this.currentMonth = monthSelect.value;

    if (this.currentViewMode === 'daily') {
      this.renderDailyAttendance();
      return;
    }

    const tbody = document.getElementById('attendance-table-body');
    if (!tbody) return;

    const students = Storage.getStudents().filter(s => s.classGrade === this.currentClass);
    const lang = Storage.getLanguage();
    const t = translations[lang] || translations.km;

    if (students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
            <div>${t.noStudentsFound || 'មិនមានសិស្សក្នុងថ្នាក់នេះឡើយ'}</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = students.map((s, idx) => {
      const att = Storage.getAttendanceRecord(s.id, this.currentTerm, this.currentMonth);
      const totalDays = (att.present || 0) + (att.excused || 0) + (att.unexcused || 0);
      const rate = totalDays > 0 ? Math.round(((att.present || 0) / totalDays) * 100) : 100;

      let rateBadgeClass = 'badge-grade-excellent';
      let alertBadge = '';
      if (rate < 80) {
        rateBadgeClass = 'badge-grade-needs';
        alertBadge = `<span class="badge badge-danger" style="font-size: 10px; margin-top: 2px;">⚠️ អវត្តមានច្រើន</span>`;
      } else if (rate < 90) {
        rateBadgeClass = 'badge-grade-fair';
      } else if (rate < 95) {
        rateBadgeClass = 'badge-grade-good';
      }

      const photoHtml = s.photo 
        ? `<img src="${s.photo}" alt="${s.khmerName}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-light);">`
        : `<span style="font-size: 20px;">${AVATAR_MAP[s.avatar] || '👦'}</span>`;

      return `
        <tr data-student-id="${s.id}">
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              ${photoHtml}
              <div>
                <div style="font-weight: 700; color: var(--text-main);">${s.khmerName}</div>
                <div style="font-size: 12px; color: var(--text-muted); font-family: var(--font-chinese);">${s.chineseName} (${s.id})</div>
              </div>
            </div>
          </td>
          <td style="text-align: center;">
            <input type="number" min="0" max="250" class="attendance-input input-present" 
                   data-type="present" value="${att.present !== undefined ? att.present : 100}" 
                   oninput="AttendanceModule.recalcAttendanceRow(this)">
          </td>
          <td style="text-align: center;">
            <input type="number" min="0" max="100" class="attendance-input input-excused" 
                   data-type="excused" value="${att.excused || 0}" 
                   oninput="AttendanceModule.recalcAttendanceRow(this)">
          </td>
          <td style="text-align: center;">
            <input type="number" min="0" max="100" class="attendance-input input-unexcused" 
                   data-type="unexcused" value="${att.unexcused || 0}" 
                   oninput="AttendanceModule.recalcAttendanceRow(this)">
          </td>
          <td style="text-align: center;">
            <input type="number" min="0" max="100" class="attendance-input input-late" 
                   data-type="late" value="${att.late || 0}">
          </td>
          <td style="text-align: center; font-weight: 700;" id="att-total-${s.id}">
            ${totalDays}
          </td>
          <td style="text-align: center;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <span class="badge ${rateBadgeClass}" id="rate-badge-${s.id}">${rate}%</span>
              ${alertBadge}
            </div>
          </td>
          <td style="text-align: center;">
            <button type="button" class="btn btn-sm btn-secondary" onclick="AttendanceModule.resetStudentAttendance('${s.id}')" title="កំណត់ឡើងវិញ 100% / 重置">
              🔄 ពេញ
            </button>
          </td>
        </tr>
      `;
    }).join('');

    this.updateSummaryBadges();
  },

  recalcAttendanceRow(input) {
    const tr = input.closest('tr');
    if (!tr) return;
    const studentId = tr.dataset.studentId;
    const present = parseInt(tr.querySelector('[data-type="present"]')?.value || '0', 10);
    const excused = parseInt(tr.querySelector('[data-type="excused"]')?.value || '0', 10);
    const unexcused = parseInt(tr.querySelector('[data-type="unexcused"]')?.value || '0', 10);

    const total = present + excused + unexcused;
    const rate = total > 0 ? Math.round((present / total) * 100) : 100;

    const totalEl = document.getElementById(`att-total-${studentId}`);
    const rateEl = document.getElementById(`att-rate-${studentId}`);

    if (totalEl) totalEl.textContent = total;
    if (rateEl) {
      let badgeClass = 'badge-grade-excellent';
      if (rate < 80) badgeClass = 'badge-grade-needs';
      else if (rate < 90) badgeClass = 'badge-grade-fair';
      else if (rate < 95) badgeClass = 'badge-grade-good';
      rateEl.innerHTML = `<span class="badge ${badgeClass}">${rate}%</span>`;
    }

    this.updateSummaryBadges();
  },

  resetStudentAttendance(studentId) {
    const tr = document.querySelector(`tr[data-student-id="${studentId}"]`);
    if (tr) {
      const p = tr.querySelector('[data-type="present"]');
      const e = tr.querySelector('[data-type="excused"]');
      const u = tr.querySelector('[data-type="unexcused"]');
      const l = tr.querySelector('[data-type="late"]');
      if (p) p.value = 100;
      if (e) e.value = 0;
      if (u) u.value = 0;
      if (l) l.value = 0;
      this.recalcAttendanceRow(p);
    }
  },

  markAllStudentsPresent() {
    const rows = document.querySelectorAll('#attendance-table-body tr[data-student-id]');
    rows.forEach(tr => {
      const p = tr.querySelector('[data-type="present"]');
      const e = tr.querySelector('[data-type="excused"]');
      const u = tr.querySelector('[data-type="unexcused"]');
      const l = tr.querySelector('[data-type="late"]');
      if (p) p.value = 100;
      if (e) e.value = 0;
      if (u) u.value = 0;
      if (l) l.value = 0;
      this.recalcAttendanceRow(p);
    });

    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast('បានសម្គាល់វត្តមានពេញ ១០០% សម្រាប់សិស្សទាំងអស់ក្នុងថ្នាក់!', 'success');
    }
  },

  updateSummaryBadges() {
    const rows = document.querySelectorAll('#attendance-table-body tr[data-student-id]');
    let totalPresent = 0, totalExcused = 0, totalUnexcused = 0, totalLate = 0;

    rows.forEach(tr => {
      totalPresent += parseInt(tr.querySelector('[data-type="present"]')?.value || '0', 10);
      totalExcused += parseInt(tr.querySelector('[data-type="excused"]')?.value || '0', 10);
      totalUnexcused += parseInt(tr.querySelector('[data-type="unexcused"]')?.value || '0', 10);
      totalLate += parseInt(tr.querySelector('[data-type="late"]')?.value || '0', 10);
    });

    const elP = document.getElementById('stat-att-present');
    const elE = document.getElementById('stat-att-excused');
    const elU = document.getElementById('stat-att-unexcused');
    const elL = document.getElementById('stat-att-late');

    if (elP) elP.textContent = totalPresent;
    if (elE) elE.textContent = totalExcused;
    if (elU) elU.textContent = totalUnexcused;
    if (elL) elL.textContent = totalLate;
  },

  saveCurrentAttendance() {
    const rows = document.querySelectorAll('#attendance-table-body tr[data-student-id]');
    const records = {};

    rows.forEach(tr => {
      const studentId = tr.dataset.studentId;
      const present = parseInt(tr.querySelector('[data-type="present"]')?.value || '0', 10);
      const excused = parseInt(tr.querySelector('[data-type="excused"]')?.value || '0', 10);
      const unexcused = parseInt(tr.querySelector('[data-type="unexcused"]')?.value || '0', 10);
      const late = parseInt(tr.querySelector('[data-type="late"]')?.value || '0', 10);

      records[studentId] = { present, excused, unexcused, late };
    });

    Storage.saveClassAttendance(this.currentClass, this.currentTerm, this.currentMonth, records);

    // Also update overall semester attendance if currently viewing 'all'
    if (this.currentMonth === 'all') {
      Object.keys(records).forEach(sId => {
        Storage.saveStudentAttendance(sId, this.currentTerm, 'all', records[sId]);
      });
    }

    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast('✅ រក្សាទុកវត្តមានសិស្សដោយជោគជ័យ!', 'success');
    }
  },

  exportAttendanceCSV() {
    Storage.exportAttendanceToCSV(this.currentClass, this.currentTerm, this.currentMonth);
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast('📥 បានទាញយកស្ថិតិវត្តមាន CSV ជោគជ័យ!', 'success');
    }
  },

  printAttendanceSheet() {
    const students = Storage.getStudents().filter(s => s.classGrade === this.currentClass);
    if (students.length === 0) {
      alert(`មិនមានសិស្សក្នុងថ្នាក់ ${this.currentClass} ទេ!`);
      return;
    }

    const settings = Storage.getSettings();
    const previewContainer = document.getElementById('report-card-preview-area');
    if (!previewContainer) return;

    const classLabelMap = {
      'K1': 'ថ្នាក់កុមារដ្ឋាន (幼小班 - K1)',
      'K2': 'មត្តេយ្យកម្រិតទាប (幼中班 - K2)',
      'K3': 'មត្តេយ្យកម្រិតខ្ពស់ (幼大班 - K3)'
    };
    const classLabel = classLabelMap[this.currentClass] || this.currentClass;

    const monthLabelMap = {
      'all': 'សរុបទាំងឆមាស (全学期汇总)',
      'month1': 'ខែតុលា (十月份)',
      'month2': 'ខែវិច្ឆិកា (十一月份)',
      'month3': 'ខែធ្នូ (十二月份)',
      'month4': 'ខែមករា (一月份)',
      'month5': 'ខែកុម្ភៈ (二月份)'
    };
    const monthLabel = monthLabelMap[this.currentMonth] || this.currentMonth;

    const termLabelMap = {
      'term1': 'ឆមាសទី១ (第一学期)',
      'term2': 'ឆមាសទី២ (第二学期)'
    };
    const termLabel = termLabelMap[this.currentTerm] || this.currentTerm;

    const now = new Date();
    const kmMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    const dateKm = `ថ្ងៃទី ${now.getDate()} ខែ ${kmMonths[now.getMonth()]} ឆ្នាំ ${now.getFullYear()}`;
    const dateCn = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日`;

    const officialSeal = (window.ReportsModule && ReportsModule.getOfficialSealSvg)
      ? ReportsModule.getOfficialSealSvg(settings) : '';

    let sumPresent = 0, sumExcused = 0, sumUnexcused = 0, sumLate = 0;

    const printHtml = `
      <div class="attendance-sheet-page page-break">
        <div class="roster-header">
          <div class="roster-school-logo">
            <img src="${settings.schoolLogo || 'assets/images/school-logo.png'}" alt="Logo">
          </div>
          <div class="roster-school-titles">
            <div class="roster-school-cn">${settings.schoolNameCn || '磅湛省公立培华学校'}</div>
            <div class="roster-school-km">${settings.schoolNameKm || 'សាលារៀន ខ្មែរ-ចិន ភៃហួរ'}</div>
          </div>
        </div>

        <div class="roster-main-title">学生月度出勤统计花名册</div>
        <div class="roster-sub-title">តារាងស្រង់វត្តមានសិស្សផ្លូវការប្រចាំខែ</div>

        <div class="roster-meta-bar">
          <div>ថ្នាក់ / 班级: <strong>${classLabel}</strong></div>
          <div>ឆមាស & ខែ / 周期: <strong>${termLabel} • ${monthLabel}</strong></div>
          <div>ឆ្នាំសិក្សា / 学年: <strong>${settings.academicYear || '2025-2026'}</strong></div>
          <div>សិស្សសរុប: <strong>${students.length} នាក់</strong></div>
        </div>

        <table class="roster-table att-print-table">
          <thead>
            <tr>
              <th style="width: 40px;">ល.រ<br>序号</th>
              <th style="width: 85px;">អត្តលេខ<br>学号</th>
              <th style="text-align: left; padding-left: 8px;">ឈ្មោះខ្មែរ<br>高棉姓名</th>
              <th style="text-align: left; padding-left: 8px;">ឈ្មោះចិន<br>中文姓名</th>
              <th style="width: 60px;">ភេទ<br>性别</th>
              <th style="width: 90px; color: #059669;">វត្តមានពេញ<br>出勤 (天)</th>
              <th style="width: 90px; color: #D97706;">មានច្បាប់<br>请假 (天)</th>
              <th style="width: 90px; color: #DC2626;">ឥតច្បាប់<br>旷课 (天)</th>
              <th style="width: 80px; color: #4F46E5;">យឺត<br>迟到 (次)</th>
              <th style="width: 95px;">អត្រាវត្តមាន<br>出勤率</th>
              <th style="width: 100px;">ការវាយតម្លៃ<br>考勤评定</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((s, idx) => {
              const att = Storage.getAttendanceRecord(s.id, this.currentTerm, this.currentMonth);
              const totalDays = (att.present || 0) + (att.excused || 0) + (att.unexcused || 0);
              const rate = totalDays > 0 ? Math.round(((att.present || 0) / totalDays) * 100) : 100;
              sumPresent += (att.present || 0);
              sumExcused += (att.excused || 0);
              sumUnexcused += (att.unexcused || 0);
              sumLate += (att.late || 0);

              let rateText = "ល្អប្រសើរ / 优秀";
              if (rate < 85) rateText = "ត្រូវកែលម្អ / 待提高";
              else if (rate < 95) rateText = "ល្អ / 良好";

              return `
                <tr>
                  <td class="center">${idx + 1}</td>
                  <td class="center" style="font-family: monospace; font-weight: 700; color: #1E3A8A;">${s.id}</td>
                  <td style="font-weight: 700; padding-left: 8px;">${s.khmerName}</td>
                  <td style="font-family: var(--font-chinese); font-weight: 800; padding-left: 8px;">${s.chineseName}</td>
                  <td class="center">${s.gender === 'female' ? 'ស្រី/女' : 'ប្រុស/男'}</td>
                  <td class="center" style="font-weight: 700; color: #059669;">${att.present || 0}</td>
                  <td class="center" style="font-weight: 700; color: #D97706;">${att.excused || 0}</td>
                  <td class="center" style="font-weight: 700; color: #DC2626;">${att.unexcused || 0}</td>
                  <td class="center" style="font-weight: 700; color: #4F46E5;">${att.late || 0}</td>
                  <td class="center" style="font-weight: 800; font-family: monospace;">${rate}%</td>
                  <td class="center" style="font-size: 11px;">${rateText}</td>
                </tr>
              `;
            }).join('')}
            <tr style="background: #F1F5F9; font-weight: 800;">
              <td colspan="5" style="text-align: right; padding-right: 12px;">សរុបទាំងថ្នាក់ (班级总计):</td>
              <td class="center" style="color: #059669;">${sumPresent}</td>
              <td class="center" style="color: #D97706;">${sumExcused}</td>
              <td class="center" style="color: #DC2626;">${sumUnexcused}</td>
              <td class="center" style="color: #4F46E5;">${sumLate}</td>
              <td class="center" colspan="2">មធ្យម: ${Math.round((sumPresent / Math.max(1, sumPresent + sumExcused + sumUnexcused)) * 100)}%</td>
            </tr>
          </tbody>
        </table>

        <div class="roster-footer">
          <div class="roster-sign-col">
            <div class="roster-sign-space">
              <div class="roster-seal-overlay">${officialSeal}</div>
            </div>
            <div class="roster-sign-line">
              <div>នាយិកាសាលា / 校长</div>
              <div style="font-weight: 700; margin-top: 2px;">${settings.principalNameKm || 'លោកស្រី ថេង សោភា'} (${settings.principalNameCn || '秦少萍'})</div>
            </div>
          </div>

          <div class="roster-date-center">
            <div>${dateKm}</div>
            <div style="font-family: var(--font-chinese);">${dateCn}</div>
          </div>

          <div class="roster-sign-col">
            <div class="roster-sign-space"></div>
            <div class="roster-sign-line">
              <div>គ្រូបន្ទុកថ្នាក់ / 班主任</div>
              <div style="font-weight: 700; margin-top: 2px;">${settings.teacherNameKm || 'អ្នកគ្រូ ចាង មីលីង'} (${settings.teacherNameCn || '江美玲'})</div>
            </div>
          </div>
        </div>
      </div>
    `;

    App.navigateTo('reports');
    previewContainer.innerHTML = printHtml;

    setTimeout(() => {
      if (typeof ElectronBridge !== 'undefined') {
        ElectronBridge.printDocument();
      } else {
        window.print();
      }
      setTimeout(() => {
        if (window.ReportsModule && ReportsModule.currentStudentId) {
          ReportsModule.renderReportCard(ReportsModule.currentStudentId);
        }
      }, 500);
    }, 300);
  },

  // ==========================================
  // DAY-BY-DAY ATTENDANCE GRID (1 - 30)
  // ==========================================
  renderDailyAttendance() {
    const table = document.getElementById('table-attendance-daily');
    if (!table) return;

    const students = Storage.getStudents().filter(s => s.classGrade === this.currentClass);
    const monthKey = this.currentMonth === 'all' ? 'month1' : this.currentMonth;
    this.dailyData = Storage.getDailyAttendance(this.currentClass, this.currentTerm, monthKey);

    let theadHtml = `
      <thead>
        <tr>
          <th style="width: 35px; text-align: center;">ល.រ</th>
          <th style="min-width: 140px; position: sticky; left: 0; background: var(--bg-surface-elevated); z-index: 2;">ឈ្មោះសិស្ស (姓名)</th>
    `;

    for (let d = 1; d <= 30; d++) {
      const isWeekend = (d % 7 === 0 || d % 7 === 6);
      theadHtml += `<th style="width: 26px; text-align: center; padding: 6px 2px; ${isWeekend ? 'background: rgba(239,68,68,0.08); color: #EF4444;' : ''}">${d}</th>`;
    }

    theadHtml += `
          <th style="width: 36px; text-align: center; color: #10B981;">P</th>
          <th style="width: 36px; text-align: center; color: #F59E0B;">E</th>
          <th style="width: 36px; text-align: center; color: #EF4444;">U</th>
          <th style="width: 36px; text-align: center; color: #6366F1;">L</th>
        </tr>
      </thead>
    `;

    let tbodyHtml = '<tbody>';
    students.forEach((s, idx) => {
      const sDays = this.dailyData[s.id] || {};
      let pCount = 0, eCount = 0, uCount = 0, lCount = 0;

      let daysCells = '';
      for (let d = 1; d <= 30; d++) {
        const val = sDays[d] || '';
        if (val === 'P') pCount++;
        else if (val === 'E') eCount++;
        else if (val === 'U') uCount++;
        else if (val === 'L') lCount++;

        let badgeStyle = 'color: var(--text-light);';
        if (val === 'P') badgeStyle = 'background: rgba(16,185,129,0.15); color: #059669; font-weight: bold;';
        else if (val === 'E') badgeStyle = 'background: rgba(245,158,11,0.15); color: #d97706; font-weight: bold;';
        else if (val === 'U') badgeStyle = 'background: rgba(239,68,68,0.15); color: #dc2626; font-weight: bold;';
        else if (val === 'L') badgeStyle = 'background: rgba(99,102,241,0.15); color: #4f46e5; font-weight: bold;';

        daysCells += `
          <td id="daily-${s.id}-${d}" onclick="AttendanceModule.toggleDailyCell('${s.id}', ${d})"
            style="text-align: center; cursor: pointer; padding: 5px 2px; user-select: none; border: 1px solid var(--border-light); ${badgeStyle}"
            title="ថ្ងៃ ${d}: ${val || 'គ្មាន'} (ចុចដើម្បីប្តូរ)">
            ${val || '-'}
          </td>
        `;
      }

      tbodyHtml += `
        <tr>
          <td style="text-align: center; font-weight: 600;">${idx + 1}</td>
          <td style="position: sticky; left: 0; background: var(--bg-surface); z-index: 1; border-right: 2px solid var(--border-light);">
            <strong>${s.khmerName}</strong>
            <span style="font-family: var(--font-chinese); font-size: 11px; color: var(--text-muted); margin-left: 4px;">${s.chineseName}</span>
          </td>
          ${daysCells}
          <td style="text-align: center; font-weight: 700; color: #10B981;" id="daily-sum-p-${s.id}">${pCount}</td>
          <td style="text-align: center; font-weight: 700; color: #F59E0B;" id="daily-sum-e-${s.id}">${eCount}</td>
          <td style="text-align: center; font-weight: 700; color: #EF4444;" id="daily-sum-u-${s.id}">${uCount}</td>
          <td style="text-align: center; font-weight: 700; color: #6366F1;" id="daily-sum-l-${s.id}">${lCount}</td>
        </tr>
      `;
    });
    tbodyHtml += '</tbody>';

    table.innerHTML = theadHtml + tbodyHtml;
  },

  toggleDailyCell(studentId, day) {
    if (!this.dailyData || !this.dailyData[studentId]) {
      if (!this.dailyData) this.dailyData = {};
      if (!this.dailyData[studentId]) this.dailyData[studentId] = {};
    }

    const currentVal = this.dailyData[studentId][day] || '';
    let nextVal = 'P';
    if (currentVal === 'P') nextVal = 'E';
    else if (currentVal === 'E') nextVal = 'U';
    else if (currentVal === 'U') nextVal = 'L';
    else if (currentVal === 'L') nextVal = '';
    else nextVal = 'P';

    this.dailyData[studentId][day] = nextVal;

    const cell = document.getElementById(`daily-${studentId}-${day}`);
    if (cell) {
      cell.textContent = nextVal || '-';
      let badgeStyle = 'color: var(--text-light);';
      if (nextVal === 'P') badgeStyle = 'background: rgba(16,185,129,0.15); color: #059669; font-weight: bold;';
      else if (nextVal === 'E') badgeStyle = 'background: rgba(245,158,11,0.15); color: #d97706; font-weight: bold;';
      else if (nextVal === 'U') badgeStyle = 'background: rgba(239,68,68,0.15); color: #dc2626; font-weight: bold;';
      else if (nextVal === 'L') badgeStyle = 'background: rgba(99,102,241,0.15); color: #4f46e5; font-weight: bold;';
      cell.setAttribute('style', `text-align: center; cursor: pointer; padding: 5px 2px; user-select: none; border: 1px solid var(--border-light); ${badgeStyle}`);
    }

    // Recalculate row sums
    const sDays = this.dailyData[studentId];
    let pCount = 0, eCount = 0, uCount = 0, lCount = 0;
    Object.values(sDays).forEach(v => {
      if (v === 'P') pCount++;
      else if (v === 'E') eCount++;
      else if (v === 'U') uCount++;
      else if (v === 'L') lCount++;
    });

    const elP = document.getElementById(`daily-sum-p-${studentId}`);
    const elE = document.getElementById(`daily-sum-e-${studentId}`);
    const elU = document.getElementById(`daily-sum-u-${studentId}`);
    const elL = document.getElementById(`daily-sum-l-${studentId}`);
    if (elP) elP.textContent = pCount;
    if (elE) elE.textContent = eCount;
    if (elU) elU.textContent = uCount;
    if (elL) elL.textContent = lCount;
  },

  markDailyAllPresent() {
    if (!this.dailyData) return;
    const students = Storage.getStudents().filter(s => s.classGrade === this.currentClass);
    students.forEach(s => {
      if (!this.dailyData[s.id]) this.dailyData[s.id] = {};
      for (let d = 1; d <= 30; d++) {
        const dayOfWeek = (d % 7);
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          this.dailyData[s.id][d] = 'P';
        }
      }
    });

    this.renderDailyAttendance();
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast("✨ បានកំណត់វត្តមាន (P) ជូនសិស្សគ្រប់គ្នា!", "success");
    }
  },

  saveDailyAttendance() {
    if (!this.dailyData) return;
    const monthKey = this.currentMonth === 'all' ? 'month1' : this.currentMonth;
    const res = Storage.saveDailyAttendance(this.currentClass, this.currentTerm, monthKey, this.dailyData);

    if (res.success) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast("✅ បានរក្សាទុកវត្តមានប្រចាំថ្ងៃ និងគណនាសរុបជោគជ័យ!", "success");
        App.updateDashboardStats();
      }
    } else {
      alert("កំហុសក្នុងការរក្សាទុក៖ " + res.error);
    }
  }
};

window.AttendanceModule = AttendanceModule;
