# Supabase Dashboard Configuration Required

This document outlines security and configuration improvements that must be applied through the Supabase Dashboard (not via SQL migrations).

## Critical Security Issues

### 1. Enable Leaked Password Protection

**Issue**: Supabase Auth can prevent the use of compromised passwords by checking against HaveIBeenPwned.org. This feature is currently disabled.

**Impact**: Users may register with passwords that have been compromised in data breaches, increasing security risk.

**How to Fix**:
1. Go to your Supabase Dashboard
2. Navigate to: **Authentication** > **Policies** > **Password Protection**
3. Enable the option: **"Check passwords against HaveIBeenPwned database"**

**Recommendation**: ✅ **Enable immediately** - This is a critical security feature with no downside.

---

## Performance Optimization

### 2. Change Auth Connection Strategy to Percentage

**Issue**: Your Auth server uses a fixed connection pool of 10 connections. Increasing instance size won't automatically improve Auth performance.

**Current**: Fixed at 10 connections
**Recommended**: Percentage-based allocation

**How to Fix**:
1. Go to your Supabase Dashboard
2. Navigate to: **Settings** > **Database** > **Connection Pooling**
3. Find the **Auth** connection pool settings
4. Change strategy from **"Fixed"** to **"Percentage"**
5. Set an appropriate percentage (recommended: 10-20% of total connections)

**Benefits**:
- Auth server scales automatically with database resources
- Better performance during high-traffic periods
- More efficient resource utilization

---

## Non-Issues (Informational)

### 3. PostGIS spatial_ref_sys Table (RLS Disabled)

**Status**: ⚠️ **No Action Required**

**Explanation**:
- `spatial_ref_sys` is a PostGIS system table containing spatial reference system definitions
- It's a read-only reference table used by PostGIS internally
- Enabling RLS on system tables is not recommended and provides no security benefit
- This table contains no user data or sensitive information

**Conclusion**: This is a false positive from the security scanner.

---

### 4. PostGIS Extension in Public Schema

**Status**: ⚠️ **No Action Required**

**Explanation**:
- PostGIS is commonly installed in the `public` schema
- This is the standard and recommended installation pattern
- Moving it to another schema can cause compatibility issues
- The PostGIS team and Supabase both recommend keeping it in `public`

**Conclusion**: This is standard practice and poses no security risk.

---

## Summary

### Action Required (2 items)
1. ✅ Enable leaked password protection (Critical)
2. ✅ Change Auth connection strategy to percentage (Performance)

### No Action Needed (2 items)
- ⚠️ PostGIS spatial_ref_sys RLS (System table)
- ⚠️ PostGIS in public schema (Standard practice)

---

## SQL Fixes Already Applied

The following issues were fixed via SQL migration `20251216001629_fix_security_performance_issues`:

✅ **Added 34 foreign key indexes** for optimal query performance
✅ **Removed 3 unused indexes** to reduce maintenance overhead
✅ **Consolidated 7 duplicate RLS policies** to prevent security gaps

All SQL-based fixes have been successfully applied to the database.
