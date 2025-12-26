## Registration Error Fix

I have identified the cause of the "400 Bad Request" error during user registration.

### The Problem

The error was caused by an incorrect database trigger (`handle_new_user`) that runs after a user is created. The trigger was trying to create a user profile with missing and incorrect data, which caused the database to reject the new user, leading to the error.

### The Fix

I have corrected the trigger logic in the file `sql/create_profile_trigger.sql`. The new trigger now correctly extracts the user's full name, phone number, and role from the information you provide during signup and uses it to create a valid profile.

### What You Need To Do

To apply the fix, you need to run the updated SQL code in your Supabase project.

1.  **Open your Supabase project dashboard.**
2.  Navigate to the **SQL Editor**.
3.  **Open the file `sql/create_profile_trigger.sql`** from this project.
4.  **Copy the entire content** of the file.
5.  **Paste the content** into the Supabase SQL Editor.
6.  **Click the "Run" button.**

After running the SQL, the registration error should be resolved. You can now try signing up again.
