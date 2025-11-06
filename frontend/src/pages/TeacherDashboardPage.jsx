import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  archiveStudent,
  bulkCreateStudents,
  createClass,
  createStudent,
  getTeacherDashboard,
  regenerateClassCredentials,
  updateClassPacing,
} from "../lib/api.js";
import { generatePassword } from "../../../shared/passwords.js";
import { useSession } from "../hooks/useSession.js";
import ContentContainer from "../components/ui/ContentContainer.jsx";
import ResponsiveGrid from "../components/ui/ResponsiveGrid.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import StatusBanner from "../components/ui/StatusBanner.jsx";
import Modal from "../components/ui/Modal.jsx";
import "./TeacherDashboardPage.css";
import { getYear7LessonById } from "../../../shared/liveDecks.js";

const STAGE_CONFIG = [
  {
    id: "year7",
    label: "Year 7",
    yearGroupLabel: "Year 7",
    cohortOffset: 7,
    groups: ["A", "B", "C", "D"],
    programme: "ks3",
    buildCode: (cohort, group) => `CsC/${cohort}F${group}`,
  },
  {
    id: "year8",
    label: "Year 8",
    yearGroupLabel: "Year 8",
    cohortOffset: 6,
    groups: ["A", "B", "C", "D"],
    programme: "ks3",
    buildCode: (cohort, group) => `CsC/${cohort}F${group}`,
  },
  {
    id: "year9",
    label: "Year 9",
    yearGroupLabel: "Year 9",
    cohortOffset: 5,
    groups: ["A", "B", "C", "D"],
    programme: "ks3",
    buildCode: (cohort, group) => `CsC/${cohort}F${group}`,
  },
  {
    id: "igcse",
    label: "IGCSE",
    yearGroupLabel: "IGCSE",
    cohortOffset: 4,
    groups: ["G1", "G2"],
    programme: "igcse",
    buildCode: (cohort, group) => `CsC/${cohort}${group}`,
  },
  {
    id: "ib",
    label: "IB",
    yearGroupLabel: "IB",
    cohortOffset: 2,
    groups: ["SL", "HL"],
    programme: (group) => (group === "HL" ? "ib-hl" : "ib-sl"),
    buildCode: (cohort, group) => `CsC/${cohort}${group}`,
  },
];

const CSV_TEMPLATE = "firstName,lastName,username\n";
const PASSWORD_STORAGE_KEY = "ibcs.teacherPasswords";

function upsertClassPacingRecords(list = [], pacing) {
  if (!pacing?.classId) return Array.isArray(list) ? list : [];
  const filtered = (list ?? []).filter((item) => item?.classId !== pacing.classId);
  return [...filtered, pacing];
}

function isYear7ClassRecord(classRecord) {
  return (classRecord?.yearGroup ?? "").toLowerCase().includes("year 7");
}

function readStoredPasswords() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PASSWORD_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredPasswords(map) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PASSWORD_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage write failures (private browsing, etc.)
  }
}

function usernameKey(username) {
  return `username:${username.toLowerCase()}`;
}

function rememberPasswords(prev, entries) {
  const next = { ...prev };
  for (const entry of entries) {
    if (!entry?.password) continue;
    if (entry.id) {
      next[entry.id] = entry.password;
    }
    if (entry.username) {
      next[usernameKey(entry.username)] = entry.password;
    }
  }
  return next;
}

function resolveStoredPassword(map, student) {
  const byId = student?.id ? map[student.id] : undefined;
  if (byId) return byId;
  if (student?.username) {
    return map[usernameKey(student.username)];
  }
  return undefined;
}

function getStageConfig(stageId) {
  return STAGE_CONFIG.find((item) => item.id === stageId) ?? STAGE_CONFIG[0];
}

function padCohort(value) {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  return digits.slice(-2).padStart(2, "0");
}

function defaultCohort(offsetYears) {
  const year = new Date().getFullYear();
  const cohort = (year % 100) + offsetYears;
  return padCohort(cohort);
}

function generateClassCode(stageId, cohort, group) {
  const config = getStageConfig(stageId);
  const cleanedGroup = group?.toUpperCase() ?? "";
  const cleanedCohort = padCohort(cohort || defaultCohort(config.cohortOffset));
  return config.buildCode(cleanedCohort, cleanedGroup);
}

function deriveProgramme(stageId, group) {
  const config = getStageConfig(stageId);
  if (typeof config.programme === "function") {
    return config.programme(group?.toUpperCase());
  }
  return config.programme;
}

function deriveYearGroupLabel(stageId, group) {
  const config = getStageConfig(stageId);
  if (stageId === "ib") {
    return `IB ${group?.toUpperCase() === "HL" ? "HL" : "SL"}`;
  }
  if (stageId === "igcse") {
    return "IGCSE";
  }
  return config.yearGroupLabel;
}

function parseClassMeta(classItem) {
  const className = classItem?.className ?? "";
  const yearGroup = (classItem?.yearGroup ?? "").toLowerCase();
  let stageId = null;
  if (yearGroup.includes("year 7")) stageId = "year7";
  else if (yearGroup.includes("year 8")) stageId = "year8";
  else if (yearGroup.includes("year 9")) stageId = "year9";
  else if (yearGroup.includes("igcse")) stageId = "igcse";
  else if (yearGroup.includes("hl") || yearGroup.includes("sl") || yearGroup.includes("ib")) stageId = "ib";

  const match = className.match(/^CsC\/(\d{2})([A-Za-z0-9]+)$/);
  const cohort = match ? match[1] : "";
  let group = match ? match[2].toUpperCase() : "";

  if (stageId === "year7" || stageId === "year8" || stageId === "year9") {
    group = group.replace(/^F/, "");
  }
  if (stageId === "igcse" && !group.startsWith("G")) {
    group = `G${group}`;
  }
  if (stageId === "ib") {
    group = group === "HL" ? "HL" : "SL";
  }

  const programme = deriveProgramme(stageId ?? "year7", group);
  const yearGroupLabel = deriveYearGroupLabel(stageId ?? "year7", group);

  return {
    stageId: stageId ?? "year7",
    cohort: cohort || defaultCohort(getStageConfig(stageId ?? "year7").cohortOffset),
    group: group || getStageConfig(stageId ?? "year7").groups[0],
    programme,
    yearGroupLabel,
  };
}

function extractPlainPassword(student) {
  const candidates = [
    student?.passwordPlain,
    student?.initialPassword,
    student?.passwordPreview,
    student?.defaultPassword,
    student?.password,
  ];
  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    if (/^\$2[aby]\$/.test(trimmed)) {
      continue;
    }
    return trimmed;
  }
  return "";
}

function parseCsvStudents(text) {
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length <= 1) {
    return [];
  }

  const header = rows[0].split(/\s*,\s*/).map((h) => h.toLowerCase());
  const firstNameIndex = header.indexOf("firstname");
  const lastNameIndex = header.indexOf("lastname");
  const usernameIndex = header.indexOf("username");

  if (firstNameIndex === -1 || lastNameIndex === -1) {
    throw new Error("Template must include firstName and lastName columns.");
  }

  return rows.slice(1).map((row) => {
    const cells = row.split(/\s*,\s*/);
    return {
      firstName: cells[firstNameIndex] ?? "",
      lastName: cells[lastNameIndex] ?? "",
      username: usernameIndex === -1 ? "" : cells[usernameIndex] ?? "",
    };
  });
}

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ibcs-student-template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function TeacherDashboardPage() {
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const token = session?.token ?? null;
  const isTeacher = session?.user?.role === "teacher";

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const [classModalOpen, setClassModalOpen] = useState(false);
  const [studentModal, setStudentModal] = useState(null);
  const [pacingState, setPacingState] = useState({});

  const [classForm, setClassForm] = useState(() => {
    const stage = STAGE_CONFIG[0];
    const cohort = defaultCohort(stage.cohortOffset);
    const group = stage.groups[0];
    return {
      stageId: stage.id,
      cohort,
      group,
      className: generateClassCode(stage.id, cohort, group),
      description: "",
    };
  });

  const [studentForm, setStudentForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: generatePassword(),
  });

  const [bulkCsv, setBulkCsv] = useState(null);
  const [bulkStatus, setBulkStatus] = useState(null);
  const [passwordLookup, setPasswordLookupState] = useState(() => readStoredPasswords());
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const updatePasswordLookup = useCallback((updater) => {
    setPasswordLookupState((prev) => {
      const result = typeof updater === "function" ? updater(prev) : updater;
      const next = result ? result : {};
      writeStoredPasswords(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!isTeacher) {
      updatePasswordLookup({});
      navigate("/", { replace: true });
    }
  }, [ready, isTeacher, navigate, updatePasswordLookup]);

  const loadDashboard = useCallback(async () => {
    if (!token || !isTeacher) return;
    setLoading(true);
    try {
      const data = await getTeacherDashboard(token);
      setDashboard(data);
      if (Array.isArray(data?.students)) {
        const entries = [];
        for (const student of data.students) {
          const plain = extractPlainPassword(student);
          if (plain) {
            entries.push({ id: student.id, username: student.username, password: plain });
          }
        }
        if (entries.length > 0) {
          updatePasswordLookup((prev) => rememberPasswords(prev, entries));
        }
      }
    } catch (error) {
      setStatus({ tone: "error", message: error.message || "Failed to load dashboard." });
    } finally {
      setLoading(false);
    }
  }, [token, isTeacher, updatePasswordLookup]);

  useEffect(() => {
    if (!ready || !isTeacher) return;
    loadDashboard();
  }, [ready, isTeacher, loadDashboard]);

  const classes = useMemo(() => {
    const list = dashboard?.classes ?? [];
    return [...list].sort((a, b) => a.className.localeCompare(b.className));
  }, [dashboard?.classes]);

  useEffect(() => {
    if (classes.length === 0) {
      setSelectedClassId(null);
      return;
    }
    setSelectedClassId((prev) => {
      if (prev && classes.some((clazz) => clazz.id === prev)) {
        return prev;
      }
      return classes[0].id;
    });
  }, [classes]);

  const studentsByClass = useMemo(() => {
    const map = new Map();
    for (const student of dashboard?.students ?? []) {
      if (!map.has(student.classId)) {
        map.set(student.classId, []);
      }
      map.get(student.classId).push(student);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.displayName.localeCompare(b.displayName));
    }
    return map;
  }, [dashboard?.students]);

  const classPacingMap = useMemo(() => {
    const map = new Map();
    for (const entry of dashboard?.classPacing ?? []) {
      if (entry?.classId) {
        map.set(entry.classId, entry);
      }
    }
    return map;
  }, [dashboard?.classPacing]);

  const selectedClass = useMemo(() => classes.find((clazz) => clazz.id === selectedClassId) ?? null, [classes, selectedClassId]);
  const selectedStudents = useMemo(
    () => (selectedClass ? studentsByClass.get(selectedClass.id) ?? [] : []),
    [selectedClass, studentsByClass],
  );
  const selectedClassMeta = useMemo(() => (selectedClass ? parseClassMeta(selectedClass) : null), [selectedClass]);
  const selectedPacing = selectedClass ? classPacingMap.get(selectedClass.id) ?? null : null;
  const selectedPacingLesson = selectedPacing ? getYear7LessonById(selectedPacing.lessonId) : null;
  const numberFormatter = useMemo(() => new Intl.NumberFormat(), []);
  const classSummaryCards = useMemo(() => {
    if (!selectedClass) return [];
    const totalLessons = availableLessons + lockedLessons;
    const formattedStudents = numberFormatter.format(selectedStudents.length);
    const formattedAvailable = numberFormatter.format(availableLessons);
    const formattedLocked = numberFormatter.format(lockedLessons);
    const formattedTotalLessons = numberFormatter.format(totalLessons);
    return [
      {
        key: "students",
        label: "Total students",
        value: formattedStudents,
      },
      {
        key: "available",
        label: "Lessons available",
        value: formattedAvailable,
        progress: totalLessons > 0 ? availableLessons / totalLessons : null,
        progressLabel:
          totalLessons > 0
            ? `${formattedAvailable} of ${formattedTotalLessons} open`
            : "No lessons unlocked yet",
      },
      {
        key: "locked",
        label: "Lessons locked",
        value: formattedLocked,
        progress: totalLessons > 0 ? lockedLessons / totalLessons : null,
        progressLabel:
          totalLessons > 0
            ? `${formattedLocked} awaiting release`
            : "All lessons unlocked",
      },
    ];
  }, [availableLessons, lockedLessons, numberFormatter, selectedClass, selectedStudents.length]);
  const selectedPacingInfo = selectedClass ? pacingState[selectedClass.id] : null;
  const isYear7Selected = selectedClass ? isYear7ClassRecord(selectedClass) : false;

  const clearPacingMessage = useCallback((classId) => {
    setTimeout(() => {
      setPacingState((prev) => {
        const current = prev[classId];
        if (!current || current.busy) {
          return prev;
        }
        const next = { ...prev };
        delete next[classId];
        return next;
      });
    }, 4000);
  }, []);

  const handleStartPacing = useCallback(
    async (classId) => {
      if (!token) return;
      setPacingState((prev) => ({
        ...prev,
        [classId]: {
          ...(prev[classId] ?? {}),
          busy: true,
          message: "Updating pointer…",
          tone: "info",
        },
      }));

      try {
        const response = await updateClassPacing(token, classId, { command: "start" });
        if (response?.pacing) {
          setDashboard((prev) => ({
            ...prev,
            classPacing: upsertClassPacingRecords(prev?.classPacing, response.pacing),
          }));
        }
        const lessonTitle = response?.lesson?.title ?? "Lesson 1";
        setPacingState((prev) => ({
          ...prev,
          [classId]: {
            busy: false,
            message: `Pointer set to ${lessonTitle}`,
            tone: "success",
          },
        }));
      } catch (error) {
        setPacingState((prev) => ({
          ...prev,
          [classId]: {
            busy: false,
            message: error?.message || "Unable to update the teaching pointer.",
            tone: "error",
          },
        }));
      } finally {
        clearPacingMessage(classId);
      }
    },
    [token, clearPacingMessage],
  );

  const handleAdvancePacing = useCallback(
    async (classId) => {
      if (!token) return;
      setPacingState((prev) => ({
        ...prev,
        [classId]: {
          ...(prev[classId] ?? {}),
          busy: true,
          message: "Advancing pointer…",
          tone: "info",
        },
      }));

      try {
        const response = await updateClassPacing(token, classId, { command: "advance" });
        if (response?.pacing) {
          setDashboard((prev) => ({
            ...prev,
            classPacing: upsertClassPacingRecords(prev?.classPacing, response.pacing),
          }));
        }
        const lessonTitle = response?.lesson?.title ?? "the next lesson";
        setPacingState((prev) => ({
          ...prev,
          [classId]: {
            busy: false,
            message: `Advanced to ${lessonTitle}`,
            tone: "success",
          },
        }));
      } catch (error) {
        setPacingState((prev) => ({
          ...prev,
          [classId]: {
            busy: false,
            message: error?.message || "Unable to advance the pointer.",
            tone: "error",
          },
        }));
      } finally {
        clearPacingMessage(classId);
      }
    },
    [token, clearPacingMessage],
  );

  const handleStopPacing = useCallback(
    async (classId) => {
      if (!token || !classId) return;
      setPacingState((prev) => ({
        ...prev,
        [classId]: {
          ...(prev[classId] ?? {}),
          busy: true,
          message: "Saving pointer…",
          tone: "info",
        },
      }));

      try {
        const response = await updateClassPacing(token, classId, { command: "stop" });
        if (response?.pacing) {
          setDashboard((prev) => ({
            ...prev,
            classPacing: upsertClassPacingRecords(prev?.classPacing, response.pacing),
          }));
        }
        const lessonTitle = response?.lesson?.title ?? "current lesson";
        setPacingState((prev) => ({
          ...prev,
          [classId]: {
            busy: false,
            message: `Pointer saved at ${lessonTitle}`,
            tone: "success",
          },
        }));
      } catch (error) {
        setPacingState((prev) => ({
          ...prev,
          [classId]: {
            busy: false,
            message: error?.message || "Unable to save the teaching pointer.",
            tone: "error",
          },
        }));
      } finally {
        clearPacingMessage(classId);
      }
    },
    [token, clearPacingMessage],
  );

  const handleOpenYear7Map = useCallback(
    (classId) => {
      navigate(`/curriculum/year7?classId=${encodeURIComponent(classId)}`);
    },
    [navigate],
  );

  const teacherName =
    dashboard?.teacher?.displayName ?? session?.user?.displayName ?? session?.user?.username ?? "Teacher";

  const overallStudentCount = dashboard?.students?.length ?? 0;
  const lockedLessons = dashboard?.lessonSummary?.locked ?? 0;
  const availableLessons = dashboard?.lessonSummary?.available ?? 0;
  const formativeComplete = dashboard?.lessonSummary?.["formative-complete"] ?? 0;
  const summativeComplete = dashboard?.lessonSummary?.["summative-complete"] ?? 0;
const summaryCards = useMemo(
    () => [
      { label: "Active classes", value: numberFormatter.format(classes.length) },
      { label: "Active students", value: numberFormatter.format(overallStudentCount) },
      { label: "Formative complete", value: numberFormatter.format(formativeComplete) },
      { label: "Summative complete", value: numberFormatter.format(summativeComplete) },
    ],
    [classes.length, formativeComplete, numberFormatter, overallStudentCount, summativeComplete],
  );

  const studentLookup = useMemo(() => {
    const map = new Map();
    for (const student of dashboard?.students ?? []) {
      map.set(student.id, student);
    }
    return map;
  }, [dashboard?.students]);

  const studentProgressSummary = useMemo(() => {
    const summaries = new Map();
    for (const record of dashboard?.progress ?? []) {
      if (!record?.studentId) continue;
      const student = studentLookup.get(record.studentId);
      if (!student) continue;
      let summary = summaries.get(record.studentId);
      if (!summary) {
        summary = {
          id: record.studentId,
          displayName: student.displayName ?? student.username ?? "Student",
          username: student.username ?? "",
          locked: 0,
          available: 0,
          formativeComplete: 0,
          summativeComplete: 0,
          lastUpdated: null,
        };
        summaries.set(record.studentId, summary);
      }
      const statusValue = (record.status || "locked").toLowerCase();
      if (statusValue === "locked") summary.locked += 1;
      else if (statusValue === "available") summary.available += 1;
      else if (statusValue === "formative-complete") summary.formativeComplete += 1;
      else if (statusValue === "summative-complete") summary.summativeComplete += 1;
      const updatedAt = record.updatedAt ? new Date(record.updatedAt).getTime() : null;
      if (updatedAt && (!summary.lastUpdated || updatedAt > summary.lastUpdated)) {
        summary.lastUpdated = updatedAt;
      }
    }
    return Array.from(summaries.values()).sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [dashboard?.progress, studentLookup]);

  const studentsNeedingAttention = useMemo(() => {
    return studentProgressSummary
      .filter((item) => item.available > 0 && item.formativeComplete === 0)
      .slice(0, 6);
  }, [studentProgressSummary]);

  const recentProgress = useMemo(() => {
    const records = [...(dashboard?.progress ?? [])]
      .filter((record) => record.updatedAt)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 8)
      .map((record) => {
        const student = studentLookup.get(record.studentId);
        return {
          id: record.id ?? `${record.studentId}-${record.lessonSlug}`,
          lesson: record.lessonSlug,
          status: record.status,
          updatedAt: record.updatedAt,
          studentName: student?.displayName ?? student?.username ?? "Student",
        };
      });
    return records;
  }, [dashboard?.progress, studentLookup]);

  const handleClassStageChange = (key, value) => {
    setClassForm((prev) => {
      if (key === "stageId") {
        const config = getStageConfig(value);
        const cohort = defaultCohort(config.cohortOffset);
        const group = config.groups[0];
        return {
          stageId: value,
          cohort,
          group,
          description: "",
          className: generateClassCode(value, cohort, group),
        };
      }
      if (key === "cohort") {
        return {
          ...prev,
          cohort: value,
          className: generateClassCode(prev.stageId, value, prev.group),
        };
      }
      if (key === "group") {
        return {
          ...prev,
          group: value,
          className: generateClassCode(prev.stageId, prev.cohort, value),
        };
      }
      return { ...prev, [key]: value };
    });
  };

  const openClassModal = () => {
    const stage = STAGE_CONFIG[0];
    const cohort = defaultCohort(stage.cohortOffset);
    const group = stage.groups[0];
    setClassForm({
      stageId: stage.id,
      cohort,
      group,
      description: "",
      className: generateClassCode(stage.id, cohort, group),
    });
    setStatus(null);
    setClassModalOpen(true);
  };

  const submitClass = async (event) => {
    event.preventDefault();
    if (!token) return;
    const config = getStageConfig(classForm.stageId);
    const cohort = padCohort(classForm.cohort) || defaultCohort(config.cohortOffset);
    const group = classForm.group || config.groups[0];
    const className = generateClassCode(classForm.stageId, cohort, group);
    const yearGroup = deriveYearGroupLabel(classForm.stageId, group);

    try {
      setStatus({ tone: "info", message: "Creating class…" });
      const created = await createClass(token, {
        className,
        description: classForm.description || undefined,
        yearGroup,
      });
      setStatus({ tone: "success", message: `Class ${className} created.` });
      setClassModalOpen(false);
      await loadDashboard();
      if (created?.id) {
        setSelectedClassId(created.id);
      }
    } catch (error) {
      setStatus({ tone: "error", message: error.message || "Unable to create class." });
    }
  };

  const openStudentModal = (classItem, mode = "single") => {
    const meta = parseClassMeta(classItem);
    setStudentForm({
      firstName: "",
      lastName: "",
      username: "",
      password: generatePassword(),
    });
    setBulkCsv(null);
    setBulkStatus(null);
    setStudentModal({ classItem: classItem, meta, mode });
  };

  const handleStudentFormChange = (field, value) => {
    setStudentForm((prev) => {
      const next = { ...prev, [field]: value };
      if ((field === "firstName" || field === "lastName") && !prev.username) {
        const first = (field === "firstName" ? value : prev.firstName).trim();
        const last = (field === "lastName" ? value : prev.lastName).trim();
        if (first && last) {
          next.username = `${first[0] ?? ""}${last}`.toLowerCase().replace(/[^a-z0-9]/g, "");
        }
      }
      return next;
    });
  };

  const submitStudent = async (event) => {
    event.preventDefault();
    if (!token || !studentModal) return;

    const meta = studentModal.meta;
    const classId = studentModal.classItem.id;
    const firstName = studentForm.firstName.trim();
    const lastName = studentForm.lastName.trim();
    const username = studentForm.username.trim();
    const password = studentForm.password || generatePassword();

    if (!firstName || !lastName) {
      setStatus({ tone: "error", message: "First name and surname are required." });
      return;
    }

    if (!username) {
      setStatus({ tone: "error", message: "Username is required." });
      return;
    }

    try {
      setStatus({ tone: "info", message: "Adding student…" });
      const created = await createStudent(token, {
        classId,
        firstName,
        lastName,
        username,
        password,
        yearGroup: meta.yearGroupLabel,
        programme: meta.programme,
      });
      updatePasswordLookup((prev) => rememberPasswords(prev, [{ id: created.id, username: created.username, password }]));
      setVisiblePasswords((prev) => ({ ...prev, [created.id]: true }));
      setStudentModal(null);
      await loadDashboard();
      setStatus({ tone: "success", message: `${firstName} ${lastName} added to ${studentModal.classItem.className}.` });
    } catch (error) {
      setStatus({ tone: "error", message: error.message || "Unable to add student." });
    }
  };

  const submitBulkStudents = async (event) => {
    event.preventDefault();
    if (!token || !studentModal || !bulkCsv) {
      setBulkStatus({ tone: "error", message: "Attach a CSV file to import." });
      return;
    }
    try {
      setBulkStatus({ tone: "info", message: "Parsing CSV…" });
      const text = typeof bulkCsv === "string" ? bulkCsv : await bulkCsv.text();
      const parsed = parseCsvStudents(text);
      if (parsed.length === 0) {
        throw new Error("The CSV file did not contain any students.");
      }
      const meta = studentModal.meta;
      const prepared = parsed.map((row) => {
        const firstName = row.firstName.trim();
        const lastName = row.lastName.trim();
        const username = row.username.trim() || `${firstName[0] ?? ""}${lastName}`.toLowerCase();
        const password = generatePassword();
        return {
          firstName,
          lastName,
          username,
          password,
          passwordPlain: password,
          programme: meta.programme,
          yearGroup: meta.yearGroupLabel,
        };
      });

      setBulkStatus({ tone: "info", message: "Uploading students…" });
      const sanitizedStudents = prepared.map((student) => {
        const copy = { ...student };
        delete copy.passwordPlain;
        return copy;
      });

      const created = await bulkCreateStudents(token, {
        classId: studentModal.classItem.id,
        students: sanitizedStudents,
      });

      const passwordEntries = created
        .map((student, index) => ({
          id: student.id,
          username: student.username,
          password: prepared[index]?.passwordPlain ?? "",
        }))
        .filter((entry) => entry.password);
      if (passwordEntries.length > 0) {
        updatePasswordLookup((prev) => rememberPasswords(prev, passwordEntries));
      }
      setVisiblePasswords((prev) => ({ ...prev, ...Object.fromEntries(created.map((student) => [student.id, true])) }));

      setBulkStatus({ tone: "success", message: `${created.length} students imported.` });
      setBulkCsv(null);
      setStudentModal(null);
      await loadDashboard();
    } catch (error) {
      setBulkStatus({ tone: "error", message: error.message || "Unable to import CSV." });
    }
  };

  const togglePassword = (studentId) => {
    setVisiblePasswords((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleArchive = async (studentId) => {
    if (!token || !studentId) return;
    const confirmArchive = window.confirm("Archive this student? They can be restored later by an administrator.");
    if (!confirmArchive) return;
    try {
      await archiveStudent(token, { studentId });
      setStatus({ tone: "success", message: "Student archived." });
      await loadDashboard();
    } catch (error) {
      setStatus({ tone: "error", message: error.message || "Unable to archive student." });
    }
  };

  const handleCopyCredentials = useCallback(async () => {
    if (!selectedClass || selectedStudents.length === 0) {
      setStatus({ tone: "error", message: "Select a class with students first." });
      return;
    }

    const storedEntries = [];
    const missingStudents = [];

    for (const student of selectedStudents) {
      const password = resolveStoredPassword(passwordLookup, student);
      const username = student.username ?? "—";
      const fallbackName = `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim();
      const name = student.displayName ?? (fallbackName || username || "Student");

      if (password && !password.startsWith("$2")) {
        storedEntries.push({ id: student.id, name, username, password });
      } else {
        missingStudents.push({ id: student.id, name, username });
      }
    }

    let credentialEntries = [...storedEntries];
    let generatedCount = 0;

    if (missingStudents.length > 0) {
      if (!token) {
        setStatus({ tone: "error", message: "Session expired. Sign in again to generate new passwords." });
        return;
      }

      const confirmReset = window.confirm(
        `No stored passwords for ${missingStudents.length} student${missingStudents.length === 1 ? "" : "s"}. Generate new passwords now?`,
      );
      if (!confirmReset) {
        setStatus({ tone: "error", message: "Password copy cancelled." });
        return;
      }

      setStatus({ tone: "info", message: "Generating fresh passwords…" });

      try {
        const response = await regenerateClassCredentials(token, selectedClass.id, {
          studentIds: missingStudents.map((student) => student.id),
        });
        const generated = (response?.credentials ?? [])
          .filter((entry) => entry?.password)
          .map((entry) => {
            const fallbackName = `${entry.firstName ?? ""} ${entry.lastName ?? ""}`.trim();
            const username = entry.username ?? "—";
            const name = entry.displayName ?? (fallbackName || username || "Student");
            return {
              id: entry.id,
              name,
              username,
              password: entry.password,
            };
          });

        if (generated.length === 0) {
          setStatus({ tone: "error", message: "Unable to generate passwords for the selected students." });
          return;
        }

        generatedCount = generated.length;
        credentialEntries = [...credentialEntries, ...generated];
        updatePasswordLookup((prev) =>
          rememberPasswords(prev, generated.map((entry) => ({ id: entry.id, username: entry.username, password: entry.password }))),
        );
        setVisiblePasswords((prev) => ({ ...prev, ...Object.fromEntries(generated.map((entry) => [entry.id, true])) }));
      } catch (error) {
        console.warn("Credential regeneration failed", error);
        setStatus({ tone: "error", message: error?.message || "Unable to generate new passwords." });
        return;
      }
    }

    if (credentialEntries.length === 0) {
      setStatus({ tone: "error", message: "No stored passwords available for this class." });
      return;
    }

    credentialEntries.sort((a, b) => a.name.localeCompare(b.name));

    const header = "Name\tUsername\tPassword";
    const lines = credentialEntries.map((entry) => `${entry.name}\t${entry.username || "—"}\t${entry.password}`);
    const payload = [header, ...lines].join("\n");

    try {
      await navigator.clipboard.writeText(payload);
      setStatus({
        tone: "success",
        message:
          generatedCount > 0
            ? `Credentials copied. ${generatedCount} password${generatedCount === 1 ? "" : "s"} refreshed.`
            : "Credentials copied to clipboard.",
      });
    } catch (error) {
      console.warn("Clipboard copy failed", error);
      setStatus({ tone: "error", message: "Unable to copy credentials. Try again." });
    }
  }, [passwordLookup, selectedClass, selectedStudents, token, updatePasswordLookup]);

  const handleViewStudentDashboard = useCallback(
    (studentId) => {
      if (!studentId) return;
      navigate(`/dashboard/student/${encodeURIComponent(studentId)}`);
    },
    [navigate],
  );

  if (!ready) {
    return null;
  }

  if (!isTeacher) {
    return null;
  }

  return (
    <ContentContainer variant="fullWidth" className="teacher-dashboard">
      <section className="teacher-dashboard__hero">
        <div className="teacher-dashboard__hero-left">
          <span className="teacher-dashboard__eyebrow">Teacher dashboard</span>
          <h1>Good day, {teacherName}</h1>
          <p className="muted">
            Manage classes, enrol students, and monitor lesson unlocks. Everything updates in real time as your classes
            progress through the IB Computer Science curriculum.
          </p>
          <div className="teacher-dashboard__hero-actions">
            <button type="button" className="pill pill--action" onClick={openClassModal}>
              Add class
            </button>
            <button
              type="button"
              className="pill"
              onClick={() => (selectedClass ? openStudentModal(selectedClass, "single") : classes[0] && openStudentModal(classes[0], "single"))}
              disabled={classes.length === 0}
            >
              Add student
            </button>
          </div>
        </div>
        <ResponsiveGrid variant="autoFit" minColumnWidth={200} className="teacher-dashboard__summary-grid">
          {summaryCards.map((card) => (
            <StatCard key={card.label} label={card.label} value={card.value} tone="brand" compact />
          ))}
        </ResponsiveGrid>
      </section>

      {status && <StatusBanner tone={status.tone}>{status.message}</StatusBanner>}

      <section className="teacher-dashboard__workspace">
        <aside className="teacher-dashboard__class-panel">
          <header>
            <h2>Your classes</h2>
            <p className="muted">Select a class to review students, pacing, and quick actions.</p>
          </header>
          <div className="teacher-dashboard__class-list">
            {classes.length === 0 && !loading && <p className="muted">Create your first class to get started.</p>}
            {classes.map((clazz) => {
              const students = studentsByClass.get(clazz.id) ?? [];
              const meta = parseClassMeta(clazz);
              const isSelected = selectedClassId === clazz.id;
              return (
                <button
                  key={clazz.id}
                  type="button"
                  className={`teacher-dashboard__class-button ${isSelected ? "is-active" : ""}`}
                  onClick={() => setSelectedClassId(clazz.id)}
                >
                  <div>
                    <strong>{clazz.className}</strong>
                    <span>{meta.yearGroupLabel}</span>
                  </div>
                  <div className="teacher-dashboard__class-meta-chip">
                    <span>{students.length} students</span>
                    <span>{meta.cohort}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="teacher-dashboard__class-detail">
          {selectedClass ? (
            <>
              <header className="teacher-dashboard__class-header">
                <div>
                  <span className="teacher-dashboard__eyebrow">Selected class</span>
                  <h2>{selectedClass.className}</h2>
                  {selectedClassMeta && <p className="muted">{selectedClassMeta.yearGroupLabel}</p>}
                </div>
                <div className="teacher-dashboard__class-actions">
                  <button type="button" className="pill" onClick={() => navigate('/curriculum/ib', { state: { classId: selectedClass.id } })}>
                    View IB Curriculum
                  </button>
                  <button type="button" className="pill" onClick={() => openStudentModal(selectedClass, "single")}>
                    Add student
                  </button>
                  <button type="button" className="pill" onClick={() => openStudentModal(selectedClass, "bulk")}>
                    Import CSV
                  </button>
                  <button type="button" className="pill" onClick={handleCopyCredentials}>
                    Copy credentials
                  </button>
                </div>
              </header>

              {classSummaryCards.length > 0 && (
                <ResponsiveGrid variant="autoFit" minColumnWidth={200} className="teacher-dashboard__class-summary">
                  {classSummaryCards.map((card, index) => (
                    <StatCard
                      key={card.key}
                      label={card.label}
                      value={card.value}
                      compact
                      tone={index === 0 ? "brand" : undefined}
                      progress={card.progress}
                      progressLabel={card.progressLabel}
                    />
                  ))}
                </ResponsiveGrid>
              )}

              {isYear7Selected && (
                <StatCard
                  label="Teacher-paced pointer"
                  value={
                    selectedPacingLesson
                      ? selectedPacingLesson.title
                      : "Pointer not set"
                  }
                  description={
                    selectedPacingLesson
                      ? selectedPacingLesson.unitTitle
                      : "Set the pointer to guide the Year 7 teaching sequence."
                  }
                  meta={
                    selectedPacing?.updatedAt
                      ? `Updated ${new Date(selectedPacing.updatedAt).toLocaleString()}`
                      : null
                  }
                  tone="brand"
                  actions={
                    <div className="teacher-dashboard__pacing-actions">
                      <button
                        type="button"
                        className="pill"
                        onClick={() => handleOpenYear7Map(selectedClass.id)}
                      >
                        Open Year 7 map
                      </button>
                      <button
                        type="button"
                        className="pill pill--action"
                        onClick={() => handleStartPacing(selectedClass.id)}
                        disabled={Boolean(selectedPacingInfo?.busy)}
                      >
                        {selectedPacing ? "Restart at lesson 1" : "Start teaching"}
                      </button>
                      <button
                        type="button"
                        className="pill"
                        onClick={() => handleAdvancePacing(selectedClass.id)}
                        disabled={Boolean(selectedPacingInfo?.busy) || !selectedPacing}
                      >
                        Advance lesson
                      </button>
                      <button
                        type="button"
                        className="pill"
                        onClick={() => handleStopPacing(selectedClass.id)}
                        disabled={Boolean(selectedPacingInfo?.busy) || !selectedPacing}
                      >
                        Stop teaching
                      </button>
                    </div>
                  }
                >
                  {selectedPacingInfo?.message && (
                    <p className={`teacher-dashboard__pacing-status teacher-dashboard__pacing-status--${selectedPacingInfo.tone ?? "info"}`}>
                      {selectedPacingInfo.message}
                    </p>
                  )}
                </StatCard>
              )}

              <div className="teacher-dashboard__table-wrapper">
                <table className="teacher-dashboard__table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Username</th>
                      <th>Password</th>
                      <th>Track</th>
                      <th>Stage</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudents.map((student) => {
                      const storedPassword = resolveStoredPassword(passwordLookup, student) ?? student.password ?? "";
                      const isHash = typeof storedPassword === "string" && storedPassword.startsWith("$2");
                      const plainPassword = isHash ? "" : storedPassword;
                      const isVisible = visiblePasswords[student.id];
                      return (
                        <tr key={student.id} onClick={() => handleViewStudentDashboard(student.id)} className="teacher-dashboard__student-row">
                          <td>
                            <span className="teacher-student-name">{student.displayName}</span>
                            <span className="teacher-student-sub">Joined {new Date(student.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td>{student.username || "—"}</td>
                          <td>
                            {plainPassword ? (
                              <button
                                type="button"
                                className="teacher-password"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  togglePassword(student.id);
                                }}
                              >
                                {isVisible ? plainPassword : "••••••"}
                              </button>
                            ) : (
                              <span className="muted">Not available</span>
                            )}
                          </td>
                          <td>{student.curriculumTrack ? student.curriculumTrack.toUpperCase() : "—"}</td>
                          <td>{student.activeStage ? student.activeStage.toUpperCase() : "—"}</td>
                          <td className="teacher-dashboard__table-actions">
                            <button
                              type="button"
                              className="button-outline button-outline--danger"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleArchive(student.id);
                              }}
                            >
                              Archive
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {selectedStudents.length === 0 && (
                      <tr>
                        <td colSpan={6} className="muted">
                          No students yet. Use “Add student” to enrol the first learner.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="teacher-dashboard__empty-detail">
              <h2>Select a class to view its roster</h2>
              <p className="muted">Once you choose a class, you can copy credentials, manage pacing, and monitor progress.</p>
            </div>
          )}
        </div>
      </section>

      <section className="teacher-dashboard__insights">
        <article className="teacher-dashboard__card">
          <h3>Lesson progress snapshot</h3>
          <div className="teacher-dashboard__metrics">
            <div>
              <span>{summativeComplete}</span>
              <small>Summative complete</small>
            </div>
            <div>
              <span>{formativeComplete}</span>
              <small>Formative complete</small>
            </div>
            <div>
              <span>{availableLessons}</span>
              <small>Available lessons</small>
            </div>
            <div>
              <span>{lockedLessons}</span>
              <small>Locked lessons</small>
            </div>
          </div>
        </article>

        <article className="teacher-dashboard__card">
          <h3>Learners needing a nudge</h3>
          <p className="muted">Students with unlocked lessons but no formative completions yet.</p>
          <ul className="teacher-dashboard__list">
            {studentsNeedingAttention.length === 0 && <li className="muted">All caught up — no students flagged.</li>}
            {studentsNeedingAttention.map((student) => (
              <li key={student.id}>
                <div>
                  <strong>{student.displayName}</strong>
                  <span className="muted">{student.available} unlocked · 0 cleared checkpoints</span>
                </div>
                <span className="teacher-dashboard__tag">Follow up</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="teacher-dashboard__card">
          <h3>Recent lesson updates</h3>
          <p className="muted">Latest activity across your classes (most recent first).</p>
          <ul className="teacher-dashboard__list teacher-dashboard__list--compact">
            {recentProgress.length === 0 && <li className="muted">No lesson activity recorded yet.</li>}
            {recentProgress.map((record) => (
              <li key={record.id}>
                <div>
                  <strong>{record.lesson}</strong>
                  <span className="muted">{record.studentName}</span>
                </div>
                <div className="teacher-dashboard__list-meta">
                  <span className={`teacher-dashboard__tag teacher-dashboard__tag--${(record.status || "locked").toLowerCase()}`}>
                    {record.status ?? "locked"}
                  </span>
                  <span className="muted">
                    {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "recently"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {classModalOpen && (
        <Modal
          isOpen={classModalOpen}
          onClose={() => setClassModalOpen(false)}
          title="Create class"
          size="md"
        >
          <form onSubmit={submitClass} className="teacher-modal__content">
            <label>
              <span>Stage</span>
              <select
                value={classForm.stageId}
                onChange={(event) => handleClassStageChange("stageId", event.target.value)}
                required
              >
                {STAGE_CONFIG.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Cohort (two digits)</span>
              <input
                value={classForm.cohort}
                onChange={(event) => handleClassStageChange("cohort", event.target.value)}
                placeholder="32"
                required
              />
            </label>
            <label>
              <span>Group</span>
              <select
                value={classForm.group}
                onChange={(event) => handleClassStageChange("group", event.target.value)}
                required
              >
                {getStageConfig(classForm.stageId).groups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Description (optional)</span>
              <input
                value={classForm.description}
                onChange={(event) => setClassForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Notes for this class"
              />
            </label>
            <div className="teacher-modal__preview">
              <span>Generated code</span>
              <strong>{generateClassCode(classForm.stageId, classForm.cohort, classForm.group)}</strong>
            </div>
            <footer>
              <button type="button" onClick={() => setClassModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="pill pill--action">
                Create class
              </button>
            </footer>
          </form>
        </Modal>
      )}

      {studentModal && (
        <Modal
          isOpen={!!studentModal}
          onClose={() => setStudentModal(null)}
          title={
            studentModal.mode === "bulk"
              ? `Import students · ${studentModal.classItem.className}`
              : `Add student · ${studentModal.classItem.className}`
          }
          size="md"
        >
          {studentModal.mode === "single" ? (
            <form onSubmit={submitStudent} className="teacher-modal__content">
              <label>
                <span>First name</span>
                <input
                  value={studentForm.firstName}
                  onChange={(event) => handleStudentFormChange("firstName", event.target.value)}
                  required
                />
              </label>
              <label>
                <span>Surname</span>
                <input
                  value={studentForm.lastName}
                  onChange={(event) => handleStudentFormChange("lastName", event.target.value)}
                  required
                />
              </label>
              <label>
                <span>Username</span>
                <input
                  value={studentForm.username}
                  onChange={(event) => handleStudentFormChange("username", event.target.value)}
                  placeholder="Enter unique username"
                  required
                />
              </label>
              <label>
                <span>Generated password</span>
                <input
                  value={studentForm.password}
                  onChange={(event) => handleStudentFormChange("password", event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="teacher-modal__ghost"
                  onClick={() => setStudentForm((prev) => ({ ...prev, password: generatePassword() }))}
                >
                  Regenerate
                </button>
              </label>
              <footer>
                <button type="button" onClick={() => setStudentModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="pill pill--action">
                  Add student
                </button>
              </footer>
            </form>
          ) : (
            <form onSubmit={submitBulkStudents} className="teacher-modal__content">
              <p className="muted">
                Upload a CSV with the columns <code>firstName</code>, <code>lastName</code>, and optional
                <code>username</code>. Passwords are auto-generated for each row.
              </p>
              <button type="button" className="teacher-modal__ghost" onClick={downloadTemplate}>
                Download blank template
              </button>
              <label>
                <span>CSV file</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(event) => setBulkCsv(event.target.files?.[0] ?? null)}
                  required
                />
              </label>
              {bulkStatus && <p className={`status status--${bulkStatus.tone}`}>{bulkStatus.message}</p>}
              <footer>
                <button type="button" onClick={() => setStudentModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="pill pill--action">
                  Import students
                </button>
              </footer>
            </form>
          )}
        </Modal>
      )}
    </ContentContainer>
  );
}

export default TeacherDashboardPage;
