use crate::Document;
use crate::DB_POOL;
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

#[tauri::command]
pub async fn test_pdf_generation() -> Result<String, String> {
  use crate::helpers::pdf_docs::create_test_pdf;
  use std::env;

  let temp_dir = env::temp_dir();
  let test_pdf_path = temp_dir.join("test_output.pdf");

  create_test_pdf(&test_pdf_path).map_err(|e| format!("Failed to create test PDF: {}", e))?;

  Ok(format!("Test PDF created at: {}", test_pdf_path.display()))
}

#[tauri::command]
pub async fn build_pdf_with_sase_api(
  first_pdf: Vec<u8>,
  ids_in_order: Vec<i64>,
  jwt_token: String,
) -> Result<Vec<u8>, String> {
  use crate::helpers::pdf_docs::merge_mixed_to_pdf_via_sase_api_with_pdfs;

  let db_pool = DB_POOL.get().ok_or("Database not initialized")?;
  let pool_guard = db_pool.lock().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;

  let mut additional_blobs = Vec::new();
  let mut additional_pdfs = Vec::new();
  let mut image_headers = Vec::new();
  let mut pdf_headers = Vec::new();

  for doc_id in &ids_in_order {
    let row = sqlx::query("SELECT data, mime_type, name FROM documents WHERE id = ?")
      .bind(doc_id)
      .fetch_optional(pool)
      .await
      .map_err(|e| format!("Database error: {}", e))?;

    if let Some(row) = row {
      let data: Vec<u8> = row.get("data");
      let mime_type: String = row.get("mime_type");
      let name: String = row.get("name");

      if mime_type.starts_with("image/") {
        additional_blobs.push(data);
        image_headers.push(name);
      } else if mime_type == "application/pdf" {
        additional_pdfs.push(data);
        pdf_headers.push(name);
      }
    }
  }

  let mut all_headers = image_headers;
  all_headers.extend(pdf_headers);

  println!(
    "Collected {} total headers: {:?}",
    all_headers.len(),
    all_headers
  );

  merge_mixed_to_pdf_via_sase_api_with_pdfs(
    first_pdf,
    additional_blobs,
    additional_pdfs,
    all_headers,
    &jwt_token,
  )
  .await
  .map_err(|e| format!("Failed to merge PDFs via SASE API: {}", e))
}
