/* Reserved client-side contracts for future teaching/exam DICOM libraries.
   No endpoint is configured and this file sends no data. */
window.CheXLibraryAdapter = {
  teaching: { listCases: async () => [], getDicomFile: async () => null },
  exams: { listExams: async () => [], submitAttempt: async () => ({ queued: false }) }
};
