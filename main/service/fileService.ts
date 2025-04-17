import fs from 'fs';

interface FileServiceResponse {
  message: string;
  data: any;
}

type FileExt = 'json' | 'sql' | 'txt';

/**
 * @description make directory
 * @param path
 * @return {void}
 */
export function makeDirectory(path: string): void {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
}


/**
 * @description Write File
 * @param path
 * @param fileData
 * @param fileName
 * @param fileExt
 * @returns {FileServiceResponse} response
 */
export function fileWrite(
  path: string,
  fileData: any,
  fileName: string,
  fileExt: FileExt,
): FileServiceResponse {
  let data;
  switch (fileExt) {
    case 'json':
      data = JSON.stringify(fileData, null, 2);
      break;
    case 'sql':
      data = fileData;
      break;
    case 'txt':
      data = fileData;
      break;
    default:
      throw new Error('Invalid file type');
  }
  try {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    const filePath = `${path}/${fileName}.${fileExt}`;
    fs.writeFileSync(filePath, data);
  } catch (err) {
    throw new Error(err);
  }
  return {
    message: 'success',
    data: null,
  };
}

/**
 * @description Read File
 * @param path
 * @returns {FileServiceResponse} response
 */
export function fileRead(path: string): FileServiceResponse {
  try {
    const data = fs.readFileSync(path, 'utf8');
    return { message: 'success', data };
  } catch (error) {
    throw new Error(error);
  }
}

/**
 * @description Delete File
 * @param path
 * @returns {FileServiceResponse} response
 */
export function fileDelete(path: string): FileServiceResponse {
  try {
    fs.unlinkSync(path);
    return { message: `delete file: ${path}`, data: null };
  } catch (error) {
    throw new Error(error);
  }
}
