# JustFitness Test Cases

## Test Case 1: User Registration and Profile Setup

**Test ID**: TC-001-Auth  
**Test Description**: Verify that users can register with the required profile details and preferences.  
**Test Type**: Functional  
**Priority**: High  
**Last Updated**: June 9, 2025

### Preconditions:
- JustFitness application is running
- Database connection is active
- Test email does not exist in the system

### Test Steps:
1. Navigate to the registration page
2. Enter the following valid information:
   - Username: testuser123
   - Email: testuser123@example.com
   - Password: Test@123
   - Password confirmation: Test@123
   - Weight: 75 (kg)
   - Height: 180 (cm)
   - Date of Birth: 1990-01-01
   - Goal Weight: 70 (kg)
   - Activity Level: moderate
   - Unit Preference: metric
3. Submit the registration form
4. Verify redirection to dashboard/home page
5. Check user profile to confirm information was saved

### Expected Results:
- User account is created successfully
- A welcome message or successful registration notification appears
- User's preferences are correctly stored in the database
- JWT/Sanctum token is generated and stored in browser storage
- User can access authenticated areas of the application

### API Endpoint:
- POST /api/register

### Test Data:
```json
{
  "username": "testuser123",
  "email": "testuser123@example.com",
  "password": "Test@123",
  "password_confirmation": "Test@123",
  "weight": 75,
  "height": 180,
  "dateOfBirth": "1990-01-01",
  "goalWeight": 70,
  "activityLevel": "moderate",
  "unitPreference": "metric"
}
```

---

## Test Case 2: Workout Creation with Exercise Sets

**Test ID**: TC-002-Workout  
**Test Description**: Verify that users can create a new workout and add exercises with specific set, rep, and weight information.  
**Test Type**: Functional  
**Priority**: High  
**Last Updated**: June 9, 2025

### Preconditions:
- User is authenticated
- Exercise database contains the required exercises
- User has permission to create workouts

### Test Steps:
1. Navigate to the workout creation page
2. Fill in workout details:
   - Name: "Upper Body Strength"
   - Description: "Focus on chest, shoulders, and arms"
   - Duration: 45 (minutes)
   - Is Public: true
3. Save the workout
4. Add the following exercises to the workout:
   - Exercise ID: [ID for "Bench Press"]
     - Set 1: 10 reps, 60kg, 90sec rest
     - Set 2: 8 reps, 70kg, 90sec rest
     - Set 3: 6 reps, 80kg, 120sec rest
   - Exercise ID: [ID for "Shoulder Press"]
     - Set 1: 12 reps, 20kg, 60sec rest
     - Set 2: 10 reps, 25kg, 60sec rest
5. Save the workout with exercises
6. View the created workout details

### Expected Results:
- Workout is created and appears in user's workout list
- All exercises are correctly associated with the workout
- Set information (reps, weight, rest time) is accurately stored
- Workout can be viewed with all exercise details intact

### API Endpoints:
- POST /api/workouts
- POST /api/workouts/{workoutId}/exercises
- PUT /api/workouts/{workoutId}/exercises/{exerciseId}/sets/{setNumber}

### Test Data:
```json
// Create Workout
{
  "name": "Upper Body Strength",
  "description": "Focus on chest, shoulders, and arms",
  "duration": 45,
  "is_public": true
}

// Add Exercise to Workout
{
  "exercise_id": 1,
  "set_number": 1,
  "reps": 10,
  "weight": 60,
  "rest_time": 90
}
```

---

## Test Case 3: Meal Logging and Nutrition Summary

**Test ID**: TC-003-Nutrition  
**Test Description**: Verify that users can log meals for a specific date and view their nutritional summary.  
**Test Type**: Functional  
**Priority**: Medium  
**Last Updated**: June 9, 2025

### Preconditions:
- User is authenticated
- Food database contains necessary food items
- No meal logs exist for the test date

### Test Steps:
1. Navigate to the nutrition tracking section
2. Select today's date (June 9, 2025)
3. Create a breakfast meal log:
   - Meal Type: breakfast
   - Add food items:
     - Oatmeal (100g): 370 calories, 13g protein, 68g carbs, 7g fat
     - Banana (1 medium): 105 calories, 1.3g protein, 27g carbs, 0.4g fat
4. Create a lunch meal log:
   - Meal Type: lunch
   - Add food items:
     - Grilled chicken breast (150g): 240 calories, 45g protein, 0g carbs, 5g fat
     - Brown rice (100g): 112 calories, 2.6g protein, 24g carbs, 0.8g fat
5. Save meal logs
6. View nutrition summary for today

### Expected Results:
- Meal logs are successfully created for both breakfast and lunch
- Food items are correctly associated with each meal log
- Nutrition summary shows:
  - Total calories: 827 calories
  - Total protein: 61.9g
  - Total carbs: 119g
  - Total fat: 13.2g
- Summary should include a breakdown by meal

### API Endpoints:
- POST /api/meal-logs
- GET /api/meal-summary?date=2025-06-09

### Test Data:
```json
// Create Meal Log
{
  "date": "2025-06-09",
  "meal_type": "breakfast",
  "items": [
    {
      "food_id": 1,
      "quantity": 100,
      "unit": "g"
    },
    {
      "food_id": 2,
      "quantity": 1,
      "unit": "medium"
    }
  ]
}
```

---

## Test Case 4: Exercise Management with Muscle Groups

**Test ID**: TC-004-Exercise  
**Test Description**: Verify that users can create custom exercises with assigned muscle groups and media.  
**Test Type**: Functional  
**Priority**: Medium  
**Last Updated**: June 9, 2025

### Preconditions:
- User is authenticated
- Muscle group data is available in the system
- User has permission to create exercises

### Test Steps:
1. Navigate to the exercise creation page
2. Fill in exercise details:
   - Name: "Cable Tricep Pushdown"
   - Description: "An isolation exercise targeting the triceps using a cable machine"
   - Is Public: true
   - Muscle Groups: [Triceps, Arms]
3. Upload an image file demonstrating the exercise (tricep_pushdown.jpg)
4. Save the exercise
5. View the created exercise in the exercise library
6. Filter exercises by "Triceps" muscle group and verify the new exercise appears

### Expected Results:
- Exercise is created successfully with correct details
- Image is uploaded and associated with the exercise
- Muscle groups are correctly linked to the exercise
- Exercise appears when filtering by associated muscle groups
- Exercise is marked as public and visible to other users

### API Endpoints:
- POST /api/exercises
- GET /api/exercises?muscle_group=3 (assuming 3 is the Triceps ID)

### Test Data:
```json
// Create Exercise (multipart form data)
{
  "name": "Cable Tricep Pushdown",
  "description": "An isolation exercise targeting the triceps using a cable machine",
  "is_public": true,
  "muscle_group_ids": [3, 5]
}
// With file upload for media
```

---

## Test Case 5: Admin User Management

**Test ID**: TC-005-Admin  
**Test Description**: Verify that admin users can view, edit roles, and delete regular user accounts.  
**Test Type**: Functional  
**Priority**: High  
**Last Updated**: June 9, 2025

### Preconditions:
- Admin user is authenticated
- Regular test user exists in the system
- Admin has proper authorization

### Test Steps:
1. Login as admin user
2. Navigate to the admin panel
3. View the list of all users
4. Find the test user (testuser123@example.com)
5. Edit the user's role:
   - Change role from "user" to "admin"
6. Save changes
7. Verify role was updated
8. Change the role back to "user"
9. Delete the test user account
10. Verify the user no longer appears in the user list

### Expected Results:
- Admin can access the user management section
- Complete list of users is displayed
- User's role can be successfully updated
- Changes are saved to the database
- User account can be deleted
- Deleted user no longer appears in the system

### API Endpoints:
- GET /api/admin/users
- PUT /api/admin/users/{id}
- DELETE /api/admin/users/{id}

### Test Data:
```json
// Update User Role
{
  "role": "admin"
}
```
