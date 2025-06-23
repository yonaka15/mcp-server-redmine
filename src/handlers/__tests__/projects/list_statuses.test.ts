import { RedmineClient } from '../../../lib/client/index.js';
import { createProjectsHandlers } from '../../projects.js';
import { HandlerContext, ToolResponse, ValidationError } from '../../types.js';
import { RedmineIssue } from '../../../lib/types/issues/types.js';

// Mock the entire RedmineClient
jest.mock('../../../lib/client/index.js');

const mockRedmineClient = RedmineClient as jest.MockedClass<typeof RedmineClient>;

describe('list_project_statuses', () => {
  let projectsHandlers: ReturnType<typeof createProjectsHandlers>;
  let mockHandlerContext: HandlerContext;
  const mockFormatAllowedStatusesImplementation = jest.fn(
    (statuses: NonNullable<RedmineIssue['allowed_statuses']>) =>
      `MockedStatusesOutput: ${JSON.stringify(statuses)}`
  );

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock RedmineClient instance methods
    mockRedmineClient.prototype.getIssues = jest.fn();
    mockRedmineClient.prototype.getIssue = jest.fn();

    mockHandlerContext = {
      client: new RedmineClient({ apiKey: 'test-key', host: 'http://localhost' }),
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      },
    };

    projectsHandlers = createProjectsHandlers(
      mockHandlerContext,
      mockFormatAllowedStatusesImplementation
    );
  });

  // --- Normal Cases ---
  it('should return formatted allowed statuses for a valid project and tracker ID', async () => {
    const mockArgs = { project_id: 1, tracker_id: 2 };
    const mockRepresentativeIssue = { id: 100 } as RedmineIssue;
    const mockAllowedStatuses = [
      { id: 1, name: 'New' },
      { id: 2, name: 'In Progress' },
    ];
    const mockDetailedIssue = {
      ...mockRepresentativeIssue,
      allowed_statuses: mockAllowedStatuses,
    } as RedmineIssue;

    (mockRedmineClient.prototype.getIssues as jest.Mock).mockResolvedValueOnce({
      issues: [mockRepresentativeIssue],
      total_count: 1,
      offset: 0,
      limit: 1,
    });
    (mockRedmineClient.prototype.getIssue as jest.Mock).mockResolvedValueOnce({
      issue: mockDetailedIssue,
    });

    const result = await projectsHandlers.list_project_statuses(mockArgs);

    expect(mockRedmineClient.prototype.getIssues).toHaveBeenCalledWith({
      project_id: 1,
      tracker_id: 2,
      limit: 1,
      status_id: '*'
    });
    expect(mockRedmineClient.prototype.getIssue).toHaveBeenCalledWith(100, { include: 'allowed_statuses' });
    expect(mockFormatAllowedStatusesImplementation).toHaveBeenCalledWith(mockAllowedStatuses);
    expect(result).toEqual<ToolResponse>({
      content: [{ type: 'text', text: `MockedStatusesOutput: ${JSON.stringify(mockAllowedStatuses)}` }],
      isError: false,
    });
  });

  // --- Semi-Normal Cases ---
  it('should return a message if no issues are found for the project and tracker', async () => {
    const mockArgs = { project_id: 1, tracker_id: 3 };
    (mockRedmineClient.prototype.getIssues as jest.Mock).mockResolvedValueOnce({
      issues: [],
      total_count: 0,
      offset: 0,
      limit: 1,
    });

    const result = await projectsHandlers.list_project_statuses(mockArgs);

    expect(mockRedmineClient.prototype.getIssues).toHaveBeenCalledWith({
      project_id: 1,
      tracker_id: 3,
      limit: 1,
      status_id: '*'
    });
    expect(mockRedmineClient.prototype.getIssue).not.toHaveBeenCalled();
    expect(result).toEqual<ToolResponse>({
      content: [{ type: 'text', text: 'No issues found for project_id 1 and tracker_id 3. Cannot determine allowed statuses.' }],
      isError: false,
    });
  });

  it('should return a message if issue is found but allowed_statuses is empty', async () => {
    const mockArgs = { project_id: 1, tracker_id: 4 };
    const mockRepresentativeIssue = { id: 101 } as RedmineIssue;
    const mockDetailedIssue = {
      ...mockRepresentativeIssue,
      allowed_statuses: [], // Empty allowed statuses
    } as RedmineIssue;

    (mockRedmineClient.prototype.getIssues as jest.Mock).mockResolvedValueOnce({
      issues: [mockRepresentativeIssue],
      total_count: 1,
      offset: 0,
      limit: 1,
    });
    (mockRedmineClient.prototype.getIssue as jest.Mock).mockResolvedValueOnce({
      issue: mockDetailedIssue,
    });

    const result = await projectsHandlers.list_project_statuses(mockArgs);
    expect(result).toEqual<ToolResponse>({
      content: [{ type: 'text', text: 'No allowed statuses found for tracker_id 4 in project_id 1. It might be that the workflow is not configured or the representative issue has no available transitions.' }],
      isError: false,
    });
  });

    it('should return a message if issue is found but allowed_statuses is undefined', async () => {
    const mockArgs = { project_id: 1, tracker_id: 5 };
    const mockRepresentativeIssue = { id: 102 } as RedmineIssue;
    const mockDetailedIssue = { // allowed_statuses is undefined
      ...mockRepresentativeIssue,
    } as RedmineIssue;

    (mockRedmineClient.prototype.getIssues as jest.Mock).mockResolvedValueOnce({
      issues: [mockRepresentativeIssue],
      total_count: 1,
      offset: 0,
      limit: 1,
    });
    (mockRedmineClient.prototype.getIssue as jest.Mock).mockResolvedValueOnce({
      issue: mockDetailedIssue,
    });

    const result = await projectsHandlers.list_project_statuses(mockArgs);
    expect(result).toEqual<ToolResponse>({
      content: [{ type: 'text', text: 'No allowed statuses found for tracker_id 5 in project_id 1. It might be that the workflow is not configured or the representative issue has no available transitions.' }],
      isError: false,
    });
  });


  // --- Abnormal Cases (Validation Errors) ---
  it('should return ValidationError if project_id is missing', async () => {
    const mockArgs = { tracker_id: 1 }; // project_id is missing
    const result = await projectsHandlers.list_project_statuses(mockArgs);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Input Error: project_id is required and must be a number.');
  });

  it('should return ValidationError if project_id is not a number', async () => {
    const mockArgs = { project_id: 'abc', tracker_id: 1 };
    const result = await projectsHandlers.list_project_statuses(mockArgs);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Input Error: project_id is required and must be a number.');
  });

  it('should return ValidationError if tracker_id is missing', async () => {
    const mockArgs = { project_id: 1 }; // tracker_id is missing
    const result = await projectsHandlers.list_project_statuses(mockArgs);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Input Error: tracker_id is required and must be a number.');
  });

  it('should return ValidationError if tracker_id is not a number', async () => {
    const mockArgs = { project_id: 1, tracker_id: 'xyz' };
    const result = await projectsHandlers.list_project_statuses(mockArgs);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Input Error: tracker_id is required and must be a number.');
  });

  // --- Abnormal Cases (API Errors) ---
  it('should return API Error if getIssues fails', async () => {
    const mockArgs = { project_id: 1, tracker_id: 2 };
    const apiError = new Error('Redmine API getIssues failed');
    (mockRedmineClient.prototype.getIssues as jest.Mock).mockRejectedValueOnce(apiError);

    const result = await projectsHandlers.list_project_statuses(mockArgs);

    expect(result).toEqual<ToolResponse>({
      content: [{ type: 'text', text: `API Error: ${apiError.message}` }],
      isError: true,
    });
  });

  it('should return API Error if getIssue fails', async () => {
    const mockArgs = { project_id: 1, tracker_id: 2 };
    const mockRepresentativeIssue = { id: 100 } as RedmineIssue;
    const apiError = new Error('Redmine API getIssue failed');

    (mockRedmineClient.prototype.getIssues as jest.Mock).mockResolvedValueOnce({
      issues: [mockRepresentativeIssue],
      total_count: 1,
      offset: 0,
      limit: 1,
    });
    (mockRedmineClient.prototype.getIssue as jest.Mock).mockRejectedValueOnce(apiError);

    const result = await projectsHandlers.list_project_statuses(mockArgs);

    expect(result).toEqual<ToolResponse>({
      content: [{ type: 'text', text: `API Error: ${apiError.message}` }],
      isError: true,
    });
  });
});
