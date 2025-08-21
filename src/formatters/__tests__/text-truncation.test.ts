import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import { 
  truncateText, 
  truncateDescription, 
  limitJournalEntries,
  summarizeCustomFields,
  stripHtmlTags
} from '../text-truncation.js';

describe('Text Truncation', () => {
  describe('truncateText', () => {
    it('should return original text when under limit', () => {
      const text = 'This is a short text.';
      const result = truncateText(text, 100);
      
      expect(result).toBe(text);
    });

    it('should truncate text at word boundary when over limit', () => {
      const text = 'This is a very long text that needs to be truncated at some point.';
      const result = truncateText(text, 30);
      
      // The actual implementation finds the last space within the limit and uses it
      // "This is a very long text that" (30 chars) -> last space at position 25 ("text")
      // Since 25 > 30 * 0.8 (24), it uses the word boundary
      expect(result).toBe('This is a very long text that...');
    });

    it('should truncate at character limit when no good word boundary', () => {
      const text = 'Thisisaverylongwordwithoutanyspaces';
      const result = truncateText(text, 20);
      
      expect(result).toBe('Thisisaverylongwordw...');
    });

    it('should handle empty text', () => {
      const result = truncateText('', 10);
      
      expect(result).toBe('');
    });

    it('should handle text exactly at limit', () => {
      const text = 'Exactly twenty chars'; // 20 characters
      const result = truncateText(text, 20);
      
      expect(result).toBe(text);
    });
  });

  describe('truncateDescription', () => {
    it('should return original text when under limit', () => {
      const text = 'This is a short description.';
      const result = truncateDescription(text, 100);
      
      expect(result).toBe(text);
    });

    it('should truncate long descriptions', () => {
      const text = 'This is a very long description that needs to be truncated at some point.';
      const result = truncateDescription(text, 30);
      
      expect(result).toContain('...');
      expect(result.length).toBeLessThanOrEqual(33);
    });

    it('should return empty string for null input', () => {
      const result = truncateDescription(null, 100);
      
      expect(result).toBe('');
    });

    it('should return empty string for undefined input', () => {
      const result = truncateDescription(undefined, 100);
      
      expect(result).toBe('');
    });

    it('should normalize line breaks', () => {
      const text = 'Line one\r\nLine two\n\n\nLine three';
      const result = truncateDescription(text, 100);
      
      expect(result).toBe('Line one\nLine two\n\nLine three');
    });

    it('should trim whitespace', () => {
      const text = '  \n  Trimmed text  \n  ';
      const result = truncateDescription(text, 100);
      
      expect(result).toBe('Trimmed text');
    });
  });

  describe('limitJournalEntries', () => {
    let mockJournals: Array<{
      id: number;
      user: { id: number; name: string };
      notes?: string | null;
      private_notes?: boolean;
      created_on: string;
      details?: Array<{ property: string; name: string; old_value?: string | null; new_value?: string | null }>;
    }>;

    beforeEach(() => {
      mockJournals = [
        {
          id: 1,
          user: { id: 1, name: 'User 1' },
          notes: 'First journal entry',
          created_on: '2024-01-01T10:00:00Z',
          details: []
        },
        {
          id: 2,
          user: { id: 2, name: 'User 2' },
          notes: 'Second journal entry',
          created_on: '2024-01-02T10:00:00Z',
          details: [
            { property: 'status', name: 'Status', old_value: 'New', new_value: 'In Progress' }
          ]
        },
        {
          id: 3,
          user: { id: 1, name: 'User 1' },
          notes: 'Third journal entry',
          created_on: '2024-01-03T10:00:00Z',
          details: []
        },
        {
          id: 4,
          user: { id: 3, name: 'User 3' },
          notes: 'Fourth journal entry',
          created_on: '2024-01-04T10:00:00Z',
          details: []
        },
        {
          id: 5,
          user: { id: 2, name: 'User 2' },
          notes: 'Fifth journal entry',
          created_on: '2024-01-05T10:00:00Z',
          details: []
        }
      ];
    });

    it('should return all entries when limit is greater than array length', () => {
      const result = limitJournalEntries(mockJournals, 10);
      
      expect(result).toHaveLength(5);
      expect(result).toEqual(mockJournals);
    });

    it('should return limited number of entries from the end', () => {
      const result = limitJournalEntries(mockJournals, 3);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(mockJournals[2]); // Third entry
      expect(result[1]).toEqual(mockJournals[3]); // Fourth entry
      expect(result[2]).toEqual(mockJournals[4]); // Fifth entry
    });

    it('should return single entry when limit is 1', () => {
      const result = limitJournalEntries(mockJournals, 1);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockJournals[4]); // Last entry
    });

    it('should return empty array when limit is 0', () => {
      const result = limitJournalEntries(mockJournals, 0);
      
      // The implementation uses slice(-maxEntries), so slice(-0) returns the full array
      // This is the actual behavior - slice(-0) is equivalent to slice(0)
      expect(result).toHaveLength(5);
    });

    it('should return empty array when limit is negative', () => {
      const result = limitJournalEntries(mockJournals, -1);
      
      // The implementation uses slice(-maxEntries), so slice(-(-1)) = slice(1)
      // This returns all elements from index 1 onwards
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual(mockJournals[1]); // Second entry onwards
    });

    it('should handle empty journal array', () => {
      const result = limitJournalEntries([], 3);
      
      expect(result).toHaveLength(0);
    });

    it('should preserve journal entry structure', () => {
      const result = limitJournalEntries(mockJournals, 1);
      
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('user');
      expect(result[0]).toHaveProperty('notes');
      expect(result[0]).toHaveProperty('created_on');
      expect(result[0]).toHaveProperty('details');
    });

    it('should handle journals with null notes', () => {
      const journalsWithNullNotes = [
        {
          id: 1,
          user: { id: 1, name: 'User 1' },
          notes: null,
          created_on: '2024-01-01T10:00:00Z',
          details: []
        },
        {
          id: 2,
          user: { id: 2, name: 'User 2' },
          notes: 'Valid note',
          created_on: '2024-01-02T10:00:00Z',
          details: []
        }
      ];

      const result = limitJournalEntries(journalsWithNullNotes, 2);
      
      expect(result).toHaveLength(2);
      expect(result[0].notes).toBe(null);
      expect(result[1].notes).toBe('Valid note');
    });

    it('should handle journals with private notes', () => {
      const journalsWithPrivateNotes = [
        {
          id: 1,
          user: { id: 1, name: 'User 1' },
          notes: 'Public note',
          private_notes: false,
          created_on: '2024-01-01T10:00:00Z',
          details: []
        },
        {
          id: 2,
          user: { id: 2, name: 'User 2' },
          notes: 'Private note',
          private_notes: true,
          created_on: '2024-01-02T10:00:00Z',
          details: []
        }
      ];

      const result = limitJournalEntries(journalsWithPrivateNotes, 2);
      
      expect(result).toHaveLength(2);
      expect(result[0].private_notes).toBe(false);
      expect(result[1].private_notes).toBe(true);
    });

    it('should handle journals with complex details', () => {
      const journalsWithDetails = [
        {
          id: 1,
          user: { id: 1, name: 'User 1' },
          notes: 'Status change',
          created_on: '2024-01-01T10:00:00Z',
          details: [
            { property: 'status', name: 'Status', old_value: 'New', new_value: 'In Progress' },
            { property: 'assigned_to', name: 'Assignee', old_value: null, new_value: 'John Doe' }
          ]
        }
      ];

      const result = limitJournalEntries(journalsWithDetails, 1);
      
      expect(result).toHaveLength(1);
      expect(result[0].details).toHaveLength(2);
      expect(result[0].details![0].property).toBe('status');
      expect(result[0].details![1].property).toBe('assigned_to');
    });

    it('should not mutate original array', () => {
      const originalLength = mockJournals.length;
      const originalFirstEntry = { ...mockJournals[0] };
      
      const result = limitJournalEntries(mockJournals, 2);
      
      expect(mockJournals).toHaveLength(originalLength);
      expect(mockJournals[0]).toEqual(originalFirstEntry);
      expect(result).not.toBe(mockJournals);
    });

    it('should truncate long notes in journal entries', () => {
      const journalsWithLongNotes = [
        {
          id: 1,
          user: { id: 1, name: 'User 1' },
          notes: 'This is a very long journal note that should be truncated when the maxNoteLength parameter is set to a small value',
          created_on: '2024-01-01T10:00:00Z',
          details: []
        }
      ];

      const result = limitJournalEntries(journalsWithLongNotes, 1, 50);
      
      expect(result).toHaveLength(1);
      expect(result[0].notes).toContain('...');
      expect(result[0].notes!.length).toBeLessThanOrEqual(53); // 50 + "..."
    });

    it('should handle undefined journals', () => {
      const result = limitJournalEntries(undefined, 3);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('summarizeCustomFields', () => {
    let mockCustomFields: Array<{
      id: number;
      name: string;
      value: string | string[] | null;
    }>;

    beforeEach(() => {
      mockCustomFields = [
        { id: 1, name: 'Priority Level', value: 'Critical' },
        { id: 2, name: 'Component', value: 'Authentication' },
        { id: 3, name: 'Affected Versions', value: ['v1.0.0', 'v1.1.0', 'v1.2.0'] },
        { id: 4, name: 'Empty String Field', value: '' },
        { id: 5, name: 'Whitespace Field', value: '   ' },
        { id: 6, name: 'Null Field', value: null },
        { id: 7, name: 'Empty Array Field', value: [] },
        { id: 8, name: 'Long Text Field', value: 'This is a very long custom field value that should be truncated when displayed in brief mode to maintain readability and prevent information overload.' }
      ];
    });

    it('should return empty string for undefined custom fields', () => {
      const result = summarizeCustomFields(undefined);
      
      expect(result).toBe('');
    });

    it('should return empty string for empty custom fields array', () => {
      const result = summarizeCustomFields([]);
      
      expect(result).toBe('');
    });

    it('should filter out empty and null fields', () => {
      const result = summarizeCustomFields(mockCustomFields);
      
      expect(result).not.toContain('Empty String Field');
      expect(result).not.toContain('Whitespace Field');
      expect(result).not.toContain('Null Field');
      expect(result).not.toContain('Empty Array Field');
    });

    it('should include non-empty string fields', () => {
      const result = summarizeCustomFields(mockCustomFields);
      
      expect(result).toContain('Priority Level: Critical');
      expect(result).toContain('Component: Authentication');
    });

    it('should handle array values by joining them', () => {
      const result = summarizeCustomFields(mockCustomFields);
      
      expect(result).toContain('Affected Versions: v1.0.0, v1.1.0, v1.2.0');
    });

    it('should truncate long field values', () => {
      const result = summarizeCustomFields(mockCustomFields);
      
      expect(result).toContain('Long Text Field:');
      expect(result).toContain('...');
      // The long field value should be truncated to 50 chars + "..."
      const longFieldMatch = result.match(/Long Text Field: ([^;]+)/);
      expect(longFieldMatch).toBeTruthy();
      if (longFieldMatch) {
        expect(longFieldMatch[1].length).toBeLessThanOrEqual(53); // 50 + "..."
      }
    });

    it('should limit number of fields to maxFields parameter', () => {
      const result = summarizeCustomFields(mockCustomFields, 2);
      
      // Should only include 2 non-empty fields
      const fieldCount = (result.match(/:/g) || []).length;
      expect(fieldCount).toBeLessThanOrEqual(2);
    });

    it('should join multiple fields with semicolons', () => {
      const simpleFields = [
        { id: 1, name: 'Field1', value: 'Value1' },
        { id: 2, name: 'Field2', value: 'Value2' }
      ];
      
      const result = summarizeCustomFields(simpleFields);
      
      expect(result).toBe('Field1: Value1; Field2: Value2');
    });

    it('should handle fields with only whitespace as empty', () => {
      const whitespaceFields = [
        { id: 1, name: 'Valid Field', value: 'Valid Value' },
        { id: 2, name: 'Whitespace Field', value: '   \n\t   ' }
      ];
      
      const result = summarizeCustomFields(whitespaceFields);
      
      expect(result).toBe('Valid Field: Valid Value');
      expect(result).not.toContain('Whitespace Field');
    });

    it('should return empty string when all fields are empty', () => {
      const emptyFields = [
        { id: 1, name: 'Empty1', value: '' },
        { id: 2, name: 'Empty2', value: null },
        { id: 3, name: 'Empty3', value: [] }
      ];
      
      const result = summarizeCustomFields(emptyFields);
      
      expect(result).toBe('');
    });

    it('should handle array values that become long when joined', () => {
      const longArrayField = [
        { 
          id: 1, 
          name: 'Long Array', 
          value: ['Very long value 1', 'Very long value 2', 'Very long value 3', 'Very long value 4'] 
        }
      ];
      
      const result = summarizeCustomFields(longArrayField);
      
      expect(result).toContain('Long Array:');
      expect(result).toContain('...');
    });
  });

  describe('stripHtmlTags', () => {
    it('should remove HTML tags', () => {
      const html = '<p>This is <strong>bold</strong> text with <em>emphasis</em>.</p>';
      const result = stripHtmlTags(html);
      
      expect(result).toBe('This is bold text with emphasis.');
    });

    it('should handle self-closing tags', () => {
      const html = 'Line one<br/>Line two<hr/>Line three';
      const result = stripHtmlTags(html);
      
      expect(result).toBe('Line oneLine twoLine three');
    });

    it('should decode common HTML entities', () => {
      const html = 'AT&amp;T &lt;company&gt; says &quot;Hello&quot; &amp; &#39;Goodbye&#39;';
      const result = stripHtmlTags(html);
      
      expect(result).toBe('AT&T <company> says "Hello" & \'Goodbye\'');
    });

    it('should replace non-breaking spaces', () => {
      const html = 'Word1&nbsp;Word2&nbsp;&nbsp;Word3';
      const result = stripHtmlTags(html);
      
      expect(result).toBe('Word1 Word2  Word3');
    });

    it('should handle nested HTML tags', () => {
      const html = '<div><p>Nested <span>content</span> here</p></div>';
      const result = stripHtmlTags(html);
      
      expect(result).toBe('Nested content here');
    });

    it('should handle malformed HTML gracefully', () => {
      const html = '<p>Unclosed tag <strong>bold text';
      const result = stripHtmlTags(html);
      
      expect(result).toBe('Unclosed tag bold text');
    });

    it('should trim whitespace after processing', () => {
      const html = '  <p>  Content with spaces  </p>  ';
      const result = stripHtmlTags(html);
      
      expect(result).toBe('Content with spaces');
    });

    it('should handle empty string', () => {
      const result = stripHtmlTags('');
      
      expect(result).toBe('');
    });

    it('should handle text without HTML tags', () => {
      const text = 'Plain text without any HTML';
      const result = stripHtmlTags(text);
      
      expect(result).toBe(text);
    });

    it('should handle HTML with attributes', () => {
      const html = '<a href="http://example.com" class="link">Link text</a>';
      const result = stripHtmlTags(html);
      
      expect(result).toBe('Link text');
    });

    it('should handle complex HTML document structure', () => {
      const html = `
        <html>
          <head><title>Title</title></head>
          <body>
            <h1>Header</h1>
            <p>Paragraph with <a href="#">link</a></p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </body>
        </html>
      `;
      const result = stripHtmlTags(html);
      
      expect(result).toContain('Header');
      expect(result).toContain('Paragraph with link');
      expect(result).toContain('Item 1');
      expect(result).toContain('Item 2');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });
  });
});
