import Papa from "papaparse";

export function parseCSV(csvSource: String | File, configExtra = {}) {
  return new Promise((resolve, reject) => {
    const config = {
      header: true,
      skipEmptyLines: true,
      complete: (result: any) => resolve(result.data),
      error: (err: Error) => reject(err),
      ...configExtra,
    };

    // If is a file (input)
    if (csvSource instanceof File) {
      Papa.parse(csvSource, config);
    }
    // If is a URL (string)
    else if (typeof csvSource === "string") {
      Papa.parse(csvSource, {
        ...config,
        download: true,
      });
    } else {
      reject(new Error("csvSource must be a File or a URL (string)."));
    }
  });
}
