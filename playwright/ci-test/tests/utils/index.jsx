export const TIMEOUT = 2000;
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export function parseMultipartFormData(body) {
  const result = {};
  const parts = body.split('Content-Disposition: form-data;');

  for (const part of parts) {
    const nameMatch = part.match(/name="([^"]+)"/);
    if (!nameMatch) continue;

    const name = nameMatch[1];
    const value = part.split('\r\n\r\n')[1]?.split('\r\n')[0];

    if (value !== undefined) {
      result[name] = value;
    }
  }
  return result;
}