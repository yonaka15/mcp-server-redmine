import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import {
  OutputDetailLevel,
  BriefFieldOptions,
  FormatOptions,
  DEFAULT_FORMAT_OPTIONS,
  parseFormatOptions,
  createDefaultBriefFields
} from '../format-options.js';

describe('Format Options', () => {
  describe('OutputDetailLevel', () => {
    it('should have correct enum values', () => {
      expect(OutputDetailLevel.BRIEF).toBe('brief');
      expect(OutputDetailLevel.FULL).toBe('full');
    });
  });

  describe('DEFAULT_FORMAT_OPTIONS', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_FORMAT_OPTIONS).toEqual({
        detail_level: OutputDetailLevel.FULL,
        max_description_length: 200,
        max_journal_entries: 3
      });
    });
  });

  describe('createDefaultBriefFields', () => {
    it('should return correct default brief field options', () => {
      const defaultFields = createDefaultBriefFields();
      
      expect(defaultFields).toEqual({
        assignee: true,
        dates: true,
        description: "truncated",
        custom_fields: [],
        category: false,
        version: false,
        time_tracking: false,
        journals: false,
        relations: false,
        attachments: false
      });
    });

    it('should return a new object each time', () => {
      const fields1 = createDefaultBriefFields();
      const fields2 = createDefaultBriefFields();
      
      expect(fields1).not.toBe(fields2);
      expect(fields1).toEqual(fields2);
    });
  });

  describe('parseFormatOptions', () => {
    describe('detail_level parsing', () => {
      it('should parse brief detail level', () => {
        const args = { detail_level: 'brief' };
        const options = parseFormatOptions(args);
        
        expect(options.detail_level).toBe(OutputDetailLevel.BRIEF);
      });

      it('should parse full detail level', () => {
        const args = { detail_level: 'full' };
        const options = parseFormatOptions(args);
        
        expect(options.detail_level).toBe(OutputDetailLevel.FULL);
      });

      it('should handle case insensitive detail level', () => {
        const args = { detail_level: 'BRIEF' };
        const options = parseFormatOptions(args);
        
        expect(options.detail_level).toBe(OutputDetailLevel.BRIEF);
      });

      it('should default to FULL for invalid detail level', () => {
        const args = { detail_level: 'invalid' };
        const options = parseFormatOptions(args);
        
        expect(options.detail_level).toBe(OutputDetailLevel.FULL);
      });

      it('should default to FULL when detail_level is not a string', () => {
        const args = { detail_level: 123 };
        const options = parseFormatOptions(args);
        
        expect(options.detail_level).toBe(OutputDetailLevel.FULL);
      });

      it('should default to FULL when detail_level is missing', () => {
        const args = {};
        const options = parseFormatOptions(args);
        
        expect(options.detail_level).toBe(OutputDetailLevel.FULL);
      });
    });

    describe('brief_fields parsing', () => {
      it('should parse valid JSON brief_fields', () => {
        const briefFieldsJson = '{"assignee":true,"description":true,"custom_fields":false}';
        const args = { brief_fields: briefFieldsJson };
        const options = parseFormatOptions(args);
        
        expect(options.brief_fields).toEqual({
          assignee: true,
          description: true,
          custom_fields: false
        });
      });

      it('should handle empty JSON object', () => {
        const args = { brief_fields: '{}' };
        const options = parseFormatOptions(args);
        
        expect(options.brief_fields).toEqual({});
      });

      it('should ignore invalid JSON and not set brief_fields', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const args = { brief_fields: 'invalid json' };
        const options = parseFormatOptions(args);
        
        expect(options.brief_fields).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalledWith('Invalid brief_fields JSON:', expect.any(Error));
        
        consoleSpy.mockRestore();
      });

      it('should ignore non-string brief_fields', () => {
        const args = { brief_fields: { assignee: true } };
        const options = parseFormatOptions(args);
        
        expect(options.brief_fields).toBeUndefined();
      });

      it('should not set brief_fields when missing', () => {
        const args = {};
        const options = parseFormatOptions(args);
        
        expect(options.brief_fields).toBeUndefined();
      });
    });

    describe('max_description_length parsing', () => {
      it('should parse valid max_description_length', () => {
        const args = { max_description_length: 150 };
        const options = parseFormatOptions(args);
        
        expect(options.max_description_length).toBe(150);
      });

      it('should enforce minimum value of 50', () => {
        const args = { max_description_length: 25 };
        const options = parseFormatOptions(args);
        
        expect(options.max_description_length).toBe(50);
      });

      it('should enforce maximum value of 1000', () => {
        const args = { max_description_length: 1500 };
        const options = parseFormatOptions(args);
        
        expect(options.max_description_length).toBe(1000);
      });

      it('should use default when not a number', () => {
        const args = { max_description_length: 'invalid' };
        const options = parseFormatOptions(args);
        
        expect(options.max_description_length).toBe(200);
      });

      it('should use default when missing', () => {
        const args = {};
        const options = parseFormatOptions(args);
        
        expect(options.max_description_length).toBe(200);
      });
    });

    describe('max_journal_entries parsing', () => {
      it('should parse valid max_journal_entries', () => {
        const args = { max_journal_entries: 5 };
        const options = parseFormatOptions(args);
        
        expect(options.max_journal_entries).toBe(5);
      });

      it('should enforce minimum value of 0', () => {
        const args = { max_journal_entries: -1 };
        const options = parseFormatOptions(args);
        
        expect(options.max_journal_entries).toBe(0);
      });

      it('should enforce maximum value of 10', () => {
        const args = { max_journal_entries: 15 };
        const options = parseFormatOptions(args);
        
        expect(options.max_journal_entries).toBe(10);
      });

      it('should use default when not a number', () => {
        const args = { max_journal_entries: 'invalid' };
        const options = parseFormatOptions(args);
        
        expect(options.max_journal_entries).toBe(3);
      });

      it('should use default when missing', () => {
        const args = {};
        const options = parseFormatOptions(args);
        
        expect(options.max_journal_entries).toBe(3);
      });
    });

    describe('combined parsing', () => {
      it('should parse all options together', () => {
        const args = {
          detail_level: 'brief',
          brief_fields: '{"assignee":true,"dates":false}',
          max_description_length: 100,
          max_journal_entries: 2
        };
        const options = parseFormatOptions(args);
        
        expect(options).toEqual({
          detail_level: OutputDetailLevel.BRIEF,
          brief_fields: { assignee: true, dates: false },
          max_description_length: 100,
          max_journal_entries: 2
        });
      });

      it('should preserve defaults for missing options', () => {
        const args = { detail_level: 'brief' };
        const options = parseFormatOptions(args);
        
        expect(options.detail_level).toBe(OutputDetailLevel.BRIEF);
        expect(options.max_description_length).toBe(200);
        expect(options.max_journal_entries).toBe(3);
        expect(options.brief_fields).toBeUndefined();
      });
    });
  });
});
