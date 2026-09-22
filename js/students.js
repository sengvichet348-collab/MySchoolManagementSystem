/**
 * Chinese Kindergarten Score Management System
 * Students Management Module
 * Enhanced with Real Photos, Bulk CSV Import, and Trash Bin
 */

const AVATAR_MAP = {
  boy1: "👦",
  boy2: "🧒",
  boy3: "👶",
  girl1: "👧",
  girl2: "👧🏻",
  girl3: "🧒🏻"
};

const StudentsModule = {
  currentFilterClass: 'all',
  currentFilterGender: 'all',
  searchQuery: '',
  selectedStudentId: null,
  cachedCsvContent: '',

  init() {
    this.bindEvents();
    this.bindPhotoUpload();
    this.bindTrashBin();
    this.bindCsvImport();
    this.renderStudents();
    this.updateTrashBadge();
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('student-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.renderStudents();
      });
    }

    // Class filter select
    const classFilter = document.getElementById('student-class-filter');
    if (classFilter) {
      classFilter.addEventListener('change', (e) => {
        this.currentFilterClass = e.target.value;
        this.renderStudents();
      });
    }

    // Gender filter select
    const genderFilter = document.getElementById('student-gender-filter');
    if (genderFilter) {
      genderFilter.addEventListener('change', (e) => {
        this.currentFilterGender = e.target.value;
        this.renderStudents();
      });
    }

    // Add Student Button
    const addBtn = document.getElementById('btn-add-student');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.openStudentModal());
    }

    // Student Form Submit
    const studentForm = document.getElementById('student-form');
    if (studentForm) {
      studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveStudent();
      });
    }

    // Avatar Selection Clicks
    const avatarGrid = document.getElementById('avatar-selector-grid');
    if (avatarGrid) {
      avatarGrid.addEventListener('click', (e) => {
        const choice = e.target.closest('.avatar-choice');
        if (choice) {
          document.querySelectorAll('.avatar-choice').forEach(c => c.classList.remove('selected'));
          choice.classList.add('selected');
          document.getElementById('student-avatar-input').value = choice.dataset.avatar;

          // If no custom photo uploaded, update preview with emoji
          const photoInput = document.getElementById('student-photo-input');
          if (!photoInput || !photoInput.value) {
            const preview = document.getElementById('student-photo-preview');
            if (preview) preview.innerHTML = AVATAR_MAP[choice.dataset.avatar] || '👦';
          }
        }
      });
    }

    // Print Class Roster (A4 Portrait 花名册)
    const btnPrintRoster = document.getElementById('btn-print-class-roster');
    if (btnPrintRoster) {
      btnPrintRoster.addEventListener('click', () => {
        this.printClassRoster();
      });
    }

    // Print Student ID Cards (A4 8/9 Badges Sheet 学生证)
    const btnPrintIdCards = document.getElementById('btn-print-student-cards');
    const modalIdCards = document.getElementById('modal-id-card-options');
    const btnConfirmIdCards = document.getElementById('btn-confirm-print-id-cards');

    if (btnPrintIdCards) {
      btnPrintIdCards.addEventListener('click', () => {
        if (modalIdCards) {
          const classSelect = document.getElementById('id-card-class-select');
          if (classSelect) {
            classSelect.value = this.currentFilterClass !== 'all' ? this.currentFilterClass : 'K1';
          }
          modalIdCards.classList.add('open');
        } else {
          this.printStudentIdCards();
        }
      });
    }

    if (btnConfirmIdCards && modalIdCards) {
      btnConfirmIdCards.addEventListener('click', () => {
        const targetClass = document.getElementById('id-card-class-select')?.value || 'all';
        const layout = document.getElementById('id-card-layout-select')?.value || '2x4';
        const showQR = document.getElementById('id-card-opt-qr')?.checked !== false;
        const showSeal = document.getElementById('id-card-opt-seal')?.checked !== false;

        modalIdCards.classList.remove('open');
        this.printStudentIdCards(targetClass, { layout, showQR, showSeal });
      });
    }
  },

  bindPhotoUpload() {
    const btnBrowse = document.getElementById('btn-browse-photo');
    const fileInput = document.getElementById('student-photo-file');
    const photoInput = document.getElementById('student-photo-input');
    const preview = document.getElementById('student-photo-preview');
    const btnClear = document.getElementById('btn-clear-photo');

    if (btnBrowse && fileInput) {
      btnBrowse.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Verify image size (limit to 3MB)
        if (file.size > 3 * 1024 * 1024) {
          alert('រូបថតធំពេក សូមជ្រើសរើសរូបដែលមានទំហំតូចជាង 3MB');
          return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
          const base64 = evt.target.result;
          if (photoInput) photoInput.value = base64;
          if (preview) preview.innerHTML = `<img src="${base64}" class="photo-preview-img">`;
          if (btnClear) btnClear.style.display = 'inline-flex';
        };
        reader.readAsDataURL(file);
      });
    }

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (photoInput) photoInput.value = '';
        if (fileInput) fileInput.value = '';
        btnClear.style.display = 'none';

        // Reset preview to current avatar emoji
        const avatarVal = document.getElementById('student-avatar-input')?.value || 'boy1';
        if (preview) preview.innerHTML = AVATAR_MAP[avatarVal] || '👦';
      });
    }
  },

  bindTrashBin() {
    const btnOpenTrash = document.getElementById('btn-open-trash');
    const modalTrash = document.getElementById('modal-trash-bin');
    const btnEmptyTrash = document.getElementById('btn-empty-trash');

    if (btnOpenTrash) {
      btnOpenTrash.addEventListener('click', () => {
        this.renderTrashList();
        if (modalTrash) modalTrash.classList.add('open');
      });
    }

    if (btnEmptyTrash) {
      btnEmptyTrash.addEventListener('click', () => {
        if (confirm('តើអ្នកប្រាកដជាចង់សម្អាតសិស្សទាំងអស់ក្នុងធុងសំរាមជាស្ថាពរឬទេ?')) {
          Storage.emptyTrash();
          this.renderTrashList();
          this.updateTrashBadge();
          App.showToast('បានសម្អាតធុងសំរាមទាំងស្រុង!', 'info');
        }
      });
    }
  },

  bindCsvImport() {
    const btnDownloadTpl = document.getElementById('btn-download-template');
    const btnOpenImport = document.getElementById('btn-import-csv');
    const modalImport = document.getElementById('modal-csv-import');
    const fileInput = document.getElementById('csv-file-input');
    const btnConfirm = document.getElementById('btn-confirm-csv-import');

    if (btnDownloadTpl) {
      btnDownloadTpl.addEventListener('click', () => {
        const csv = Storage.generateStudentTemplateCSV();
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_import_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        App.showToast('ទាញយកទម្រង់គំរូ CSV ជោគជ័យ!', 'success');
      });
    }

    if (btnOpenImport) {
      btnOpenImport.addEventListener('click', () => {
        this.cachedCsvContent = '';
        if (fileInput) fileInput.value = '';
        document.getElementById('csv-preview-container').style.display = 'none';
        if (btnConfirm) btnConfirm.disabled = true;
        if (modalImport) modalImport.classList.add('open');
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
          this.cachedCsvContent = evt.target.result;
          this.renderCsvPreview(this.cachedCsvContent);
        };
        reader.readAsText(file);
      });
    }

    if (btnConfirm) {
      btnConfirm.addEventListener('click', () => {
        if (!this.cachedCsvContent) return;
        const result = Storage.importStudentsCSV(this.cachedCsvContent);
        if (result.success) {
          if (modalImport) modalImport.classList.remove('open');
          this.renderStudents();
          App.updateDashboardStats();
          if (window.Analytics) Analytics.renderAllCharts();
          App.showToast(`បានបញ្ចូលសិស្សចំនួន ${result.count} នាក់ដោយជោគជ័យ!`, 'success');
        } else {
          alert('កំហុសក្នុងការបញ្ចូលទិន្នន័យ៖ ' + result.error);
        }
      });
    }
  },

  renderCsvPreview(csvText) {
    const cleanContent = csvText.replace(/^\uFEFF/, '');
    const lines = cleanContent.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);
    const previewContainer = document.getElementById('csv-preview-container');
    const countBadge = document.getElementById('csv-preview-count');
    const tbody = document.getElementById('csv-preview-tbody');
    const btnConfirm = document.getElementById('btn-confirm-csv-import');

    if (lines.length < 2) {
      alert('ឯកសារ CSV មិនមានទិន្នន័យត្រឹមត្រូវទេ');
      return;
    }

    const rows = lines.slice(1, 11); // Show first 10 rows for preview
    countBadge.textContent = `${lines.length - 1} នាក់`;

    tbody.innerHTML = rows.map(line => {
      const parts = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      return `
        <tr>
          <td><strong>${parts[0] || '-'}</strong></td>
          <td>${parts[1] || '-'}</td>
          <td>${parts[3] || 'male'}</td>
          <td><span class="badge badge-k2">${parts[4] || 'K3'}</span></td>
          <td>${parts[5] || '-'}</td>
          <td>${parts[7] || '-'}</td>
        </tr>
      `;
    }).join('');

    previewContainer.style.display = 'block';
    if (btnConfirm) btnConfirm.disabled = false;
  },

  updateTrashBadge() {
    const badge = document.getElementById('trash-count-badge');
    if (!badge) return;
    const trash = Storage.getTrashStudents();
    badge.textContent = trash.length;
    badge.style.display = trash.length > 0 ? 'inline-flex' : 'none';
  },

  renderTrashList() {
    const container = document.getElementById('trash-students-list');
    if (!container) return;

    const trash = Storage.getTrashStudents();
    if (trash.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 30px;">ធុងសំរាមទទេ គ្មានសិស្សដែលបានលុបទេ</div>`;
      return;
    }

    container.innerHTML = trash.map(s => {
      const avatarEmoji = AVATAR_MAP[s.avatar] || '🧒';
      const avatarDisplay = s.photo ? `<img src="${s.photo}" class="photo-preview-img">` : avatarEmoji;

      return `
        <div class="trash-item-row">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="avatar-circle" style="width: 36px; height: 36px; font-size: 18px;">${avatarDisplay}</div>
            <div>
              <div style="font-weight: 700; font-size: 13.5px; color: var(--text-main);">${s.khmerName} (${s.chineseName})</div>
              <div style="font-size: 11px; color: var(--text-muted);">${s.id} | ថ្នាក់ ${s.classGrade}</div>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-secondary" onclick="StudentsModule.restoreStudent('${s.id}')">
              ♻️ ស្តារឡើងវិញ
            </button>
            <button class="btn btn-sm btn-danger" onclick="StudentsModule.permanentDelete('${s.id}')">
              ❌ លុបជាស្ថាពរ
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  restoreStudent(id) {
    if (Storage.restoreStudent(id)) {
      this.renderTrashList();
      this.updateTrashBadge();
      this.renderStudents();
      App.updateDashboardStats();
      if (window.Analytics) Analytics.renderAllCharts();
      App.showToast('បានស្តារសិស្សឡើងវិញដោយជោគជ័យ!', 'success');
    }
  },

  permanentDelete(id) {
    if (confirm('តើអ្នកប្រាកដជាចង់លុបសិស្សនេះជាស្ថាពរឬទេ? ពិន្ទុទាំងអស់នឹងត្រូវលុបបំបាត់ចោល។')) {
      Storage.permanentDeleteStudent(id);
      this.renderTrashList();
      this.updateTrashBadge();
      App.showToast('បានលុបសិស្សជាស្ថាពរ!', 'info');
    }
  },

  getFilteredStudents() {
    let list = Storage.getStudents();

    if (this.currentFilterClass !== 'all') {
      list = list.filter(s => s.classGrade === this.currentFilterClass);
    }

    if (this.currentFilterGender !== 'all') {
      list = list.filter(s => s.gender === this.currentFilterGender);
    }

    if (this.searchQuery) {
      list = list.filter(s => {
        const km = (s.khmerName || '').toLowerCase();
        const cn = (s.chineseName || '').toLowerCase();
        const py = (s.pinyin || '').toLowerCase();
        const id = (s.id || '').toLowerCase();
        return km.includes(this.searchQuery) ||
               cn.includes(this.searchQuery) ||
               py.includes(this.searchQuery) ||
               id.includes(this.searchQuery);
      });
    }

    return list;
  },

  renderStudents() {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;

    const students = this.getFilteredStudents();
    const lang = Storage.getLanguage();
    const t = translations[lang] || translations.km;

    if (students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
            <div style="font-size: 36px; margin-bottom: 8px;">📋</div>
            <div>${t.noStudentsFound}</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = students.map(s => {
      const avatarEmoji = AVATAR_MAP[s.avatar] || "🧒";
      const avatarDisplay = s.photo ? `<img src="${s.photo}" class="photo-preview-img">` : avatarEmoji;
      const classLabel = t['class' + s.classGrade] || s.classGrade;
      const genderLabel = s.gender === 'female' ? t.female : t.male;
      const genderBadgeClass = s.gender === 'female' ? 'badge-gender-f' : 'badge-gender-m';
      const classBadgeClass = `badge-${s.classGrade.toLowerCase()}`;

      return `
        <tr>
          <td><strong style="color: var(--primary);">${s.id}</strong></td>
          <td>
            <div class="student-cell">
              <div class="avatar-circle ${s.gender}">${avatarDisplay}</div>
              <div class="student-meta">
                <span class="student-kh-name">${s.khmerName}</span>
                <span class="student-cn-name">${s.chineseName} ${s.pinyin ? '(' + s.pinyin + ')' : ''}</span>
              </div>
            </div>
          </td>
          <td>
            <span class="badge ${genderBadgeClass}">${genderLabel}</span>
          </td>
          <td>
            <span class="badge ${classBadgeClass}">${classLabel}</span>
          </td>
          <td>${s.dob || '-'}</td>
          <td>
            <div style="font-size: 13px; font-weight: 500;">${s.guardianName || '-'}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${s.guardianPhone || ''}</div>
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-sm btn-secondary" onclick="StudentsModule.viewStudentDetail('${s.id}')" title="មើលព័ត៌មានលម្អិត / 查看详情">
                👁️
              </button>
              <button class="btn btn-sm btn-secondary" onclick="StudentsModule.openStudentModal('${s.id}')" title="${t.edit}">
                ✏️
              </button>
              <button class="btn btn-sm btn-danger" onclick="StudentsModule.deleteStudent('${s.id}')" title="ផ្ញើទៅធុងសំរាម">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Update count indicator
    const countEl = document.getElementById('students-count-badge');
    if (countEl) {
      countEl.textContent = `${students.length} ${t.totalCountStudents}`;
    }
  },

  openStudentModal(studentId = null) {
    this.selectedStudentId = studentId;
    const modal = document.getElementById('student-modal');
    const titleEl = document.getElementById('student-modal-title');
    const lang = Storage.getLanguage();
    const t = translations[lang] || translations.km;

    const idInput = document.getElementById('student-id-input');
    const khNameInput = document.getElementById('student-kh-input');
    const cnNameInput = document.getElementById('student-cn-input');
    const pinyinInput = document.getElementById('student-pinyin-input');
    const genderInput = document.getElementById('student-gender-input');
    const classInput = document.getElementById('student-class-input');
    const dobInput = document.getElementById('student-dob-input');
    const guardNameInput = document.getElementById('student-guard-name-input');
    const guardPhoneInput = document.getElementById('student-guard-phone-input');
    const avatarInput = document.getElementById('student-avatar-input');
    const photoInput = document.getElementById('student-photo-input');
    const photoPreview = document.getElementById('student-photo-preview');
    const btnClearPhoto = document.getElementById('btn-clear-photo');

    if (studentId) {
      // Edit mode
      const s = Storage.getStudentById(studentId);
      if (!s) return;
      titleEl.textContent = t.editStudent;
      idInput.value = s.id;
      idInput.readOnly = true;
      khNameInput.value = s.khmerName || '';
      cnNameInput.value = s.chineseName || '';
      pinyinInput.value = s.pinyin || '';
      genderInput.value = s.gender || 'male';
      classInput.value = s.classGrade || 'K3';
      dobInput.value = s.dob || '';
      guardNameInput.value = s.guardianName || '';
      guardPhoneInput.value = s.guardianPhone || '';
      avatarInput.value = s.avatar || 'boy1';

      if (s.photo) {
        if (photoInput) photoInput.value = s.photo;
        if (photoPreview) photoPreview.innerHTML = `<img src="${s.photo}" class="photo-preview-img">`;
        if (btnClearPhoto) btnClearPhoto.style.display = 'inline-flex';
      } else {
        if (photoInput) photoInput.value = '';
        if (photoPreview) photoPreview.innerHTML = AVATAR_MAP[s.avatar] || '👦';
        if (btnClearPhoto) btnClearPhoto.style.display = 'none';
      }
    } else {
      // Add mode - Auto-generate ID
      titleEl.textContent = t.addStudent;
      const count = Storage.getStudents().length + 1;
      idInput.value = `STU-${String(count).padStart(3, '0')}`;
      idInput.readOnly = false;
      khNameInput.value = '';
      cnNameInput.value = '';
      pinyinInput.value = '';
      genderInput.value = 'male';
      classInput.value = 'K3';
      dobInput.value = '2020-01-01';
      guardNameInput.value = '';
      guardPhoneInput.value = '';
      avatarInput.value = 'boy1';

      if (photoInput) photoInput.value = '';
      if (photoPreview) photoPreview.innerHTML = '👦';
      if (btnClearPhoto) btnClearPhoto.style.display = 'none';
    }

    // Highlight selected avatar choice
    document.querySelectorAll('.avatar-choice').forEach(c => {
      c.classList.toggle('selected', c.dataset.avatar === avatarInput.value);
    });

    modal.classList.add('open');
  },

  closeStudentModal() {
    const modal = document.getElementById('student-modal');
    modal.classList.remove('open');
    this.selectedStudentId = null;
  },

  handleSaveStudent() {
    const id = document.getElementById('student-id-input').value.trim();
    const khmerName = document.getElementById('student-kh-input').value.trim();
    const chineseName = document.getElementById('student-cn-input').value.trim();
    const pinyin = document.getElementById('student-pinyin-input').value.trim();
    const gender = document.getElementById('student-gender-input').value;
    const classGrade = document.getElementById('student-class-input').value;
    const dob = document.getElementById('student-dob-input').value;
    const guardianName = document.getElementById('student-guard-name-input').value.trim();
    const guardianPhone = document.getElementById('student-guard-phone-input').value.trim();
    const avatar = document.getElementById('student-avatar-input').value || 'boy1';
    const photo = document.getElementById('student-photo-input')?.value || null;

    if (!id || !khmerName || !chineseName) {
      alert("សូមបំពេញអត្តលេខ ឈ្មោះខ្មែរ និងឈ្មោះចិន! / Please fill ID, Khmer & Chinese Name!");
      return;
    }

    const studentData = {
      id,
      khmerName,
      chineseName,
      pinyin,
      gender,
      classGrade,
      dob,
      guardianName,
      guardianPhone,
      avatar,
      photo
    };

    Storage.saveStudent(studentData);
    this.closeStudentModal();
    this.renderStudents();
    App.showToast("ព័ត៌មានសិស្សត្រូវបានរក្សាទុក! / Student saved!", "success");
    App.updateDashboardStats();
    if (window.Analytics) Analytics.renderAllCharts();
    ScoreModule.refreshClassScores();
  },

  deleteStudent(id) {
    const lang = Storage.getLanguage();
    const t = translations[lang] || translations.km;
    if (confirm('តើអ្នកពិតជាចង់ផ្ញើសិស្សនេះទៅកាន់ធុងសំរាមឬទេ? (អាចស្តារឡើងវិញបាន)')) {
      Storage.deleteStudent(id);
      this.renderStudents();
      this.updateTrashBadge();
      App.showToast("បានផ្លាស់ទីសិស្សទៅធុងសំរាម! / Moved to Trash!", "info");
      App.updateDashboardStats();
      if (window.Analytics) Analytics.renderAllCharts();
      ScoreModule.refreshClassScores();
    }
  },

  viewStudentDetail(studentId) {
    const student = Storage.getStudentById(studentId);
    if (!student) return;

    const modal = document.getElementById('modal-student-detail');
    const content = document.getElementById('student-detail-content');
    if (!modal || !content) return;

    const score = Storage.getStudentScore(studentId, 'term1') || {};
    const att = Storage.getStudentAttendanceSummary(studentId, 'term1');
    const avatarEmoji = AVATAR_MAP[student.avatar] || '🧒';
    const photoDisplay = student.photo
      ? `<img src="${student.photo}" alt="${student.khmerName}" style="width: 100%; height: 100%; object-fit: cover;">`
      : `<span style="font-size: 40px;">${avatarEmoji}</span>`;

    const rankStr = score.rank ? `ចំណាត់ថ្នាក់លេខ ${score.rank}` : 'មិនទាន់គណនា';
    const avgStr = score.average !== undefined ? Number(score.average).toFixed(2) : '-';
    const totalDays = (att.present || 0) + (att.excused || 0) + (att.unexcused || 0);

    content.innerHTML = `
      <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-light);">
        <div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid var(--primary); display: flex; align-items: center; justify-content: center; background: #FFFBEB; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          ${photoDisplay}
        </div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 4px;">
            <span style="font-size: 22px; font-weight: 800; color: var(--text-main);">${student.khmerName}</span>
            <span style="font-size: 20px; font-weight: 800; color: var(--primary); font-family: var(--font-chinese);">${student.chineseName}</span>
            <span style="font-size: 13px; color: var(--text-muted);">${student.gender === 'female' ? '👧 ស្រី (女)' : '👦 ប្រុស (男)'}</span>
          </div>
          <div style="font-size: 13px; color: var(--text-muted); display: flex; gap: 12px; flex-wrap: wrap;">
            <span>អត្តលេខ: <strong style="color: var(--primary); font-family: monospace;">${student.id}</strong></span>
            <span>ថ្នាក់: <strong>${student.classGrade}</strong></span>
            <span>ថ្ងៃកំណើត: <strong>${student.dob || '-'}</strong></span>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px;">
          <div style="font-weight: 700; font-size: 13px; color: #1E293B; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <span>📊</span> <span>លទ្ធផលសិក្សា (ឆមាសទី១)</span>
          </div>
          <div style="font-size: 12.5px; line-height: 1.8;">
            <div>ចំណាត់ថ្នាក់: <strong style="color: var(--primary);">${rankStr}</strong></div>
            <div>មធ្យមភាគ: <strong>${avgStr}</strong></div>
            <div>និទ្ទេស: <strong>${score.grade || '-'}</strong></div>
          </div>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px;">
          <div style="font-weight: 700; font-size: 13px; color: #1E293B; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <span>📅</span> <span>ស្ថិតិវត្តមានសរុប</span>
          </div>
          <div style="font-size: 12.5px; line-height: 1.8;">
            <div>វត្តមានពេញ: <strong style="color: #10B981;">${att.present}</strong> ថ្ងៃ / ${totalDays} ថ្ងៃ</div>
            <div>ច្បាប់ / ឥតច្បាប់: <strong>${att.excused} / ${att.unexcused}</strong> ថ្ងៃ</div>
            <div>អត្រាវត្តមាន: <strong style="color: #4338CA;">${att.rate}%</strong></div>
          </div>
        </div>
      </div>

      <div style="background: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 12.5px;">
        <div style="font-weight: 700; color: #78350F; margin-bottom: 4px;">👨‍👩‍👧 ព័ត៌មានអាណាព្យាបាល</div>
        <div>ឈ្មោះអាណាព្យាបាល: <strong>${student.guardianName || '-'}</strong></div>
        <div>លេខទូរស័ព្ទ: <strong style="color: var(--primary); font-family: monospace;">${student.guardianPhone || '-'}</strong></div>
      </div>

      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button class="btn btn-secondary btn-sm" onclick="StudentsModule.jumpToReportCard('${student.id}')">
          <span>📋</span> <span>មើលព្រឹត្តិបត្រពិន្ទុ</span>
        </button>
        <button class="btn btn-gold btn-sm" onclick="StudentsModule.jumpToCertificate('${student.id}')">
          <span>🏆</span> <span>មើលប័ណ្ណសរសើរ</span>
        </button>
      </div>
    `;

    modal.classList.add('open');
  },

  jumpToReportCard(studentId) {
    document.getElementById('modal-student-detail')?.classList.remove('open');
    App.navigateTo('reports');
    setTimeout(() => {
      if (window.ReportsModule) {
        ReportsModule.selectStudent(studentId);
      }
    }, 200);
  },

  jumpToCertificate(studentId) {
    document.getElementById('modal-student-detail')?.classList.remove('open');
    App.navigateTo('certificates');
    setTimeout(() => {
      const select = document.getElementById('cert-student-select');
      if (select) {
        select.value = studentId;
        if (window.ReportsModule) ReportsModule.renderCertificate(studentId);
      }
    }, 200);
  },

  printClassRoster(targetClass = null) {
    const classGrade = targetClass || (this.currentFilterClass !== 'all' ? this.currentFilterClass : 'K1');
    const allStudents = Storage.getStudents().filter(s => s.classGrade === classGrade);

    if (allStudents.length === 0) {
      alert(`មិនមានសិស្សក្នុងថ្នាក់ ${classGrade} ដើម្បីបោះពុម្ពទេ!`);
      return;
    }

    const settings = Storage.getSettings();
    const femaleCount = allStudents.filter(s => s.gender === 'female').length;
    const maleCount = allStudents.length - femaleCount;

    const classGradeMap = {
      'K1': 'ថ្នាក់កុមារដ្ឋាន (幼小班 - K1)',
      'K2': 'មត្តេយ្យកម្រិតទាប (幼中班 - K2)',
      'K3': 'មត្តេយ្យកម្រិតខ្ពស់ (幼大班 - K3)'
    };
    const classLabel = classGradeMap[classGrade] || classGrade;

    // Build A4 Portrait Printable Roster
    const previewContainer = document.getElementById('report-card-preview-area');
    if (!previewContainer) return;

    const now = new Date();
    const kmMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    const dateKm = `ថ្ងៃទី ${now.getDate()} ខែ ${kmMonths[now.getMonth()]} ឆ្នាំ ${now.getFullYear()}`;
    const dateCn = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日`;

    const officialSeal = (window.ReportsModule && ReportsModule.getOfficialSealSvg) 
      ? ReportsModule.getOfficialSealSvg(settings) : '';

    const rosterHtml = `
      <div class="roster-page page-break">
        <div class="roster-header">
          <div class="roster-school-logo">
            <img src="${settings.schoolLogo || 'assets/images/school-logo.png'}" alt="Logo">
          </div>
          <div class="roster-school-titles">
            <div class="roster-school-cn">${settings.schoolNameCn || '磅湛省公立培华学校'}</div>
            <div class="roster-school-km">${settings.schoolNameKm || 'សាលារៀន ខ្មែរ-ចិន ភៃហួរ'}</div>
          </div>
        </div>

        <div class="roster-main-title">班级学生花名册</div>
        <div class="roster-sub-title">បញ្ជីរាយនាមសិស្សប្រចាំថ្នាក់ផ្លូវការ</div>

        <div class="roster-meta-bar">
          <div>ថ្នាក់ / 班级: <strong>${classLabel}</strong></div>
          <div>សិស្សសរុប / 总人数: <strong>${allStudents.length} នាក់</strong> (ស្រី/女: <strong>${femaleCount}</strong>, ប្រុស/男: <strong>${maleCount}</strong>)</div>
          <div>ឆ្នាំសិក្សា / 学年: <strong>${settings.academicYear || '2025 - 2026'}</strong></div>
        </div>

        <table class="roster-table">
          <thead>
            <tr>
              <th style="width: 40px;">ល.រ<br>序号</th>
              <th style="width: 50px;">រូបថត<br>相片</th>
              <th style="width: 85px;">អត្តលេខ<br>学号</th>
              <th style="text-align: left; padding-left: 8px;">ឈ្មោះខ្មែរ<br>高棉姓名</th>
              <th style="text-align: left; padding-left: 8px;">ឈ្មោះចិន<br>中文姓名</th>
              <th style="width: 60px;">ភេទ<br>性别</th>
              <th style="width: 95px;">ថ្ងៃកំណើត<br>出生日期</th>
              <th style="text-align: left; padding-left: 8px;">អាណាព្យាបាល និងទូរស័ព្ទ<br>家长与联系电话</th>
            </tr>
          </thead>
          <tbody>
            ${allStudents.map((s, idx) => {
              const avatarEmoji = AVATAR_MAP[s.avatar] || '🧒';
              const photoImg = s.photo 
                ? `<img src="${s.photo}" alt="${s.khmerName}" class="roster-avatar-img">`
                : `<span style="font-size: 18px;">${avatarEmoji}</span>`;
              const genderText = s.gender === 'female' ? 'ស្រី / 女' : 'ប្រុស / 男';

              return `
                <tr>
                  <td class="center">${idx + 1}</td>
                  <td class="center"><div class="roster-avatar-cell">${photoImg}</div></td>
                  <td class="center" style="font-family: monospace; font-weight: 700; color: #1E3A8A;">${s.id}</td>
                  <td style="font-weight: 700; padding-left: 8px;">${s.khmerName}</td>
                  <td style="font-family: var(--font-chinese); font-weight: 800; padding-left: 8px; font-size: 13px;">${s.chineseName}</td>
                  <td class="center">${genderText}</td>
                  <td class="center" style="font-size: 11px;">${s.dob || '-'}</td>
                  <td style="padding-left: 8px;">
                    <div style="font-size: 11.5px; font-weight: 600;">${s.guardianName || '-'}</div>
                    <div style="font-size: 10.5px; color: #64748B; font-family: monospace;">${s.guardianPhone || ''}</div>
                  </td>
                </tr>
              `;
            }).join('')}
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
    previewContainer.innerHTML = rosterHtml;

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

  printStudentIdCards(targetClass = null, options = {}) {
    const layout = options.layout || '2x4';
    const showQR = options.showQR !== false;
    const showSeal = options.showSeal !== false;
    const chunkSize = layout === '3x3' ? 9 : 8;

    let allStudents = Storage.getStudents();
    if (targetClass && targetClass !== 'all') {
      allStudents = allStudents.filter(s => s.classGrade === targetClass);
    } else if (!targetClass && this.currentFilterClass !== 'all') {
      allStudents = allStudents.filter(s => s.classGrade === this.currentFilterClass);
    }

    if (allStudents.length === 0) {
      alert(`មិនមានសិស្សដើម្បីបោះពុម្ពកាតសិស្សទេ!`);
      return;
    }

    const settings = Storage.getSettings();
    const previewContainer = document.getElementById('report-card-preview-area');
    if (!previewContainer) return;

    const pages = [];
    for (let i = 0; i < allStudents.length; i += chunkSize) {
      pages.push(allStudents.slice(i, i + chunkSize));
    }

    const cardsHtml = pages.map((pageStudents, pageIdx) => `
      <div class="id-cards-sheet ${layout === '3x3' ? 'sheet-3x3' : ''} page-break">
        <div class="id-cards-header-notice">
          <span>🪪 កាតសិស្សផ្លូវការ (学生证) • ${targetClass === 'all' || !targetClass ? 'គ្រប់ថ្នាក់' : targetClass} • ទំព័រ ${pageIdx + 1}/${pages.length} (ប្លង់ ${layout})</span>
          <span style="font-size: 11px; color: #64748B;">កាត់តាមបន្ទាត់ដាច់ៗ (Cut along dashed lines)</span>
        </div>
        <div class="id-cards-grid ${layout === '3x3' ? 'grid-3x3' : 'grid-2x4'}">
          ${pageStudents.map(s => {
            const avatarEmoji = AVATAR_MAP[s.avatar] || '🧒';
            const photoDisplay = s.photo
              ? `<img src="${s.photo}" alt="${s.khmerName}" class="id-card-photo-img">`
              : `<div class="id-card-photo-avatar">${avatarEmoji}</div>`;

            let qrCodeHtml = '';
            if (showQR && typeof QRCode !== 'undefined') {
              const qrText = `សាលារៀន ខ្មែរ-ចិន ភៃហួរ | 磅湛省公立培华学校\nអត្តលេខ/ID: ${s.id}\nឈ្មោះ: ${s.khmerName} (${s.chineseName})\nថ្នាក់/Class: ${s.classGrade}\nអាណាព្យាបាល: ${s.guardianName || '-'}\nទូរស័ព្ទ: ${s.guardianPhone || '-'}`;
              qrCodeHtml = `<div class="id-card-qr-box" title="ស្កេនដើម្បីមើលព័ត៌មាន">${QRCode.generateSVG(qrText, { size: 46, margin: 1 })}</div>`;
            }

            const sealHtml = showSeal ? `
              <div class="id-card-seal-stamp" title="ត្រាសាលាផ្លូវការ">
                <div class="seal-inner">★ 培华学校 ★<br><span style="font-size: 7.5px;">PEI HUA</span></div>
              </div>
            ` : '';

            return `
              <div class="student-id-card ${layout === '3x3' ? 'card-compact' : ''}">
                <div class="id-card-top">
                  <div class="id-card-logo">
                    <img src="${settings.schoolLogo || 'assets/images/school-logo.png'}" alt="Logo">
                  </div>
                  <div class="id-card-school-info">
                    <div class="id-card-school-cn">${settings.schoolNameCn || '磅湛省公立培华学校'}</div>
                    <div class="id-card-school-km">${settings.schoolNameKm || 'សាលារៀន ខ្មែរ-ចិន ភៃហួរ'}</div>
                  </div>
                </div>

                <div class="id-card-badge-title">
                  <span>កាតសិស្សមត្តេយ្យ • 华文幼儿园学生证</span>
                </div>

                <div class="id-card-body">
                  <div class="id-card-photo-frame">
                    ${photoDisplay}
                  </div>
                  <div class="id-card-details">
                    <div class="id-card-name-cn">${s.chineseName}</div>
                    <div class="id-card-name-km">${s.khmerName}</div>
                    <div class="id-card-row">
                      <span class="id-label">អត្តលេខ/学号:</span>
                      <strong class="id-val" style="color: #1E3A8A; font-family: monospace;">${s.id}</strong>
                    </div>
                    <div class="id-card-row">
                      <span class="id-label">ថ្នាក់/班级:</span>
                      <span class="id-val">${s.classGrade} (${s.gender === 'female' ? 'ស្រី/女' : 'ប្រុស/男'})</span>
                    </div>
                    <div class="id-card-row">
                      <span class="id-label">កំណើត/出生:</span>
                      <span class="id-val">${s.dob || '-'}</span>
                    </div>
                  </div>
                </div>

                <div class="id-card-footer">
                  ${qrCodeHtml ? qrCodeHtml : `
                    <div class="id-card-barcode">
                      <div class="barcode-bars">||| | |||| | ||| || ||| | |||</div>
                      <div class="barcode-text">PEIHUA-${s.id}</div>
                    </div>
                  `}
                  <div class="id-card-footer-meta">
                    <div class="id-card-year">${settings.academicYear || '2025-2026'}</div>
                    <div class="id-card-id-sub">PEIHUA-${s.id}</div>
                  </div>
                  ${sealHtml}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');

    App.navigateTo('reports');
    previewContainer.innerHTML = cardsHtml;

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
  }
};

window.StudentsModule = StudentsModule;
