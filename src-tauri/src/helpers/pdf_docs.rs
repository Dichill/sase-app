use anyhow::{anyhow, Result};
use lopdf::{dictionary, Document};

/// Converts an image blob to a single-page A4 PDF with 15mm margins
///
/// # Arguments
/// * `image_data` - Raw image bytes
///
/// # Returns
/// * `Result<Vec<u8>>` - PDF bytes or error
///
/// # Details
/// - Creates A4 page (210×297 mm) with 15mm margins
/// - Scales image proportionally to fit within content area
/// - Centers the image on the page
///
/// Note: This is a simplified implementation that creates a basic PDF structure.
/// For production use, consider using a more robust PDF creation library.
pub fn image_to_single_page_pdf_bytes(image_data: &[u8]) -> Result<Vec<u8>> {
  // Decode the image using the image crate
  let img =
    ::image::load_from_memory(image_data).map_err(|e| anyhow!("Failed to decode image: {}", e))?;

  // A4 dimensions in points (1 mm = 2.834645669 points)
  const A4_WIDTH_PT: f64 = 595.276; // 210 mm
  const A4_HEIGHT_PT: f64 = 841.890; // 297 mm
  const MARGIN_PT: f64 = 42.520; // 15 mm

  // Content area after margins
  let content_width_pt = A4_WIDTH_PT - (2.0 * MARGIN_PT);
  let content_height_pt = A4_HEIGHT_PT - (2.0 * MARGIN_PT);

  // Get image dimensions
  let img_width = img.width() as f64;
  let img_height = img.height() as f64;

  // Calculate scaling to fit within content area while maintaining aspect ratio
  let scale_x = content_width_pt / img_width;
  let scale_y = content_height_pt / img_height;
  let scale = scale_x.min(scale_y); // Use smaller scale to fit both dimensions

  // Calculate final image dimensions
  let final_width = img_width * scale;
  let final_height = img_height * scale;

  // Calculate centering offsets
  let x_offset = MARGIN_PT + (content_width_pt - final_width) / 2.0;
  let y_offset = MARGIN_PT + (content_height_pt - final_height) / 2.0;

  // Convert image to JPEG bytes for embedding in PDF
  let mut jpeg_bytes = Vec::new();
  let rgb_img = img.to_rgb8();

  // Use image crate to encode as JPEG
  let mut cursor = std::io::Cursor::new(&mut jpeg_bytes);
  rgb_img
    .write_to(&mut cursor, ::image::ImageFormat::Jpeg)
    .map_err(|e| anyhow!("Failed to encode image as JPEG: {}", e))?;

  // Create a basic PDF structure using lopdf
  let mut doc = Document::with_version("1.5");

  // Create image XObject
  let image_dict = dictionary! {
      "Type" => "XObject",
      "Subtype" => "Image",
      "Width" => img.width() as i64,
      "Height" => img.height() as i64,
      "ColorSpace" => "DeviceRGB",
      "BitsPerComponent" => 8_i64,
      "Filter" => "DCTDecode",
      "Length" => jpeg_bytes.len() as i64,
  };

  let image_stream = lopdf::Stream::new(image_dict, jpeg_bytes);
  let image_id = doc.add_object(lopdf::Object::Stream(image_stream));

  // Create resource dictionary
  let resources_dict = dictionary! {
      "XObject" => dictionary! {
          "Im1" => lopdf::Object::Reference(image_id),
      },
  };
  let resources_id = doc.add_object(lopdf::Object::Dictionary(resources_dict));

  // Create content stream that draws the image
  let content_stream = format!(
    "q\n{} 0 0 {} {} {} cm\n/Im1 Do\nQ\n",
    final_width, final_height, x_offset, y_offset
  );

  let content_dict = dictionary! {
      "Length" => content_stream.len() as i64,
  };
  let content_stream_obj = lopdf::Stream::new(content_dict, content_stream.into_bytes());
  let content_id = doc.add_object(lopdf::Object::Stream(content_stream_obj));

  // Create page dictionary
  let page_dict = dictionary! {
      "Type" => "Page",
      "MediaBox" => vec![0.into(), 0.into(), A4_WIDTH_PT.into(), A4_HEIGHT_PT.into()],
      "Resources" => lopdf::Object::Reference(resources_id),
      "Contents" => lopdf::Object::Reference(content_id),
  };
  let page_id = doc.add_object(lopdf::Object::Dictionary(page_dict));

  // Create pages dictionary
  let pages_dict = dictionary! {
      "Type" => "Pages",
      "Count" => 1_i64,
      "Kids" => vec![lopdf::Object::Reference(page_id)],
  };
  let pages_id = doc.add_object(lopdf::Object::Dictionary(pages_dict));

  // Set parent reference for the page
  if let Ok(lopdf::Object::Dictionary(ref mut page_dict)) = doc.get_object_mut(page_id) {
    page_dict.set("Parent", lopdf::Object::Reference(pages_id));
  }

  // Create catalog
  let catalog_dict = dictionary! {
      "Type" => "Catalog",
      "Pages" => lopdf::Object::Reference(pages_id),
  };
  let catalog_id = doc.add_object(lopdf::Object::Dictionary(catalog_dict));

  // Set root reference in trailer
  doc
    .trailer
    .set("Root", lopdf::Object::Reference(catalog_id));

  // Save PDF to bytes
  let mut output = Vec::new();
  doc
    .save_to(&mut std::io::Cursor::new(&mut output))
    .map_err(|e| anyhow!("Failed to save PDF: {}", e))?;

  Ok(output)
}

/// Merges mixed content types (images and PDFs) into a single PDF
///
/// # Arguments
/// * `files` - Vector of (MIME type, file bytes) tuples
///
/// # Returns
/// * `Result<Vec<u8>>` - Merged PDF bytes or error
///
/// # Supported MIME types
/// - `image/*` - Converted to PDF using image_to_single_page_pdf_bytes
/// - `application/pdf` or `application/x-pdf` - Validated and included as-is
/// - Others - Return error
pub fn merge_mixed_to_pdf(files: Vec<(String, Vec<u8>)>) -> Result<Vec<u8>> {
  if files.is_empty() {
    return Err(anyhow!("No files provided for merging"));
  }

  let mut pdf_bytes_list: Vec<Vec<u8>> = Vec::new();

  // Process each file based on MIME type
  for (mime_type, file_data) in files {
    if mime_type.starts_with("image/") {
      // Convert image to PDF
      let pdf_bytes = image_to_single_page_pdf_bytes(&file_data)
        .map_err(|e| anyhow!("Failed to convert image to PDF: {}", e))?;
      pdf_bytes_list.push(pdf_bytes);
    } else if mime_type == "application/pdf" || mime_type == "application/x-pdf" {
      // Validate PDF by attempting to load it
      let _pdf_doc = Document::load_mem(&file_data)
        .map_err(|e| anyhow!("Failed to load PDF document: {}", e))?;
      pdf_bytes_list.push(file_data);
    } else {
      return Err(anyhow!("Unsupported MIME type: {}", mime_type));
    }
  }

  // If only one document, return it as-is
  if pdf_bytes_list.len() == 1 {
    return Ok(pdf_bytes_list.into_iter().next().unwrap());
  }

  // Merge multiple PDFs using lopdf
  let mut merged_doc = Document::with_version("1.5");
  let mut all_page_ids = Vec::new();

  for pdf_bytes in pdf_bytes_list {
    let doc = Document::load_mem(&pdf_bytes)
      .map_err(|e| anyhow!("Failed to load PDF for merging: {}", e))?;

    // Get all page IDs from the document
    let pages_map = doc.get_pages();
    let page_ids: Vec<_> = pages_map.keys().cloned().collect();

    // Copy pages and their resources to merged document
    for &page_id in &page_ids {
      // Copy the page object
      if let Ok(page_object) = doc.get_object((page_id, 0)) {
        let new_page_id = merged_doc.add_object(page_object.clone());
        all_page_ids.push(new_page_id);

        // Copy referenced objects (resources, contents, etc.)
        if let lopdf::Object::Dictionary(ref page_dict) = page_object {
          // Copy resources if they exist
          if let Ok(resources_ref) = page_dict.get(b"Resources") {
            if let lopdf::Object::Reference((ref_id, gen)) = resources_ref {
              if let Ok(resources_obj) = doc.get_object((*ref_id, *gen)) {
                let new_resources_id = merged_doc.add_object(resources_obj.clone());
                // Update the page to reference the new resources
                if let Ok(lopdf::Object::Dictionary(ref mut new_page_dict)) =
                  merged_doc.get_object_mut(new_page_id)
                {
                  new_page_dict.set("Resources", lopdf::Object::Reference(new_resources_id));
                }
              }
            }
          }

          // Copy contents if they exist
          if let Ok(contents_ref) = page_dict.get(b"Contents") {
            if let lopdf::Object::Reference((ref_id, gen)) = contents_ref {
              if let Ok(contents_obj) = doc.get_object((*ref_id, *gen)) {
                let new_contents_id = merged_doc.add_object(contents_obj.clone());
                // Update the page to reference the new contents
                if let Ok(lopdf::Object::Dictionary(ref mut new_page_dict)) =
                  merged_doc.get_object_mut(new_page_id)
                {
                  new_page_dict.set("Contents", lopdf::Object::Reference(new_contents_id));
                }
              }
            }
          }
        }
      }
    }
  }

  // Create pages dictionary
  if !all_page_ids.is_empty() {
    let pages_dict = dictionary! {
        "Type" => "Pages",
        "Count" => all_page_ids.len() as i64,
        "Kids" => all_page_ids.iter().map(|id| lopdf::Object::Reference(*id)).collect::<Vec<_>>(),
    };
    let pages_id = merged_doc.add_object(lopdf::Object::Dictionary(pages_dict));

    // Update parent references for all pages
    for page_id in &all_page_ids {
      if let Ok(lopdf::Object::Dictionary(ref mut page_dict)) = merged_doc.get_object_mut(*page_id)
      {
        page_dict.set("Parent", lopdf::Object::Reference(pages_id));
      }
    }

    // Create catalog
    let catalog_dict = dictionary! {
        "Type" => "Catalog",
        "Pages" => lopdf::Object::Reference(pages_id),
    };
    let catalog_id = merged_doc.add_object(lopdf::Object::Dictionary(catalog_dict));
    merged_doc
      .trailer
      .set("Root", lopdf::Object::Reference(catalog_id));
  }

  // Save merged document to bytes
  let mut output = Vec::new();
  merged_doc
    .save_to(&mut std::io::Cursor::new(&mut output))
    .map_err(|e| anyhow!("Failed to save merged PDF: {}", e))?;

  Ok(output)
}
