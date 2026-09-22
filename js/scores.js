/**
 * Chinese Kindergarten Score Management System
 * Scores Entry, Evaluation & Dynamic Curriculum Module (成绩管理与课程体系)
 * Official Curriculum matching Timetable (课程表) with Dynamic Subject Extensibility
 */

function getSubjectsForClass(classGrade) {
  return typeof Storage !== 'undefined' ? Storage.getSubjects() : [];
}

const PRESET_COMMENTS = [
  { text: "ឆ្លាតវៃ រួសរាយ និងឧស្សាហ៍ព្យាយាម / 聪明活泼，善于表达，学习认真" },
  { text: "យកចិត្តទុកដាក់ស្ដាប់ និងចេះជួយមិត្តភក្តិ / 上课专注，乐于助人，各科成绩优异" },
  { text: "មានទេពកោសល្យខាងគូររូប និងសិល្បៈតន្ត្រី / 动手能力强，有艺术天赋，礼貌待人" },
  { text: "សុភាពរាបសារ ស្តាប់បង្គាប់គ្រូ / 文静乖巧，遵守纪律，是一名好学生" },
  { text: "មានការរីកចម្រើន ត្រូវហាត់និយាយបន្ថែម / 表现有进步，需多在日常生活中开口练习" }
];

const ScoreModule = {
  currentClass: 'K1',
  currentTerm: 'term1',
  activeCommentStudentId: null,

  init() {
    this.bindEvents();
    this.bindSubjectManager();
    this.bindScoreCsv();
    this.bindBatchFill();
    this.refreshClassScores();

    window.addEventListener('subjects-changed', () => {
      this.refreshClassScores();
    });
  },

  bindEvents() {
    const classSelect = document.getElementById('score-class-select');
    if (classSelect) {
      classSelect.value = this.currentClass;
      classSelect.addEventListener('change', (e) => {
        this.currentClass = e.target.value;
        this.refreshClassScores();
      });
    }

    const termSelect = document.getElementById('score-term-select');
    if (termSelect) {
      termSelect.value = this.currentTerm;
      termSelect.addEventListener('change', (e) => {
        this.currentTerm = e.target.value;
        this.refreshClassScores();
      });
    }

    const saveBtn = document.getElementById('btn-save-scores');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveCurrentScores();
      });
    }

    const exportBtn = document.getElementById('btn-export-scores-csv');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        Storage.exportToCSV(this.currentClass, this.currentTerm);
      });
    }

    const smartCommentsBtn = document.getElementById('btn-smart-comments');
    if (smartCommentsBtn) {
      smartCommentsBtn.addEventListener('click', () => {
        this.generateSmartComments();
      });
    }
  },

  bindSubjectManager() {
    const btnManageSubjects = document.getElementById('btn-manage-subjects');
    const modal = document.getElementById('modal-subjects-manager');
    const btnClose = document.getElementById('btn-close-subjects-modal');
    const btnAdd = document.getElementById('btn-add-subject-row');
    const btnReset = document.getElementById('btn-reset-subjects');

    if (btnManageSubjects && modal) {
      btnManageSubjects.addEventListener('click', () => {
        this.renderSubjectManagerList();
        modal.classList.add('open');
      });
    }

    if (btnClose && modal) {
      btnClose.addEventListener('click', () => {
        modal.classList.remove('open');
      });
    }

    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        this.showAddSubjectForm();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm("តើលោកគ្រូចង់កំណត់មុខវិជ្ជាទៅតាមកាលវិភាគដើម (៦ មុខវិជ្ជា) វិញឬទេ? / 是否恢复默认科目？")) {
          Storage.resetSubjectsToDefault();
          this.renderSubjectManagerList();
          this.refreshClassScores();
          if (typeof App !== 'undefined' && App.showToast) {
            App.showToast("បានកំណត់មុខវិជ្ជាទៅលំនាំដើមវិញ! / Reset to default curriculum!", "success");
          }
        }
      });
    }
  },

  renderSubjectManagerList() {
    const container = document.getElementById('subjects-manager-list');
    if (!container) return;

    const subjects = Storage.getSubjects();
    container.innerHTML = subjects.map((sub, idx) => `
      <div class="subject-row-item" data-key="${sub.key}">
        <div class="subject-row-color" style="background: ${sub.color || '#4F46E5'}; width: 14px; height: 14px; border-radius: 50%;"></div>
        <div class="subject-row-details" style="flex: 1;">
          <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${sub.nameKm} <span style="font-family: var(--font-chinese); color: var(--primary); font-size: 13px;">(${sub.nameCn})</span></div>
          <div style="font-size: 12px; color: var(--text-muted);">ពិន្ទុពេញ (Max Score): <strong>${sub.maxScore || 100}</strong> | អក្សរកាត់: ${sub.shortKm} (${sub.shortCn})</div>
        </div>
        <div class="subject-row-actions">
          <button type="button" class="btn btn-sm btn-secondary" onclick="ScoreModule.editSubjectPrompt('${sub.key}')" title="កែសម្រួល / 编辑">
            ✏️
          </button>
          <button type="button" class="btn btn-sm btn-danger" onclick="ScoreModule.deleteSubjectPrompt('${sub.key}')" title="លុប / 删除">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
  },

  showAddSubjectForm() {
    const nameKm = prompt("បញ្ចូលឈ្មោះមុខវិជ្ជាជាភាសាខ្មែរ (ឧ. គំនូរ និងសិប្បកម្ម) :");
    if (!nameKm || !nameKm.trim()) return;

    const nameCn = prompt("បញ្ចូលឈ្មោះមុខវិជ្ជាជាភាសាចិន (例如：美术与手工) :") || nameKm;
    const maxScore = parseInt(prompt("បញ្ចូលពិន្ទុពេញ (ឧ. 100 ឬ 10) :", "100"), 10) || 100;

    const key = 'sub_' + Date.now().toString(36);
    const newSubject = {
      key,
      nameKm: nameKm.trim(),
      nameCn: nameCn.trim(),
      shortKm: nameKm.trim().slice(0, 4),
      shortCn: nameCn.trim().slice(0, 2),
      maxScore,
      color: '#8B5CF6'
    };

    Storage.addSubject(newSubject);
    this.renderSubjectManagerList();
    this.refreshClassScores();
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`បានបន្ថែមមុខវិជ្ជា "${nameKm}" ដោយជោគជ័យ!`, "success");
    }
  },

  editSubjectPrompt(key) {
    const subjects = Storage.getSubjects();
    const sub = subjects.find(s => s.key === key);
    if (!sub) return;

    const nameKm = prompt("កែសម្រួលឈ្មោះជាភាសាខ្មែរ :", sub.nameKm);
    if (!nameKm || !nameKm.trim()) return;
    const nameCn = prompt("កែសម្រួលឈ្មោះជាភាសាចិន :", sub.nameCn) || nameKm;
    const maxScore = parseInt(prompt("កែសម្រួលពិន្ទុពេញ (Max Score) :", sub.maxScore || 100), 10) || 100;

    Storage.updateSubject(key, {
      nameKm: nameKm.trim(),
      nameCn: nameCn.trim(),
      maxScore
    });

    this.renderSubjectManagerList();
    this.refreshClassScores();
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`បានកែសម្រួលមុខវិជ្ជា "${nameKm}" រួចរាល់!`, "success");
    }
  },

  deleteSubjectPrompt(key) {
    const subjects = Storage.getSubjects();
    const sub = subjects.find(s => s.key === key);
    if (!sub) return;

    if (confirm(`តើលោកគ្រូពិតជាចង់លុបមុខវិជ្ជា "${sub.nameKm}" (${sub.nameCn}) មែនទេ? / 确定删除该科目？`)) {
      Storage.deleteSubject(key);
      this.renderSubjectManagerList();
      this.refreshClassScores();
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(`បានលុបមុខវិជ្ជា "${sub.nameKm}" រួចរាល់!`, "success");
      }
    }
  },

  refreshClassScores() {
    const classSelect = document.getElementById('score-class-select');
    const termSelect = document.getElementById('score-term-select');
    if (classSelect) this.currentClass = classSelect.value;
    if (termSelect) this.currentTerm = termSelect.value;

    const subjects = Storage.getSubjects();
    const maxTotal = subjects.reduce((acc, s) => acc + (Number(s.maxScore) || 100), 0);

    const students = Storage.getStudents().filter(s => s.classGrade === this.currentClass);
    const thead = document.getElementById('score-matrix-thead');
    const tbody = document.getElementById('score-matrix-body');
    if (!tbody) return;

    // Dynamically render Table Header based on subjects
    if (thead) {
      thead.innerHTML = `
        <tr>
          <th style="width: 40px; text-align: center;">ល.រ</th>
          <th style="min-width: 150px;">ឈ្មោះសិស្ស (姓名)</th>
          ${subjects.map(sub => `
            <th style="text-align: center; min-width: 95px;" title="${sub.nameCn}">
              <div style="font-weight: 700;">${sub.nameKm}</div>
              <div style="font-size: 11px; font-family: var(--font-chinese); color: ${sub.color || 'var(--primary)'}; font-weight: 800; margin-top: 1px;">${sub.nameCn} (${sub.maxScore || 100})</div>
            </th>
          `).join('')}
          <th style="text-align: center; width: 85px;" data-i18n="totalScore">សរុប<br><span style="font-size: 10px; font-weight: normal;">(总分 ${maxTotal})</span></th>
          <th style="text-align: center; width: 80px;" data-i18n="averageScore">មធ្យម<br><span style="font-size: 10px; font-weight: normal;">(平均 100)</span></th>
          <th style="text-align: center; width: 110px;" data-i18n="gradeMention">និទ្ទេស<br><span style="font-size: 10px; font-weight: normal;">(等级)</span></th>
          <th style="text-align: center; width: 80px;" data-i18n="rank">ចំណាត់ថ្នាក់<br><span style="font-size: 10px; font-weight: normal;">(名次)</span></th>
          <th data-i18n="teacherComment">មតិយោបល់គ្រូបន្ទុកថ្នាក់ (教师成长评语)</th>
        </tr>
      `;
    }

    const lang = Storage.getLanguage();
    const t = translations[lang] || translations.km;

    if (students.length === 0) {
      const colSpanCount = 6 + subjects.length;
      tbody.innerHTML = `
        <tr>
          <td colspan="${colSpanCount}" style="text-align: center; padding: 40px; color: var(--text-muted);">
            <div>${t.noStudentsFound || 'មិនមានសិស្សក្នុងថ្នាក់នេះឡើយ'}</div>
          </td>
        </tr>
      `;
      return;
    }

    // Build rows with current score values
    tbody.innerHTML = students.map((s, idx) => {
      const sc = Storage.getStudentScore(s.id, this.currentTerm) || {};
      const photoHtml = s.photo 
        ? `<img src="${s.photo}" alt="${s.khmerName}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-light);">`
        : `<span style="font-size: 18px;">${AVATAR_MAP[s.avatar] || '👧'}</span>`;

      return `
        <tr data-student-id="${s.id}">
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              ${photoHtml}
              <div>
                <div style="font-weight: 700; color: var(--text-main);">${s.khmerName}</div>
                <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-chinese);">${s.chineseName}</div>
              </div>
            </div>
          </td>
          ${subjects.map(sub => `
            <td style="text-align: center;">
              <input type="number" 
                     step="0.5" 
                     min="0" 
                     max="${sub.maxScore || 100}" 
                     class="score-input" 
                     data-subject="${sub.key}" 
                     placeholder="0-${sub.maxScore || 100}"
                     value="${sc[sub.key] !== undefined && sc[sub.key] !== null ? sc[sub.key] : ''}" 
                     oninput="ScoreModule.recalcRow(this)"
                     onkeydown="ScoreModule.handleNavKeys(event, this)">
            </td>
          `).join('')}
          <td class="cell-total" id="total-${s.id}">-</td>
          <td class="cell-average" id="avg-${s.id}">-</td>
          <td style="text-align: center;" id="grade-${s.id}">-</td>
          <td style="text-align: center; font-weight: 800;" id="rank-${s.id}">-</td>
          <td>
            <div style="display: flex; gap: 4px; align-items: center;">
              <input type="text" 
                     class="comment-input" 
                     id="comment-${s.id}" 
                     placeholder="មតិយោបល់ / 教师评语..." 
                     value="${sc.teacherComment || ''}">
              <button class="btn btn-sm btn-secondary" 
                      type="button"
                      onclick="ScoreModule.showQuickCommentPicker('${s.id}')"
                      title="Quick Comment">
                💬
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Initial recalculation of all rows and rankings
    this.recalculateAllRanks();
  },

  handleNavKeys(e, input) {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentTd = input.closest('td');
      const currentTr = input.closest('tr');
      const nextTr = currentTr.nextElementSibling;
      if (nextTr) {
        const colIndex = Array.from(currentTr.children).indexOf(currentTd);
        const nextInput = nextTr.children[colIndex]?.querySelector('input.score-input');
        if (nextInput) nextInput.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const currentTd = input.closest('td');
      const currentTr = input.closest('tr');
      const prevTr = currentTr.previousElementSibling;
      if (prevTr) {
        const colIndex = Array.from(currentTr.children).indexOf(currentTd);
        const prevInput = prevTr.children[colIndex]?.querySelector('input.score-input');
        if (prevInput) prevInput.focus();
      }
    }
  },

  recalcRow(input) {
    this.recalculateAllRanks();
  },

  recalculateAllRanks() {
    const rows = document.querySelectorAll('#score-matrix-body tr[data-student-id]');
    const studentSummaries = [];
    const totalStudents = rows.length;

    rows.forEach(tr => {
      const studentId = tr.dataset.studentId;
      const inputs = tr.querySelectorAll('input.score-input');
      let sum = 0;
      let count = 0;

      inputs.forEach(inp => {
        const val = parseFloat(inp.value);
        if (!isNaN(val)) {
          sum += val;
          count++;
          // Score Heatmap Highlighting
          const scale100 = val > 10;
          inp.classList.remove('score-cell-high', 'score-cell-good', 'score-cell-mid', 'score-cell-low');
          if (scale100 ? val >= 90 : val >= 9.0) inp.classList.add('score-cell-high');
          else if (scale100 ? val >= 80 : val >= 8.0) inp.classList.add('score-cell-good');
          else if (scale100 ? val >= 65 : val >= 6.5) inp.classList.add('score-cell-mid');
          else inp.classList.add('score-cell-low');
        } else {
          inp.classList.remove('score-cell-high', 'score-cell-good', 'score-cell-mid', 'score-cell-low');
        }
      });

      const avg = count > 0 ? (sum / count) : null;
      studentSummaries.push({
        studentId,
        total: count > 0 ? sum : null,
        avg: avg,
        element: tr
      });
    });

    // Sort by average descending for ranking
    const sorted = [...studentSummaries]
      .filter(s => s.avg !== null)
      .sort((a, b) => b.avg - a.avg);

    // Assign rank with tie-breaking
    let currentRank = 1;
    sorted.forEach((item, idx) => {
      if (idx > 0 && Math.abs(item.avg - sorted[idx - 1].avg) > 0.001) {
        currentRank = idx + 1;
      }
      item.rank = currentRank;
    });

    studentSummaries.forEach(s => {
      const totalEl = document.getElementById(`total-${s.studentId}`);
      const avgEl = document.getElementById(`avg-${s.studentId}`);
      const gradeEl = document.getElementById(`grade-${s.studentId}`);
      const rankEl = document.getElementById(`rank-${s.studentId}`);

      if (s.avg !== null) {
        totalEl.textContent = s.total.toFixed(1);
        avgEl.textContent = s.avg.toFixed(2);

        // Grade Mention calculation (supporting 10 scale or 100 scale)
        const scale100 = s.avg > 10;
        let gradeBadge = '';
        if (scale100) {
          if (s.avg >= 90) gradeBadge = `<span class="badge badge-grade-excellent">优 / ល្អប្រសើរ</span>`;
          else if (s.avg >= 80) gradeBadge = `<span class="badge badge-grade-good">良 / ល្អ</span>`;
          else if (s.avg >= 65) gradeBadge = `<span class="badge badge-grade-fair">中 / មធ្យម</span>`;
          else gradeBadge = `<span class="badge badge-grade-needs">待提高 / ត្រូវកែលម្អ</span>`;
        } else {
          if (s.avg >= 9.0) gradeBadge = `<span class="badge badge-grade-excellent">优 / ល្អប្រសើរ</span>`;
          else if (s.avg >= 8.0) gradeBadge = `<span class="badge badge-grade-good">良 / ល្អ</span>`;
          else if (s.avg >= 6.5) gradeBadge = `<span class="badge badge-grade-fair">中 / មធ្យម</span>`;
          else gradeBadge = `<span class="badge badge-grade-needs">待提高 / ត្រូវកែលម្អ</span>`;
        }
        gradeEl.innerHTML = gradeBadge;

        const rankItem = sorted.find(x => x.studentId === s.studentId);
        if (rankItem) {
          let rankBadge = '';
          if (rankItem.rank === 1) {
            rankBadge = `<span class="honor-rank-badge rank-1" title="ចំណាត់ថ្នាក់លេខ ១">🥇 ១</span>`;
          } else if (rankItem.rank === 2) {
            rankBadge = `<span class="honor-rank-badge rank-2" title="ចំណាត់ថ្នាក់លេខ ២">🥈 ២</span>`;
          } else if (rankItem.rank === 3) {
            rankBadge = `<span class="honor-rank-badge rank-3" title="ចំណាត់ថ្នាក់លេខ ៣">🥉 ៣</span>`;
          } else {
            rankBadge = `<span class="honor-rank-badge rank-other">${rankItem.rank}</span>`;
          }
          rankEl.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              ${rankBadge}
              <span style="font-size: 10px; color: var(--text-muted);">${rankItem.rank} / ${totalStudents}</span>
            </div>
          `;
        }
      } else {
        totalEl.textContent = '-';
        avgEl.textContent = '-';
        gradeEl.textContent = '-';
        rankEl.textContent = '-';
      }
    });

    this.updateScoreAnalytics(studentSummaries);
  },

  updateScoreAnalytics(summaries) {
    if (!summaries || summaries.length === 0) return;

    const validSummaries = summaries.filter(s => s.avg !== null && !isNaN(s.avg));
    const totalCount = validSummaries.length;

    let countA = 0, countB = 0, countC = 0, countD = 0;
    let sumAvg = 0;

    const settings = typeof Storage !== 'undefined' ? Storage.getSettings() : {};
    const cutA = settings.gradeCutoffA || 90;
    const cutB = settings.gradeCutoffB || 80;
    const cutC = settings.gradeCutoffC || 65;

    validSummaries.forEach(s => {
      sumAvg += s.avg;
      if (s.avg >= cutA) countA++;
      else if (s.avg >= cutB) countB++;
      else if (s.avg >= cutC) countC++;
      else countD++;
    });

    const pctA = totalCount > 0 ? Math.round((countA / totalCount) * 100) : 0;
    const pctB = totalCount > 0 ? Math.round((countB / totalCount) * 100) : 0;
    const pctC = totalCount > 0 ? Math.round((countC / totalCount) * 100) : 0;
    const pctD = totalCount > 0 ? Math.round((countD / totalCount) * 100) : 0;
    const classAvg = totalCount > 0 ? (sumAvg / totalCount).toFixed(1) : '0.0';

    const elA = document.getElementById('score-stat-count-a');
    const elB = document.getElementById('score-stat-count-b');
    const elC = document.getElementById('score-stat-count-c');
    const elD = document.getElementById('score-stat-count-d');
    const elAvg = document.getElementById('score-class-avg-badge');

    if (elA) elA.textContent = `${countA} នាក់ (${pctA}%)`;
    if (elB) elB.textContent = `${countB} នាក់ (${pctB}%)`;
    if (elC) elC.textContent = `${countC} នាក់ (${pctC}%)`;
    if (elD) elD.textContent = `${countD} នាក់ (${pctD}%)`;
    if (elAvg) elAvg.textContent = `មធ្យមរួមថ្នាក់: ${classAvg}`;

    // Subject averages strip
    const subStrip = document.getElementById('score-subject-averages-strip');
    if (subStrip && typeof Storage !== 'undefined') {
      const subjects = Storage.getSubjects();
      const subHtml = subjects.map(sub => {
        const inputs = document.querySelectorAll(`input.score-input[data-subject="${sub.key}"]`);
        let subSum = 0, subCount = 0;
        inputs.forEach(inp => {
          const v = parseFloat(inp.value);
          if (!isNaN(v)) {
            subSum += v;
            subCount++;
          }
        });
        const subAvg = subCount > 0 ? (subSum / subCount).toFixed(1) : '-';
        return `
          <div style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 4px; background: var(--bg-surface-elevated); border: 1px solid var(--border-light);">
            <span style="font-weight: 600; color: var(--text-main);">${sub.shortKm || sub.nameKm}:</span>
            <span style="font-weight: 700; color: var(--primary);">${subAvg}</span>
          </div>
        `;
      }).join('');

      subStrip.innerHTML = `<span style="font-weight: 600;">មធ្យមភាគមុខវិជ្ជា៖</span> ${subHtml}`;
    }
  },

  generateSmartComments() {
    const rows = document.querySelectorAll('#score-matrix-body tr[data-student-id]');
    if (rows.length === 0) return;

    let updatedCount = 0;
    rows.forEach(tr => {
      const studentId = tr.dataset.studentId;
      const avgEl = document.getElementById(`avg-${studentId}`);
      const commentInput = document.getElementById(`comment-${studentId}`);
      if (!commentInput) return;

      const avg = avgEl ? parseFloat(avgEl.textContent) : 0;
      let comment = '';

      if (avg >= 90) {
        comment = "ឆ្លាតវៃ រួសរាយ និងឧស្សាហ៍ព្យាយាម ទទួលបានលទ្ធផលល្អឆ្នើម / 聪明活泼，善于表达，各科成绩优异，学习表现非常出色。";
      } else if (avg >= 80) {
        comment = "យកចិត្តទុកដាក់ស្ដាប់ ឧស្សាហ៍រៀនសូត្រ និងចេះជួយមិត្តភក្តិ / 上课专注听讲，乐于助人，各科表现良好，继续保持。";
      } else if (avg >= 65) {
        comment = "សុភាពរាបសារ ស្តាប់បង្គាប់គ្រូ ត្រូវពង្រឹងការសន្ទនាបន្ថែម / 文静乖巧，遵守纪律，成绩中等，需多在日常生活中开口多练中文。";
      } else {
        comment = "មានការខិតខំ តែត្រូវការការយកចិត្តទុកដាក់ និងបំប៉នបន្ថែម / 学习有潜力，需要老师和家长多加辅导与鼓励，争取更大进步。";
      }

      commentInput.value = comment;
      commentInput.style.borderColor = 'var(--primary)';
      updatedCount++;
    });

    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`🪄 បានបង្កើតមតិស្វ័យប្រវត្តិតាមពិន្ទុសិស្ស ${updatedCount} នាក់ជោគជ័យ!`, 'success');
    }
  },

  showQuickCommentPicker(studentId) {
    this.activeCommentStudentId = studentId;
    const modal = document.getElementById('modal-comments-bank');
    if (!modal) return;

    const avgEl = document.getElementById(`avg-${studentId}`);
    const avg = avgEl ? parseFloat(avgEl.textContent) : 90;
    const is100 = avg > 10;
    
    let defaultCat = 'excellent';
    if (is100 ? avg < 65 : avg < 7.0) defaultCat = 'needsImprovement';
    else if (is100 ? avg < 80 : avg < 8.0) defaultCat = 'fair';
    else if (is100 ? avg < 90 : avg < 9.0) defaultCat = 'good';

    this.renderCommentPresets(defaultCat);
    modal.classList.add('open');
  },

  renderCommentPresets(category) {
    const listContainer = document.getElementById('comment-presets-list');
    const tabButtons = document.querySelectorAll('#comment-cat-tabs .comment-cat-btn');
    if (!listContainer) return;

    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
      btn.onclick = () => this.renderCommentPresets(btn.dataset.category);
    });

    const presets = typeof CommentsBank !== 'undefined' && CommentsBank.categories ? CommentsBank.categories[category] || [] : [];
    listContainer.innerHTML = presets.map(p => `
      <div class="comment-preset-item" onclick="ScoreModule.selectCommentPreset('${p.id}', '${category}')">
        <div class="comment-preset-title">${p.titleKm} (${p.titleCn})</div>
        <div class="comment-preset-text">
          <div>🇰🇭 ${p.textKm}</div>
          <div style="color: var(--text-muted); font-family: var(--font-chinese); margin-top: 2px;">🇨🇳 ${p.textCn}</div>
        </div>
      </div>
    `).join('');
  },

  selectCommentPreset(presetId, category) {
    const preset = (typeof CommentsBank !== 'undefined' && CommentsBank.categories ? CommentsBank.categories[category] || [] : []).find(p => p.id === presetId);
    if (!preset || !this.activeCommentStudentId) return;

    const commentInput = document.getElementById(`comment-${this.activeCommentStudentId}`);
    if (commentInput) {
      commentInput.value = typeof CommentsBank !== 'undefined' ? CommentsBank.formatBilingual(preset) : `${preset.textKm} ${preset.textCn}`;
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast("បានបញ្ចូលមតិយោបល់! / Comment inserted!", "success");
      }
    }

    const modal = document.getElementById('modal-comments-bank');
    if (modal) modal.classList.remove('open');
    this.activeCommentStudentId = null;
  },

  saveCurrentScores() {
    const rows = document.querySelectorAll('#score-matrix-body tr[data-student-id]');
    const scoresToSave = [];

    // First collect all averages to calculate ranks
    const summaries = [];
    rows.forEach(tr => {
      const studentId = tr.dataset.studentId;
      const inputs = tr.querySelectorAll('input.score-input');
      let sum = 0, count = 0;
      inputs.forEach(inp => {
        const val = parseFloat(inp.value);
        if (!isNaN(val)) {
          sum += val;
          count++;
        }
      });
      summaries.push({
        studentId,
        avg: count > 0 ? (sum / count) : 0,
        total: sum
      });
    });

    summaries.sort((a, b) => b.avg - a.avg);
    let rankCounter = 1;
    summaries.forEach((item, i) => {
      if (i > 0 && Math.abs(item.avg - summaries[i - 1].avg) > 0.001) {
        rankCounter = i + 1;
      }
      item.rank = rankCounter;
    });

    rows.forEach(tr => {
      const studentId = tr.dataset.studentId;
      const comment = document.getElementById(`comment-${studentId}`)?.value.trim() || '';
      const scoreObj = {
        studentId,
        term: this.currentTerm,
        teacherComment: comment
      };

      const inputs = tr.querySelectorAll('input.score-input');
      inputs.forEach(inp => {
        const subKey = inp.dataset.subject;
        const val = parseFloat(inp.value);
        scoreObj[subKey] = !isNaN(val) ? val : null;
      });

      const rankInfo = summaries.find(s => s.studentId === studentId);
      if (rankInfo && rankInfo.avg > 0) {
        scoreObj.rank = rankInfo.rank;
        scoreObj.average = rankInfo.avg.toFixed(2);
        scoreObj.total = rankInfo.total.toFixed(1);
        const avg = rankInfo.avg;
        const is100 = avg > 10;
        if (is100 ? avg >= 90 : avg >= 9.0) scoreObj.grade = 'A';
        else if (is100 ? avg >= 80 : avg >= 8.0) scoreObj.grade = 'B';
        else if (is100 ? avg >= 65 : avg >= 6.5) scoreObj.grade = 'C';
        else scoreObj.grade = 'D';
      }

      scoresToSave.push(scoreObj);
    });

    Storage.saveMultipleScores(scoresToSave);
    window.dispatchEvent(new CustomEvent('scores-changed', { detail: scoresToSave }));

    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast("✅ ពិន្ទុ និងចំណាត់ថ្នាក់ត្រូវបានរក្សាទុកដោយជោគជ័យ!", "success");
      App.updateDashboardStats();
    }
  },

  bindScoreCsv() {
    const btnTpl = document.getElementById('btn-download-score-template');
    const btnImport = document.getElementById('btn-import-scores-csv');
    const modal = document.getElementById('modal-scores-csv-import');
    const fileInput = document.getElementById('scores-csv-file-input');
    const btnConfirm = document.getElementById('btn-confirm-scores-csv-import');
    let cachedCsv = '';

    if (btnTpl) {
      btnTpl.addEventListener('click', () => {
        const csv = Storage.generateScoreTemplateCSV(this.currentClass);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scores_template_${this.currentClass}_${this.currentTerm}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast("ទាញយកទម្រង់ពិន្ទុ CSV ជោគជ័យ!", "success");
        }
      });
    }

    if (btnImport && modal) {
      btnImport.addEventListener('click', () => {
        cachedCsv = '';
        if (fileInput) fileInput.value = '';
        const preview = document.getElementById('scores-csv-preview-container');
        if (preview) preview.style.display = 'none';
        if (btnConfirm) btnConfirm.disabled = true;
        modal.classList.add('open');
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          cachedCsv = evt.target.result;
          const preview = document.getElementById('scores-csv-preview-container');
          const countBadge = document.getElementById('scores-csv-preview-count');
          const lines = cachedCsv.trim().split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);
          if (countBadge) countBadge.textContent = `${Math.max(0, lines.length - 1)} ជួរដេក`;
          if (preview) preview.style.display = 'block';
          if (btnConfirm) btnConfirm.disabled = false;
        };
        reader.readAsText(file);
      });
    }

    if (btnConfirm && modal) {
      btnConfirm.addEventListener('click', () => {
        if (!cachedCsv) return;
        const res = Storage.importScoresCSV(cachedCsv, this.currentTerm);
        if (res.success) {
          modal.classList.remove('open');
          this.refreshClassScores();
          if (typeof App !== 'undefined' && App.showToast) {
            App.showToast(`បានបញ្ចូលពិន្ទុសិស្សចំនួន ${res.count} នាក់ដោយជោគជ័យ!`, 'success');
          }
        } else {
          alert('កំហុស៖ ' + res.error);
        }
      });
    }
  },

  bindBatchFill() {
    const btnOpen = document.getElementById('btn-batch-fill-scores');
    const modal = document.getElementById('modal-batch-fill-scores');
    const select = document.getElementById('batch-fill-subject-select');
    const inputVal = document.getElementById('batch-fill-value-input');
    const btnConfirm = document.getElementById('btn-confirm-batch-fill');

    if (btnOpen && modal) {
      btnOpen.addEventListener('click', () => {
        const subjects = Storage.getSubjects();
        if (select) {
          select.innerHTML = subjects.map(s => `
            <option value="${s.key}">${s.nameKm} (${s.nameCn}) - Max ${s.maxScore || 100}</option>
          `).join('');
        }
        if (inputVal) inputVal.value = '85';
        modal.classList.add('open');
      });
    }

    if (btnConfirm && modal && select && inputVal) {
      btnConfirm.addEventListener('click', () => {
        const subKey = select.value;
        const val = parseFloat(inputVal.value);
        if (isNaN(val) || val < 0) {
          alert('សូមបញ្ចូលពិន្ទុត្រឹមត្រូវ!');
          return;
        }

        const rows = document.querySelectorAll('#score-matrix-body tr[data-student-id]');
        rows.forEach(tr => {
          const inp = tr.querySelector(`input.score-input[data-subject="${subKey}"]`);
          if (inp) {
            inp.value = val;
          }
        });

        this.recalculateAllRanks();
        modal.classList.remove('open');
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast(`បានកំណត់ពិន្ទុ ${val} ជូនសិស្សទាំងអស់ក្នុងថ្នាក់!`, 'info');
        }
      });
    }
  }
};

window.ScoreModule = ScoreModule;
window.getSubjectsForClass = getSubjectsForClass;
