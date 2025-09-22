mod checklist;
mod document;
mod helpers;
mod listings;
mod profile;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use anyhow::Result;
use serde::{Deserialize, Serialize};
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::SqlitePool;
use std::str::FromStr;
use std::sync::Arc;
use std::sync::LazyLock;
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::sync::RwLock;

#[derive(Deserialize)]
struct OpenArgs {
  path: String,
  password: String,
}

pub static DB_POOL: LazyLock<Arc<RwLock<Option<SqlitePool>>>> =
  LazyLock::new(|| Arc::new(RwLock::new(None)));

#[tauri::command]
async fn open_db_with_password(args: OpenArgs) -> Result<serde_json::Value, String> {
  let db_path = args.path;
  let password = args.password;

  let conn_str = format!("sqlite://{}", db_path);
  let opts = SqliteConnectOptions::from_str(&conn_str)
    .map_err(|e| format!("conn string parse: {}", e))?
    .create_if_missing(true);

  let pool = SqlitePoolOptions::new()
    .max_connections(5)
    .after_connect({
      let key = password.clone();

      move |conn, _meta| {
        let key: String = key.clone();
        Box::pin(async move {
          let escaped_key: String = key.replace('\'', "''");
          let pragma: String = format!("PRAGMA key = '{}';", escaped_key);

          sqlx::query(&pragma).execute(conn).await.map(|_| ())
        })
      }
    })
    .connect_with(opts)
    .await
    .map_err(|e| format!("db connect: {}", e))?;

  let check = sqlx::query_scalar::<_, Option<String>>("PRAGMA cipher_version;")
    .fetch_one(&pool)
    .await
    .map_err(|e| format!("cipher_version check failed: {}", e))?;

  println!("Creating database tables...");
  create_tables(&pool)
    .await
    .map_err(|e| format!("Failed to create tables: {}", e))?;

  println!("Setting DB_POOL...");
  {
    let mut pool_guard = DB_POOL.write().await;
    *pool_guard = Some(pool);
  }

  println!("Database initialization successful!");
  Ok(serde_json::json!({ "success": true, "cipher_version": check }))
}

/// Create all required tables for the application
async fn create_tables(pool: &SqlitePool) -> Result<(), sqlx::Error> {
  // Create Listings table
  sqlx::query(
    r#"
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address TEXT NOT NULL,
      contact_email TEXT,
      contact_phone TEXT,
      contact_other TEXT,
      source_link TEXT NOT NULL,
      price_rent DECIMAL(10,2) NOT NULL,
      housing_type TEXT,
      lease_type TEXT,
      upfront_fees DECIMAL(10,2),
      utilities TEXT, -- JSON array of utilities
      credit_score_min INTEGER,
      minimum_income DECIMAL(10,2),
      references_required BOOLEAN DEFAULT 0,
      reference_document_ids TEXT, -- JSON array of document IDs
      bedrooms INTEGER,
      bathrooms DECIMAL(3,1),
      square_footage INTEGER,
      layout_description TEXT,
      amenities TEXT, -- JSON array of amenities
      pet_policy TEXT,
      furnishing TEXT,
      notes TEXT,
      favorite BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    "#,
  )
  .execute(pool)
  .await?;

  // Create Profile table
  sqlx::query(
    r#"
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullname TEXT,
      date_of_birth DATE,
      gender TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      monthly_income INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    "#,
  )
  .execute(pool)
  .await?;

  // Create Income Source table
  sqlx::query(
    r#"
    CREATE TABLE IF NOT EXISTS income_sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER,
        source TEXT NOT NULL,
        employer_name TEXT,
        job_title TEXT,
        employment_length TEXT,
        employer_contact TEXT,
        FOREIGN KEY(profile_id) REFERENCES profile(id)
    )
    "#,
  )
  .execute(pool)
  .await?;

  // Create Monthly Income table
  // sqlx::query(
  //   r#"
  //   CREATE TABLE IF NOT EXISTS monthly_income (
  //     profile_id INTEGER PRIMARY KEY,
  //     monthly_income INTEGER,
  //     FOREIGN KEY(profile_id) REFERENCES profile(id)
  //   )
  //   "#,
  // )
  // .execute(pool)
  // .await?;

  // Create Documents table
  sqlx::query(
    r#"
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      document_type TEXT NOT NULL,
      reminder_date DATETIME,
      mime_type TEXT,
      data BLOB,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    "#,
  )
  .execute(pool)
  .await?;

  // Create Checklists table
  sqlx::query(
    r#"
    CREATE TABLE IF NOT EXISTS checklists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      is_checked BOOLEAN DEFAULT 0,
      task_name TEXT NOT NULL,
      document_references TEXT, -- filename or embedded link
      reminder_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    "#,
  )
  .execute(pool)
  .await?;

  // AdditionalInfo table
  sqlx::query(
    r#"
    CREATE TABLE IF NOT EXISTS additional_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      icon TEXT 
    )
    "#,
  )
  .execute(pool)
  .await?;

  // Insert a default profile if none exists
  sqlx::query(
    r#"
    INSERT OR IGNORE INTO profile (id, fullname, date_of_birth, gender, phone, email, address, monthly_income)
    VALUES (1, '', '', '', '', '', '', 0)
    "#,
  )
  .execute(pool)
  .await?;

  // Create triggers to update the updated_at column
  sqlx::query(
    r#"
    CREATE TRIGGER IF NOT EXISTS update_listings_updated_at
    AFTER UPDATE ON listings
    FOR EACH ROW
    BEGIN
      UPDATE listings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
    "#,
  )
  .execute(pool)
  .await?;

  sqlx::query(
    r#"
    CREATE TRIGGER IF NOT EXISTS update_profile_updated_at
    AFTER UPDATE ON profile
    FOR EACH ROW
    BEGIN
      UPDATE profile SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
    "#,
  )
  .execute(pool)
  .await?;

  sqlx::query(
    r#"
    CREATE TRIGGER IF NOT EXISTS update_documents_updated_at
    AFTER UPDATE ON documents
    FOR EACH ROW
    BEGIN
      UPDATE documents SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
    "#,
  )
  .execute(pool)
  .await?;

  sqlx::query(
    r#"
    CREATE TRIGGER IF NOT EXISTS update_checklists_updated_at
    AFTER UPDATE ON checklists
    FOR EACH ROW
    BEGIN
      UPDATE checklists SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
    "#,
  )
  .execute(pool)
  .await?;

  Ok(())
}

#[derive(Serialize, Deserialize)]
struct Listing {
  id: Option<i64>,
  address: String,
  contact_email: Option<String>,
  contact_phone: Option<String>,
  contact_other: Option<String>,
  source_link: String,
  price_rent: f64,
  housing_type: Option<String>,
  lease_type: Option<String>,
  upfront_fees: Option<f64>,
  utilities: Option<String>,
  credit_score_min: Option<i32>,
  minimum_income: Option<f64>,
  references_required: Option<bool>,
  reference_document_ids: Option<String>,
  bedrooms: Option<i32>,
  bathrooms: Option<f64>,
  square_footage: Option<i32>,
  layout_description: Option<String>,
  amenities: Option<String>,
  pet_policy: Option<String>,
  furnishing: Option<String>,
  notes: Option<String>,
  favorite: Option<bool>,
  created_at: Option<String>,
  updated_at: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct Profile {
  id: Option<i64>,
  fullname: Option<String>,
  date_of_birth: Option<String>,
  gender: Option<String>,
  phone: Option<String>,
  email: Option<String>,
  address: Option<String>,
  created_at: Option<String>,
  updated_at: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct Document {
  id: Option<i64>,
  name: String,
  document_type: String,
  reminder_date: Option<String>,
  mime_type: Option<String>,
  data: Option<Vec<u8>>,
  updated_at: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct IncomeSource {
  id: Option<i64>,
  // profile_id: Option<i64>,
  source: String,
  employer_name: String,
  job_title: String,
  employment_length: String,
  employer_contact: String,
}

// #[derive(Serialize, Deserialize)]
// struct MonthlyIncome {
//   profile_id: Option<i64>,
//   monthly_income: f64,
// }

#[derive(Serialize, Deserialize)]
struct Checklist {
  id: Option<i64>,
  is_checked: bool,
  task_name: String,
  document_references: Option<String>,
  reminder_date: Option<String>,
  created_at: Option<String>,
  updated_at: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct AdditionalInfoItem {
  id: String,
  label: String,
  value: String,
  icon: Option<String>,
}

/// Initialize database with user password
#[tauri::command]
async fn initialize_user_database(
  app_handle: tauri::AppHandle,
  password: String,
) -> Result<serde_json::Value, String> {
  use tauri::Manager;

  let app_data_dir = app_handle
    .path()
    .app_data_dir()
    .map_err(|e| format!("Failed to get app data directory: {}", e))?;

  std::fs::create_dir_all(&app_data_dir)
    .map_err(|e| format!("Failed to create app data directory: {}", e))?;

  let db_path = app_data_dir.join("sase.db");

  println!("Database path: {:?}", db_path);

  let args = OpenArgs {
    path: db_path.to_string_lossy().to_string(),
    password,
  };

  open_db_with_password(args).await
}

#[tauri::command]
async fn delete_database(app_handle: tauri::AppHandle) -> Result<(), String> {
  use tauri::Manager;

  // Close and clear the database pool
  {
    let mut pool_guard = DB_POOL.write().await;
    if let Some(pool) = pool_guard.take() {
      pool.close().await;
    }
  }

  tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

  let app_data_dir = app_handle
    .path()
    .app_data_dir()
    .map_err(|e| format!("Failed to get app data directory: {}", e))?;

  let db_file_path = app_data_dir.join("sase.db");

  if db_file_path.exists() {
    #[cfg(unix)]
    {
      use std::os::unix::fs::PermissionsExt;
      if let Ok(metadata) = std::fs::metadata(&db_file_path) {
        let mut perms = metadata.permissions();
        perms.set_mode(0o666);
        let _ = std::fs::set_permissions(&db_file_path, perms);
      }
    }

    std::fs::remove_file(&db_file_path).map_err(|e| {
      format!(
        "Failed to delete database file '{}': {} (Error code: {})",
        db_file_path.display(),
        e,
        e.raw_os_error().unwrap_or(-1)
      )
    })?;
    println!("Database file deleted successfully: {:?}", db_file_path);
  } else {
    println!("Database file does not exist: {:?}", db_file_path);
  }

  Ok(())
}

#[tauri::command]
fn get_database_info(app_handle: tauri::AppHandle) -> Result<serde_json::Value, String> {
  use tauri::Manager;

  let app_data_dir = app_handle
    .path()
    .app_data_dir()
    .map_err(|e| format!("Failed to get app data directory: {}", e))?;

  let db_file_path = app_data_dir.join("sase.db");

  if db_file_path.exists() {
    match std::fs::metadata(&db_file_path) {
      Ok(metadata) => {
        let permissions = metadata.permissions();

        #[cfg(unix)]
        let permissions_info = {
          use std::os::unix::fs::PermissionsExt;
          format!("{:o}", permissions.mode())
        };

        #[cfg(windows)]
        let permissions_info = {
          if permissions.readonly() {
            "readonly".to_string()
          } else {
            "read-write".to_string()
          }
        };

        #[cfg(not(any(unix, windows)))]
        let permissions_info = "unknown".to_string();

        Ok(serde_json::json!({
          "exists": true,
          "path": db_file_path.to_string_lossy(),
          "size": metadata.len(),
          "permissions": permissions_info,
          "readonly": permissions.readonly(),
          "is_file": metadata.is_file()
        }))
      }
      Err(e) => Ok(serde_json::json!({
        "exists": true,
        "path": db_file_path.to_string_lossy(),
        "error": format!("Failed to get metadata: {}", e)
      })),
    }
  } else {
    Ok(serde_json::json!({
      "exists": false,
      "path": db_file_path.to_string_lossy()
    }))
  }
}

#[tauri::command]
fn greet() -> String {
  let now = SystemTime::now();
  let epoch_ms = now.duration_since(UNIX_EPOCH).unwrap().as_millis();

  format!("Hello world from Rust! Current epoch: {epoch_ms}")
}

#[tauri::command]
fn get_environment_variable(name: &str) -> String {
  std::env::var(name).unwrap_or_else(|_| "".to_string())
}

#[tauri::command]
fn some_command() {
  println!("This is a command");
}

// add new commands here
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_http::init())
    .invoke_handler(tauri::generate_handler![
      get_environment_variable,
      greet,
      open_db_with_password,
      initialize_user_database,
      some_command,
      delete_database,
      get_database_info,
      profile::add_income_source,
      profile::get_income_sources,
      profile::delete_income_source,
      profile::get_monthly_income,
      profile::set_monthly_income,
      profile::get_user_profile,
      profile::set_user_profile,
      profile::get_additional_info,
      profile::set_additional_info,
      profile::delete_additional_info,
      listings::add_listing,
      listings::get_listings,
      listings::get_listing,
      listings::delete_listing,
      listings::get_listing_notes,
      listings::set_listing_notes,
      listings::update_listing,
      listings::toggle_listing_favorite,
      listings::set_listing_favorite,
      document::get_documents,
      document::add_document,
      document::read_file_as_blob,
      document::delete_document,
      document::test_pdf_generation,
      document::build_pdf_with_sase_api,
      checklist::get_checklists,
      checklist::add_checklist,
      checklist::update_checklist,
      checklist::delete_checklist,
      checklist::toggle_checklist_completion,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
