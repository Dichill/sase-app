// for src/components/profile

// Import get_db_pool from the correct module if it's defined elsewhere
// Adjust the path as necessary
use crate::AdditionalInfoItem;
use crate::IncomeSource;
// use crate::MonthlyIncome;
use crate::DB_POOL;
use sqlx::Row;

// Income Sources
#[tauri::command]
pub async fn add_income_source(
  source: String,
  employer_name: String,
  job_title: String,
  employment_length: String,
  employer_contact: String,
) -> Result<(), String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;
  sqlx::query("INSERT INTO income_sources (source, employer_name, job_title, employment_length, employer_contact) VALUES (?, ?, ?, ?, ?)")
        .bind(source)
        .bind(employer_name)
        .bind(job_title)
        .bind(employment_length)
        .bind(employer_contact)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
pub async fn get_income_sources() -> Result<Vec<IncomeSource>, String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;
  let rows = sqlx::query(
    r#"
        SELECT *
        FROM income_sources
        "#,
  )
  .fetch_all(pool)
  .await
  .map_err(|e| format!("Failed to fetch monthly incomes: {}", e))?;

  let mut income_source = Vec::new();
  for row in rows {
    income_source.push(IncomeSource {
      id: row.try_get("id").unwrap_or_default(),
      // profile_id: row.try_get("profile_id").unwrap_or_default(),
      source: row.try_get("source").unwrap_or_default(),
      employer_name: row.try_get("employer_name").unwrap_or_default(),
      job_title: row.try_get("job_title").unwrap_or_default(),
      employment_length: row.try_get("employment_length").unwrap_or_default(),
      employer_contact: row.try_get("employer_contact").unwrap_or_default(),
    });
  }

  Ok(income_source)
}

#[tauri::command]
pub async fn delete_income_source(id: i64) -> Result<(), String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;

  sqlx::query("DELETE FROM monthly_income WHERE id = ?")
    .bind(id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to delete entry:  {}", e))?;

  Ok(())
}
// End Income Sources

// Monthly Income
#[tauri::command]
pub async fn get_monthly_income(profile_id: i64) -> Result<Option<i64>, String> {
    let pool_guard = DB_POOL.read().await;
    let pool = pool_guard.as_ref().ok_or("Database not initialized")?;

    let row = sqlx::query("SELECT monthly_income FROM profile WHERE id = ?")
        .bind(profile_id)
        .fetch_optional(pool)
        .await
        .map_err(|e| format!("Failed to fetch monthly income: {}", e))?;

    if let Some(row) = row {
        // If the column is REAL/NUMERIC, prefer this (propagates conversion errors):
        let val: Option<i64> = row.try_get::<Option<i64>, _>("monthly_income")
            .map_err(|e| format!("Type/column error reading monthly_income: {}", e))?;

        // Debug log to verify the raw value you read
        println!("get_monthly_income: profile_id={}, monthly_income={:?}", profile_id, val);

        Ok(val)
    } else {
        println!("get_monthly_income: no row for profile_id={}", profile_id);
        Ok(None)
    }
}

#[tauri::command]
pub async fn set_monthly_income(income: i64) -> Result<(), String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;

  sqlx::query("UPDATE profile SET monthly_income = ? WHERE id = 1")
    .bind(income)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to update monthly income: {}", e))?;

  Ok(())
}
// End Monthly Income

// User Profile
#[tauri::command]
pub async fn get_user_profile() -> Result<Vec<String>, String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;
  let rows = sqlx::query(
    r#"
        SELECT *
        FROM profile
        "#,
  )
  .fetch_all(pool)
  .await
  .map_err(|e| format!("Failed to fetch user profile: {}", e))?;

  let mut user_profile = Vec::new();
  for row in rows {
    user_profile.push(row.try_get("name").unwrap_or_default());
    user_profile.push(row.try_get("email").unwrap_or_default());
    user_profile.push(row.try_get("phone").unwrap_or_default());
    user_profile.push(row.try_get("address").unwrap_or_default());
    user_profile.push(row.try_get("date_of_birth").unwrap_or_default());
    user_profile.push(row.try_get("ssn").unwrap_or_default());
    user_profile.push(row.try_get("marital_status").unwrap_or_default());
    user_profile.push(row.try_get("dependents").unwrap_or_default());
    user_profile.push(row.try_get("employment_status").unwrap_or_default());
    user_profile.push(row.try_get("employer_name").unwrap_or_default());
    user_profile.push(row.try_get("job_title").unwrap_or_default());
    user_profile.push(row.try_get("annual_income").unwrap_or_default());
  }

  Ok(user_profile)
}

#[tauri::command]
pub async fn set_user_profile(
  name: String,
  email: String,
  phone: String,
  address: String,
  date_of_birth: String,
  ssn: String,
  marital_status: String,
  dependents: i32,
  employment_status: String,
  employer_name: String,
  job_title: String,
  annual_income: f64,
) -> Result<(), String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;
  sqlx::query("UPDATE user_profile SET name = ?, email = ?, phone = ?, address = ?, date_of_birth = ?, ssn = ?, marital_status = ?, dependents = ?, employment_status = ?, employer_name = ?, job_title = ?, annual_income = ? WHERE profile_id = 1")
        .bind(name)
        .bind(email)
        .bind(phone)
        .bind(address)
        .bind(date_of_birth)
        .bind(ssn)
        .bind(marital_status)
        .bind(dependents)
        .bind(employment_status)
        .bind(employer_name)
        .bind(job_title)
        .bind(annual_income)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
  Ok(())
}

// End User Profile

// Additional Info
#[tauri::command]
pub async fn get_additional_info() -> Result<Vec<AdditionalInfoItem>, String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;
  let rows = sqlx::query(
    r#"
        SELECT *
        FROM income_sources
        "#,
  )
  .fetch_all(pool)
  .await
  .map_err(|e| format!("Failed to fetch monthly incomes: {}", e))?;

  let mut additional_info = Vec::new();
  for row in rows {
    additional_info.push(AdditionalInfoItem {
      id: row.try_get("id").unwrap_or_default(),
      label: row.try_get("label").unwrap_or_default(),
      value: row.try_get("value").unwrap_or_default(),
      icon: row.try_get("icon").unwrap_or_default(),
    });
  }

  Ok(additional_info)
}

//UPSERT
#[tauri::command]
pub async fn set_additional_info(id: Option<i64>, info: AdditionalInfoItem) -> Result<(), String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;
  if let Some(id) = id {
    // Update existing entry
    sqlx::query("UPDATE additional_info SET title = ?, description = ?, icon = ? WHERE id = ?")
      .bind(&info.label)
      .bind(&info.value)
      .bind(&info.icon)
      .bind(id)
      .execute(pool)
      .await
      .map_err(|e| format!("Failed to update entry: {}", e))?;
  } else {
    // Insert new entry
    sqlx::query("INSERT INTO additional_info (title, description, icon) VALUES (?, ?, ?)")
      .bind(&info.label)
      .bind(&info.value)
      .bind(&info.icon)
      .execute(pool)
      .await
      .map_err(|e| format!("Failed to insert entry: {}", e))?;
  }
  Ok(())
}

#[tauri::command]
pub async fn delete_additional_info(id: i64) -> Result<(), String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;

  sqlx::query("DELETE FROM additional_info WHERE id = ?")
    .bind(id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to delete entry:  {}", e))?;

  Ok(())
}

// End Additional Info
