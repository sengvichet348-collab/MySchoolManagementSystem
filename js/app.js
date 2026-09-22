/**
 * Chinese Kindergarten Score Management System
 * Main Controller & App Orchestrator
 */

const App = {
  currentTab: 'dashboard',

  init() {
    // 0. Initialize Electron Bridge
    if (typeof ElectronBridge !== 'undefined') {
      ElectronBridge.init();
    }

    // 1. Initialize Storage
    Storage.init();

    // 2. Setup Theme & Language
    this.initTheme();
    const savedLang = Storage.getLanguage();
    this.applyLanguage(savedLang);

    // 3. Bind navigation and global events
    this.bindNavigation();
    this.bindLanguageSwitcher();
    this.bindSettingsEvents();
    this.bindClassPills();
    this.bindTopbarActions();

    // 4. Initialize child modules
    StudentsModule.init();
    ScoreModule.init();
    ReportsModule.init();
    if (window.AttendanceModule) {
      AttendanceModule.init();
    }
    if (window.HonorRollModule) {
      HonorRollModule.init();
    }
    if (window.Analytics) {
      Analytics.init();
    }

    // 5. Update dashboard & desktop titlebar
    this.updateDashboardStats();
    this.updateTitlebarInfo();

    // 6. Run daily auto-backup
    Storage.autoBackupDaily();
  },

  initTheme() {
    const savedTheme = localStorage.getItem('zh_kindergarten_theme') || 'dark';
    this.setTheme(savedTheme);

    const themeToggleBtn = document.getElementById('titlebar-theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
      });
    }
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zh_kindergarten_theme', theme);

    const btn = document.getElementById('titlebar-theme-toggle');
    if (btn) {
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      btn.title = theme === 'dark' ? 'ប្តូរទៅ Light Mode / 日间模式' : 'ប្តូរទៅ Dark Mode / 夜间模式';
    }
  },

  bindClassPills() {
    const pills = document.querySelectorAll('#student-class-pills .class-pill-btn');
    const classFilter = document.getElementById('student-class-filter');
    if (!pills.length || !classFilter) return;

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const selectedClass = pill.dataset.class;
        classFilter.value = selectedClass;
        classFilter.dispatchEvent(new Event('change'));
      });
    });
  },

  bindTopbarActions() {
    const printBtn = document.getElementById('topbar-print-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        if (typeof ElectronBridge !== 'undefined') {
          ElectronBridge.printDocument();
        } else {
          window.print();
        }
      });
    }
  },

  updateTitlebarInfo() {
    const infoEl = document.getElementById('titlebar-academic-info');
    if (!infoEl) return;

    const settings = Storage.getSettings();
    const termLabel = settings.currentTerm === 'term2' ? 'ឆមាសទី ២ (Term 2)' : 'ឆមាសទី ១ (Term 1)';
    infoEl.textContent = `ឆ្នាំសិក្សា ${settings.academicYear || '2025 - 2026'} | ${termLabel}`;
  },

  bindNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Quick action clicks from dashboard
    document.querySelectorAll('[data-quick-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.quickTab;
        this.switchTab(targetTab);
        if (btn.dataset.quickAction === 'add-student') {
          setTimeout(() => StudentsModule.openStudentModal(), 100);
        }
      });
    });
  },

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update sidebar navigation active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tabName);
    });

    // Update visible view container
    document.querySelectorAll('.view-container').forEach(view => {
      view.classList.toggle('active', view.id === `view-${tabName}`);
    });

    // Update Topbar Title
    const titleEl = document.getElementById('topbar-page-title');
    const lang = Storage.getLanguage();
    const t = translations[lang] || translations.km;

    const titles = {
      dashboard: t.navDashboard || 'ផ្ទាំងគ្រប់គ្រង',
      students: t.navStudents || 'បញ្ជីសិស្ស',
      scores: t.navScores || 'បញ្ចូលពិន្ទុ',
      attendance: 'វត្តមានសិស្ស / 考勤管理',
      'honor-roll': 'តារាងកិត្តិយស / 班级荣誉榜',
      reports: t.navReports || 'ព្រឹត្តិបត្រពិន្ទុ',
      certificates: t.navCertificates || 'ប័ណ្ណសរសើរ',
      settings: t.navSettings || 'ការកំណត់'
    };

    if (titleEl) {
      titleEl.textContent = titles[tabName] || t.appTitle;
    }

    // Refresh specific view data on switch
    if (tabName === 'dashboard') {
      this.updateDashboardStats();
      if (window.Analytics) Analytics.renderAllCharts();
    } else if (tabName === 'students') {
      StudentsModule.renderStudents();
    } else if (tabName === 'scores') {
      ScoreModule.refreshClassScores();
    } else if (tabName === 'attendance') {
      if (window.AttendanceModule) AttendanceModule.renderAttendanceTable();
    } else if (tabName === 'honor-roll') {
      if (window.HonorRollModule) HonorRollModule.renderHonorRoll();
    } else if (tabName === 'reports') {
      ReportsModule.renderStudentPicker();
    } else if (tabName === 'certificates') {
      ReportsModule.populateCertSelect();
    } else if (tabName === 'settings') {
      this.populateSettingsForm();
    }
  },

  bindLanguageSwitcher() {
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        Storage.setLanguage(lang);
        this.applyLanguage(lang);
      });
    });
  },

  applyLanguage(lang) {
    // Update button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    const t = translations[lang] || translations.km;

    // Translate all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (t[key]) {
        el.textContent = t[key];
      }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (t[key]) {
        el.placeholder = t[key];
      }
    });

    // Refresh views to apply new language strings
    this.updateDashboardStats();
    StudentsModule.renderStudents();
    ScoreModule.refreshClassScores();
    if (ReportsModule.currentStudentId) {
      ReportsModule.renderReportCard(ReportsModule.currentStudentId);
    }
    ReportsModule.populateCertSelect();
  },

  updateDashboardStats() {
    const students = Storage.getStudents();
    const scores = Storage.getAllScores();
    const lang = Storage.getLanguage();
    const t = translations[lang] || translations.km;

    // Total counts
    const totalEl = document.getElementById('stat-total-students');
    const maleEl = document.getElementById('stat-male-students');
    const femaleEl = document.getElementById('stat-female-students');
    const classesEl = document.getElementById('stat-total-classes');
    const avgEl = document.getElementById('stat-average-score');

    if (totalEl) totalEl.textContent = students.length;
    if (maleEl) maleEl.textContent = students.filter(s => s.gender === 'male').length;
    if (femaleEl) femaleEl.textContent = students.filter(s => s.gender === 'female').length;

    // Distinct classes
    const classSet = new Set(students.map(s => s.classGrade));
    if (classesEl) classesEl.textContent = classSet.size || 3;

    // Total active subjects
    const subjectsEl = document.getElementById('stat-total-subjects');
    if (subjectsEl) {
      subjectsEl.textContent = Storage.getSubjects().length;
    }

    // Overall attendance rate
    const attRateEl = document.getElementById('stat-attendance-rate');
    if (attRateEl) {
      let totalP = 0, totalD = 0;
      students.forEach(s => {
        const att = Storage.getStudentAttendanceSummary(s.id, 'term1');
        const days = (att.present || 0) + (att.excused || 0) + (att.unexcused || 0);
        totalP += (att.present || 0);
        totalD += days;
      });
      const overallRate = totalD > 0 ? Math.round((totalP / totalD) * 100) : 98;
      attRateEl.textContent = `${overallRate}%`;
    }

    // Calculate overall average across all students
    let overallSum = 0, overallCount = 0;
    const studentAvgList = [];

    students.forEach(s => {
      const sc = Storage.getStudentScore(s.id, 'term1');
      if (sc) {
        let stuSum = 0, stuCount = 0;
        const subjects = typeof getSubjectsForClass === 'function' ? getSubjectsForClass(s.classGrade) : SUBJECTS;
        subjects.forEach(sub => {
          const val = parseFloat(sc[sub.key]);
          if (!isNaN(val)) {
            stuSum += val;
            stuCount++;
            overallSum += val;
            overallCount++;
          }
        });
        if (stuCount > 0) {
          studentAvgList.push({
            student: s,
            avg: stuSum / stuCount,
            scoreRecord: sc
          });
        }
      }
    });

    if (avgEl) {
      const overallAvg = overallCount > 0 ? (overallSum / overallCount).toFixed(2) : '91.50';
      avgEl.textContent = overallAvg;
    }

    // Top Honor Roll (Top 5)
    studentAvgList.sort((a, b) => b.avg - a.avg);
    const top5 = studentAvgList.slice(0, 5);
    const honorContainer = document.getElementById('dashboard-honor-list');

    if (honorContainer) {
      if (top5.length === 0) {
        honorContainer.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 20px;">${t.noStudentsFound}</div>`;
      } else {
        honorContainer.innerHTML = top5.map((item, idx) => {
          const rank = idx + 1;
          let rankBadgeClass = 'rank-other';
          if (rank === 1) rankBadgeClass = 'rank-1';
          else if (rank === 2) rankBadgeClass = 'rank-2';
          else if (rank === 3) rankBadgeClass = 'rank-3';

          const avatarEmoji = AVATAR_MAP[item.student.avatar] || "🧒";
          const classLabel = t['class' + item.student.classGrade] || item.student.classGrade;

          return `
            <div class="honor-item">
              <div class="honor-rank-badge ${rankBadgeClass}">
                ${rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
              </div>
              <div class="honor-student-info">
                <div class="avatar-circle" style="width: 34px; height: 34px; font-size: 18px;">${avatarEmoji}</div>
                <div class="honor-names">
                  <span class="honor-kh-name">${item.student.khmerName}</span>
                  <span class="honor-cn-name">${item.student.chineseName} (${classLabel})</span>
                </div>
              </div>
              <div class="honor-score">
                ${item.avg.toFixed(2)}
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Update School name and logo in sidebar badge & header
    const settings = Storage.getSettings();
    const badgeKm = document.getElementById('sidebar-school-km');
    const badgeCn = document.getElementById('sidebar-school-cn');
    if (badgeKm) badgeKm.textContent = settings.schoolNameKm || 'សាលារៀន ខ្មែរ-ចិន ភៃហួរ';
    if (badgeCn) badgeCn.textContent = settings.schoolNameCn || '磅湛省公立培华学校';

    const sidebarLogo = document.getElementById('sidebar-school-logo');
    if (sidebarLogo) {
      if (settings.schoolLogo) {
        sidebarLogo.innerHTML = `<img src="${settings.schoolLogo}" alt="Logo" class="sidebar-school-logo-img">`;
      } else {
        sidebarLogo.innerHTML = '🏫';
      }
    }

    const brandIcon = document.getElementById('sidebar-brand-icon');
    if (brandIcon) {
      if (settings.schoolLogo) {
        brandIcon.innerHTML = `<img src="${settings.schoolLogo}" alt="Logo" class="sidebar-brand-logo">`;
      } else {
        brandIcon.innerHTML = '🎓';
      }
    }

    const titlebarIcon = document.getElementById('titlebar-school-icon');
    if (titlebarIcon) {
      if (settings.schoolLogo) {
        titlebarIcon.innerHTML = `<img src="${settings.schoolLogo}" alt="Logo" class="titlebar-logo">`;
      } else {
        titlebarIcon.innerHTML = '🎓';
      }
    }
  },

  populateSettingsForm() {
    const settings = Storage.getSettings();
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('setting-school-km', settings.schoolNameKm);
    setVal('setting-school-cn', settings.schoolNameCn);
    setVal('setting-academic-year', settings.academicYear);
    setVal('setting-principal-km', settings.principalNameKm);
    setVal('setting-principal-cn', settings.principalNameCn);
    setVal('setting-teacher-km', settings.teacherNameKm);
    setVal('setting-teacher-cn', settings.teacherNameCn);
    setVal('setting-score-scale', settings.scoreScale || 100);
    setVal('setting-seal-text', settings.sealText || settings.schoolNameCn || '磅湛省公立培华学校');
    setVal('setting-motto-km', settings.schoolMottoKm || 'ឧស្សាហ៍ វិន័យ សាមគ្គី ច្នៃប្រឌិត');
    setVal('setting-motto-cn', settings.schoolMottoCn || '勤奋 · 守纪 · 博爱 · 创新');
    setVal('setting-cutoff-a', settings.gradeCutoffA || 90);
    setVal('setting-cutoff-b', settings.gradeCutoffB || 80);
    setVal('setting-cutoff-c', settings.gradeCutoffC || 65);

    this.renderSnapshotsList();

    // Previews for Logo & Signatures
    const logoPrev = document.getElementById('setting-logo-preview');
    const logoClear = document.getElementById('btn-clear-logo');
    if (logoPrev) {
      if (settings.schoolLogo) {
        logoPrev.innerHTML = `<img src="${settings.schoolLogo}" style="width: 100%; height: 100%; object-fit: contain;">`;
        if (logoClear) logoClear.style.display = 'inline-flex';
      } else {
        logoPrev.innerHTML = '🏫';
        if (logoClear) logoClear.style.display = 'none';
      }
    }

    const sealPrev = document.getElementById('setting-seal-preview');
    const sealClear = document.getElementById('btn-clear-seal');
    if (sealPrev) {
      const sealImg = settings.schoolSeal || (typeof DEFAULT_SCHOOL_SEAL !== 'undefined' ? DEFAULT_SCHOOL_SEAL : 'assets/images/school-seal.png');
      if (sealImg) {
        sealPrev.innerHTML = `<img src="${sealImg}" style="width: 100%; height: 100%; object-fit: contain;">`;
        if (sealClear) sealClear.style.display = 'inline-flex';
      } else {
        sealPrev.innerHTML = 'គ្មាន';
        if (sealClear) sealClear.style.display = 'none';
      }
    }

    const prinSigPrev = document.getElementById('setting-sig-principal-preview');
    const prinSigClear = document.getElementById('btn-clear-sig-principal');
    if (prinSigPrev) {
      if (settings.principalSignature) {
        prinSigPrev.innerHTML = `<img src="${settings.principalSignature}" style="width: 100%; height: 100%; object-fit: contain;">`;
        if (prinSigClear) prinSigClear.style.display = 'inline-flex';
      } else {
        prinSigPrev.innerHTML = 'គ្មាន';
        if (prinSigClear) prinSigClear.style.display = 'none';
      }
    }

    const teachSigPrev = document.getElementById('setting-sig-teacher-preview');
    const teachSigClear = document.getElementById('btn-clear-sig-teacher');
    if (teachSigPrev) {
      if (settings.teacherSignature) {
        teachSigPrev.innerHTML = `<img src="${settings.teacherSignature}" style="width: 100%; height: 100%; object-fit: contain;">`;
        if (teachSigClear) teachSigClear.style.display = 'inline-flex';
      } else {
        teachSigPrev.innerHTML = 'គ្មាន';
        if (teachSigClear) teachSigClear.style.display = 'none';
      }
    }
  },

  bindSettingsEvents() {
    // School Logo file handling
    const logoBtn = document.getElementById('btn-upload-logo');
    const logoFile = document.getElementById('setting-logo-file');
    const logoClear = document.getElementById('btn-clear-logo');
    const logoPrev = document.getElementById('setting-logo-preview');
    let tempLogoBase64 = null;

    if (logoBtn && logoFile) {
      logoBtn.onclick = () => logoFile.click();
      logoFile.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          tempLogoBase64 = evt.target.result;
          if (logoPrev) logoPrev.innerHTML = `<img src="${tempLogoBase64}" style="width: 100%; height: 100%; object-fit: contain;">`;
          if (logoClear) logoClear.style.display = 'inline-flex';
        };
        reader.readAsDataURL(file);
      };
    }
    if (logoClear) {
      logoClear.onclick = () => {
        tempLogoBase64 = '';
        if (logoFile) logoFile.value = '';
        if (logoPrev) logoPrev.innerHTML = '🏫';
        logoClear.style.display = 'none';
      };
    }

    const logoResetDefault = document.getElementById('btn-reset-default-logo');
    if (logoResetDefault) {
      logoResetDefault.onclick = () => {
        if (typeof DEFAULT_SCHOOL_LOGO !== 'undefined') {
          tempLogoBase64 = DEFAULT_SCHOOL_LOGO;
          if (logoFile) logoFile.value = '';
          if (logoPrev) logoPrev.innerHTML = `<img src="${tempLogoBase64}" style="width: 100%; height: 100%; object-fit: contain;">`;
          if (logoClear) logoClear.style.display = 'inline-flex';
        }
      };
    }

    // School Seal file handling
    const sealBtn = document.getElementById('btn-upload-seal');
    const sealFile = document.getElementById('setting-seal-file');
    const sealClear = document.getElementById('btn-clear-seal');
    const sealPrev = document.getElementById('setting-seal-preview');
    const sealResetDefault = document.getElementById('btn-reset-default-seal');
    let tempSealBase64 = null;

    if (sealBtn && sealFile) {
      sealBtn.onclick = () => sealFile.click();
      sealFile.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          tempSealBase64 = evt.target.result;
          if (sealPrev) sealPrev.innerHTML = `<img src="${tempSealBase64}" style="width: 100%; height: 100%; object-fit: contain;">`;
          if (sealClear) sealClear.style.display = 'inline-flex';
        };
        reader.readAsDataURL(file);
      };
    }
    if (sealClear) {
      sealClear.onclick = () => {
        tempSealBase64 = '';
        if (sealFile) sealFile.value = '';
        if (sealPrev) sealPrev.innerHTML = 'គ្មាន';
        sealClear.style.display = 'none';
      };
    }
    if (sealResetDefault) {
      sealResetDefault.onclick = () => {
        if (typeof DEFAULT_SCHOOL_SEAL !== 'undefined') {
          tempSealBase64 = DEFAULT_SCHOOL_SEAL;
          if (sealFile) sealFile.value = '';
          if (sealPrev) sealPrev.innerHTML = `<img src="${tempSealBase64}" style="width: 100%; height: 100%; object-fit: contain;">`;
          if (sealClear) sealClear.style.display = 'inline-flex';
        }
      };
    }

    // Principal Signature file handling
    const prinSigBtn = document.getElementById('btn-upload-sig-principal');
    const prinSigFile = document.getElementById('setting-sig-principal-file');
    const prinSigClear = document.getElementById('btn-clear-sig-principal');
    const prinSigPrev = document.getElementById('setting-sig-principal-preview');
    let tempPrinSigBase64 = null;

    if (prinSigBtn && prinSigFile) {
      prinSigBtn.onclick = () => prinSigFile.click();
      prinSigFile.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          tempPrinSigBase64 = evt.target.result;
          if (prinSigPrev) prinSigPrev.innerHTML = `<img src="${tempPrinSigBase64}" style="width: 100%; height: 100%; object-fit: contain;">`;
          if (prinSigClear) prinSigClear.style.display = 'inline-flex';
        };
        reader.readAsDataURL(file);
      };
    }
    if (prinSigClear) {
      prinSigClear.onclick = () => {
        tempPrinSigBase64 = '';
        if (prinSigFile) prinSigFile.value = '';
        if (prinSigPrev) prinSigPrev.innerHTML = 'គ្មាន';
        prinSigClear.style.display = 'none';
      };
    }

    // Teacher Signature file handling
    const teachSigBtn = document.getElementById('btn-upload-sig-teacher');
    const teachSigFile = document.getElementById('setting-sig-teacher-file');
    const teachSigClear = document.getElementById('btn-clear-sig-teacher');
    const teachSigPrev = document.getElementById('setting-sig-teacher-preview');
    let tempTeachSigBase64 = null;

    if (teachSigBtn && teachSigFile) {
      teachSigBtn.onclick = () => teachSigFile.click();
      teachSigFile.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          tempTeachSigBase64 = evt.target.result;
          if (teachSigPrev) teachSigPrev.innerHTML = `<img src="${tempTeachSigBase64}" style="width: 100%; height: 100%; object-fit: contain;">`;
          if (teachSigClear) teachSigClear.style.display = 'inline-flex';
        };
        reader.readAsDataURL(file);
      };
    }
    if (teachSigClear) {
      teachSigClear.onclick = () => {
        tempTeachSigBase64 = '';
        if (teachSigFile) teachSigFile.value = '';
        if (teachSigPrev) teachSigPrev.innerHTML = 'គ្មាន';
        teachSigClear.style.display = 'none';
      };
    }

    const form = document.getElementById('settings-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentSettings = Storage.getSettings();

        const updatedSettings = {
          ...currentSettings,
          schoolNameKm: document.getElementById('setting-school-km')?.value.trim(),
          schoolNameCn: document.getElementById('setting-school-cn')?.value.trim(),
          academicYear: document.getElementById('setting-academic-year')?.value.trim(),
          scoreScale: parseInt(document.getElementById('setting-score-scale')?.value || '100', 10),
          sealText: document.getElementById('setting-seal-text')?.value.trim() || '磅湛省公立培华学校',
          principalNameKm: document.getElementById('setting-principal-km')?.value.trim(),
          principalNameCn: document.getElementById('setting-principal-cn')?.value.trim(),
          teacherNameKm: document.getElementById('setting-teacher-km')?.value.trim(),
          teacherNameCn: document.getElementById('setting-teacher-cn')?.value.trim(),
          schoolMottoKm: document.getElementById('setting-motto-km')?.value.trim() || 'ឧស្សាហ៍ វិន័យ សាមគ្គី ច្នៃប្រឌិត',
          schoolMottoCn: document.getElementById('setting-motto-cn')?.value.trim() || '勤奋 · 守纪 · 博爱 · 创新',
          gradeCutoffA: parseInt(document.getElementById('setting-cutoff-a')?.value || '90', 10),
          gradeCutoffB: parseInt(document.getElementById('setting-cutoff-b')?.value || '80', 10),
          gradeCutoffC: parseInt(document.getElementById('setting-cutoff-c')?.value || '65', 10)
        };

        if (tempLogoBase64 !== null) updatedSettings.schoolLogo = tempLogoBase64 || null;
        if (tempSealBase64 !== null) updatedSettings.schoolSeal = tempSealBase64 || null;
        if (tempPrinSigBase64 !== null) updatedSettings.principalSignature = tempPrinSigBase64 || null;
        if (tempTeachSigBase64 !== null) updatedSettings.teacherSignature = tempTeachSigBase64 || null;

        Storage.saveSettings(updatedSettings);
        this.showToast("បានរក្សាទុកការកំណត់ និងរូបភាព! / Settings saved!", "success");
        this.updateDashboardStats();
        this.updateTitlebarInfo();
      });
    }

    // Export Backup
    const exportBtn = document.getElementById('btn-export-backup');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        Storage.exportBackupJSON();
        this.showToast("ទាញយកឯកសារបម្រុងទុកជោគជ័យ! / Backup downloaded!", "success");
      });
    }

    // Import Backup
    const fileInput = document.getElementById('input-import-file');
    const importBtn = document.getElementById('btn-import-backup');
    if (importBtn && fileInput) {
      importBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const res = Storage.importBackupJSON(evt.target.result);
          if (res.success) {
            this.showToast("ទិន្នន័យត្រូវបានបញ្ចូលឡើងវិញ! / Data restored!", "success");
            this.updateDashboardStats();
            StudentsModule.renderStudents();
            ScoreModule.refreshClassScores();
          } else {
            alert("Error importing file: " + res.error);
          }
        };
        reader.readAsText(file);
      });
    }

    // Reset Demo Data
    const resetBtn = document.getElementById('btn-reset-demo');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const lang = Storage.getLanguage();
        const t = translations[lang] || translations.km;
        if (confirm(t.resetConfirm)) {
          Storage.resetToDemo();
          this.showToast(t.dataReset, "info");
          this.updateDashboardStats();
          StudentsModule.renderStudents();
          ScoreModule.refreshClassScores();
          this.populateSettingsForm();
        }
      });
    }

    // Manual Snapshot Creation
    const btnCreateSnap = document.getElementById('btn-create-snapshot');
    if (btnCreateSnap) {
      btnCreateSnap.addEventListener('click', () => {
        const note = prompt('សូមបញ្ចូលចំណាំសម្រាប់ចំណុចបម្រុងទុកនេះ / 备份备注:', 'បម្រុងទុកដោយដៃ (Manual Backup)');
        if (note !== null) {
          const res = Storage.createManualSnapshot(note);
          if (res.success) {
            this.showToast('✅ បានបង្កើតចំណុចបម្រុងទុកដោយជោគជ័យ!', 'success');
            this.renderSnapshotsList();
          }
        }
      });
    }
  },

  renderSnapshotsList() {
    const container = document.getElementById('settings-snapshots-list');
    if (!container) return;

    const snapshots = Storage.getBackupSnapshots();
    if (snapshots.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 18px; font-size: 13px;">មិនទាន់មានប្រវត្តិបម្រុងទុកនៅឡើយទេ</div>`;
      return;
    }

    container.innerHTML = snapshots.map((s, idx) => `
      <div class="snapshot-card" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border-light); border-radius: 8px; margin-bottom: 8px;">
        <div>
          <div style="font-weight: 700; font-size: 13.5px; color: var(--text-main);">
            📦 ${s.label || 'Daily Auto-Backup'}
          </div>
          <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
            <span>📅 ${s.date} ${s.time || ''}</span> • 
            <span>សិស្ស: <strong>${s.studentsCount || 0}</strong></span> • 
            <span>ពិន្ទុ: <strong>${s.scoresCount || 0}</strong></span>
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="App.restoreSnapshot('${s.date}')" style="font-size: 12px;">
          ♻️ ស្តារ (Restore)
        </button>
      </div>
    `).join('');
  },

  restoreSnapshot(dateStr) {
    if (confirm(`តើអ្នកពិតជាចង់ស្តារទិន្នន័យពីថ្ងៃ ${dateStr} ឡើងវិញឬទេ? ទិន្នន័យបច្ចុប្បន្ននឹងត្រូវបានជំនួស។`)) {
      const res = Storage.restoreFromSnapshot(dateStr);
      if (res.success) {
        this.showToast('✅ បានស្តារទិន្នន័យជោគជ័យ!', 'success');
        this.updateDashboardStats();
        StudentsModule.renderStudents();
        ScoreModule.refreshClassScores();
        this.populateSettingsForm();
      } else {
        alert(res.error);
      }
    }
  },

  showToast(message, type = 'info') {
    let container = document.getElementById('app-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'app-toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>🔔</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 200);
    }, 3000);
  }
};

window.App = App;

// Bootstrap when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
