# API Bug Testing Instructions

## Quick Start

### Step 1: Get Your Access Token

1. **Log into your Ovok app** in the browser
2. **Open DevTools** (Press F12)
3. **Go to Console tab**
4. **Run this command:**
   ```javascript
   localStorage.getItem('accessToken')
   ```
5. **Copy the token value** (it's a long string)

### Step 2: Run the Bug Tests

**Option A: Set environment variable**
```bash
export OVOK_ACCESS_TOKEN=your_token_here
node tests/api-bug-testing.js
```

**Option B: Inline (one command)**
```bash
OVOK_ACCESS_TOKEN=your_token_here node tests/api-bug-testing.js
```

**Option C: Check token helper**
```bash
node tests/get-token-helper.js
```

### Step 3: Review Results

After running tests, check:
- **Console output** - See bugs found in real-time
- **`tests/bug-reports.json`** - Detailed bug reports in JSON
- **`API_BUG_REPORTS.md`** - Formatted bug reports (will be updated)

---

## What Gets Tested

The test script systematically tests:

### 1. **Authentication & Security** (No token needed)
- ✅ Requests without token
- ✅ Requests with invalid token
- ✅ Token validation

### 2. **Validation Bugs** (Requires token)
- ✅ Missing required fields
- ✅ Invalid data types
- ✅ Invalid date formats
- ✅ Invalid enum values

### 3. **Search Functionality** (Requires token)
- ✅ Special characters in search
- ✅ SQL injection attempts
- ✅ Empty strings
- ✅ Invalid pagination parameters

### 4. **Error Handling** (Requires token)
- ✅ Consistent error formats
- ✅ Proper HTTP status codes
- ✅ Helpful error messages

### 5. **Resource References** (Requires token)
- ✅ Invalid patient references
- ✅ Non-existent resources
- ✅ Invalid reference formats

### 6. **Pagination** (Requires token)
- ✅ Default limits
- ✅ Invalid _count values
- ✅ Pagination links

---

## Understanding Results

### Bug Categories

- **Validation** - API accepts invalid data
- **Functional** - API doesn't work as expected
- **Security** - Authentication/authorization issues
- **Performance** - Slow responses, timeouts
- **Consistency** - Inconsistent behavior across endpoints
- **Error Handling** - Poor error messages or wrong status codes
- **FHIR Compliance** - Doesn't follow FHIR R4 spec

### Severity Levels

- **Critical** - Security vulnerabilities, data loss
- **High** - Breaks functionality, affects users
- **Medium** - Causes confusion, poor UX
- **Low** - Minor issues, edge cases

---

## Example Output

```
🚀 Starting API Bug Testing...

=== Test: Authentication Edge Cases ===
✅ Request without token returns 401
✅ Request with invalid token returns 401

=== Test: Patient Creation - Missing Required Fields ===
🐛 BUG FOUND: Patient creation accepts missing required fields
   Type: Validation
   Endpoint: POST /fhir/Patient
   Status: 200

============================================================
📊 TEST SUMMARY
============================================================
Total Bugs Found: 1

🐛 BUGS FOUND:

1. Patient creation accepts missing required fields
   Type: Validation
   Endpoint: POST /fhir/Patient
   Status: 200

📝 Bug reports saved to: tests/bug-reports.json
```

---

## Reporting Bugs

After running tests:

1. **Review `tests/bug-reports.json`** for detailed findings
2. **Copy bug details** to your bug tracking system
3. **Use the template** in `API_BUG_REPORTING_GUIDE.md` for formal reports
4. **Include request/response examples** from the JSON file

---

## Troubleshooting

### "No access token provided"
- Get token from browser (see Step 1 above)
- Set `OVOK_ACCESS_TOKEN` environment variable

### "401 Unauthorized" errors
- Token might be expired - get a new one
- Token might be invalid - check it's correct

### Tests are slow
- Some tests make multiple API calls
- This is normal - be patient

### No bugs found
- Great! But try:
  - Different data combinations
  - Edge cases
  - Different endpoints
  - Real-world scenarios

---

## Next Steps

1. **Run tests regularly** - Especially after API updates
2. **Test new features** - As you use them
3. **Document findings** - Use the bug report template
4. **Follow up** - Check if reported bugs are fixed
5. **Test edge cases** - Invalid inputs, boundary conditions

---

## Tips

- **Test during development** - Find bugs early
- **Test with real data** - Use actual patient/appointment data
- **Test error scenarios** - What happens when things go wrong
- **Test consistency** - Same operations should behave the same
- **Document everything** - Even small issues matter

---

## Need Help?

- Check `API_BUG_REPORTING_GUIDE.md` for detailed testing methodology
- Review `OVOK_API_DOCUMENTATION.md` for API reference
- Look at `tests/api-test-suite.js` for example API calls

