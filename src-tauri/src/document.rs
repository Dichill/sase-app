use crate::helpers::pdf_docs::merge_mixed_to_pdf;
use crate::Document;
use crate::DB_POOL;
use lopdf::Document as LoDocument;
use serde::{Deserialize, Serialize};
use sqlx::Row;
use std::fs;

#[derive(Serialize, Deserialize)]
pub struct FileBlob {
  data: Vec<u8>,
  mime_type: String,
}

#[tauri::command]
pub async fn get_documents() -> Result<Vec<Document>, String> {
  let db_pool = DB_POOL.get().ok_or("Database not initialized")?;
  let pool_guard = db_pool.lock().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;
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
      mime_type: row.try_get("mime_type").ok(),
      data: row.try_get::<Vec<u8>, _>("data").ok(),
      updated_at: row.try_get("updated_at").ok(),
    });
  }

  Ok(documents)
}

#[tauri::command]
pub async fn add_document(document: Document) -> Result<i64, String> {
  let db_pool = DB_POOL.get().ok_or("Database not initialized")?;
  let pool_guard = db_pool.lock().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;
  let result = sqlx::query(
    r#"
    INSERT INTO documents (name, document_type, reminder_date, mime_type, data) VALUES (?, ?, ?, ?, ?)
    "#,
  )
  .bind(&document.name)
  .bind(&document.document_type)
  .bind(&document.reminder_date)
  .bind(&document.mime_type)
  .bind(&document.data)
  .execute(pool)
  .await
  .map_err(|e| format!("Failed to insert document: {}", e))?;
  Ok(result.last_insert_rowid())
}

#[tauri::command]
pub async fn read_file_as_blob(file_path: String) -> Result<FileBlob, String> {
  println!("Attempting to read file: {}", file_path);

  if !std::path::Path::new(&file_path).exists() {
    return Err(format!("File does not exist: {}", file_path));
  }

  let file_contents =
    fs::read(&file_path).map_err(|e| format!("Failed to read file '{}': {}", file_path, e))?;

  println!(
    "File read successfully. Size: {} bytes",
    file_contents.len()
  );

  let mime_type = get_mime_type(&file_path);
  println!("Detected MIME type: {}", mime_type);

  Ok(FileBlob {
    data: file_contents,
    mime_type,
  })
}

#[tauri::command]
pub async fn delete_document(document_id: i64) -> Result<(), String> {
  let db_pool = DB_POOL.get().ok_or("Database not initialized")?;
  let pool_guard = db_pool.lock().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;
  sqlx::query("DELETE FROM documents WHERE id = ?")
    .bind(document_id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to delete document: {}", e))?;
  Ok(())
}

#[tauri::command]
pub async fn build_pdf_with_first(
  first_pdf: Vec<u8>,
  ids_in_order: Vec<i64>,
) -> Result<Vec<u8>, String> {
  // Validate the first PDF
  LoDocument::load_mem(&first_pdf).map_err(|e| format!("First PDF is invalid: {e}"))?;

  // Pull blobs from DB in the CALLER’S order
  let db_pool = DB_POOL.get().ok_or("Database not initialized")?;
  let pool_guard = db_pool.lock().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;

  let mut sources: Vec<(String, Vec<u8>)> = Vec::with_capacity(ids_in_order.len() + 1);

  // First PDF goes first
  sources.push(("application/pdf".to_string(), first_pdf));

  // Then append the selected documents (images become single-page PDFs later)
  for id in ids_in_order {
    let row = sqlx::query(r#"SELECT mime_type, data FROM documents WHERE id = ? LIMIT 1"#)
      .bind(id)
      .fetch_optional(pool)
      .await
      .map_err(|e| format!("DB read failed for id {id}: {e}"))?;

    let Some(row) = row else {
      return Err(format!("Document not found: {id}"));
    };

    let mime: Option<String> = row.try_get("mime_type").ok();
    let data: Option<Vec<u8>> = row.try_get("data").ok();

    let mime = mime.ok_or_else(|| format!("Missing mime_type for id {id}"))?;
    let data = data.ok_or_else(|| format!("Missing data blob for id {id}"))?;

    sources.push((mime, data));
  }

  // Merge (images → single-page PDFs, PDFs as-is)
  merge_mixed_to_pdf(sources).map_err(|e| format!("Failed to build final PDF: {e:#}"))
}

fn get_mime_type(file_path: &str) -> String {
  let extension = file_path.split('.').last().unwrap_or("").to_lowercase();

  match &extension[..] {
    "pdf" => "application/pdf".to_string(),
    "doc" => "application/msword".to_string(),
    "docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document".to_string(),
    "txt" => "text/plain".to_string(),
    "jpg" | "jpeg" => "image/jpeg".to_string(),
    "png" => "image/png".to_string(),
    "gif" => "image/gif".to_string(),
    "bmp" => "image/bmp".to_string(),
    "webp" => "image/webp".to_string(),
    "svg" => "image/svg+xml".to_string(),
    "mp4" => "video/mp4".to_string(),
    "avi" => "video/x-msvideo".to_string(),
    "mov" => "video/quicktime".to_string(),
    "wmv" => "video/x-ms-wmv".to_string(),
    "mp3" => "audio/mpeg".to_string(),
    "wav" => "audio/wav".to_string(),
    "ogg" => "audio/ogg".to_string(),
    "zip" => "application/zip".to_string(),
    "rar" => "application/x-rar-compressed".to_string(),
    "7z" => "application/x-7z-compressed".to_string(),
    "xls" => "application/vnd.ms-excel".to_string(),
    "xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".to_string(),
    "ppt" => "application/vnd.ms-powerpoint".to_string(),
    "pptx" => {
      "application/vnd.openxmlformats-officedocument.presentationml.presentation".to_string()
    }
    _ => "application/octet-stream".to_string(),
  }
}
