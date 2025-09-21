// for src/components/profile

// Import get_db_pool from the correct module if it's defined elsewhere
// Adjust the path as necessary
use crate::IncomeSource;
use crate::DB_POOL;
use sqlx::Row;

#[tauri::command]
pub async fn add_income_source(
  source: String,
  employer_name: String,
  job_title: String,
  employment_length: String,
  employer_contact: String,
) -> Result<(), String> {
  let pool = DB_POOL.get().ok_or("Database not initialized")?;
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
  let pool = DB_POOL.get().ok_or("Database not initialized")?;
  let rows = sqlx::query(
    r#"
        SELECT *
        FROM income_sources
        "#,
  )
  .fetch_all(pool)
  .await
  .map_err(|e| format!("Failed to fetch documents: {}", e))?;

  let mut documents = Vec::new();
  for row in rows {
    documents.push(IncomeSource {
      source: row.try_get("source").unwrap_or_default(),
      employer_name: row.try_get("employer_name").unwrap_or_default(),
      job_title: row.try_get("job_title").unwrap_or_default(),
      employment_length: row.try_get("employment_length").unwrap_or_default(),
      employer_contact: row.try_get("employer_contact").unwrap_or_default(),
    });
  }

  Ok(documents)
}

