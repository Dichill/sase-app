use crate::Document;
use crate::DB_POOL;
use sqlx::Row;

#[tauri::command]
pub async fn fetch_documents() -> Result<Vec<Document>, String> {
  let pool = DB_POOL.get().ok_or("Database not initialized")?;
  let rows = sqlx::query(
    r#"
        SELECT *
        FROM documents
        "#,
  )
  .fetch_all(pool)
  .await
  .map_err(|e| format!("Failed to fetch documents: {}", e))?;

  let mut documents = Vec::new();
  for row in rows {
    documents.push(Document {
      id: row.try_get("id").ok(),
      name: row.try_get("name").unwrap_or_default(),
      document_type: row.try_get("document_type").unwrap_or_default(),
      reminder_date: row.try_get("reminder_date").ok(),
      document_references: row.try_get("document_references").ok(),
      updated_at: row.try_get("updated_at").ok(),
    });
  }

  Ok(documents)
}

#[tauri::command]
pub async fn add_document(document: Document) -> Result<i64, String> {
  let pool = DB_POOL.get().ok_or("Database not initialized")?;
  let result = sqlx::query(
    r#"
    INSERT INTO documents (name, document_type, reminder_date, document_references) VALUES (?, ?, ?, ?)
    "#,
  )
  .bind(&document.name)
  .bind(&document.document_type)
  .bind(&document.reminder_date)
  .bind(&document.document_references)
  .execute(pool)
  .await
  .map_err(|e| format!("Failed to insert document: {}", e))?;
  Ok(result.last_insert_rowid())
}
