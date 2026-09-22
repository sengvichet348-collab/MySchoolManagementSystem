/**
 * Chinese Kindergarten Score Management System
 * Storage & Data Management Layer (LocalStorage, Import/Export, Demo Dataset)
 */

const STORAGE_KEYS = {
  STUDENTS: 'zh_kindergarten_students',
  SCORES: 'zh_kindergarten_scores',
  SETTINGS: 'zh_kindergarten_settings',
  LANGUAGE: 'zh_kindergarten_lang',
  TRASH: 'zh_kindergarten_trash',
  BACKUP_SNAPSHOTS: 'zh_kindergarten_backup_snapshots',
  CUSTOM_SUBJECTS: 'zh_kindergarten_custom_subjects',
  ATTENDANCE: 'zh_kindergarten_attendance',
  DAILY_ATTENDANCE: 'zh_kindergarten_daily_attendance'
};

const DEFAULT_SUBJECTS = [
  { key: 'huawen', nameKm: 'ភាសាចិន', nameCn: '华文', shortKm: 'ចិន', shortCn: '华文', maxScore: 100, color: '#4F46E5', isDefault: true },
  { key: 'pinyin', nameKm: 'ភីនអុីន', nameCn: '拼音', shortKm: 'ភីនអុីន', shortCn: '拼音', maxScore: 100, color: '#06B6D4', isDefault: true },
  { key: 'shuxue', nameKm: 'គណិតវិទ្យា', nameCn: '数学', shortKm: 'គណិត', shortCn: '数学', maxScore: 100, color: '#10B981', isDefault: true },
  { key: 'hanle', nameKm: 'ពាក្យចិនចំរុះ', nameCn: '汉乐', shortKm: 'ចំរុះ', shortCn: '汉乐', maxScore: 100, color: '#EC4899', isDefault: true },
  { key: 'bishun', nameKm: 'ក្បួនគំនូសអក្សរចិន', nameCn: '笔顺', shortKm: 'គំនូស', shortCn: '笔顺', maxScore: 100, color: '#8B5CF6', isDefault: true },
  { key: 'changyou', nameKm: 'ចម្រៀង និងកាយវិការ', nameCn: '唱游', shortKm: 'ចម្រៀង', shortCn: '唱游', maxScore: 100, color: '#F59E0B', isDefault: true }
];

const DEMO_ATTENDANCE = {
  "K1-term1-all": {
    "K1-001": { present: 98, excused: 2, unexcused: 0, late: 0 },
    "K1-002": { present: 95, excused: 3, unexcused: 2, late: 1 },
    "K1-003": { present: 100, excused: 0, unexcused: 0, late: 0 },
    "K1-004": { present: 96, excused: 4, unexcused: 0, late: 0 },
    "K1-005": { present: 94, excused: 5, unexcused: 1, late: 2 }
  },
  "K2-term1-all": {
    "K2-001": { present: 99, excused: 1, unexcused: 0, late: 0 },
    "K2-002": { present: 95, excused: 4, unexcused: 1, late: 1 }
  },
  "K3-term1-all": {
    "K3-001": { present: 98, excused: 2, unexcused: 0, late: 0 },
    "K3-002": { present: 97, excused: 3, unexcused: 0, late: 1 }
  }
};

const DEFAULT_SETTINGS = {
  schoolNameKm: "សាលារៀន ខ្មែរ-ចិន ភៃហួរ",
  schoolNameCn: "磅湛省公立培华学校",
  schoolNameEn: "Khmer-Chinese Pei Hua School",
  academicYear: "2025 - 2026",
  currentTerm: "term1",
  scoreScale: 100, // 100-point full score scale
  principalNameKm: "លោកស្រី ថេង សោភា",
  principalNameCn: "秦少萍 校长",
  teacherNameKm: "អ្នកគ្រូ ចាង មីលីង",
  teacherNameCn: "江美玲 老师",
  schoolLogo: typeof DEFAULT_SCHOOL_LOGO !== 'undefined' ? DEFAULT_SCHOOL_LOGO : 'assets/images/school-logo.png',
  schoolSeal: typeof DEFAULT_SCHOOL_SEAL !== 'undefined' ? DEFAULT_SCHOOL_SEAL : 'assets/images/school-seal.png',
  principalSignature: null, // Base64 image
  teacherSignature: null, // Base64 image
  sealText: "磅湛省公立培华学校",
  schoolMottoKm: "ឧស្សាហ៍ វិន័យ សាមគ្គី ច្នៃប្រឌិត",
  schoolMottoCn: "勤奋 · 守纪 · 博爱 · 创新",
  gradeCutoffA: 90,
  gradeCutoffB: 80,
  gradeCutoffC: 65
};

const DEMO_STUDENTS = [
  {
    id: "K1-001",
    khmerName: "កាំង មួយជូ",
    chineseName: "康美珠",
    pinyin: "Kāng Měizhū",
    gender: "female",
    dob: "2022-01-05",
    classGrade: "K1",
    guardianName: "កាំង ធាន",
    guardianPhone: "017 889 900",
    avatar: "girl1"
  },
  {
    id: "K1-002",
    khmerName: "ស៊ូ ស៊ាវឡឺ",
    chineseName: "苏小乐",
    pinyin: "Sū Xiǎolè",
    gender: "male",
    dob: "2022-04-18",
    classGrade: "K1",
    guardianName: "ស៊ូ ជីន",
    guardianPhone: "096 554 433",
    avatar: "boy3"
  },
  {
    id: "K1-003",
    khmerName: "លី មួយគា",
    chineseName: "李美华",
    pinyin: "Lǐ Měihuá",
    gender: "female",
    dob: "2022-03-12",
    classGrade: "K1",
    guardianName: "លី ស៊ាងហៃ",
    guardianPhone: "012 889 922",
    avatar: "girl2"
  },
  {
    id: "K1-004",
    khmerName: "ចិន ចាន់វឌ្ឍនៈ",
    chineseName: "陈俊杰",
    pinyin: "Chén Jùnjié",
    gender: "male",
    dob: "2022-02-18",
    classGrade: "K1",
    guardianName: "ចិន គួង",
    guardianPhone: "098 765 432",
    avatar: "boy1"
  },
  {
    id: "K1-005",
    khmerName: "វ៉ាង ស៊ាវហ្វុង",
    chineseName: "王小峰",
    pinyin: "Wáng Xiǎofēng",
    gender: "male",
    dob: "2022-07-25",
    classGrade: "K1",
    guardianName: "វ៉ាង ម៉េង",
    guardianPhone: "077 112 233",
    avatar: "boy2"
  },
  {
    id: "K2-001",
    khmerName: "សុខ ធីតា",
    chineseName: "林安琪",
    pinyin: "Lín Ānqí",
    gender: "female",
    dob: "2021-03-15",
    classGrade: "K2",
    guardianName: "សុខ ពិសិដ្ឋ",
    guardianPhone: "010 223 344",
    avatar: "girl3"
  },
  {
    id: "K2-002",
    khmerName: "តាន់ ជីនឡុង",
    chineseName: "陈金龙",
    pinyin: "Chén Jīnlóng",
    gender: "male",
    dob: "2021-06-20",
    classGrade: "K2",
    guardianName: "តាន់ គង់",
    guardianPhone: "015 667 788",
    avatar: "boy1"
  },
  {
    id: "K3-001",
    khmerName: "យ៉ាង សុជាតា",
    chineseName: "杨丽丽",
    pinyin: "Yáng Lìlì",
    gender: "female",
    dob: "2020-05-30",
    classGrade: "K3",
    guardianName: "យ៉ាង ជីន",
    guardianPhone: "088 998 877",
    avatar: "girl2"
  },
  {
    id: "K3-002",
    khmerName: "ហេង វិបុល",
    chineseName: "黄文彬",
    pinyin: "Huáng Wénbīn",
    gender: "male",
    dob: "2020-09-08",
    classGrade: "K3",
    guardianName: "ហេង សុខា",
    guardianPhone: "092 445 566",
    avatar: "boy3"
  }
];

// Official Scores for 6 Timetable Subjects (华文, 拼音, 数学, 汉乐, 笔顺, 唱游) - 100 Point Scale
const DEMO_SCORES = [
  {
    studentId: "K1-001",
    term: "term1",
    huawen: 96,
    pinyin: 94,
    shuxue: 92,
    hanle: 95,
    bishun: 90,
    changyou: 98,
    grade: "A",
    rank: 1,
    average: "94.17",
    teacherComment: "ឆ្លាតវៃ រួសរាយ ពូកែច្រៀងចម្រៀងកុមារចិន និងសរសេរគំនូសអក្សរចិនបានត្រឹមត្រូវ។ 聪明活泼，华语发音纯正，笔顺规范，唱游表现极佳！"
  },
  {
    studentId: "K1-002",
    term: "term1",
    huawen: 88,
    pinyin: 86,
    shuxue: 89,
    hanle: 85,
    bishun: 82,
    changyou: 90,
    grade: "B",
    rank: 2,
    average: "86.67",
    teacherComment: "ចូលចិត្តរៀនគណិតវិទ្យា និងតន្ត្រី សម្របខ្លួនបានល្អក្នុងថ្នាក់។ 喜欢数学与音乐，遵守课堂纪律，各方面进步明显！"
  },
  {
    studentId: "K1-003",
    term: "term1",
    huawen: 98,
    pinyin: 95,
    shuxue: 96,
    hanle: 97,
    bishun: 95,
    changyou: 98,
    grade: "A",
    rank: 1,
    average: "96.50",
    teacherComment: "ឆ្លាតវៃ រួសរាយរាក់ទាក់ សកម្មក្នុងការបញ្ចេញមតិ និងជាគំរូល្អក្នុងថ្នាក់។ 聪明活泼，善于表达，学习认真，全面发展！"
  },
  {
    studentId: "K1-004",
    term: "term1",
    huawen: 92,
    pinyin: 90,
    shuxue: 95,
    hanle: 90,
    bishun: 88,
    changyou: 93,
    grade: "A",
    rank: 3,
    average: "91.33",
    teacherComment: "ចេះជួយមិត្តភក្តិ ចូលចិត្តរៀនគណិតវិទ្យា និងអក្សរចិនបានល្អណាស់។ 懂礼貌，思维敏捷，对数学和拼音汉字领悟极快。"
  },
  {
    studentId: "K1-005",
    term: "term1",
    huawen: 85,
    pinyin: 88,
    shuxue: 82,
    hanle: 95,
    bishun: 94,
    changyou: 90,
    grade: "B",
    rank: 4,
    average: "89.00",
    teacherComment: "មានទេពកោសល្យខ្ពស់ខាងគូររូប និងសិល្បៈតន្ត្រី រួសរាយរាក់ទាក់។ 儿歌表现优异，活泼开朗，动手能力很强！"
  },
  {
    studentId: "K2-001",
    term: "term1",
    huawen: 95,
    pinyin: 96,
    shuxue: 92,
    hanle: 94,
    bishun: 95,
    changyou: 96,
    grade: "A",
    rank: 1,
    average: "94.67",
    teacherComment: "ក្មេងស្រីឆ្លាត ចងចាំតួអក្សរចិនបានលឿន និងច្រៀងចម្រៀងកុមារពិរោះ។ 聪明伶俐，儿歌唱得动听，汉字记忆力强！"
  },
  {
    studentId: "K2-002",
    term: "term1",
    huawen: 88,
    pinyin: 86,
    shuxue: 90,
    hanle: 85,
    bishun: 85,
    changyou: 88,
    grade: "B",
    rank: 2,
    average: "87.00",
    teacherComment: "កាយសម្បទារឹងមាំ សកម្មរហ័សរហួន និងស្តាប់បង្គាប់អ្នកគ្រូ។ 身体棒，活泼爱动，习惯优良。"
  },
  {
    studentId: "K3-001",
    term: "term1",
    huawen: 90,
    pinyin: 92,
    shuxue: 88,
    hanle: 92,
    bishun: 90,
    changyou: 95,
    grade: "A",
    rank: 1,
    average: "91.17",
    teacherComment: "សុភាពរាបសារ ស្តាប់បង្គាប់គ្រូ ឧស្សាហ៍ព្យាយាមសរសេរអក្សរចិន។ 文静乖巧，遵守纪律，书写工整！"
  },
  {
    studentId: "K3-002",
    term: "term1",
    huawen: 80,
    pinyin: 83,
    shuxue: 85,
    hanle: 85,
    bishun: 80,
    changyou: 88,
    grade: "B",
    rank: 2,
    average: "83.50",
    teacherComment: "មានភាពរីកចម្រើនគួរឱ្យកត់សម្គាល់ ត្រូវខិតខំហាត់និយាយចិនបន្ថែម។ 表现有很大进步，加油！"
  }
];

const Storage = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      this.saveStudents(DEMO_STUDENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCORES)) {
      this.saveAllScores(DEMO_SCORES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.saveSettings(DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LANGUAGE)) {
      this.setLanguage('km'); // default Khmer
    }

    // Comprehensive migration: Ensure all existing stored scores use the 6 official timetable subjects
    const storedScores = this.getAllScores();
    let scoresNeedSave = false;
    const subList = ['huawen', 'pinyin', 'shuxue', 'hanle', 'bishun', 'changyou'];

    storedScores.forEach(sc => {
      if (sc.huawen === undefined) {
        scoresNeedSave = true;
        sc.huawen = sc.chinese !== undefined ? sc.chinese : 92;
        sc.pinyin = sc.speaking !== undefined ? sc.speaking : 90;
        sc.shuxue = sc.math !== undefined ? sc.math : 91;
        sc.hanle = sc.music !== undefined ? sc.music : 93;
        sc.bishun = sc.art !== undefined ? sc.art : 90;
        sc.changyou = sc.moral !== undefined ? sc.moral : 94;
        delete sc.chinese;
        delete sc.speaking;
        delete sc.math;
        delete sc.art;
        delete sc.music;
        delete sc.moral;
        delete sc.khmer;
      }

      // Automatically migrate scores from 10-point scale to 100-point scale
      let converted = false;
      subList.forEach(k => {
        if (sc[k] !== undefined && sc[k] !== null && sc[k] > 0 && sc[k] <= 10.0) {
          sc[k] = Math.round(sc[k] * 10 * 10) / 10;
          converted = true;
        }
      });
      if (sc.average && parseFloat(sc.average) > 0 && parseFloat(sc.average) <= 10.0) {
        sc.average = (parseFloat(sc.average) * 10).toFixed(2);
        converted = true;
      }
      if (converted) scoresNeedSave = true;
    });
    if (scoresNeedSave) {
      this.saveAllScores(storedScores);
    }

    // Ensure K1 students appear first in existing storage
    const existingStudents = this.getStudents();
    if (existingStudents.length > 0 && existingStudents[0].classGrade !== 'K1') {
      existingStudents.sort((a, b) => {
        if (a.classGrade === 'K1' && b.classGrade !== 'K1') return -1;
        if (a.classGrade !== 'K1' && b.classGrade === 'K1') return 1;
        return a.id.localeCompare(b.id);
      });
      this.saveStudents(existingStudents);
    }

    // Ensure default teacher is Jiang Meiling (from timetable 班主任：江美玲)
    const settings = this.getSettings();
    let settingsNeedSave = false;
    if (!settings.teacherNameKm || settings.teacherNameKm === 'អ្នកគ្រូ ចាន់ សុគន្ធា') {
      settings.teacherNameKm = 'អ្នកគ្រូ ចាង មីលីង';
      settings.teacherNameCn = '江美玲 老师';
      settingsNeedSave = true;
    }

    // Ensure default principal is Qin Shaoping (校长：秦少萍 / លោកស្រី ថេង សោភា)
    if (!settings.principalNameKm || settings.principalNameKm === 'លោកស្រី ម៉ី លីនហួ' || settings.principalNameKm === 'លោកស្រី ឈិន ស៊ាវភីង' || !settings.principalNameCn || !settings.principalNameCn.includes('秦少萍')) {
      settings.principalNameKm = 'លោកស្រី ថេង សោភា';
      settings.principalNameCn = '秦少萍 校长';
      settingsNeedSave = true;
    }

    // Ensure school logo is set to Pei Hua School logo (media_1790038912954.jpg)
    if (typeof DEFAULT_SCHOOL_LOGO !== 'undefined') {
      if (!settings.schoolLogo || settings.schoolLogo === 'null' || settings.schoolLogoVersion !== 2) {
        settings.schoolLogo = DEFAULT_SCHOOL_LOGO;
        settings.schoolLogoVersion = 2;
        settingsNeedSave = true;
      }
    }

    // Ensure school seal is set to transparent circular seal (media_1790040686492.png)
    if (typeof DEFAULT_SCHOOL_SEAL !== 'undefined') {
      if (!settings.schoolSeal || settings.schoolSeal === 'null' || settings.schoolSealVersion !== 2) {
        settings.schoolSeal = DEFAULT_SCHOOL_SEAL;
        settings.schoolSealVersion = 2;
        settingsNeedSave = true;
      }
    }

    // Ensure school name is Pei Hua School (សាលារៀន ខ្មែរ-ចិន ភៃហួរ)
    if (!settings.schoolNameKm || settings.schoolNameKm.includes('វឌ្ឍនភាព') || settings.schoolNameKm === 'សាលាមត្តេយ្យភាសាចិន' || settings.schoolNameKm.includes('ប៉ៃហួ') || settings.schoolNameKm.includes('ប៉ៃហួរ') || !settings.schoolNameCn || settings.schoolNameCn.includes('进步华文')) {
      settings.schoolNameKm = 'សាលារៀន ខ្មែរ-ចិន ភៃហួរ';
      settings.schoolNameCn = '磅湛省公立培华学校';
      settings.schoolNameEn = 'Khmer-Chinese Pei Hua School';
      settings.sealText = '磅湛省公立培华学校';
      settingsNeedSave = true;
    }

    if (settingsNeedSave) {
      this.saveSettings(settings);
    }

    // Ensure Custom Subjects are initialized
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOM_SUBJECTS)) {
      this.saveSubjects(DEFAULT_SUBJECTS);
    }

    // Ensure Attendance is initialized
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(DEMO_ATTENDANCE));
    }
  },

  getLanguage() {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'km';
  },

  setLanguage(lang) {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  },

  getStudents() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to parse students:", e);
      return [];
    }
  },

  saveStudents(students) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  getStudentById(id) {
    const students = this.getStudents();
    return students.find(s => s.id === id) || null;
  },

  saveStudent(student) {
    let students = this.getStudents();
    const index = students.findIndex(s => s.id === student.id);
    if (index >= 0) {
      students[index] = student;
    } else {
      students.unshift(student);
    }
    this.saveStudents(students);
    return student;
  },

  // Soft delete: moves student to Trash Bin instead of permanent deletion
  deleteStudent(id) {
    return this.softDeleteStudent(id);
  },

  softDeleteStudent(id) {
    let students = this.getStudents();
    const student = students.find(s => s.id === id);
    if (!student) return false;

    // Remove from active list
    students = students.filter(s => s.id !== id);
    this.saveStudents(students);

    // Add to trash list with timestamp
    let trash = this.getTrashStudents();
    student.deletedAt = new Date().toISOString();
    trash.unshift(student);
    localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify(trash));
    return true;
  },

  getTrashStudents() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRASH);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  restoreStudent(id) {
    let trash = this.getTrashStudents();
    const student = trash.find(s => s.id === id);
    if (!student) return false;

    // Remove from trash
    trash = trash.filter(s => s.id !== id);
    delete student.deletedAt;
    localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify(trash));

    // Restore to active list
    let students = this.getStudents();
    students.unshift(student);
    this.saveStudents(students);
    return true;
  },

  permanentDeleteStudent(id) {
    // Remove from trash
    let trash = this.getTrashStudents();
    trash = trash.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify(trash));

    // Also remove from active list if still there
    let students = this.getStudents().filter(s => s.id !== id);
    this.saveStudents(students);

    // Remove all associated scores
    let scores = this.getAllScores().filter(sc => sc.studentId !== id);
    this.saveAllScores(scores);
    return true;
  },

  emptyTrash() {
    let trash = this.getTrashStudents();
    trash.forEach(s => {
      let scores = this.getAllScores().filter(sc => sc.studentId !== s.id);
      this.saveAllScores(scores);
    });
    localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify([]));
  },

  getAllScores() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCORES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to parse scores:", e);
      return [];
    }
  },

  saveAllScores(scores) {
    localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));
  },

  getStudentScore(studentId, term) {
    const scores = this.getAllScores();
    return scores.find(s => s.studentId === studentId && s.term === term) || null;
  },

  saveScore(scoreRecord) {
    let scores = this.getAllScores();
    const index = scores.findIndex(
      s => s.studentId === scoreRecord.studentId && s.term === scoreRecord.term
    );
    if (index >= 0) {
      scores[index] = { ...scores[index], ...scoreRecord };
    } else {
      scores.push(scoreRecord);
    }
    this.saveAllScores(scores);
    return scoreRecord;
  },

  saveMultipleScores(scoresList) {
    let allScores = this.getAllScores();
    scoresList.forEach(newScore => {
      const idx = allScores.findIndex(
        s => s.studentId === newScore.studentId && s.term === newScore.term
      );
      if (idx >= 0) {
        allScores[idx] = { ...allScores[idx], ...newScore };
      } else {
        allScores.push(newScore);
      }
    });
    this.saveAllScores(allScores);
  },

  // ==========================================
  // SUBJECT MANAGEMENT METHODS (DYNAMIC CURRICULUM)
  // ==========================================
  getSubjects() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_SUBJECTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to parse subjects:", e);
    }
    return DEFAULT_SUBJECTS;
  },

  saveSubjects(subjects) {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SUBJECTS, JSON.stringify(subjects));
    if (typeof window !== 'undefined' && window.dispatchEvent && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('subjects-changed', { detail: subjects }));
    }
  },

  addSubject(subject) {
    const subjects = this.getSubjects();
    if (!subject.key) {
      subject.key = 'sub_' + Date.now().toString(36);
    }
    let uniqueKey = subject.key.replace(/[^a-zA-Z0-9_]/g, '');
    let counter = 1;
    while (subjects.some(s => s.key === uniqueKey)) {
      uniqueKey = `${subject.key}_${counter++}`;
    }
    subject.key = uniqueKey;
    subject.maxScore = Number(subject.maxScore) || 100;
    subject.color = subject.color || '#6366F1';
    subjects.push(subject);
    this.saveSubjects(subjects);
    return subject;
  },

  updateSubject(key, updatedData) {
    const subjects = this.getSubjects();
    const idx = subjects.findIndex(s => s.key === key);
    if (idx !== -1) {
      subjects[idx] = { ...subjects[idx], ...updatedData, key };
      this.saveSubjects(subjects);
      return subjects[idx];
    }
    return null;
  },

  deleteSubject(key) {
    let subjects = this.getSubjects();
    subjects = subjects.filter(s => s.key !== key);
    if (subjects.length === 0) {
      subjects = [...DEFAULT_SUBJECTS];
    }
    this.saveSubjects(subjects);
    return subjects;
  },

  resetSubjectsToDefault() {
    this.saveSubjects(DEFAULT_SUBJECTS);
    return DEFAULT_SUBJECTS;
  },

  // ==========================================
  // ATTENDANCE MANAGEMENT METHODS
  // ==========================================
  getAttendanceMap() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  saveAttendanceMap(map) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(map));
    if (typeof window !== 'undefined' && window.dispatchEvent && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('attendance-changed', { detail: map }));
    }
  },

  getAttendanceRecord(studentId, term = 'term1', month = 'all') {
    const map = this.getAttendanceMap();
    const student = this.getStudentById(studentId);
    const classGrade = student ? student.classGrade : 'K1';
    const key = `${classGrade}-${term}-${month}`;
    const classRecords = map[key] || {};
    return classRecords[studentId] || { present: 100, excused: 0, unexcused: 0, late: 0 };
  },

  saveStudentAttendance(studentId, term, month, record) {
    const map = this.getAttendanceMap();
    const student = this.getStudentById(studentId);
    const classGrade = student ? student.classGrade : 'K1';
    const key = `${classGrade}-${term}-${month}`;
    if (!map[key]) map[key] = {};
    map[key][studentId] = {
      present: Math.max(0, Number(record.present) || 0),
      excused: Math.max(0, Number(record.excused) || 0),
      unexcused: Math.max(0, Number(record.unexcused) || 0),
      late: Math.max(0, Number(record.late) || 0)
    };
    this.saveAttendanceMap(map);
  },

  saveClassAttendance(classGrade, term, month, records) {
    const map = this.getAttendanceMap();
    const key = `${classGrade}-${term}-${month}`;
    map[key] = records;
    this.saveAttendanceMap(map);
  },

  getStudentAttendanceSummary(studentId, term = 'term1') {
    return this.getAttendanceRecord(studentId, term, 'all');
  },

  // ==========================================
  // ADVANCED AUTO-RANKING & TIE-BREAKING
  // ==========================================
  calculateAndSaveClassRankings(classGrade, term) {
    const students = this.getStudents().filter(s => s.classGrade === classGrade);
    const subjects = this.getSubjects();
    const scores = this.getAllScores();
    const studentStats = [];

    students.forEach(student => {
      const sc = scores.find(s => s.studentId === student.id && s.term === term);
      if (!sc) {
        studentStats.push({ studentId: student.id, total: 0, average: 0, hasScores: false });
        return;
      }
      let sum = 0;
      let count = 0;
      subjects.forEach(sub => {
        const val = parseFloat(sc[sub.key]);
        if (!isNaN(val)) {
          sum += val;
          count++;
        }
      });
      const avg = count > 0 ? (sum / count) : 0;
      studentStats.push({
        studentId: student.id,
        total: sum,
        average: avg,
        hasScores: count > 0
      });
    });

    // Sort descending by average
    const ranked = [...studentStats].filter(s => s.hasScores).sort((a, b) => b.average - a.average);
    let currentRank = 1;
    ranked.forEach((item, idx) => {
      if (idx > 0 && Math.abs(item.average - ranked[idx - 1].average) > 0.001) {
        currentRank = idx + 1;
      }
      item.rank = currentRank;
    });

    // Update into all scores
    let changed = false;
    ranked.forEach(item => {
      const sc = scores.find(s => s.studentId === item.studentId && s.term === term);
      if (sc) {
        const avgStr = item.average.toFixed(2);
        const totStr = item.total.toFixed(1);
        if (sc.rank !== item.rank || sc.average !== avgStr || sc.total !== totStr) {
          sc.rank = item.rank;
          sc.average = avgStr;
          sc.total = totStr;
          changed = true;
        }
      }
    });

    if (changed) {
      this.saveAllScores(scores);
    }

    return ranked;
  },

  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      console.error("Failed to parse settings:", e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  exportBackupJSON() {
    const backupData = {
      version: "2.0",
      exportDate: new Date().toISOString(),
      settings: this.getSettings(),
      students: this.getStudents(),
      scores: this.getAllScores(),
      customSubjects: this.getSubjects(),
      attendance: this.getAttendanceMap()
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const fileName = `kindergarten_backup_${new Date().toISOString().slice(0, 10)}.json`;

    if (typeof ElectronBridge !== 'undefined' && ElectronBridge.isElectron) {
      ElectronBridge.saveBackupFile(jsonStr, fileName);
    } else {
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  },

  importBackupJSON(fileContent) {
    try {
      const data = JSON.parse(fileContent);
      if (data.students && Array.isArray(data.students)) {
        this.saveStudents(data.students);
      }
      if (data.scores && Array.isArray(data.scores)) {
        this.saveAllScores(data.scores);
      }
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      if (data.customSubjects && Array.isArray(data.customSubjects)) {
        this.saveSubjects(data.customSubjects);
      }
      if (data.attendance && typeof data.attendance === 'object') {
        this.saveAttendanceMap(data.attendance);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  resetToDemo() {
    this.saveStudents(DEMO_STUDENTS);
    this.saveAllScores(DEMO_SCORES);
    this.saveSettings(DEFAULT_SETTINGS);
  },

  /**
   * Generate Sample CSV Template for Bulk Student Import
   */
  generateStudentTemplateCSV() {
    const headers = [
      "Khmer Name",
      "Chinese Name",
      "Pinyin",
      "Gender",
      "Class",
      "DOB",
      "Guardian Name",
      "Guardian Phone"
    ];

    const sampleRows = [
      ["សុខ វិសាល", "索威萨", "Suǒ Wēisà", "male", "K3", "2020-03-15", "សុខ សុភា", "012345678"],
      ["លី ម៉ីលីង", "李美玲", "Lǐ Měilíng", "female", "K3", "2020-06-20", "លី ចិន", "098765432"],
      ["ចាន់ សុភ័ក្ត្រ", "陈索菲", "Chén Suǒfēi", "female", "K2", "2021-02-10", "ចាន់ វណ្ណា", "077123456"]
    ];

    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...sampleRows.map(r => r.map(c => `"${c}"`).join(','))
    ].join('\r\n');

    return csvContent;
  },

  /**
   * Bulk Import Students from CSV Text
   */
  importStudentsCSV(csvContent) {
    if (!csvContent || typeof csvContent !== 'string') {
      return { success: false, error: 'ទិន្នន័យ CSV ទទេ ឬមិនត្រឹមត្រូវ' };
    }

    try {
      // Remove UTF-8 BOM if present
      const cleanContent = csvContent.replace(/^\uFEFF/, '');
      const lines = cleanContent.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);
      
      if (lines.length < 2) {
        return { success: false, error: 'ឯកសារ CSV ត្រូវមានក្បាលតារាង (Header) និងទិន្នន័យយ៉ាងហោច ១ ជួរ' };
      }

      // Simple CSV line parser taking care of quotes
      const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"' || char === "'") {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim().replace(/^["']|["']$/g, ''));
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        return result;
      };

      const existingStudents = this.getStudents();
      let importedCount = 0;
      let errors = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 2 || !cols[0]) continue; // Skip blank or invalid rows

        const khmerName = cols[0];
        const chineseName = cols[1] || khmerName;
        const pinyin = cols[2] || '';
        let gender = (cols[3] || 'male').toLowerCase();
        if (gender.includes('ស្រី') || gender.includes('女') || gender.includes('f')) {
          gender = 'female';
        } else {
          gender = 'male';
        }

        let classGrade = (cols[4] || 'K3').toUpperCase().trim();
        if (!['K1', 'K2', 'K3'].includes(classGrade)) {
          classGrade = 'K3';
        }

        const dob = cols[5] || '2020-01-01';
        const guardianName = cols[6] || '';
        const guardianPhone = cols[7] || '';

        // Generate unique ID
        const classCount = existingStudents.filter(s => s.classGrade === classGrade).length + importedCount + 1;
        const studentId = `${classGrade}-${String(classCount).padStart(3, '0')}`;

        // Random avatar choice based on gender
        const avatar = gender === 'female' 
          ? (['girl1', 'girl2', 'girl3'][importedCount % 3]) 
          : (['boy1', 'boy2', 'boy3'][importedCount % 3]);

        const newStudent = {
          id: studentId,
          khmerName,
          chineseName,
          pinyin,
          gender,
          dob,
          classGrade,
          guardianName,
          guardianPhone,
          avatar
        };

        existingStudents.push(newStudent);
        importedCount++;
      }

      if (importedCount > 0) {
        this.saveStudents(existingStudents);
        return { success: true, count: importedCount };
      } else {
        return { success: false, error: 'មិនមានទិន្នន័យសិស្សត្រឹមត្រូវសម្រាប់បញ្ចូលទេ' };
      }
    } catch (err) {
      console.error('CSV Import Exception:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Daily Auto-Backup Snapshot System
   */
  autoBackupDaily() {
    try {
      const today = new Date().toISOString().slice(0, 10);
      let snapshots = this.getBackupSnapshots();

      // If today is already backed up, skip
      if (snapshots.some(s => s.date === today)) {
        return;
      }

      const snapshot = {
        date: today,
        timestamp: Date.now(),
        studentsCount: this.getStudents().length,
        scoresCount: this.getAllScores().length,
        data: {
          students: this.getStudents(),
          scores: this.getAllScores(),
          settings: this.getSettings()
        }
      };

      snapshots.unshift(snapshot);
      // Keep only last 7 daily snapshots
      if (snapshots.length > 7) {
        snapshots = snapshots.slice(0, 7);
      }

      localStorage.setItem(STORAGE_KEYS.BACKUP_SNAPSHOTS, JSON.stringify(snapshots));
      console.log(`[Storage] Created daily auto-backup snapshot for ${today}`);
    } catch (e) {
      console.error('[Storage] Auto-backup error:', e);
    }
  },

  getBackupSnapshots() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BACKUP_SNAPSHOTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  restoreFromSnapshot(dateStr) {
    const snapshots = this.getBackupSnapshots();
    const snap = snapshots.find(s => s.date === dateStr);
    if (!snap || !snap.data) {
      return { success: false, error: 'រកមិនឃើញទិន្នន័យបម្រុងទុកកាលបរិច្ឆេទនេះទេ' };
    }

    if (snap.data.students) this.saveStudents(snap.data.students);
    if (snap.data.scores) this.saveAllScores(snap.data.scores);
    if (snap.data.settings) this.saveSettings(snap.data.settings);

    return { success: true };
  },

  exportToCSV(classGrade, term) {
    const students = this.getStudents().filter(s => !classGrade || s.classGrade === classGrade);
    const subjects = this.getSubjects();
    const maxTotal = subjects.reduce((acc, s) => acc + (Number(s.maxScore) || 100), 0);

    const headers = [
      "ID", "Khmer Name", "Chinese Name", "Pinyin", "Gender", "Class",
      ...subjects.map(s => `${s.nameCn} (${s.nameKm} ${s.maxScore})`),
      `Total (${maxTotal})`, "Average (100)", "Grade", "Rank",
      "Present (出勤)", "Excused (请假)", "Unexcused (旷课)", "Late (迟到)",
      "Teacher Comment"
    ];

    const rows = students.map((stu, i) => {
      const sc = this.getStudentScore(stu.id, term) || {};
      const att = this.getStudentAttendanceSummary(stu.id, term);
      let sum = 0, count = 0;
      subjects.forEach(sub => {
        if (sc[sub.key] !== undefined && sc[sub.key] !== null && sc[sub.key] !== '') {
          sum += parseFloat(sc[sub.key]);
          count++;
        }
      });
      const avg = count > 0 ? (sum / count).toFixed(2) : '';
      const total = count > 0 ? sum.toFixed(1) : '';

      const scoreCols = subjects.map(sub => sc[sub.key] !== undefined && sc[sub.key] !== null ? sc[sub.key] : '');

      return [
        `"${stu.id}"`,
        `"${stu.khmerName || ''}"`,
        `"${stu.chineseName || ''}"`,
        `"${stu.pinyin || ''}"`,
        `"${stu.gender || ''}"`,
        `"${stu.classGrade || ''}"`,
        ...scoreCols,
        total,
        avg,
        `"${sc.grade || ''}"`,
        sc.rank || (i + 1),
        att.present,
        att.excused,
        att.unexcused,
        att.late,
        `"${(sc.teacherComment || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    // Add UTF-8 BOM so Excel opens Khmer and Chinese characters properly
    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scores_${classGrade || 'all'}_${term}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  createManualSnapshot(label = 'Manual Backup') {
    try {
      let snapshots = this.getBackupSnapshots();
      const now = new Date();
      const id = 'snap-' + Date.now();
      const dateStr = now.toLocaleDateString('km-KH') + ' ' + now.toLocaleTimeString();

      const snapshot = {
        id,
        date: now.toISOString().slice(0, 10),
        time: now.toLocaleTimeString(),
        label: label,
        timestamp: Date.now(),
        studentsCount: this.getStudents().length,
        scoresCount: this.getAllScores().length,
        data: {
          students: this.getStudents(),
          scores: this.getAllScores(),
          settings: this.getSettings(),
          subjects: this.getSubjects(),
          attendance: this.getAttendanceData()
        }
      };

      snapshots.unshift(snapshot);
      if (snapshots.length > 15) snapshots = snapshots.slice(0, 15);
      localStorage.setItem(STORAGE_KEYS.BACKUP_SNAPSHOTS, JSON.stringify(snapshots));
      return { success: true, snapshot };
    } catch (e) {
      console.error('[Storage] Create snapshot error:', e);
      return { success: false, error: e.message };
    }
  },

  generateScoreTemplateCSV(classGrade) {
    const students = this.getStudents().filter(s => !classGrade || s.classGrade === classGrade);
    const subjects = this.getSubjects();

    const headers = [
      "Student ID", "Khmer Name", "Chinese Name", "Class",
      ...subjects.map(s => `${s.nameCn}_${s.key}`)
    ];

    const rows = students.map(s => [
      `"${s.id}"`,
      `"${s.khmerName || ''}"`,
      `"${s.chineseName || ''}"`,
      `"${s.classGrade || ''}"`,
      ...subjects.map(() => "")
    ].join(','));

    return "\uFEFF" + [headers.join(','), ...rows].join('\r\n');
  },

  importScoresCSV(csvText, term) {
    try {
      const cleanContent = csvText.replace(/^\uFEFF/, '');
      const lines = cleanContent.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        return { success: false, error: 'ឯកសារ CSV មិនមានទិន្នន័យគ្រប់គ្រាន់ទេ' };
      }

      const parseCSVLine = (line) => {
        let insideQuote = false;
        let current = '';
        const result = [];
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            insideQuote = !insideQuote;
          } else if (char === ',' && !insideQuote) {
            result.push(current.trim().replace(/^["']|["']$/g, ''));
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        return result;
      };

      const headerCols = parseCSVLine(lines[0]);
      const subjects = this.getSubjects();
      
      // Map columns to subject keys
      const subjectIndexMap = {};
      headerCols.forEach((col, idx) => {
        subjects.forEach(sub => {
          if (col.toLowerCase().includes(sub.key.toLowerCase()) || col.includes(sub.nameCn) || col.includes(sub.nameKm)) {
            subjectIndexMap[sub.key] = idx;
          }
        });
      });

      let updatedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        const studentId = cols[0];
        if (!studentId) continue;

        let scoreRecord = this.getStudentScore(studentId, term) || {
          studentId,
          term,
          termName: term === 'term1' ? 'ឆមាសទី១' : 'ឆមាសទី២'
        };

        let hasNewScore = false;
        subjects.forEach(sub => {
          const colIdx = subjectIndexMap[sub.key];
          if (colIdx !== undefined && cols[colIdx] !== undefined && cols[colIdx] !== '') {
            const val = parseFloat(cols[colIdx]);
            if (!isNaN(val)) {
              scoreRecord[sub.key] = val;
              hasNewScore = true;
            }
          }
        });

        if (hasNewScore) {
          // Re-calculate sum & average
          let sum = 0, count = 0;
          subjects.forEach(sub => {
            const val = parseFloat(scoreRecord[sub.key]);
            if (!isNaN(val)) {
              sum += val;
              count++;
            }
          });
          scoreRecord.total = count > 0 ? sum : 0;
          scoreRecord.average = count > 0 ? (sum / count) : 0;

          // Grade
          const avg = scoreRecord.average;
          const is100 = avg > 10;
          if (is100 ? avg >= 90 : avg >= 9.0) scoreRecord.grade = '优秀 (A)';
          else if (is100 ? avg >= 80 : avg >= 8.0) scoreRecord.grade = '良好 (B)';
          else if (is100 ? avg >= 65 : avg >= 6.5) scoreRecord.grade = '中等 (C)';
          else scoreRecord.grade = '待提高 (D)';

          this.saveScore(scoreRecord);
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        // Re-calculate rankings for all classes
        ['K1', 'K2', 'K3'].forEach(cg => this.calculateAndSaveClassRankings(cg, term));
        return { success: true, count: updatedCount };
      } else {
        return { success: false, error: 'មិនមានពិន្ទុដែលត្រូវបានបញ្ចូលឡើយ សូមពិនិត្យឈ្មោះកូដមុខវិជ្ជាក្នុង CSV' };
      }
    } catch (err) {
      console.error('Import Scores Error:', err);
      return { success: false, error: err.message };
    }
  },

  saveDomainRatings(studentId, term, ratings) {
    try {
      const key = `zh_domain_ratings_${studentId}_${term}`;
      localStorage.setItem(key, JSON.stringify(ratings));
      return true;
    } catch (e) {
      return false;
    }
  },

  getDomainRatings(studentId, term) {
    try {
      const key = `zh_domain_ratings_${studentId}_${term}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveCustomCitation(studentId, term, citationData) {
    try {
      const key = `zh_cert_citation_${studentId}_${term}`;
      localStorage.setItem(key, JSON.stringify(citationData));
      return true;
    } catch (e) {
      return false;
    }
  },

  getCustomCitation(studentId, term) {
    try {
      const key = `zh_cert_citation_${studentId}_${term}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  exportAttendanceToCSV(classGrade, term, month = 'all') {
    const students = this.getStudents().filter(s => !classGrade || s.classGrade === classGrade);
    const headers = [
      "Student ID", "Khmer Name", "Chinese Name", "Class",
      "Term", "Month", "Present (出勤)", "Excused (请假)", "Unexcused (旷课)", "Late (迟到)",
      "Attendance Rate (%)", "Status (状态)"
    ];

    const rows = students.map(s => {
      const att = this.getAttendanceRecord(s.id, term, month);
      const totalDays = (att.present || 0) + (att.excused || 0) + (att.unexcused || 0);
      const rate = totalDays > 0 ? Math.round(((att.present || 0) / totalDays) * 100) : 100;
      let status = "ល្អប្រសើរ (优秀)";
      if (rate < 85) status = "អវត្តមានច្រើន (需关注)";
      else if (rate < 95) status = "ល្អ (良好)";

      return [
        `"${s.id}"`,
        `"${s.khmerName || ''}"`,
        `"${s.chineseName || ''}"`,
        `"${s.classGrade || ''}"`,
        `"${term}"`,
        `"${month}"`,
        att.present || 0,
        att.excused || 0,
        att.unexcused || 0,
        att.late || 0,
        `${rate}%`,
        `"${status}"`
      ].join(',');
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${classGrade || 'all'}_${term}_${month}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // ==========================================
  // DAILY ATTENDANCE SYSTEM (Day-by-Day 1-31)
  // ==========================================
  getDailyAttendance(classGrade, term, month = 'month1') {
    const key = `${STORAGE_KEYS.DAILY_ATTENDANCE}_${classGrade}_${term}_${month}`;
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading daily attendance:', e);
    }

    // Default generate demo days for class students (Days 1 to 25/30)
    const students = this.getStudents().filter(s => !classGrade || s.classGrade === classGrade);
    const initial = {};
    students.forEach(s => {
      initial[s.id] = {};
      // Fill Mon-Fri days with 'P'
      for (let d = 1; d <= 30; d++) {
        const dayOfWeek = (d % 7);
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          initial[s.id][d] = ''; // Weekend off
        } else {
          initial[s.id][d] = 'P'; // Default Present
        }
      }
    });
    return initial;
  },

  saveDailyAttendance(classGrade, term, month, dailyData) {
    const key = `${STORAGE_KEYS.DAILY_ATTENDANCE}_${classGrade}_${term}_${month}`;
    try {
      localStorage.setItem(key, JSON.stringify(dailyData));

      // Auto-compute monthly summary for all students in this daily sheet
      const monthlyRecords = {};
      Object.keys(dailyData).forEach(studentId => {
        const studentDays = dailyData[studentId] || {};
        let present = 0, excused = 0, unexcused = 0, late = 0;
        Object.values(studentDays).forEach(status => {
          if (status === 'P') present++;
          else if (status === 'E') excused++;
          else if (status === 'U') unexcused++;
          else if (status === 'L') late++;
        });

        monthlyRecords[studentId] = {
          present,
          excused,
          unexcused,
          late
        };
      });

      this.saveClassAttendance(classGrade, term, month, monthlyRecords);
      return { success: true };
    } catch (e) {
      console.error('Error saving daily attendance:', e);
      return { success: false, error: e.message };
    }
  },

  // ==========================================
  // ANNUAL CUMULATIVE RECORD SYSTEM (学年档案)
  // ==========================================
  getStudentAnnualRecord(studentId) {
    const student = this.getStudentById(studentId);
    if (!student) return null;

    const scoreT1 = this.getStudentScore(studentId, 'term1');
    const scoreT2 = this.getStudentScore(studentId, 'term2');
    const attT1 = this.getAttendanceRecord(studentId, 'term1', 'all');
    const attT2 = this.getAttendanceRecord(studentId, 'term2', 'all');
    const subjects = this.getSubjects();

    const subjectRows = subjects.map(sub => {
      const valT1 = scoreT1 && scoreT1[sub.key] !== undefined && scoreT1[sub.key] !== null ? parseFloat(scoreT1[sub.key]) : null;
      const valT2 = scoreT2 && scoreT2[sub.key] !== undefined && scoreT2[sub.key] !== null ? parseFloat(scoreT2[sub.key]) : null;
      let annualSubAvg = '-';
      if (valT1 !== null && valT2 !== null) {
        annualSubAvg = ((valT1 + valT2) / 2).toFixed(1);
      } else if (valT1 !== null) {
        annualSubAvg = valT1.toFixed(1);
      } else if (valT2 !== null) {
        annualSubAvg = valT2.toFixed(1);
      }

      return {
        key: sub.key,
        nameKm: sub.nameKm,
        nameCn: sub.nameCn,
        maxScore: sub.maxScore || 100,
        t1: valT1 !== null ? valT1 : '-',
        t2: valT2 !== null ? valT2 : '-',
        annualAvg: annualSubAvg
      };
    });

    const avg1 = scoreT1 && scoreT1.average ? parseFloat(scoreT1.average) : null;
    const avg2 = scoreT2 && scoreT2.average ? parseFloat(scoreT2.average) : null;
    let finalAnnualAvg = '-';
    if (avg1 !== null && avg2 !== null) {
      finalAnnualAvg = ((avg1 + avg2) / 2).toFixed(2);
    } else if (avg1 !== null) {
      finalAnnualAvg = avg1.toFixed(2);
    } else if (avg2 !== null) {
      finalAnnualAvg = avg2.toFixed(2);
    }

    const numAvg = parseFloat(finalAnnualAvg);
    let finalGrade = '-';
    if (!isNaN(numAvg)) {
      const cutoffs = this.getSettings();
      const cutA = cutoffs.gradeCutoffA || 90;
      const cutB = cutoffs.gradeCutoffB || 80;
      const cutC = cutoffs.gradeCutoffC || 65;
      if (numAvg >= cutA) finalGrade = 'A';
      else if (numAvg >= cutB) finalGrade = 'B';
      else if (numAvg >= cutC) finalGrade = 'C';
      else finalGrade = 'D';
    }

    // Cumulative Attendance
    const totalPresent = (attT1.present || 0) + (attT2.present || 0);
    const totalExcused = (attT1.excused || 0) + (attT2.excused || 0);
    const totalUnexcused = (attT1.unexcused || 0) + (attT2.unexcused || 0);
    const totalLate = (attT1.late || 0) + (attT2.late || 0);
    const totalSchoolDays = totalPresent + totalExcused + totalUnexcused;
    const attendanceRate = totalSchoolDays > 0 ? Math.round((totalPresent / totalSchoolDays) * 100) : 100;

    // Promotion suggestion based on class
    let promotion = {
      km: 'អនុញ្ញាតឱ្យឡើងទៅថ្នាក់ មត្តេយ្យកម្រិតទាប (K2)',
      cn: '准予升入 幼中班 (K2)'
    };
    if (student.classGrade === 'K2') {
      promotion = {
        km: 'អនុញ្ញាតឱ្យឡើងទៅថ្នាក់ មត្តេយ្យកម្រិតខ្ពស់ (K3)',
        cn: '准予升入 幼大班 (K3)'
      };
    } else if (student.classGrade === 'K3') {
      promotion = {
        km: 'បញ្ចប់ការសិក្សាមត្តេយ្យ និងឡើងទៅថ្នាក់ បឋមសិក្សា (ថ្នាក់ទី១)',
        cn: '幼儿园毕业 准予升入 小学一年级'
      };
    }

    return {
      student,
      scoreT1,
      scoreT2,
      subjectRows,
      finalAnnualAvg,
      finalGrade,
      term1Rank: scoreT1 ? scoreT1.rank || '-' : '-',
      term2Rank: scoreT2 ? scoreT2.rank || '-' : '-',
      attendance: {
        totalPresent,
        totalExcused,
        totalUnexcused,
        totalLate,
        totalSchoolDays,
        attendanceRate
      },
      promotion
    };
  }
};

if (typeof window !== 'undefined') window.Storage = Storage;
if (typeof module !== 'undefined' && module.exports) module.exports = Storage;
