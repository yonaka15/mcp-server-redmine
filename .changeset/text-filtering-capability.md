---
"@yonaka15/mcp-server-redmine": minor
---

Add text filtering capability for efficient issue searching

- Add three text filter parameters: subject_filter, description_filter, notes_filter
- Generate proper Redmine API queries using f[]=field&op[field]=~&v[field][]= format
- Seamless integration with brief mode optimization for large dataset handling
- Enable efficient searching in databases with 3000+ issues without context overflow
- Maintain 100% backward compatibility with existing list_issues functionality
