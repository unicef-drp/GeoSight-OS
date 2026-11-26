/**
 * Return the number with human readable format.
 */
export function formatNumber(
  number: number | null | undefined,
  decimals: number = 2,
  autoUnit: boolean = false,
  keepZeros: boolean = false,
): string {
  if ([null, undefined].includes(number)) {
    return "";
  } else if (isNaN(number)) {
    return number.toString();
  } else {
    let numFloat = parseFloat(String(number));
    if (isNaN(numFloat) || typeof numFloat !== "number") {
      return number.toString();
    }

    // Create auto unit
    let unit = "";
    if (autoUnit) {
      const absNum = Math.abs(numFloat);
      if (absNum >= 1000) {
        const units = ["", "K", "M", "B", "T"];
        let unitIndex = 0;
        let n: number = numFloat;

        while (Math.abs(n) >= 1000 && unitIndex < units.length - 1) {
          n /= 1000;
          unitIndex++;
          unit = units[unitIndex];
        }

        numFloat = n;
      }
    }

    const text = numFloat.toFixed(decimals);
    let num = text.split(".")[0];
    let decimal = text.split(".")[1];
    let string = num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (decimal && keepZeros) {
      string += "." + decimal;
    } else if (decimal && parseInt(decimal)) {
      string += "." + decimal.replace(/[0]+$/, "");
    }
    return string + unit;
  }
}

/** Number format of a widget (its aggregation settings). */
export interface WidgetNumberFormat {
  useDecimalPlace?: boolean;
  decimalPlace?: number;
  useAutoUnits?: boolean;
}

/**
 * Format a value with the widget's number format.
 * Decimal places on: exactly that many digits (44.00). Off: up to
 * `fallbackDecimals`, without trailing zeros.
 */
export function formatWidgetNumber(
  value: number | null | undefined,
  format: WidgetNumberFormat | null | undefined,
  fallbackDecimals: number = 0,
): string {
  return format?.useDecimalPlace
    ? formatNumber(value, format.decimalPlace || 0, format.useAutoUnits, true)
    : formatNumber(value, fallbackDecimals, format?.useAutoUnits);
}
