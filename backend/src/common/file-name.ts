// Removes anything that is not safe in a file name or a download header:
//   "7-Day Gorilla Trek!" -> "7-Day Gorilla Trek"
export const safeFileName = (name: string) =>
  name.replace(/[^\w .-]/g, '').trim() || 'Quotation';
