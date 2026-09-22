/**
 * Chinese Kindergarten Score Management System
 * Visual Analytics & Charts Engine (Lightweight Pure SVG)
 */

const Analytics = {
  SUBJECTS: [
    { key: 'huawen', labelKm: '华文 (ភាសាចិន)', color: '#4F46E5' },
    { key: 'pinyin', labelKm: '拼音 (ភីនអុីន)', color: '#06B6D4' },
    { key: 'shuxue', labelKm: '数学 (គណិតវិទ្យា)', color: '#10B981' },
    { key: 'hanle', labelKm: '汉乐 (ពាក្យចិនចំរុះ)', color: '#EC4899' },
    { key: 'bishun', labelKm: '笔顺 (គំនូសអក្សរ)', color: '#8B5CF6' },
    { key: 'changyou', labelKm: '唱游 (ចម្រៀង-កាយវិការ)', color: '#F59E0B' }
  ],

  init() {
    this.renderAllCharts();
  },

  renderAllCharts() {
    this.renderGradeBreakdownChart();
    this.renderSubjectPerformanceChart();
    this.renderClassComparisonChart();
  },

  /**
   * Render Donut Chart for Grade Distribution (A, B, C, D)
   */
  renderGradeBreakdownChart() {
    const container = document.getElementById('analytics-grade-chart');
    if (!container) return;

    const students = Storage.getStudents();
    const settings = Storage.getSettings();
    const term = settings.currentTerm || 'term1';

    let counts = { A: 0, B: 0, C: 0, D: 0 };
    let totalScored = 0;

    students.forEach(s => {
      const sc = Storage.getStudentScore(s.id, term);
      if (sc) {
        let grade = sc.grade;
        if (!grade && sc.average) {
          const avg = parseFloat(sc.average);
          const is100 = avg > 10;
          if (is100 ? avg >= 90 : avg >= 9.0) grade = 'A';
          else if (is100 ? avg >= 80 : avg >= 8.0) grade = 'B';
          else if (is100 ? avg >= 65 : avg >= 6.5) grade = 'C';
          else grade = 'D';
        }
        if (grade && counts[grade] !== undefined) {
          counts[grade]++;
          totalScored++;
        }
      }
    });

    if (totalScored === 0) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 30px 10px; font-size: 13px;">មិនទាន់មានទិន្នន័យពិន្ទុសម្រាប់បង្ហាញក្រាហ្វិកនៅឡើយទេ</div>`;
      return;
    }

    const pA = Math.round((counts.A / totalScored) * 100);
    const pB = Math.round((counts.B / totalScored) * 100);
    const pC = Math.round((counts.C / totalScored) * 100);
    const pD = 100 - (pA + pB + pC);

    container.innerHTML = `
      <div class="analytics-donut-wrapper">
        <svg viewBox="0 0 160 160" class="analytics-donut-svg">
          <circle cx="80" cy="80" r="60" fill="transparent" stroke="var(--border-color)" stroke-width="20" opacity="0.3"></circle>
          
          <!-- Grade A: Emerald (10B981) -->
          <circle cx="80" cy="80" r="60" fill="transparent" stroke="#10B981" stroke-width="20"
            stroke-dasharray="${(pA * 377) / 100} 377" stroke-dashoffset="0" transform="rotate(-90 80 80)"></circle>
          
          <!-- Grade B: Indigo (6366F1) -->
          <circle cx="80" cy="80" r="60" fill="transparent" stroke="#6366F1" stroke-width="20"
            stroke-dasharray="${(pB * 377) / 100} 377" stroke-dashoffset="-${(pA * 377) / 100}" transform="rotate(-90 80 80)"></circle>
          
          <!-- Grade C: Amber (F59E0B) -->
          <circle cx="80" cy="80" r="60" fill="transparent" stroke="#F59E0B" stroke-width="20"
            stroke-dasharray="${(pC * 377) / 100} 377" stroke-dashoffset="-${((pA + pB) * 377) / 100}" transform="rotate(-90 80 80)"></circle>
          
          <!-- Grade D: Rose (F43F5E) -->
          <circle cx="80" cy="80" r="60" fill="transparent" stroke="#F43F5E" stroke-width="20"
            stroke-dasharray="${(pD * 377) / 100} 377" stroke-dashoffset="-${((pA + pB + pC) * 377) / 100}" transform="rotate(-90 80 80)"></circle>

          <!-- Center Text -->
          <text x="80" y="74" text-anchor="middle" font-size="20" font-weight="800" fill="var(--text-main)">${totalScored}</text>
          <text x="80" y="92" text-anchor="middle" font-size="10" fill="var(--text-muted)">សិស្សមានពិន្ទុ</text>
        </svg>

        <div class="analytics-legend-grid">
          <div class="legend-item"><span class="legend-dot" style="background: #10B981;"></span><span class="legend-text">និទ្ទេស A (优秀): <strong>${counts.A} (${pA}%)</strong></span></div>
          <div class="legend-item"><span class="legend-dot" style="background: #6366F1;"></span><span class="legend-text">និទ្ទេស B (良好): <strong>${counts.B} (${pB}%)</strong></span></div>
          <div class="legend-item"><span class="legend-dot" style="background: #F59E0B;"></span><span class="legend-text">និទ្ទេស C (及格): <strong>${counts.C} (${pC}%)</strong></span></div>
          <div class="legend-item"><span class="legend-dot" style="background: #F43F5E;"></span><span class="legend-text">និទ្ទេស D (需努力): <strong>${counts.D} (${pD}%)</strong></span></div>
        </div>
      </div>
    `;
  },

  /**
   * Render Horizontal Bar Chart comparing Average Scores by Subject
   */
  renderSubjectPerformanceChart() {
    const container = document.getElementById('analytics-subject-chart');
    if (!container) return;

    const students = Storage.getStudents();
    const settings = Storage.getSettings();
    const term = settings.currentTerm || 'term1';

    let subjectStats = {};
    this.SUBJECTS.forEach(sub => {
      subjectStats[sub.key] = { sum: 0, count: 0, label: sub.labelKm, color: sub.color };
    });

    students.forEach(s => {
      const sc = Storage.getStudentScore(s.id, term);
      if (sc) {
        this.SUBJECTS.forEach(sub => {
          if (sc[sub.key] !== undefined && sc[sub.key] !== null && sc[sub.key] !== '') {
            subjectStats[sub.key].sum += parseFloat(sc[sub.key]);
            subjectStats[sub.key].count++;
          }
        });
      }
    });

    // Only render subjects that have records
    const activeSubjects = this.SUBJECTS.filter(sub => subjectStats[sub.key].count > 0);
    const subjectsToDisplay = activeSubjects.length > 0 ? activeSubjects : this.SUBJECTS.slice(0, 7);

    const barsHtml = subjectsToDisplay.map(sub => {
      const stat = subjectStats[sub.key];
      const avg = stat.count > 0 ? (stat.sum / stat.count).toFixed(2) : 0;
      const numAvg = parseFloat(avg);
      const widthPct = Math.min(100, Math.round(numAvg > 10 ? numAvg : numAvg * 10));

      return `
        <div class="sub-perf-row">
          <div class="sub-perf-label">${stat.label}</div>
          <div class="sub-perf-bar-track">
            <div class="sub-perf-bar-fill" style="width: ${widthPct}%; background: ${stat.color};"></div>
          </div>
          <div class="sub-perf-score" style="color: ${stat.color};">${avg}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="sub-perf-list">${barsHtml}</div>`;
  },

  /**
   * Render Class Comparison (K3 vs K2 vs K1)
   */
  renderClassComparisonChart() {
    const container = document.getElementById('analytics-class-chart');
    if (!container) return;

    const students = Storage.getStudents();
    const settings = Storage.getSettings();
    const term = settings.currentTerm || 'term1';

    const classes = [
      { id: 'K3', label: '幼大班 (K3)' },
      { id: 'K2', label: '幼中班 (K2)' },
      { id: 'K1', label: '幼小班 (K1)' }
    ];

    const cardsHtml = classes.map(cls => {
      const classStudents = students.filter(s => s.classGrade === cls.id);
      let sumAvg = 0, scoredCount = 0;

      classStudents.forEach(s => {
        const sc = Storage.getStudentScore(s.id, term);
        if (sc) {
          const subjects = typeof getSubjectsForClass === 'function' ? getSubjectsForClass(s.classGrade) : this.SUBJECTS;
          let sum = 0, count = 0;
          subjects.forEach(sub => {
            if (sc[sub.key] !== undefined && sc[sub.key] !== null && sc[sub.key] !== '') {
              sum += parseFloat(sc[sub.key]);
              count++;
            }
          });
          if (count > 0) {
            sumAvg += (sum / count);
            scoredCount++;
          }
        }
      });

      const classAvg = scoredCount > 0 ? (sumAvg / scoredCount).toFixed(2) : '0.00';

      return `
        <div class="class-summary-chip">
          <div class="class-chip-header">
            <span class="badge badge-k2">${cls.label}</span>
            <span style="font-size: 12px; color: var(--text-muted);">${classStudents.length} នាក់</span>
          </div>
          <div style="font-size: 22px; font-weight: 800; color: var(--text-main); margin-top: 6px;">
            ${classAvg} <span style="font-size: 12px; font-weight: 500; color: var(--text-muted);">/100</span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="class-comparison-grid">${cardsHtml}</div>`;
  }
};

window.Analytics = Analytics;
