use crate::Checklist;
use crate::DB_POOL;
use sqlx::Row;

/// Get all checklist items
#[tauri::command]
pub async fn get_checklists() -> Result<Vec<Checklist>, String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;
  let rows = sqlx::query(
    r#"
        SELECT id, is_checked, task_name, document_references, reminder_date, created_at, updated_at
        FROM checklists
        ORDER BY created_at DESC
        "#,
  )
  .fetch_all(pool)
  .await
  .map_err(|e| format!("Failed to fetch checklists: {}", e))?;

  let mut checklists = Vec::new();
  for row in rows {
    checklists.push(Checklist {
      id: row.try_get("id").ok(),
      is_checked: row.try_get("is_checked").unwrap_or(false),
      task_name: row.try_get("task_name").unwrap_or_default(),
      document_references: row.try_get("document_references").ok(),
      reminder_date: row.try_get("reminder_date").ok(),
      created_at: row.try_get("created_at").ok(),
      updated_at: row.try_get("updated_at").ok(),
    });
  }

  Ok(checklists)
}

/// Add a new checklist item
#[tauri::command]
pub async fn add_checklist(checklist: Checklist) -> Result<i64, String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;
  let result = sqlx::query(
    r#"
        INSERT INTO checklists (is_checked, task_name, document_references, reminder_date) 
        VALUES (?, ?, ?, ?)
        "#,
  )
  .bind(checklist.is_checked)
  .bind(&checklist.task_name)
  .bind(&checklist.document_references)
  .bind(&checklist.reminder_date)
  .execute(pool)
  .await
  .map_err(|e| format!("Failed to insert checklist: {}", e))?;

  Ok(result.last_insert_rowid())
}

/// Update an existing checklist item
#[tauri::command]
pub async fn update_checklist(
  id: i64,
  task_name: String,
  is_checked: bool,
  document_references: Option<String>,
  reminder_date: Option<String>,
) -> Result<(), String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;

  sqlx::query(
    r#"
        UPDATE checklists 
        SET task_name = ?, is_checked = ?, document_references = ?, reminder_date = ?
        WHERE id = ?
        "#,
  )
  .bind(&task_name)
  .bind(is_checked)
  .bind(&document_references)
  .bind(&reminder_date)
  .bind(id)
  .execute(pool)
  .await
  .map_err(|e| format!("Failed to update checklist: {}", e))?;

  Ok(())
}

/// Delete a checklist item
#[tauri::command]
pub async fn delete_checklist(id: i64) -> Result<(), String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;

  sqlx::query("DELETE FROM checklists WHERE id = ?")
    .bind(id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to delete checklist: {}", e))?;

  Ok(())
}

/// Toggle the completion status of a checklist item
#[tauri::command]
pub async fn toggle_checklist_completion(id: i64) -> Result<bool, String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;

  // First get the current status
  let row = sqlx::query("SELECT is_checked FROM checklists WHERE id = ?")
    .bind(id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to fetch checklist: {}", e))?;

  let current_status: bool = row.try_get("is_checked").unwrap_or(false);
  let new_status = !current_status;

  // Update with the new status
  sqlx::query("UPDATE checklists SET is_checked = ? WHERE id = ?")
    .bind(new_status)
    .bind(id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to toggle checklist completion: {}", e))?;

  Ok(new_status)
}
