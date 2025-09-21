// for src/components/profile

// Import get_db_pool from the correct module if it's defined elsewhere
// Adjust the path as necessary
use crate::DB_POOL;

#[tauri::command]
pub async fn add_income_source(
  source: String,
  employer_name: String,
  job_title: String,
  employment_length: String,
  employer_contact: String,
) -> Result<(), String> {
  let db_pool = DB_POOL.get().ok_or("Database not initialized")?;
  let pool_guard = db_pool.lock().await;
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
