/**
 * Chinese Kindergarten Score Management System
 * Reports & Merit Certificate Generation Module (幼儿成长发展报告与荣誉证书)
 * Enhanced with Dynamic Subjects, Attendance Summary, Multi-Theme Certificates, Bilingual Content & Batch Printing
 */

const AWARD_TEMPLATES = {
  top1: {
    titleKm: "សិស្សឆ្នើមចំណាត់ថ្នាក់លេខ ១",
    titleCn: "第一名 · 状元之星",
    badgeKm: "🏆 សិស្សឆ្នើមលេខ ១ ប្រចាំថ្នាក់ (第一名 状元)",
    badgeCn: "第一名 状元",
    descKm: "បានខិតខំប្រឹងប្រែងរៀនសូត្រ ទទួលបានលទ្ធផលចំណាត់ថ្នាក់លេខ ១ ជើងឯកឆ្នើមប្រចាំថ្នាក់ និងមានវិន័យថ្លៃថ្នូរ។ មានការរីកចម្រើនលើគ្រប់វិស័យទាំងភាសាចិន គណិតវិទ្យា សិល្បៈ និងឥរិយាបថរស់នៅប្រចាំថ្ងៃ។",
    descCn: "在学期总评中成绩名列前茅，荣获全班第一名！学习专注，勤奋好学，遵守纪律，德智体美全面发展，堪为表率，特发此状，以资鼓励！"
  },
  top2: {
    titleKm: "សិស្សឆ្នើមចំណាត់ថ្នាក់លេខ ២",
    titleCn: "第二名 · 榜眼之星",
    badgeKm: "🥈 សិស្សឆ្នើមលេខ ២ ប្រចាំថ្នាក់ (第二名 榜眼)",
    badgeCn: "第二名 榜眼",
    descKm: "បានខិតខំប្រឹងប្រែងរៀនសូត្រ ទទួលបានលទ្ធផលចំណាត់ថ្នាក់លេខ ២ ប្រចាំថ្នាក់ និងមានសីលធម៌ល្អប្រសើរ។ ឆ្លាតវៃ រួសរាយ និងយកចិត្តទុកដាក់ខ្ពស់លើការសិក្សា។",
    descCn: "在学期总评中成绩优异，荣获全班第二名！尊师爱友，乐于助人，学习态度积极端正，特发此状，以资鼓励！"
  },
  top3: {
    titleKm: "សិស្សឆ្នើមចំណាត់ថ្នាក់លេខ ៣",
    titleCn: "第三名 · 探花之星",
    badgeKm: "🥉 សិស្សឆ្នើមលេខ ៣ ប្រចាំថ្នាក់ (第三名 探花)",
    badgeCn: "第三名 探花",
    descKm: "បានខិតខំប្រឹងប្រែងរៀនសូត្រ ទទួលបានលទ្ធផលចំណាត់ថ្នាក់លេខ ៣ ប្រចាំថ្នាក់។ សកម្មក្នុងសកម្មភាពថ្នាក់រៀន និងមានវិន័យថ្លៃថ្នូរ។",
    descCn: "在学期总评中表现突出，荣获全班第三名！思维敏捷，上课专心，表现优良，特发此状，以资鼓励！"
  },
  model: {
    titleKm: "សិស្សគំរូ និងវិន័យល្អ",
    titleCn: "三好学生 · 优秀模范生",
    badgeKm: "🌟 សិស្សគំរូ និងវិន័យល្អ (三好模范生)",
    badgeCn: "三好模范生",
    descKm: "ជាសិស្សគំរូល្អក្នុងថ្នាក់ សុភាពរាបសារ គោរពវិន័យសាលា ចេះជួយមិត្តភក្តិ និងស្តាប់បង្គាប់លោកគ្រូ-អ្នកគ្រូយ៉ាងល្អប្រសើរ។",
    descCn: "在校期间思想品德端正，懂礼貌，守纪律，团结友爱，积极参与集体活动，被评为“三好模范生”，特发此状，以资鼓励！"
  },
  chinese: {
    titleKm: "សិស្សឆ្នើមផ្នែកភាសាចិន",
    titleCn: "华语之星 · 语言表达奖",
    badgeKm: "🀄 សិស្សឆ្នើមភាសាចិន (华语之星)",
    badgeCn: "华语之星",
    descKm: "មានទេពកោសល្យខ្ពស់ និងការរីកចម្រើនយ៉ាងលេចធ្លោក្នុងការរៀនភាសាចិន បញ្ចេញសំឡេងភីនអុីនបានត្រឹមត្រូវ និងចងចាំតួអក្សរចិនបានល្អឥតខ្ចោះ។",
    descCn: "在华文学习与拼音朗读中发音标准纯正，汉字书写规范，口语表达流利自信，被评为“华语之星”，特发此状，以资鼓励！"
  },
  math: {
    titleKm: "សិស្សឆ្នើមផ្នែកគណិតវិទ្យា",
    titleCn: "算术智慧之星 · 数学小能手",
    badgeKm: "🔢 សិស្សឆ្នើមគណិតវិទ្យា (算术之星)",
    badgeCn: "算术之星",
    descKm: "មានការគិតរហ័សរហួន ឆ្លាតវៃ ចងចាំលេខ និងដោះស្រាយលំហាត់គណិតវិទ្យាកុមារបានលឿន និងត្រឹមត្រូវជានិច្ច។",
    descCn: "在数学思维启蒙与数字运算活动中反应敏捷，逻辑清晰，探索欲强，被评为“算术智慧之星”，特发此状，以资鼓励！"
  },
  art: {
    titleKm: "សិស្សឆ្នើមផ្នែកសិល្បៈ និងគំនូរ",
    titleCn: "艺术创意之星 · 巧手小画家",
    badgeKm: "🎨 សិស្សឆ្នើមសិល្បៈ និងគំនូរ (艺术之星)",
    badgeCn: "艺术之星",
    descKm: "មានទេពកោសល្យច្នៃប្រឌិតខ្ពស់ខាងគូររូប ផាត់ពណ៌ និងការងារសិប្បកម្មកុមារបានយ៉ាងស្រស់ស្អាត និងរស់រវើក។",
    descCn: "在美术绘画、色彩搭配与手工制作中富有想象力与创造力，作品生动精彩，被评为“艺术创意之星”，特发此状，以资鼓励！"
  },
  music: {
    titleKm: "សិស្សឆ្នើមផ្នែកចម្រៀង និងតន្ត្រី",
    titleCn: "歌唱之星 · 音乐律动星",
    badgeKm: "🎵 សិស្សឆ្នើមចម្រៀង និងកាយវិការ (律动之星)",
    badgeCn: "音乐律动之星",
    descKm: "ចូលចិត្តច្រៀងចម្រៀងកុមារខ្មែរ-ចិន មានទឹកដមសំនៀងពិរោះ រាំកាយវិការបានស្ទាត់ជំនាញ និងរស់រវើកក្នុងថ្នាក់។",
    descCn: "在儿歌演唱与音乐律动活动中乐感极佳，嗓音清脆动听，表现力丰富自信，被评为“音乐律动之星”，特发此状，以资鼓励！"
  },
  attendance: {
    titleKm: "សិស្សឧស្សាហ៍ព្យាយាម និងវត្តមានពេញ",
    titleCn: "全勤好少年 · 勤勉笃学奖",
    badgeKm: "🌟 សិស្សវត្តមានពេញ ១០០% (全勤好少年)",
    badgeCn: "全勤好少年",
    descKm: "មានភាពឧស្សាហ៍ព្យាយាម មកសាលារៀនទៀងទាត់ជារៀងរាល់ថ្ងៃ មិនដែលអវត្តមាន និងគោរពពេលវេលាបានល្អឥតខ្ចោះ។",
    descCn: "在本学期出勤率达百分之百，不迟到，不早退，勤勉好学，持之以恒，被评为“全勤好少年”，特发此状，以资鼓励！"
  }
};

const TEACHER_COMMENTS_PRESETS = {
  model: {
    label: "🌟 សិស្សពូកែ និងវិន័យថ្លៃថ្នូរ (成绩优异·品德端正)",
    text: "ឆ្លាតវៃ ឧស្សាហ៍ព្យាយាម រួសរាយ និងមានវិន័យល្អណាស់ក្នុងថ្នាក់។ បញ្ចេញសំឡេងភាសាចិនបានច្បាស់ល្អ។ / 聪明懂事，学习积极，课堂纪律好，与同学友好相处，华语发音标准清晰，表现十分优异！"
  },
  chinese: {
    label: "🀄 ឆ្នើមភាសាចិន (华语听说突出)",
    text: "មានទេពកោសល្យខ្ពស់ក្នុងការរៀនភាសាចិន បញ្ចេញសំឡេងភីនអុីនបានត្រឹមត្រូវ ចងចាំតួអក្សរចិនបានល្អ និងក្លាហានក្នុងការសន្ទនា។ / 华语发音纯正标准，拼音拼读熟练，识字量大，课堂对话积极自信，表现卓越！"
  },
  smart: {
    label: "💡 ឆ្លាតវៃ រហ័សរហួន (思维敏捷·活泼自信)",
    text: "មានភាពរួសរាយរាក់ទាក់ គិតរហ័សរហួន សកម្មក្នុងការឆ្លើយសំណួរ និងចូលរួមសកម្មភាពក្នុងថ្នាក់យ៉ាងក្លាហាន។ / 思维敏捷，反应迅速，上课乐于举手发言，自信活泼，充满好奇心与探索精神！"
  },
  creative: {
    label: "🎨 គំនិតច្នៃប្រឌិត និងសិល្បៈ (艺术创意·巧手小画家)",
    text: "មានគំនិតច្នៃប្រឌិតខ្ពស់ ចូលចិត្តគូររូប ផាត់ពណ៌ និងចម្រៀងកាយវិការបានយ៉ាងរស់រវើក និងស្រស់ស្អាត។ / 想象力丰富，动手能力强，在美术绘画、手工及儿歌律动方面表现尤为生动出色！"
  },
  improving: {
    label: "🌱 សុភាពរាបសារ និងរីកចម្រើន (积极努力·稳步进步)",
    text: "សុភាពរាបសារ គោរពវិន័យ ចេះយកចិត្តទុកដាក់ស្ដាប់ការពន្យល់ និងមានការរីកចម្រើនគួរឱ្យកត់សម្គាល់ក្នុងឆមាសនេះ។ / 懂礼貌守纪律，听讲认真，学习态度端正，各方面均有显著进步，值得表扬！"
  }
};

const ReportsModule = {
  currentStudentId: null,
  currentTerm: 'term1',
  currentClass: 'K1',
  currentCertTheme: 'imperial',
  currentAwardType: 'auto',
  includeCertPhoto: true,

  init() {
    this.bindEvents();
    this.renderStudentPicker();

    window.addEventListener('subjects-changed', () => {
      if (this.currentStudentId) this.renderReportCard(this.currentStudentId);
    });
    window.addEventListener('attendance-changed', () => {
      if (this.currentStudentId) this.renderReportCard(this.currentStudentId);
    });
    window.addEventListener('scores-changed', () => {
      if (this.currentStudentId) this.renderReportCard(this.currentStudentId);
    });
  },

  bindEvents() {
    const classFilter = document.getElementById('report-class-filter');
    if (classFilter) {
      classFilter.value = this.currentClass;
      classFilter.addEventListener('change', (e) => {
        this.currentClass = e.target.value;
        this.renderStudentPicker();
      });
    }

    const termFilter = document.getElementById('report-term-filter');
    if (termFilter) {
      termFilter.addEventListener('change', (e) => {
        this.currentTerm = e.target.value;
        if (this.currentStudentId) {
          this.renderReportCard(this.currentStudentId);
        }
      });
    }

    const printBtn = document.getElementById('btn-print-report');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        if (typeof ElectronBridge !== 'undefined') {
          ElectronBridge.printDocument();
        } else {
          window.print();
        }
      });
    }

    const exportPdfReportBtn = document.getElementById('btn-export-pdf-report');
    if (exportPdfReportBtn) {
      exportPdfReportBtn.addEventListener('click', () => {
        const studentId = this.currentStudentId || 'All';
        const fileName = `ReportCard-${studentId}-${this.currentTerm}.pdf`;
        if (typeof ElectronBridge !== 'undefined') {
          ElectronBridge.exportPDF(fileName, false);
        } else {
          window.print();
        }
      });
    }

    const printAllBtn = document.getElementById('btn-print-all-reports');
    if (printAllBtn) {
      printAllBtn.addEventListener('click', () => {
        this.batchPrintAllInClass();
      });
    }

    // Certificate tab events
    const certStudentSelect = document.getElementById('cert-student-select');
    if (certStudentSelect) {
      certStudentSelect.addEventListener('change', (e) => {
        this.renderCertificate(e.target.value);
      });
    }

    const certStyleSelect = document.getElementById('cert-style-select');
    if (certStyleSelect) {
      certStyleSelect.addEventListener('change', (e) => {
        this.currentCertTheme = e.target.value;
        const sId = certStudentSelect ? certStudentSelect.value : this.currentStudentId;
        if (sId) this.renderCertificate(sId);
      });
    }

    const certAwardSelect = document.getElementById('cert-award-select');
    if (certAwardSelect) {
      certAwardSelect.addEventListener('change', (e) => {
        this.currentAwardType = e.target.value;
        const sId = certStudentSelect ? certStudentSelect.value : this.currentStudentId;
        if (sId) this.renderCertificate(sId);
      });
    }

    const certIncludePhoto = document.getElementById('cert-include-photo');
    if (certIncludePhoto) {
      certIncludePhoto.addEventListener('change', (e) => {
        this.includeCertPhoto = e.target.checked;
        const sId = certStudentSelect ? certStudentSelect.value : this.currentStudentId;
        if (sId) this.renderCertificate(sId);
      });
    }

    const printCertBtn = document.getElementById('btn-print-cert');
    if (printCertBtn) {
      printCertBtn.addEventListener('click', () => {
        if (typeof ElectronBridge !== 'undefined') {
          ElectronBridge.printDocument();
        } else {
          window.print();
        }
      });
    }

    const exportPdfCertBtn = document.getElementById('btn-export-pdf-cert');
    if (exportPdfCertBtn) {
      exportPdfCertBtn.addEventListener('click', () => {
        const studentId = certStudentSelect ? certStudentSelect.value : 'Honor';
        const fileName = `Certificate-${studentId}.pdf`;
        if (typeof ElectronBridge !== 'undefined') {
          ElectronBridge.exportPDF(fileName, true);
        } else {
          window.print();
        }
      });
    }

    const batchPrintCertBtn = document.getElementById('btn-batch-print-cert');
    if (batchPrintCertBtn) {
      batchPrintCertBtn.addEventListener('click', () => {
        this.batchPrintMeritCertificates();
      });
    }

    const batchPrintAllCertBtn = document.getElementById('btn-batch-print-all-cert');
    if (batchPrintAllCertBtn) {
      batchPrintAllCertBtn.addEventListener('click', () => {
        this.batchPrintAllCertificatesInClass();
      });
    }

    // Teacher quick comment select
    const quickCommentSelect = document.getElementById('rc-quick-comment-select');
    const commentInput = document.getElementById('rc-teacher-comment-input');
    if (quickCommentSelect && commentInput) {
      quickCommentSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val && TEACHER_COMMENTS_PRESETS[val]) {
          commentInput.value = TEACHER_COMMENTS_PRESETS[val].text;
          if (this.currentStudentId) {
            const score = Storage.getStudentScore(this.currentStudentId, this.currentTerm) || {};
            score.teacherComment = commentInput.value;
            Storage.saveStudentScore(this.currentStudentId, this.currentTerm, score);
            this.renderReportCard(this.currentStudentId);
          }
        }
      });
    }

    // Teacher comment save button
    const saveCommentBtn = document.getElementById('btn-save-comment');
    if (saveCommentBtn && commentInput) {
      saveCommentBtn.addEventListener('click', () => {
        if (!this.currentStudentId) return;
        const score = Storage.getStudentScore(this.currentStudentId, this.currentTerm) || {};
        score.teacherComment = commentInput.value.trim();
        Storage.saveStudentScore(this.currentStudentId, this.currentTerm, score);
        this.renderReportCard(this.currentStudentId);

        const origHtml = saveCommentBtn.innerHTML;
        saveCommentBtn.innerHTML = '<span>✅</span> <span>រក្សាទុករួចរាល់!</span>';
        setTimeout(() => {
          saveCommentBtn.innerHTML = origHtml;
        }, 1400);
      });
    }

    // 5-Domain Star Adjuster Handlers
    const domainKeys = ['health', 'language', 'social', 'science', 'art'];
    domainKeys.forEach(dk => {
      const sel = document.getElementById(`rc-domain-${dk}-select`);
      if (sel) {
        sel.addEventListener('change', () => {
          if (!this.currentStudentId) return;
          const ratings = this.getCurrentDomainInputs();
          Storage.saveDomainRatings(this.currentStudentId, this.currentTerm, ratings);
          this.renderReportCard(this.currentStudentId);
        });
      }
    });

    // Custom Citation Editor Handlers for Certificates
    const titleKmInput = document.getElementById('cert-custom-title-km');
    const titleCnInput = document.getElementById('cert-custom-title-cn');
    const descKmInput = document.getElementById('cert-custom-desc-km');
    const descCnInput = document.getElementById('cert-custom-desc-cn');
    const btnSaveCitation = document.getElementById('btn-save-cert-citation');
    const btnResetCitation = document.getElementById('btn-reset-cert-citation');

    if (btnSaveCitation) {
      btnSaveCitation.addEventListener('click', () => {
        const sSelect = document.getElementById('cert-student-select');
        const sId = sSelect ? sSelect.value : this.currentStudentId;
        if (!sId) return;

        const citation = {
          titleKm: titleKmInput ? titleKmInput.value.trim() : '',
          titleCn: titleCnInput ? titleCnInput.value.trim() : '',
          descKm: descKmInput ? descKmInput.value.trim() : '',
          descCn: descCnInput ? descCnInput.value.trim() : ''
        };
        Storage.saveCustomCitation(sId, this.currentTerm, citation);
        this.renderCertificate(sId);
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('✅ បានរក្សាទុកខ្លឹមសារប័ណ្ណសរសើរផ្ទាល់ខ្លួន!', 'success');
        }
      });
    }

    if (btnResetCitation) {
      btnResetCitation.addEventListener('click', () => {
        const sSelect = document.getElementById('cert-student-select');
        const sId = sSelect ? sSelect.value : this.currentStudentId;
        if (!sId) return;

        localStorage.removeItem(`zh_cert_citation_${sId}_${this.currentTerm}`);
        this.syncCustomCitationControls(sId);
        this.renderCertificate(sId);
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('🔄 បានកំណត់ខ្លឹមសារប័ណ្ណទៅតាមលំនាំដើម!', 'info');
        }
      });
    }
  },

  renderStudentPicker() {
    const container = document.getElementById('report-student-list');
    if (!container) return;

    let students = Storage.getStudents();
    if (this.currentClass !== 'all') {
      students = students.filter(s => s.classGrade === this.currentClass);
    }

    const lang = Storage.getLanguage();
    const t = translations[lang] || translations.km;

    if (students.length === 0) {
      container.innerHTML = `<div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 20px;">${t.noStudentsFound || 'មិនមានសិស្ស'}</div>`;
      return;
    }

    if (!this.currentStudentId || !students.find(s => s.id === this.currentStudentId)) {
      this.currentStudentId = students[0].id;
    }

    container.innerHTML = students.map(s => {
      const isSelected = s.id === this.currentStudentId;
      const avatarEmoji = AVATAR_MAP[s.avatar] || "🧒";
      const avatarDisplay = s.photo 
        ? `<img src="${s.photo}" alt="${s.khmerName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` 
        : avatarEmoji;

      return `
        <div class="student-picker-item ${isSelected ? 'active' : ''}" 
             data-student-id="${s.id}" 
             onclick="ReportsModule.selectStudent('${s.id}')">
          <div class="avatar-circle" style="width: 32px; height: 32px; font-size: 16px;">${avatarDisplay}</div>
          <div class="name-box">
            <div style="font-weight: 700; font-size: 13px;">${s.khmerName}</div>
            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-chinese);">${s.chineseName} (${s.classGrade})</div>
          </div>
          <div style="font-size: 11px; font-weight: 700; color: var(--primary);">${s.id}</div>
        </div>
      `;
    }).join('');

    this.syncCommentControls(this.currentStudentId);
    this.renderReportCard(this.currentStudentId);
    this.populateCertSelect();
  },

  syncCommentControls(studentId) {
    const commentInput = document.getElementById('rc-teacher-comment-input');
    const quickCommentSelect = document.getElementById('rc-quick-comment-select');
    if (!commentInput) return;

    const score = Storage.getStudentScore(studentId, this.currentTerm) || {};
    const defaultComment = TEACHER_COMMENTS_PRESETS.model.text;
    const currentComment = score.teacherComment !== undefined ? score.teacherComment : defaultComment;
    commentInput.value = currentComment;

    if (quickCommentSelect) {
      let matchedKey = '';
      for (const [key, preset] of Object.entries(TEACHER_COMMENTS_PRESETS)) {
        if (preset.text.trim() === currentComment.trim()) {
          matchedKey = key;
          break;
        }
      }
      quickCommentSelect.value = matchedKey;
    }
  },

  selectStudent(studentId) {
    this.currentStudentId = studentId;
    document.querySelectorAll('.student-picker-item').forEach(el => {
      el.classList.toggle('active', el.dataset.studentId === studentId);
    });
    this.syncCommentControls(studentId);
    this.syncDomainControls(studentId);
    this.syncCustomCitationControls(studentId);
    this.renderReportCard(studentId);
  },

  getCurrentDomainInputs() {
    return {
      health: parseInt(document.getElementById('rc-domain-health-select')?.value || '5', 10),
      language: parseInt(document.getElementById('rc-domain-language-select')?.value || '5', 10),
      social: parseInt(document.getElementById('rc-domain-social-select')?.value || '5', 10),
      science: parseInt(document.getElementById('rc-domain-science-select')?.value || '5', 10),
      art: parseInt(document.getElementById('rc-domain-art-select')?.value || '5', 10)
    };
  },

  syncDomainControls(studentId) {
    const saved = Storage.getDomainRatings(studentId, this.currentTerm);
    const score = Storage.getStudentScore(studentId, this.currentTerm) || {};
    const att = Storage.getStudentAttendanceSummary(studentId, this.currentTerm);
    const avg = parseFloat(score.average || 0);

    const calcDefault = (val) => {
      if (!val) return 5;
      const num = parseFloat(val);
      const is100 = num > 10;
      if (is100 ? num >= 88 : num >= 8.8) return 5;
      if (is100 ? num >= 75 : num >= 7.5) return 4;
      if (is100 ? num >= 60 : num >= 6.0) return 3;
      return 2;
    };

    const dHealth = saved?.health || (att.rate >= 90 ? 5 : (att.rate >= 75 ? 4 : 3));
    const dLang = saved?.language || calcDefault(score.chinese || score.huawen || avg);
    const dSoc = saved?.social || (att.rate >= 85 ? 5 : 4);
    const dSci = saved?.science || calcDefault(score.math || score.shuxue || avg);
    const dArt = saved?.art || calcDefault(score.art || score.changyou || avg);

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = String(val);
    };

    setVal('rc-domain-health-select', dHealth);
    setVal('rc-domain-language-select', dLang);
    setVal('rc-domain-social-select', dSoc);
    setVal('rc-domain-science-select', dSci);
    setVal('rc-domain-art-select', dArt);
  },

  syncCustomCitationControls(studentId) {
    const custom = Storage.getCustomCitation(studentId, this.currentTerm);
    const score = Storage.getStudentScore(studentId, this.currentTerm) || {};
    const rank = Number(score.rank) || 1;
    let awardKey = this.currentAwardType || 'auto';
    if (awardKey === 'auto') {
      if (rank === 1) awardKey = 'top1';
      else if (rank === 2) awardKey = 'top2';
      else if (rank === 3) awardKey = 'top3';
      else awardKey = 'model';
    }
    const def = AWARD_TEMPLATES[awardKey] || AWARD_TEMPLATES.top1;

    const setInput = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setInput('cert-custom-title-km', custom?.titleKm || def.titleKm);
    setInput('cert-custom-title-cn', custom?.titleCn || def.titleCn);
    setInput('cert-custom-desc-km', custom?.descKm || def.descKm);
    setInput('cert-custom-desc-cn', custom?.descCn || def.descCn);
  },

  getOfficialSealSvg(settings) {
    const sealSrc = settings.schoolSeal 
      || (typeof DEFAULT_SCHOOL_SEAL !== 'undefined' ? DEFAULT_SCHOOL_SEAL : 'assets/images/school-seal.png');
    return `
      <div class="chinese-red-seal">
        <img src="${sealSrc}" alt="ត្រាសាលា 培华学校" class="official-seal-img" onerror="this.onerror=null; this.src='assets/images/school-seal.png';">
      </div>
    `;
  },

  buildReportCardHtml(student, settings, score, t) {
    const avatarEmoji = AVATAR_MAP[student.avatar] || "🧒";
    const avatarDisplay = student.photo 
      ? `<img src="${student.photo}" class="rc-real-photo">` 
      : avatarEmoji;

    const schoolLogoHtml = settings.schoolLogo
      ? `<img src="${settings.schoolLogo}" class="rc-school-logo-img" alt="Logo">`
      : '';

    const officialSeal = this.getOfficialSealSvg(settings);

    const principalSignHtml = settings.principalSignature
      ? `<img src="${settings.principalSignature}" class="rc-signature-img">`
      : '';

    const teacherSignHtml = settings.teacherSignature
      ? `<img src="${settings.teacherSignature}" class="rc-signature-img">`
      : '';

    // Determine subjects dynamically from Storage
    const subjects = Storage.getSubjects();
    const maxTotalScore = subjects.reduce((acc, s) => acc + (Number(s.maxScore) || 100), 0);

    // Calculate sum & average
    let sum = 0, count = 0;
    subjects.forEach(sub => {
      const val = parseFloat(score[sub.key]);
      if (!isNaN(val)) {
        sum += val;
        count++;
      }
    });
    const avg = count > 0 ? (sum / count) : 0;
    const total = count > 0 ? sum : 0;

    let gradeText = "-";
    if (avg > 0) {
      const is100 = avg > 10;
      if (is100 ? avg >= 90 : avg >= 9.0) gradeText = "优秀 / ល្អប្រសើរ (A)";
      else if (is100 ? avg >= 80 : avg >= 8.0) gradeText = "良好 / ល្អ (B)";
      else if (is100 ? avg >= 65 : avg >= 6.5) gradeText = "中等 / មធ្យម (C)";
      else gradeText = "待提高 / ត្រូវកែលម្អ (D)";
    }

    const termMap = {
      term1: 'ឆមាសទី១ / 第一学期',
      term2: 'ឆមាសទី២ / 第二学期',
      month1: 'ខែតុលា / 十月份',
      month2: 'ខែវិច្ឆិកា / 十一月份',
      month3: 'ខែធ្នូ / 十二月份',
      finalExam: 'ប្រឡងប្រចាំឆ្នាំ / 学年末'
    };
    const termLabel = termMap[this.currentTerm] || this.currentTerm;

    const classGradeMap = {
      'K1': 'ថ្នាក់កុមារដ្ឋាន / 幼儿一班',
      'K2': 'មត្តេយ្យកម្រិតទាប / 幼儿中班',
      'K3': 'មត្តេយ្យកម្រិតខ្ពស់ / 幼儿大班'
    };
    const classLabel = classGradeMap[student.classGrade] || student.classGrade;
    const genderLabel = student.gender === 'female' ? 'ស្រី / 女' : 'ប្រុស / 男';

    const teacherNameKm = settings.teacherNameKm || 'អ្នកគ្រូ ចាង មីលីង';
    const teacherNameCn = settings.teacherNameCn || '江美玲 老师';

    // Total students in this class for ranking proportion
    const classStudentsCount = Storage.getStudents().filter(s => s.classGrade === student.classGrade).length || 1;
    const rankDisplay = score.rank ? `第 ${score.rank} / ${classStudentsCount} 名 (ចំណាត់ថ្នាក់លេខ ${score.rank}/${classStudentsCount})` : '-';

    // Get attendance stats for this student
    const att = Storage.getStudentAttendanceSummary(student.id, this.currentTerm);
    const totalSchoolDays = (att.present || 0) + (att.excused || 0) + (att.unexcused || 0);

    // 5 Early Childhood Developmental Domains (幼儿五大领域发展评估)
    const attRate = (att && att.rate) ? parseFloat(att.rate) : 100;
    const calcDomainStars = (val, fallback = 5) => {
      if (val === undefined || val === null || isNaN(val)) return fallback;
      const num = parseFloat(val);
      const is100 = num > 10;
      if (is100 ? num >= 88 : num >= 8.8) return 5;
      if (is100 ? num >= 75 : num >= 7.5) return 4;
      if (is100 ? num >= 60 : num >= 6.0) return 3;
      return 2;
    };

    const savedDomains = Storage.getDomainRatings(student.id, this.currentTerm);
    const domainRatings = savedDomains || {
      health: attRate >= 90 ? 5 : (attRate >= 75 ? 4 : 3),
      language: calcDomainStars(score.chinese, calcDomainStars(avg, 5)),
      social: (attRate >= 85 && avg >= (avg > 10 ? 75 : 7.5)) ? 5 : 4,
      science: calcDomainStars(score.math, calcDomainStars(avg, 5)),
      art: calcDomainStars(score.art || score.music, calcDomainStars(avg, 5))
    };

    const renderDomainStars = (starsCount) => {
      let starsHtml = '';
      for (let i = 1; i <= 5; i++) {
        const active = i <= starsCount;
        starsHtml += `<span style="color: ${active ? '#F59E0B' : '#E2E8F0'}; font-size: 13px; margin: 0 1px;">★</span>`;
      }
      return starsHtml;
    };

    return `
      <div class="a4-page">
        <!-- Header -->
        <div class="rc-header">
          <div class="rc-header-top-row">
            ${schoolLogoHtml ? `<div class="rc-header-logo-box">${schoolLogoHtml}</div>` : ''}
            <div class="rc-header-school-titles">
              <div class="rc-school-cn">${settings.schoolNameCn || '磅湛省公立培华学校'}</div>
              <div class="rc-school-km">${settings.schoolNameKm || 'សាលារៀន ខ្មែរ-ចិន ភៃហួរ'}</div>
            </div>
          </div>
          <div class="rc-badge-title">ព្រឹត្តិបត្រពិន្ទុសិស្សមត្តេយ្យ / 幼儿成绩单</div>
          <div class="rc-sub-title" style="font-size: 11px; color: #64748B; margin-top: 4px;">
            幼儿学期成长发展评价表 • ឆ្នាំសិក្សា ${settings.academicYear || '2025 - 2026'} 学年 • ${termLabel}
          </div>
        </div>

        <!-- Student Profile Box -->
        <div class="rc-student-bio">
          <div class="rc-avatar-box">
            ${avatarDisplay}
          </div>
          <div>
            <div class="rc-bio-item">
              <span class="rc-bio-label">អត្តលេខ / 学号:</span>
              <span class="rc-bio-val" style="color: var(--primary); font-family: monospace; font-size: 13px;">${student.id}</span>
            </div>
            <div class="rc-bio-item">
              <span class="rc-bio-label">ឈ្មោះខ្មែរ / 姓名:</span>
              <span class="rc-bio-val">${student.khmerName}</span>
            </div>
            <div class="rc-bio-item">
              <span class="rc-bio-label">ឈ្មោះចិន / 中文:</span>
              <span class="rc-bio-val" style="font-family: var(--font-chinese); font-weight: 800;">${student.chineseName}</span>
            </div>
          </div>
          <div>
            <div class="rc-bio-item">
              <span class="rc-bio-label">ថ្នាក់រៀន / 班级:</span>
              <span class="rc-bio-val">${classLabel}</span>
            </div>
            <div class="rc-bio-item">
              <span class="rc-bio-label">ភេទ / 性别:</span>
              <span class="rc-bio-val">${genderLabel}</span>
            </div>
            <div class="rc-bio-item">
              <span class="rc-bio-label">ថ្ងៃកំណើត / 出生:</span>
              <span class="rc-bio-val">${student.dob || '-'}</span>
            </div>
          </div>
        </div>

        <!-- Attendance Summary Row -->
        <div class="rc-attendance-strip" style="display: flex; justify-content: space-around; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 7px 12px; margin-bottom: 12px; font-size: 11.5px;">
          <div>ថ្ងៃរៀនសរុប (总学日): <strong>${totalSchoolDays}</strong> ថ្ងៃ</div>
          <div>•</div>
          <div>វត្តមានពេញ (出勤): <strong style="color: #10B981;">${att.present}</strong> ថ្ងៃ</div>
          <div>•</div>
          <div>មានច្បាប់ (请假): <strong style="color: #F59E0B;">${att.excused}</strong> ថ្ងៃ</div>
          <div>•</div>
          <div>ឥតច្បាប់ (旷课): <strong style="color: #EF4444;">${att.unexcused}</strong> ថ្ងៃ</div>
          <div>•</div>
          <div>យឺត (迟到): <strong>${att.late}</strong> លើក</div>
        </div>

        <!-- Evaluation Breakdown Table -->
        <table class="rc-table">
          <thead>
            <tr>
              <th style="width: 45px;">ល.រ<br><span style="font-size: 11px; font-family: var(--font-chinese); font-weight: normal;">序号</span></th>
              <th style="text-align: left; padding-left: 14px;">មុខវិជ្ជា និងជំនាញវាយតម្លៃ / 学习领域与评估科目</th>
              <th style="width: 95px;">ពិន្ទុពេញ<br><span style="font-size: 11px; font-family: var(--font-chinese); font-weight: normal;">满分</span></th>
              <th style="width: 105px;">ពិន្ទុទទួលបាន<br><span style="font-size: 11px; font-family: var(--font-chinese); font-weight: normal;">实得分</span></th>
              <th style="width: 120px;">កម្រិតវាយតម្លៃ<br><span style="font-size: 11px; font-family: var(--font-chinese); font-weight: normal;">评定等级</span></th>
            </tr>
          </thead>
          <tbody>
            ${subjects.map((sub, idx) => {
              const val = score[sub.key];
              const scoreDisplay = val !== undefined && val !== null ? val : '-';
              let level = '-';
              if (val !== undefined && val !== null) {
                const num = parseFloat(val);
                const is100 = num > 10;
                if (is100 ? num >= 90 : num >= 9.0) level = '优秀 / ល្អប្រសើរ';
                else if (is100 ? num >= 80 : num >= 8.0) level = '良好 / ល្អ';
                else if (is100 ? num >= 65 : num >= 6.5) level = '中等 / មធ្យម';
                else level = '待提高 / ត្រូវកែលម្អ';
              }
              return `
                <tr>
                  <td class="center">${idx + 1}</td>
                  <td class="subject-name" style="padding-left: 14px;">
                    <div style="font-weight: 700; font-size: 13px; color: #0F172A;">${sub.nameKm}</div>
                    <div style="font-size: 12px; color: ${sub.color || '#4338CA'}; font-family: var(--font-chinese); font-weight: 700; margin-top: 2px;">${sub.nameCn}</div>
                  </td>
                  <td class="center">${sub.maxScore || 100}</td>
                  <td class="center" style="font-weight: 700; font-size: 13px; color: var(--primary);">${scoreDisplay}</td>
                  <td class="center" style="font-size: 11px; font-weight: 700; color: #1E293B;">${level}</td>
                </tr>
              `;
            }).join('')}
            <tr class="total-row">
              <td colspan="2" style="text-align: right; font-weight: 800; padding-right: 16px;">
                ពិន្ទុសរុប និងមធ្យមភាគ / 总分与平均分:
              </td>
              <td class="center">${maxTotalScore}</td>
              <td class="center" style="font-weight: 800; color: #1E293B;">${total > 0 ? total.toFixed(1) : '-'}</td>
              <td class="center" style="font-weight: 800; color: var(--primary);">
                មធ្យម / 平均: ${avg > 0 ? avg.toFixed(2) : '-'}
              </td>
            </tr>
            <tr class="total-row" style="background: #EEF2FF;">
              <td colspan="2" style="text-align: right; font-weight: 800; padding-right: 16px;">
                ចំណាត់ថ្នាក់ និងនិទ្ទេសរួម / 名次与综合等级:
              </td>
              <td colspan="3" style="text-align: center; font-weight: 800; color: #4338CA;">
                ${rankDisplay} &nbsp;|&nbsp; និទ្ទេស / 等级: ${gradeText}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 5 Early Childhood Developmental Domains (幼儿五大领域发展评估) -->
        <div class="rc-domains-section">
          <div class="rc-domains-header">
            <span class="rc-domains-badge-title">🌟 ការវាយតម្លៃការលូតលាស់ទាំង ៥ វិស័យរបស់កុមារ / 幼儿五大领域发展综合评价</span>
          </div>
          <div class="rc-domains-grid">
            <div class="rc-domain-card">
              <div class="rc-domain-head">
                <span class="rc-domain-icon">🏃‍♂️</span>
                <div class="rc-domain-name">
                  <div class="rc-d-km">សុខភាព & ចលនា</div>
                  <div class="rc-d-cn">健康与动作</div>
                </div>
              </div>
              <div class="rc-domain-stars">${renderDomainStars(domainRatings.health)}</div>
              <div class="rc-domain-desc">រាងកាយរឹងមាំ អនាម័យ និងចូលចិត្តកីឡា</div>
            </div>

            <div class="rc-domain-card">
              <div class="rc-domain-head">
                <span class="rc-domain-icon">🗣️</span>
                <div class="rc-domain-name">
                  <div class="rc-d-km">ភាសា & ទំនាក់ទំនង</div>
                  <div class="rc-d-cn">语言与表达</div>
                </div>
              </div>
              <div class="rc-domain-stars">${renderDomainStars(domainRatings.language)}</div>
              <div class="rc-domain-desc">បញ្ចេញសំឡេងចិន-ខ្មែរច្បាស់ ក្លាហានបញ្ចេញមតិ</div>
            </div>

            <div class="rc-domain-card">
              <div class="rc-domain-head">
                <span class="rc-domain-icon">🤝</span>
                <div class="rc-domain-name">
                  <div class="rc-d-km">សង្គម & ចរិយាធម៌</div>
                  <div class="rc-d-cn">社会与习惯</div>
                </div>
              </div>
              <div class="rc-domain-stars">${renderDomainStars(domainRatings.social)}</div>
              <div class="rc-domain-desc">ចេះជួយមិត្ត គួរសម និងគោរពវិន័យថ្នាក់រៀន</div>
            </div>

            <div class="rc-domain-card">
              <div class="rc-domain-head">
                <span class="rc-domain-icon">🔬</span>
                <div class="rc-domain-name">
                  <div class="rc-d-km">វិទ្យាសាស្ត្រ & គិត</div>
                  <div class="rc-d-cn">科学与探究</div>
                </div>
              </div>
              <div class="rc-domain-stars">${renderDomainStars(domainRatings.science)}</div>
              <div class="rc-domain-desc">ឆ្លាតវៃ ចង់ដឹងចង់ឃើញ ចងចាំលេខ និងលំនាំ</div>
            </div>

            <div class="rc-domain-card">
              <div class="rc-domain-head">
                <span class="rc-domain-icon">🎨</span>
                <div class="rc-domain-name">
                  <div class="rc-d-km">សិល្បៈ & សោភ័ណ</div>
                  <div class="rc-d-cn">艺术与美感</div>
                </div>
              </div>
              <div class="rc-domain-stars">${renderDomainStars(domainRatings.art)}</div>
              <div class="rc-domain-desc">គំនិតច្នៃប្រឌិត ចូលចិត្តគូររូប និងចម្រៀងកាយវិការ</div>
            </div>
          </div>
        </div>

        <!-- Teacher Comments -->
        <div class="rc-comment-section">
          <div class="rc-comment-title">
            <span>✍️</span> មតិយោបល់គ្រូបន្ទុកថ្នាក់ / 教师成长评语:
          </div>
          <div class="rc-comment-text">
            ${score.teacherComment || 'ឆ្លាតវៃ ឧស្សាហ៍ព្យាយាម រួសរាយ និងមានវិន័យល្អណាស់ក្នុងថ្នាក់។ បញ្ចេញសំឡេងភាសាចិនបានច្បាស់ល្អ។ / 聪明懂事，学习积极，课堂纪律好，与同学友好相处，华语发音标准清晰，表现十分优异！'}
          </div>
        </div>

        <!-- Signatures & Official Stamp -->
        <div class="rc-signatures">
          <div class="rc-sign-block">
            <span class="rc-sign-title">ហត្ថលេខានាយកសាលា<br><span style="font-size: 11px; font-weight: normal; font-family: var(--font-chinese);">校长签名</span></span>
            <div class="rc-sign-space">
              ${principalSignHtml || officialSeal}
            </div>
            <span class="rc-sign-name">${settings.principalNameKm || 'លោកស្រី ថេង សោភា'} (${settings.principalNameCn || '秦少萍 校长'})</span>
          </div>

          <div class="rc-sign-block">
            <span class="rc-sign-title">ហត្ថលេខាគ្រូបន្ទុកថ្នាក់<br><span style="font-size: 11px; font-weight: normal; font-family: var(--font-chinese);">班主任签名</span></span>
            <div class="rc-sign-space">
              ${teacherSignHtml}
            </div>
            <span class="rc-sign-name">${teacherNameKm} (${teacherNameCn})</span>
          </div>

          <div class="rc-sign-block">
            <span class="rc-sign-title">ហត្ថលេខាអាណាព្យាបាល<br><span style="font-size: 11px; font-weight: normal; font-family: var(--font-chinese);">家长签名</span></span>
            <div class="rc-sign-space"></div>
            <span class="rc-sign-name">មាតាបិតា ឬអាណាព្យាបាល (家长)</span>
          </div>
        </div>

        <!-- Parent Acknowledgment Tear-off Slip (家长回执联) -->
        <div class="rc-parent-slip-wrapper">
          <div class="rc-slip-cut-line">
            <span>✂️</span>
            <span class="rc-cut-text">កាត់តាមបន្ទាត់ដាច់ៗនេះផ្ញើជូនសាលាវិញ (沿虚线剪下交回学校)</span>
            <span>✂️</span>
          </div>
          <div class="rc-parent-slip">
            <div class="rc-slip-header">
              <div class="rc-slip-title-km">ប័ណ្ណទទួលដំណឹង និងការយល់ព្រមពីអាណាព្យាបាល (家长回执联)</div>
              <div class="rc-slip-meta">${settings.schoolNameKm || 'សាលារៀន ខ្មែរ-ចិន ភៃហួរ'} • ${termLabel} • ឆ្នាំ ${settings.academicYear || '2025-2026'}</div>
            </div>
            <div class="rc-slip-grid">
              <div>សិស្ស៖ <strong>${student.khmerName} (${student.chineseName})</strong></div>
              <div>អត្តលេខ៖ <strong>${student.id}</strong> | ថ្នាក់៖ <strong>${classLabel}</strong></div>
              <div>មធ្យមភាគ៖ <strong>${avg > 0 ? avg.toFixed(2) : '-'}</strong> | និទ្ទេស៖ <strong>${gradeText}</strong></div>
              <div>អត្រាវត្តមាន៖ <strong>${att.rate}%</strong> | ចំណាត់ថ្នាក់៖ <strong>${score.rank ? score.rank : '-'}</strong></div>
            </div>
            <div class="rc-slip-feedback-line">
              <span>មតិយោបល់ ឬសំណូមពរអាណាព្យាបាល (家长意见)：</span>
              <span class="rc-slip-dotted-line">.......................................................................................................................................</span>
            </div>
            <div class="rc-slip-bottom">
              <div>កាលបរិច្ឆេទ (日期)：______ / ______ / 2026</div>
              <div>ហត្ថលេខា ឬស្នាមមេដៃអាណាព្យាបាល (家长签名/盖章)：__________________</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  buildAnnualReportBookHtml(studentId, settings, t) {
    const annualRec = Storage.getStudentAnnualRecord(studentId);
    if (!annualRec) return '';

    const { student, subjectRows, finalAnnualAvg, finalGrade, term1Rank, term2Rank, attendance, promotion } = annualRec;
    const avatarEmoji = AVATAR_MAP[student.avatar] || "🧒";
    const avatarDisplay = student.photo 
      ? `<img src="${student.photo}" class="rc-real-photo">` 
      : avatarEmoji;

    const schoolLogoHtml = settings.schoolLogo
      ? `<img src="${settings.schoolLogo}" class="rc-school-logo-img" alt="Logo">`
      : '';

    const officialSeal = this.getOfficialSealSvg(settings);

    const principalSignHtml = settings.principalSignature
      ? `<img src="${settings.principalSignature}" class="rc-signature-img">`
      : '';

    const teacherSignHtml = settings.teacherSignature
      ? `<img src="${settings.teacherSignature}" class="rc-signature-img">`
      : '';

    const classLabel = student.classGrade === 'K3' ? 'មត្តេយ្យកម្រិតខ្ពស់ (幼大班 - K3)'
                     : student.classGrade === 'K2' ? 'មត្តេយ្យកម្រិតទាប (幼中班 - K2)'
                     : 'ថ្នាក់កុមារដ្ឋាន (幼小班 - K1)';

    const teacherNameKm = student.classGrade === 'K3' ? (settings.teacherK3NameKm || 'អ្នកគ្រូ លី គឹមហុង')
                        : student.classGrade === 'K2' ? (settings.teacherK2NameKm || 'អ្នកគ្រូ ស៊ឹម ម៉េងជូ')
                        : (settings.teacherK1NameKm || 'អ្នកគ្រូ ចាង មីលីង');

    const teacherNameCn = student.classGrade === 'K3' ? (settings.teacherK3NameCn || '李金红')
                        : student.classGrade === 'K2' ? (settings.teacherK2NameCn || '沈孟珠')
                        : (settings.teacherK1NameCn || '江美玲');

    const gradeText = finalGrade === 'A' ? '优 (ល្អប្រសើរ / 优秀)'
                    : finalGrade === 'B' ? '良 (ល្អ / 良好)'
                    : finalGrade === 'C' ? '中 (មធ្យម / 中等)'
                    : '待提高 (ត្រូវកែលម្អ)';

    return `
      <div class="report-sheet annual-growth-book">
        <!-- School Header -->
        <div class="rc-header">
          <div class="rc-logo-left">
            ${schoolLogoHtml}
          </div>
          <div class="rc-school-title">
            <h1 class="rc-school-km">${settings.schoolNameKm || 'សាលារៀន ខ្មែរ-ចិន ភៃហួរ'}</h1>
            <h2 class="rc-school-cn">${settings.schoolNameCn || '磅湛省公立培华学校'}</h2>
            <div class="rc-school-motto-strip">
              <span>${settings.schoolMottoKm || 'ឧស្សាហ៍ វិន័យ សាមគ្គី ច្នៃប្រឌិត'}</span> • 
              <span style="font-family: var(--font-chinese);">${settings.schoolMottoCn || '勤奋 · 守纪 · 博爱 · 创新'}</span>
            </div>
            <div class="rc-term-badge" style="background: linear-gradient(135deg, #1E3A8A, #3B82F6); color: #fff;">
              <span>សៀវភៅតាមដានការលូតលាស់ និងលទ្ធផលសិក្សាប្រចាំឆ្នាំ • 华文幼儿园学年综合成长档案</span>
            </div>
          </div>
          <div class="rc-logo-right">
            ${officialSeal}
          </div>
        </div>

        <!-- Student Meta Strip -->
        <div class="rc-student-meta">
          <div class="rc-student-photo">
            ${avatarDisplay}
          </div>
          <div class="rc-meta-grid">
            <div class="rc-meta-item">
              <span class="rc-meta-label">ឈ្មោះសិស្ស (姓名):</span>
              <strong class="rc-meta-value">${student.khmerName} (${student.chineseName})</strong>
            </div>
            <div class="rc-meta-item">
              <span class="rc-meta-label">អត្តលេខសិស្ស (学号):</span>
              <strong class="rc-meta-value" style="font-family: monospace; color: var(--primary);">${student.id}</strong>
            </div>
            <div class="rc-meta-item">
              <span class="rc-meta-label">ថ្នាក់រៀន (班级):</span>
              <span class="rc-meta-value">${classLabel}</span>
            </div>
            <div class="rc-meta-item">
              <span class="rc-meta-label">ឆ្នាំសិក្សា (学年):</span>
              <span class="rc-meta-value">${settings.academicYear || '2025 - 2026'}</span>
            </div>
            <div class="rc-meta-item">
              <span class="rc-meta-label">ភេទ (性别):</span>
              <span class="rc-meta-value">${student.gender === 'female' ? 'ស្រី (女)' : 'ប្រុស (男)'}</span>
            </div>
            <div class="rc-meta-item">
              <span class="rc-meta-label">គ្រូបន្ទុកថ្នាក់ (班主任):</span>
              <span class="rc-meta-value">${teacherNameKm} (${teacherNameCn})</span>
            </div>
          </div>
        </div>

        <!-- Dual-Term Performance Table -->
        <table class="rc-scores-table" style="margin-top: 14px;">
          <thead>
            <tr>
              <th style="width: 40px;" class="center">ល.រ</th>
              <th style="text-align: left; padding-left: 14px;">មុខវិជ្ជាសិក្សា (课程与科目)</th>
              <th style="width: 80px;" class="center">ពិន្ទុពេញ</th>
              <th style="width: 100px;" class="center">ឆមាសទី ១<br><span style="font-size: 10px; font-weight: normal;">第一学期</span></th>
              <th style="width: 100px;" class="center">ឆមាសទី ២<br><span style="font-size: 10px; font-weight: normal;">第二学期</span></th>
              <th style="width: 110px;" class="center">មធ្យមប្រចាំឆ្នាំ<br><span style="font-size: 10px; font-weight: normal;">学年总评</span></th>
            </tr>
          </thead>
          <tbody>
            ${subjectRows.map((sub, idx) => `
              <tr>
                <td class="center font-bold">${idx + 1}</td>
                <td class="subject-name" style="padding-left: 14px;">
                  <div style="font-weight: 700; font-size: 12.5px; color: #0F172A;">${sub.nameKm}</div>
                  <div style="font-size: 11.5px; color: #4338CA; font-family: var(--font-chinese); font-weight: 700;">${sub.nameCn}</div>
                </td>
                <td class="center">${sub.maxScore}</td>
                <td class="center" style="font-weight: 600;">${sub.t1}</td>
                <td class="center" style="font-weight: 600;">${sub.t2}</td>
                <td class="center" style="font-weight: 800; font-size: 13px; color: var(--primary);">${sub.annualAvg}</td>
              </tr>
            `).join('')}
            <tr class="total-row" style="background: #EEF2FF;">
              <td colspan="3" style="text-align: right; font-weight: 800; padding-right: 14px;">
                លទ្ធផលមធ្យមភាគ និងចំណាត់ថ្នាក់ប្រចាំឆ្នាំ / 学年总成绩与名次:
              </td>
              <td class="center" style="font-weight: 700;">ឆ.១: ${term1Rank ? `លេខ ${term1Rank}` : '-'}</td>
              <td class="center" style="font-weight: 700;">ឆ.២: ${term2Rank ? `លេខ ${term2Rank}` : '-'}</td>
              <td class="center" style="font-weight: 800; color: var(--primary); font-size: 14px;">
                ${finalAnnualAvg} (${finalGrade})
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Growth Evolution & Attendance Strips -->
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 14px; margin-top: 14px;">
          <!-- 5 Domains Annual Evolution -->
          <div style="padding: 12px 14px; border: 1px solid #CBD5E1; border-radius: 8px; background: #F8FAFC;">
            <div style="font-weight: 700; font-size: 12px; color: #1E3A8A; margin-bottom: 8px;">
              🌟 ការលូតលាស់ទាំង ៥ វិស័យប្រចាំឆ្នាំ (幼儿五大领域成长总评)
            </div>
            <div style="font-size: 11px; display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between;"><span>🏃‍♂️ សុខភាព & ចលនា (健康与动作):</span><span style="color: #F59E0B; font-weight: bold;">⭐⭐⭐⭐⭐ ឆ្នើម</span></div>
              <div style="display: flex; justify-content: space-between;"><span>🗣️ ភាសា & ទំនាក់ទំនង (语言与表达):</span><span style="color: #F59E0B; font-weight: bold;">⭐⭐⭐⭐⭐ ឆ្នើម</span></div>
              <div style="display: flex; justify-content: space-between;"><span>🤝 សង្គម & ចរិយាធម៌ (社会与习惯):</span><span style="color: #F59E0B; font-weight: bold;">⭐⭐⭐⭐⭐ ឆ្នើម</span></div>
              <div style="display: flex; justify-content: space-between;"><span>🔬 វិទ្យាសាស្ត្រ & គិត (科学与探究):</span><span style="color: #F59E0B; font-weight: bold;">⭐⭐⭐⭐⭐ ឆ្នើម</span></div>
              <div style="display: flex; justify-content: space-between;"><span>🎨 សិល្បៈ & សោភ័ណ (艺术与美感):</span><span style="color: #F59E0B; font-weight: bold;">⭐⭐⭐⭐⭐ ឆ្នើម</span></div>
            </div>
          </div>

          <!-- Cumulative Attendance Box -->
          <div style="padding: 12px 14px; border: 1px solid #CBD5E1; border-radius: 8px; background: #F8FAFC; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-weight: 700; font-size: 12px; color: #1E3A8A;">
              📅 ស្ថិតិវត្តមានពេញមួយឆ្នាំសិក្សា (学年出勤全记录)
            </div>
            <div style="font-size: 11.5px; line-height: 1.6; margin-top: 4px;">
              <div>• ថ្ងៃរៀនសរុប៖ <strong>${attendance.totalSchoolDays} ថ្ងៃ</strong></div>
              <div>• វត្តមានពេញ៖ <strong style="color: #10B981;">${attendance.totalPresent} ថ្ងៃ</strong> (ច្បាប់: ${attendance.totalExcused}, ឥតច្បាប់: ${attendance.totalUnexcused})</div>
              <div>• អត្រាវត្តមានសរុបប្រចាំឆ្នាំ៖ <strong style="font-size: 13px; color: #1E3A8A;">${attendance.attendanceRate}%</strong></div>
            </div>
            <div style="font-size: 11px; font-weight: bold; color: #059669; background: rgba(16,185,129,0.1); padding: 4px 8px; border-radius: 4px; text-align: center;">
              🏆 សិស្សមានវិន័យ និងការចូលរៀនទៀងទាត់
            </div>
          </div>
        </div>

        <!-- Annual Promotion Decision -->
        <div class="rc-promotion-box" style="margin-top: 14px; padding: 12px 16px; border: 2px solid #3B82F6; background: #EFF6FF; border-radius: 8px; text-align: center;">
          <div style="font-size: 13px; font-weight: 800; color: #1E3A8A;">
            🎓 សេចក្តីសម្រេចរបស់គណៈគ្រប់គ្រងសាលា (升学审定与毕业鉴定)
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #1E40AF; margin-top: 4px;">
            ${promotion.km}
          </div>
          <div style="font-size: 13px; font-family: var(--font-chinese); font-weight: 700; color: #2563EB; margin-top: 2px;">
            ${promotion.cn}
          </div>
        </div>

        <!-- Signatures & Official Stamp -->
        <div class="rc-signatures" style="margin-top: 16px;">
          <div class="rc-sign-block">
            <span class="rc-sign-title">ហត្ថលេខានាយកសាលា<br><span style="font-size: 11px; font-weight: normal; font-family: var(--font-chinese);">校长签名</span></span>
            <div class="rc-sign-space">
              ${principalSignHtml || officialSeal}
            </div>
            <span class="rc-sign-name">${settings.principalNameKm || 'លោកស្រី ថេង សោភា'} (${settings.principalNameCn || '秦少萍 校长'})</span>
          </div>

          <div class="rc-sign-block">
            <span class="rc-sign-title">ហត្ថលេខាគ្រូបន្ទុកថ្នាក់<br><span style="font-size: 11px; font-weight: normal; font-family: var(--font-chinese);">班主任签名</span></span>
            <div class="rc-sign-space">
              ${teacherSignHtml}
            </div>
            <span class="rc-sign-name">${teacherNameKm} (${teacherNameCn})</span>
          </div>

          <div class="rc-sign-block">
            <span class="rc-sign-title">ហត្ថលេខាអាណាព្យាបាល<br><span style="font-size: 11px; font-weight: normal; font-family: var(--font-chinese);">家长签名</span></span>
            <div class="rc-sign-space"></div>
            <span class="rc-sign-name">មាតាបិតា ឬអាណាព្យាបាល (家长)</span>
          </div>
        </div>
      </div>
    `;
  },

  renderReportCard(studentId) {
    const previewContainer = document.getElementById('report-card-preview-area');
    if (!previewContainer) return;

    const student = Storage.getStudentById(studentId);
    if (!student) {
      previewContainer.innerHTML = '<div style="color: var(--text-muted); padding: 40px; text-align: center;">សូមជ្រើសរើសសិស្សដើម្បីមើលព្រឹត្តិបត្រ</div>';
      return;
    }

    const settings = Storage.getSettings();
    const lang = Storage.getLanguage();
    const t = translations[lang] || translations.km;

    if (this.currentTerm === 'annualRecord') {
      previewContainer.innerHTML = this.buildAnnualReportBookHtml(studentId, settings, t);
      return;
    }

    const score = Storage.getStudentScore(studentId, this.currentTerm) || {};
    previewContainer.innerHTML = this.buildReportCardHtml(student, settings, score, t);
  },

  populateCertSelect() {
    const select = document.getElementById('cert-student-select');
    if (!select) return;

    const students = Storage.getStudents();
    select.innerHTML = students.map(s => {
      const score = Storage.getStudentScore(s.id, this.currentTerm) || {};
      const rankStr = score.rank ? `(ចំណាត់ថ្នាក់: ${score.rank})` : '';
      return `<option value="${s.id}">${s.khmerName} - ${s.chineseName} [${s.classGrade}] ${rankStr}</option>`;
    }).join('');

    if (students.length > 0) {
      this.renderCertificate(students[0].id);
    }
  },

  buildCertificateHtml(student, settings, score, t, overrideTheme, overrideAward) {
    const theme = overrideTheme || this.currentCertTheme || 'imperial';
    let awardKey = overrideAward || this.currentAwardType || 'auto';

    const rank = Number(score.rank) || 1;
    if (awardKey === 'auto') {
      if (rank === 1) awardKey = 'top1';
      else if (rank === 2) awardKey = 'top2';
      else if (rank === 3) awardKey = 'top3';
      else awardKey = 'model';
    }

    let award = { ...(AWARD_TEMPLATES[awardKey] || AWARD_TEMPLATES.top1) };
    const customCitation = Storage.getCustomCitation(student.id, this.currentTerm);
    if (customCitation) {
      if (customCitation.titleKm) award.titleKm = customCitation.titleKm;
      if (customCitation.titleCn) award.titleCn = customCitation.titleCn;
      if (customCitation.descKm) award.descKm = customCitation.descKm;
      if (customCitation.descCn) award.descCn = customCitation.descCn;
    }
    const officialSeal = this.getOfficialSealSvg(settings);

    const principalSignHtml = settings.principalSignature
      ? `<img src="${settings.principalSignature}" class="rc-signature-img" alt="Principal Signature">`
      : '';

    const teacherSignHtml = settings.teacherSignature
      ? `<img src="${settings.teacherSignature}" class="rc-signature-img" alt="Teacher Signature">`
      : '';

    const schoolLogoHtml = settings.schoolLogo
      ? `<img src="${settings.schoolLogo}" class="cert-school-logo-img" alt="School Logo">`
      : `<div class="cert-school-badge-placeholder">🏫</div>`;

    // Student Photo/Avatar HTML
    let studentPhotoHtml = '';
    if (this.includeCertPhoto) {
      if (student.photo) {
        studentPhotoHtml = `
          <div class="cert-photo-container">
            <div class="cert-photo-frame">
              <img src="${student.photo}" class="cert-photo-img" alt="${student.khmerName}">
            </div>
          </div>
        `;
      } else {
        const avatarEmoji = AVATAR_MAP[student.avatar] || '🧒';
        studentPhotoHtml = `
          <div class="cert-photo-container">
            <div class="cert-photo-frame cert-photo-avatar">
              <span>${avatarEmoji}</span>
            </div>
          </div>
        `;
      }
    }

    // Format current date in both Khmer & Chinese
    const now = new Date();
    const kmMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    const dateKm = `ថ្ងៃទី ${now.getDate()} ខែ ${kmMonths[now.getMonth()]} ឆ្នាំ ${now.getFullYear()}`;
    const dateCn = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日`;

    // Term labels
    let termTextKm = 'ឆមាសទី១';
    let termTextCn = '第一学期';
    if (this.currentTerm === 'term2') {
      termTextKm = 'ឆមាសទី២';
      termTextCn = '第二学期';
    } else if (this.currentTerm === 'finalExam') {
      termTextKm = 'ប្រចាំឆ្នាំ';
      termTextCn = '全学年';
    }

    return `
      <div class="cert-page cert-theme-${theme} page-break" data-theme="${theme}">
        <div class="cert-outer-border">
          <div class="cert-inner-border">
            <div class="cert-watermark-emblem"></div>
            
            <div class="cert-corner-decor tl"></div>
            <div class="cert-corner-decor tr"></div>
            <div class="cert-corner-decor bl"></div>
            <div class="cert-corner-decor br"></div>

            <!-- Top Header with School Name & Serial -->
            <div class="cert-top-header">
              <div class="cert-header-left">
                <div class="cert-header-logo-box">${schoolLogoHtml}</div>
                <div class="cert-school-titles">
                  <div class="cert-school-cn">${settings.schoolNameCn || '磅湛省公立培华学校'}</div>
                  <div class="cert-school-km">${settings.schoolNameKm || 'សាលារៀន ខ្មែរ-ចិន ភៃហួរ'}</div>
                </div>
              </div>
              <div class="cert-header-serial">
                <span class="cert-serial-label">លេខសម្គាល់ / 编号:</span>
                <span class="cert-serial-value">${settings.academicYear ? settings.academicYear.split('-')[0].trim() : '2026'}-${student.id}</span>
              </div>
            </div>

            <!-- Main Heading -->
            <div class="cert-title-section">
              <div class="cert-main-title">荣誉证书</div>
              <div class="cert-km-title">ប័ណ្ណសរសើរសិស្សឆ្នើម និងកិត្តិយស</div>
            </div>

            <!-- Award Ribbon Badge -->
            <div class="cert-ribbon-wrapper">
              <div class="cert-rank-ribbon">
                <span class="ribbon-icon">🎖️</span>
                <span class="ribbon-text-cn">${award.titleCn}</span>
                <span class="ribbon-sep">•</span>
                <span class="ribbon-text-km">${award.titleKm}</span>
              </div>
            </div>

            <!-- Student Section (Seamless without card box) -->
            <div class="cert-student-section ${this.includeCertPhoto ? 'with-photo' : 'without-photo'}">
              ${studentPhotoHtml}
              <div class="cert-student-info">
                <div class="cert-intro-text">
                  <span>兹证明</span>
                  <span class="intro-sep">•</span>
                  <span>សេចក្តីបញ្ជាក់</span>
                </div>
                <div class="cert-student-names">
                  <span class="cert-student-name-cn">${student.chineseName}</span>
                  <span class="cert-student-name-km">(${student.khmerName})</span>
                  <span class="cert-student-gender">${student.gender === 'female' ? '👧 女' : '👦 男'}</span>
                </div>
                <div class="cert-meta-tags">
                  <span>ថ្នាក់ / 班级: <strong>${student.classGrade}</strong></span>
                  <span class="cert-meta-sep">•</span>
                  <span>អត្តលេខ / 学号: <strong>${student.id}</strong></span>
                  <span class="cert-meta-sep">•</span>
                  <span>ឆមាស / 学期: <strong>${termTextKm} (${termTextCn})</strong></span>
                  <span class="cert-meta-sep">•</span>
                  <span>ឆ្នាំសិក្សា / 学年: <strong>${settings.academicYear || '2025 - 2026'}</strong></span>
                </div>
              </div>
            </div>

            <!-- Unified Bilingual Citation Body (No separate boxes or split columns) -->
            <div class="cert-unified-body">
              <div class="cert-desc-cn">${award.descCn}</div>
              <div class="cert-desc-km">${award.descKm}</div>
            </div>

            <!-- Footer: Signatures, Seal, Date -->
            <div class="cert-footer-section">
              <!-- Left: Principal -->
              <div class="cert-sign-col cert-sign-principal">
                <div class="cert-sign-space">
                  ${principalSignHtml}
                  <div class="cert-seal-overlay">${officialSeal}</div>
                </div>
                <div class="cert-sign-line">
                  <div class="cert-sign-role">នាយិកាសាលា / 校长</div>
                  <div class="cert-sign-name">${settings.principalNameKm || 'លោកស្រី ថេង សោភា'} • ${settings.principalNameCn || '秦少萍'}</div>
                </div>
              </div>

              <!-- Center: Official Date -->
              <div class="cert-sign-center-date">
                <div class="cert-date-km">${dateKm}</div>
                <div class="cert-date-cn">${dateCn}</div>
                <div class="cert-date-school">${settings.schoolNameCn || '磅湛省公立培华学校'}</div>
              </div>

              <!-- Right: Class Teacher -->
              <div class="cert-sign-col cert-sign-teacher">
                <div class="cert-sign-space">
                  ${teacherSignHtml}
                </div>
                <div class="cert-sign-line">
                  <div class="cert-sign-role">គ្រូបន្ទុកថ្នាក់ / 班主任</div>
                  <div class="cert-sign-name">${settings.teacherNameKm || 'អ្នកគ្រូ ចាង មីលីង'} • ${settings.teacherNameCn || '江美玲'}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  },

  renderCertificate(studentId) {
    const preview = document.getElementById('cert-preview-area');
    if (!preview) return;

    const student = Storage.getStudentById(studentId);
    if (!student) return;

    const settings = Storage.getSettings();
    const score = Storage.getStudentScore(studentId, this.currentTerm) || {};
    const lang = Storage.getLanguage();
    const t = translations[lang] || translations.km;

    preview.innerHTML = this.buildCertificateHtml(student, settings, score, t);
  },

  batchPrintAllInClass() {
    let students = Storage.getStudents();
    if (this.currentClass !== 'all') {
      students = students.filter(s => s.classGrade === this.currentClass);
    }

    if (students.length === 0) {
      alert("មិនមានសិស្សក្នុងថ្នាក់នេះដើម្បីបោះពុម្ពទេ! / No students to print!");
      return;
    }

    const previewContainer = document.getElementById('report-card-preview-area');
    const settings = Storage.getSettings();
    const lang = Storage.getLanguage();
    const t = translations[lang] || translations.km;

    previewContainer.innerHTML = `
      <div class="batch-preview-container">
        ${students.map(s => {
          if (this.currentTerm === 'annualRecord') {
            return `<div class="page-break">${this.buildAnnualReportBookHtml(s.id, settings, t)}</div>`;
          }
          const score = Storage.getStudentScore(s.id, this.currentTerm) || {};
          return `<div class="page-break">${this.buildReportCardHtml(s, settings, score, t)}</div>`;
        }).join('')}
      </div>
    `;

    setTimeout(() => {
      if (typeof ElectronBridge !== 'undefined') {
        ElectronBridge.printDocument();
      } else {
        window.print();
      }
      setTimeout(() => {
        this.renderReportCard(this.currentStudentId);
      }, 500);
    }, 400);
  },

  batchPrintMeritCertificates() {
    let students = Storage.getStudents();
    if (this.currentClass !== 'all') {
      students = students.filter(s => s.classGrade === this.currentClass);
    }

    let targetStudents = students;
    if (this.currentAwardType === 'auto') {
      targetStudents = students.filter(s => {
        const sc = Storage.getStudentScore(s.id, this.currentTerm) || {};
        return sc.rank && Number(sc.rank) <= 3;
      });
      if (targetStudents.length === 0) {
        targetStudents = students.slice(0, 3);
      }
    }

    if (targetStudents.length === 0) {
      alert("មិនមានសិស្សក្នុងថ្នាក់នេះដើម្បីបោះពុម្ពទេ! / No students to print!");
      return;
    }

    const preview = document.getElementById('cert-preview-area');
    const settings = Storage.getSettings();
    const lang = Storage.getLanguage();
    const t = translations[lang] || translations.km;

    preview.innerHTML = `
      <div class="batch-cert-container">
        ${targetStudents.map(s => {
          const score = Storage.getStudentScore(s.id, this.currentTerm) || {};
          return this.buildCertificateHtml(s, settings, score, t);
        }).join('')}
      </div>
    `;

    setTimeout(() => {
      if (typeof ElectronBridge !== 'undefined') {
        ElectronBridge.printDocument();
      } else {
        window.print();
      }
      setTimeout(() => {
        const certStudentSelect = document.getElementById('cert-student-select');
        const sId = certStudentSelect ? certStudentSelect.value : targetStudents[0]?.id;
        if (sId) this.renderCertificate(sId);
      }, 500);
    }, 400);
  },

  batchPrintAllCertificatesInClass() {
    let students = Storage.getStudents();
    if (this.currentClass !== 'all') {
      students = students.filter(s => s.classGrade === this.currentClass);
    }

    if (students.length === 0) {
      alert("មិនមានសិស្សក្នុងថ្នាក់នេះដើម្បីបោះពុម្ពទេ! / No students to print!");
      return;
    }

    const preview = document.getElementById('cert-preview-area');
    const settings = Storage.getSettings();
    const lang = Storage.getLanguage();
    const t = translations[lang] || translations.km;

    preview.innerHTML = `
      <div class="batch-cert-container">
        ${students.map(s => {
          const score = Storage.getStudentScore(s.id, this.currentTerm) || {};
          return this.buildCertificateHtml(s, settings, score, t);
        }).join('')}
      </div>
    `;

    setTimeout(() => {
      if (typeof ElectronBridge !== 'undefined') {
        ElectronBridge.printDocument();
      } else {
        window.print();
      }
      setTimeout(() => {
        const certStudentSelect = document.getElementById('cert-student-select');
        const sId = certStudentSelect ? certStudentSelect.value : students[0]?.id;
        if (sId) this.renderCertificate(sId);
      }, 500);
    }, 400);
  }
};

window.ReportsModule = ReportsModule;
