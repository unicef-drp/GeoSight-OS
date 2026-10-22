"""Validate H3 cell id inputs"""

import h3


class H3Error(h3.H3ValueError):
    """h3 package uses H3ValueError instead of H3Error"""


def normalize_cell(value) -> str:
    """Return stripped version of id:
    Strings only, strip spaces, lowercase.
    Raise H3Error if the result is empty or not valid h3"""
    if not isinstance(value, str):
        raise H3Error('H3 id not a string')

    cell = value.strip().lower()
    if not cell:
        raise H3Error('input is empty')
    if not h3.is_valid_cell(cell):
        raise H3Error('Invalid H3 id')
    return cell


def validate_column(values):
    """Validate data rows in a column, 
    counting every bad row"""
    valid_ids = []
    errors = []
    for row, value in enumerate(values, start=2):
        """header does not count"""
        try:
            valid_ids.append(normalize_cell(value))
        except H3Error as error:
            errors.append({
                'row': row,
                'value': value,
                'message': str(error),
            })
    return valid_ids, errors


def resolutions_present(cells) -> list[int]:
    """Return sorted distinct resolutions"""
    return sorted({h3.get_resolution(normalize_cell(cell)) for cell in cells})
