use crate::Listing;
use crate::DB_POOL;
use sqlx::Row;

/// Add a new listing
#[tauri::command]
pub async fn add_listing(listing: Listing) -> Result<i64, String> {
  println!("add_listing called with address: {}", listing.address);
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;
  let result = sqlx::query(
    r#"
    INSERT INTO listings (
      address, contact_email, contact_phone, contact_other, source_link, price_rent,
      housing_type, lease_type, upfront_fees, utilities, credit_score_min, minimum_income,
      references_required, reference_document_ids, bedrooms, bathrooms, square_footage, layout_description,
      amenities, pet_policy, furnishing, notes, favorite
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
  .bind(&listing.reference_document_ids)
  .bind(listing.bedrooms)
  .bind(listing.bathrooms)
  .bind(listing.square_footage)
  .bind(&listing.layout_description)
  .bind(&listing.amenities)
  .bind(&listing.pet_policy)
  .bind(&listing.furnishing)
  .bind(&listing.notes)
  .bind(listing.favorite)
  .execute(pool)
  .await
  .map_err(|e| format!("Failed to insert listing: {}", e))?;

  Ok(result.last_insert_rowid())
}

/// Get all listings
#[tauri::command]
pub async fn get_listings() -> Result<Vec<Listing>, String> {
  println!("get_listings called");
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;

  let rows = sqlx::query(
    r#"
    SELECT 
      id, address, contact_email, contact_phone, contact_other, source_link, 
      price_rent, housing_type, lease_type, upfront_fees, utilities, 
      credit_score_min, minimum_income, references_required, reference_document_ids, bedrooms, 
      bathrooms, square_footage, layout_description, amenities, pet_policy, 
      furnishing, notes, favorite, created_at, updated_at
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
      reference_document_ids: row.try_get("reference_document_ids").ok(),
      bedrooms: row.try_get("bedrooms").ok(),
      bathrooms: row.try_get("bathrooms").ok(),
      square_footage: row.try_get("square_footage").ok(),
      layout_description: row.try_get("layout_description").ok(),
      amenities: row.try_get("amenities").ok(),
      pet_policy: row.try_get("pet_policy").ok(),
      furnishing: row.try_get("furnishing").ok(),
      notes: row.try_get("notes").ok(),
      favorite: row.try_get("favorite").ok(),
      created_at: row.try_get("created_at").ok(),
      updated_at: row.try_get("updated_at").ok(),
    });
  }
  Ok(listings)
}

#[tauri::command]
pub async fn get_listing(id: i64) -> Result<Listing, String> {
  println!("get_listing called with id: {}", id);
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;

  let row = sqlx::query(
    r#"
    SELECT 
      id, address, contact_email, contact_phone, contact_other, source_link, 
      price_rent, housing_type, lease_type, upfront_fees, utilities, 
      credit_score_min, minimum_income, references_required, reference_document_ids, bedrooms, 
      bathrooms, square_footage, layout_description, amenities, pet_policy, 
      furnishing, notes, favorite, created_at, updated_at
    FROM listings 
    WHERE id = ?
    "#,
  )
  .bind(id)
  .fetch_one(pool)
  .await
  .map_err(|e| format!("Failed to fetch listing: {}", e))?;

  let listing = Listing {
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
    reference_document_ids: row.try_get("reference_document_ids").ok(),
    bedrooms: row.try_get("bedrooms").ok(),
    bathrooms: row.try_get("bathrooms").ok(),
    square_footage: row.try_get("square_footage").ok(),
    layout_description: row.try_get("layout_description").ok(),
    amenities: row.try_get("amenities").ok(),
    pet_policy: row.try_get("pet_policy").ok(),
    furnishing: row.try_get("furnishing").ok(),
    notes: row.try_get("notes").ok(),
    favorite: row.try_get("favorite").ok(),
    created_at: row.try_get("created_at").ok(),
    updated_at: row.try_get("updated_at").ok(),
  };

  Ok(listing)
}

#[tauri::command]
pub async fn delete_listing(id: i64) -> Result<(), String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;

  let result = sqlx::query("DELETE FROM listings WHERE id = ?")
    .bind(id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to delete listing: {}", e))?;

  if result.rows_affected() == 0 {
    return Err(format!("No listing found with id {}", id));
  }

  Ok(())
}

#[tauri::command]
pub async fn update_listing(
  id: i64,
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
  bathrooms: Option<i32>,
  square_footage: Option<i32>,
  layout_description: Option<String>,
  amenities: Option<String>,
  pet_policy: Option<String>,
  furnishing: Option<String>,
  notes: Option<String>,
  favorite: Option<bool>,
) -> Result<(), String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;

  let result = sqlx::query(
    r#"
    UPDATE listings
    SET 
      address = ?, 
      contact_email = ?, 
      contact_phone = ?, 
      contact_other = ?, 
      source_link = ?, 
      price_rent = ?, 
      housing_type = ?, 
      lease_type = ?, 
      upfront_fees = ?, 
      utilities = ?, 
      credit_score_min = ?, 
      minimum_income = ?, 
      references_required = ?, 
      reference_document_ids = ?,
      bedrooms = ?, 
      bathrooms = ?, 
      square_footage = ?, 
      layout_description = ?, 
      amenities = ?, 
      pet_policy = ?, 
      furnishing = ?, 
      notes = ?,
      favorite = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    "#,
  )
  .bind(&address)
  .bind(&contact_email)
  .bind(&contact_phone)
  .bind(&contact_other)
  .bind(&source_link)
  .bind(price_rent)
  .bind(&housing_type)
  .bind(&lease_type)
  .bind(upfront_fees)
  .bind(&utilities)
  .bind(credit_score_min)
  .bind(minimum_income)
  .bind(references_required)
  .bind(&reference_document_ids)
  .bind(bedrooms)
  .bind(bathrooms)
  .bind(square_footage)
  .bind(&layout_description)
  .bind(&amenities)
  .bind(&pet_policy)
  .bind(&furnishing)
  .bind(&notes)
  .bind(favorite)
  .bind(id)
  .execute(pool)
  .await
  .map_err(|e| format!("Failed to update listing: {}", e))?;
  if result.rows_affected() == 0 {
    return Err(format!("No listing found with id {}", id));
  }
  Ok(())
}

// Get Notes for specified listing
#[tauri::command]
pub async fn get_listing_notes(listing_id: i64) -> Result<String, String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;

  let row = sqlx::query("SELECT notes FROM listings WHERE id = ?")
    .bind(listing_id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to fetch notes: {}", e))?;

  let notes: String = row.try_get("notes").unwrap_or_default();
  Ok(notes)
}

// Set/Update Notes for specified listing
#[tauri::command]
pub async fn set_listing_notes(listing_id: i64, notes: String) -> Result<(), String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;

  let result = sqlx::query("UPDATE listings SET notes = ? WHERE id = ?")
    .bind(&notes)
    .bind(listing_id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to update notes: {}", e))?;

  if result.rows_affected() == 0 {
    return Err(format!("No listing found with id {}", listing_id));
  }

  Ok(())
}

/// Toggle the favorite status of a listing
#[tauri::command]
pub async fn toggle_listing_favorite(listing_id: i64) -> Result<bool, String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;

  // First, get the current favorite status
  let current_favorite: bool =
    sqlx::query_scalar("SELECT COALESCE(favorite, 0) FROM listings WHERE id = ?")
      .bind(listing_id)
      .fetch_one(pool)
      .await
      .map_err(|e| format!("Failed to fetch current favorite status: {}", e))?;

  // Toggle the favorite status
  let new_favorite = !current_favorite;

  let result = sqlx::query("UPDATE listings SET favorite = ? WHERE id = ?")
    .bind(new_favorite)
    .bind(listing_id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to update favorite status: {}", e))?;

  if result.rows_affected() == 0 {
    return Err(format!("No listing found with id {}", listing_id));
  }

  Ok(new_favorite)
}

/// Set the favorite status of a listing
#[tauri::command]
pub async fn set_listing_favorite(listing_id: i64, favorite: bool) -> Result<(), String> {
  let pool_guard = DB_POOL.read().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;

  let result = sqlx::query("UPDATE listings SET favorite = ? WHERE id = ?")
    .bind(favorite)
    .bind(listing_id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to update favorite status: {}", e))?;

  if result.rows_affected() == 0 {
    return Err(format!("No listing found with id {}", listing_id));
  }

  Ok(())
}
