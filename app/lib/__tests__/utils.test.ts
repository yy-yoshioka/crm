import { debounce, formatDate, cn } from '../utils';

jest.useFakeTimers();

describe('Utils', () => {
  describe('debounce function', () => {
    it('should call the function after the specified delay', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 500);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(499);
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should only call the function once if called multiple times within delay', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 500);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call the function with the latest arguments', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 500);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      jest.advanceTimersByTime(500);
      expect(mockFn).toHaveBeenCalledWith('third');
    });
  });

  describe('formatDate function', () => {
    it('should format a date string correctly', () => {
      const mockDate = new Date('2023-05-15T12:30:45Z');
      const formattedDate = formatDate(mockDate.toISOString());

      // The exact expected format may vary based on implementation
      expect(formattedDate).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(formattedDate).toContain('2023');
    });

    it('should return "N/A" for invalid date input', () => {
      const formattedDate = formatDate('invalid-date');
      expect(formattedDate).toBe('N/A');
    });
  });

  describe('cn function (class name utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('base-class', 'another-class');
      expect(result).toBe('base-class another-class');
    });

    it('should filter out falsy values', () => {
      const result = cn(
        'base-class',
        false && 'conditional-class',
        '' as string,
        null as unknown as string,
        undefined as unknown as string
      );
      expect(result).toBe('base-class');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn(
        'base-class',
        isActive && 'active-class',
        !isActive && 'inactive-class'
      );
      expect(result).toBe('base-class active-class');
    });
  });
});
