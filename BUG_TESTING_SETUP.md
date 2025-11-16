# API Bug Testing Setup - Complete ✅

I've set up a comprehensive bug testing system for the Ovok APIs. Here's what's been created:

## 📁 Files Created

1. **`API_BUG_REPORTING_GUIDE.md`** - Complete guide on how to test and report bugs
2. **`tests/api-bug-testing.js`** - Automated test script that finds common bugs
3. **`API_BUG_REPORTS.md`** - Template for documenting found bugs
4. **`TESTING_INSTRUCTIONS.md`** - Step-by-step instructions to run tests
5. **`tests/get-token-helper.js`** - Helper to get your access token

## 🚀 Quick Start

### 1. Get Your Access Token

Open your browser console (F12) after logging into Ovok app and run:
```javascript
localStorage.getItem('accessToken')
```

### 2. Run the Tests

```bash
OVOK_ACCESS_TOKEN=your_token_here node tests/api-bug-testing.js
```

### 3. Review Results

- Check console output for bugs found
- See `tests/bug-reports.json` for detailed reports
- Use `API_BUG_REPORTS.md` template for formal reports

## 🧪 What Gets Tested

The test script automatically checks for:

### ✅ Authentication & Security
- Requests without token
- Invalid tokens
- Token validation

### ✅ Validation Bugs
- Missing required fields
- Invalid data types
- Invalid date formats
- Invalid enum values

### ✅ Search Functionality
- Special characters (O'Brien, etc.)
- SQL injection attempts
- Empty strings
- Invalid pagination

### ✅ Error Handling
- Consistent error formats
- Proper HTTP status codes
- Helpful error messages

### ✅ Resource References
- Invalid patient references
- Non-existent resources
- Invalid reference formats

### ✅ Pagination
- Default limits
- Invalid _count values
- Pagination links

## 📊 Bug Categories

Bugs are automatically categorized as:
- **Validation** - API accepts invalid data
- **Functional** - API doesn't work as expected
- **Security** - Authentication/authorization issues
- **Performance** - Slow responses
- **Consistency** - Inconsistent behavior
- **Error Handling** - Poor error messages
- **FHIR Compliance** - Doesn't follow FHIR spec

## 🎯 Next Steps

1. **Run the tests** with your access token
2. **Review findings** in the bug reports
3. **Document bugs** using the templates
4. **Report to Ovok team** using the bug report format
5. **Re-test regularly** especially after API updates

## 📝 Example Bug Report Format

When you find bugs, they'll be documented like this:

```markdown
### Bug #1: Patient Creation Accepts Invalid Data

**Type:** Validation  
**Severity:** High  
**Endpoint:** POST /fhir/Patient  
**Date Found:** 2024-01-15

#### Description
Creating a patient with invalid birthDate format (e.g., "2024-13-45") 
returns 200 OK instead of 400 Bad Request.

#### Expected Behavior
Should return 400 with validation error message

#### Actual Behavior
Returns 200 OK and creates patient with invalid date

#### Steps to Reproduce
1. POST /fhir/Patient with birthDate: "2024-13-45"
2. Observe response

#### Impact
- **User Impact:** Data integrity issue
- **Workaround:** None
- **Frequency:** Always
```

## 💡 Tips

- **Test regularly** - Run tests weekly or after API updates
- **Test edge cases** - Invalid inputs, boundary conditions
- **Document everything** - Even small issues matter
- **Be specific** - Include exact request/response examples
- **Follow up** - Check if reported bugs are fixed

## 🔍 Testing Strategy

The test script focuses on **common bug-prone areas**:

1. **Validation** - Most APIs have validation bugs
2. **Error handling** - Often inconsistent or unhelpful
3. **Search** - Special characters and edge cases
4. **Authentication** - Security is critical
5. **Pagination** - Often overlooked

## 📚 Documentation

- **`API_BUG_REPORTING_GUIDE.md`** - Complete methodology
- **`TESTING_INSTRUCTIONS.md`** - How to run tests
- **`OVOK_API_DOCUMENTATION.md`** - API reference

## ⚠️ Important Notes

- Tests **don't modify your project** - they're read-only
- Tests **don't break functionality** - they just test APIs
- You need a **valid access token** to test authenticated endpoints
- Tests are **safe to run** - they don't delete or modify data

## 🎉 You're Ready!

Everything is set up. Just:
1. Get your token
2. Run the test script
3. Review and report bugs

Happy bug hunting! 🐛

