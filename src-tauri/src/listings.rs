use crate::Listing;
use crate::DB_POOL;
use sqlx::Row;

/// Add a new listing
#[tauri::command]
pub async fn add_listing(listing: Listing) -> Result<i64, String> {
  println!("add_listing called with address: {}", listing.address);
  let db_pool = DB_POOL.get().ok_or("Database not initialized")?;
  let pool_guard = db_pool.lock().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;
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
pub async fn get_listings() -> Result<Vec<Listing>, String> {
  println!("get_listings called");
  let db_pool = DB_POOL.get().ok_or("Database not initialized")?;
  let pool_guard = db_pool.lock().await;
  let pool = pool_guard.as_ref().ok_or("Database not initialized")?;

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
