// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use anyhow::Result;
use serde::{Deserialize, Serialize};
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::{Row, SqlitePool};
use std::str::FromStr;
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::sync::OnceCell;

#[derive(Deserialize)]
struct OpenArgs {
  path: String,
  password: String,
}

static DB_POOL: OnceCell<SqlitePool> = OnceCell::const_new();

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

  create_tables(&pool)
    .await
    .map_err(|e| format!("Failed to create tables: {}", e))?;

  let _ = DB_POOL.set(pool);

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
      lease_type TEXT CHECK (lease_type IN ('month-to-month', 'annual')),
      upfront_fees DECIMAL(10,2),
      utilities TEXT, -- JSON array of utilities
      credit_score_min INTEGER,
      minimum_income DECIMAL(10,2),
      references_required BOOLEAN DEFAULT 0,
      bedrooms INTEGER,
      bathrooms DECIMAL(3,1),
      square_footage INTEGER,
      layout_description TEXT,
      amenities TEXT, -- JSON array of amenities
      pet_policy TEXT,
      furnishing TEXT CHECK (furnishing IN ('furnished', 'unfurnished', 'semi-furnished')),
      notes TEXT,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    "#,
  )
  .execute(pool)
  .await?;

  // Create Documents table
  sqlx::query(
    r#"
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      document_type TEXT NOT NULL CHECK (document_type IN ('ID Card', 'Drivers License', 'Passport', 'Other')),
      reminder_date DATETIME,
      document_references TEXT, -- filename with extension
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
  bedrooms: Option<i32>,
  bathrooms: Option<f64>,
  square_footage: Option<i32>,
  layout_description: Option<String>,
  amenities: Option<String>,
  pet_policy: Option<String>,
  furnishing: Option<String>,
  notes: Option<String>,
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
  document_references: Option<String>,
  updated_at: Option<String>,
}

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

/// Initialize database with user password
#[tauri::command]
async fn initialize_user_database(
  email: String,
  password: String,
) -> Result<serde_json::Value, String> {
  let sanitized_email = email.replace(['@', '.', '+'], "_");
  let db_path = format!("user_data_{}.db", sanitized_email);

  let args = OpenArgs {
    path: db_path.clone(),
    password,
  };

  open_db_with_password(args).await
}

/// Add a new listing
#[tauri::command]
async fn add_listing(listing: Listing) -> Result<i64, String> {
  let pool = DB_POOL.get().ok_or("Database not initialized")?;

  let result = sqlx::query(
    r#"
    INSERT INTO listings (
      address, contact_email, contact_phone, contact_other, source_link, price_rent,
      housing_type, lease_type, upfront_fees, utilities, credit_score_min, minimum_income,
      references_required, bedrooms, bathrooms, square_footage, layout_description,
      amenities, pet_policy, furnishing, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    "#,
  )
  .bind(&listing.address)
  .bind(&listing.contact_email)
  .bind(&listing.contact_phone)
  .bind(&listing.contact_other)
  .bind(&listing.source_link)
  .bind(listing.price_rent)
  .bind(&listing.housing_type)
  .bind(&listing.lease_type)
  .bind(listing.upfront_fees)
  .bind(&listing.utilities)
  .bind(listing.credit_score_min)
  .bind(listing.minimum_income)
  .bind(listing.references_required)
  .bind(listing.bedrooms)
  .bind(listing.bathrooms)
  .bind(listing.square_footage)
  .bind(&listing.layout_description)
  .bind(&listing.amenities)
  .bind(&listing.pet_policy)
  .bind(&listing.furnishing)
  .bind(&listing.notes)
  .execute(pool)
  .await
  .map_err(|e| format!("Failed to insert listing: {}", e))?;

  Ok(result.last_insert_rowid())
}

/// Get all listings
#[tauri::command]
async fn get_listings() -> Result<Vec<Listing>, String> {
  let pool = DB_POOL.get().ok_or("Database not initialized")?;

  let rows = sqlx::query(
    r#"
    SELECT 
      id, address, contact_email, contact_phone, contact_other, source_link, 
      price_rent, housing_type, lease_type, upfront_fees, utilities, 
      credit_score_min, minimum_income, references_required, bedrooms, 
      bathrooms, square_footage, layout_description, amenities, pet_policy, 
      furnishing, notes, created_at, updated_at
    FROM listings 
    ORDER BY created_at DESC
    "#,
  )
  .fetch_all(pool)
  .await
  .map_err(|e| format!("Failed to fetch listings: {}", e))?;

  let mut listings = Vec::new();
  for row in rows {
    listings.push(Listing {
      id: row.try_get("id").ok(),
      address: row.try_get("address").unwrap_or_default(),
      contact_email: row.try_get("contact_email").ok(),
      contact_phone: row.try_get("contact_phone").ok(),
      contact_other: row.try_get("contact_other").ok(),
      source_link: row.try_get("source_link").unwrap_or_default(),
      price_rent: row.try_get("price_rent").unwrap_or(0.0),
      housing_type: row.try_get("housing_type").ok(),
      lease_type: row.try_get("lease_type").ok(),
      upfront_fees: row.try_get("upfront_fees").ok(),
      utilities: row.try_get("utilities").ok(),
      credit_score_min: row.try_get("credit_score_min").ok(),
      minimum_income: row.try_get("minimum_income").ok(),
      references_required: row.try_get("references_required").ok(),
      bedrooms: row.try_get("bedrooms").ok(),
      bathrooms: row.try_get("bathrooms").ok(),
      square_footage: row.try_get("square_footage").ok(),
      layout_description: row.try_get("layout_description").ok(),
      amenities: row.try_get("amenities").ok(),
      pet_policy: row.try_get("pet_policy").ok(),
      furnishing: row.try_get("furnishing").ok(),
      notes: row.try_get("notes").ok(),
      created_at: row.try_get("created_at").ok(),
      updated_at: row.try_get("updated_at").ok(),
    });
  }

  Ok(listings)
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_http::init())
    .invoke_handler(tauri::generate_handler![
      get_environment_variable,
      greet,
      open_db_with_password,
      initialize_user_database,
      add_listing,
      get_listings
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
