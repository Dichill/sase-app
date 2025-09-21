use anyhow::Result;
use std::fs;
use std::path::Path;

// Import symbols from our Symbol Plan
use printpdf::{
  deserialize::PdfWarnMsg,
  image::{RawImage, RawImageData, RawImageFormat},
  ops::{Op, PdfPage},
  serialize::PdfSaveOptions,
  units::Mm,
  xobject::XObjectTransform,
  PdfDocument,
};

/// Convert image blobs to a multi-page PDF, one image per page
pub fn blobs_to_pdf(blobs: &[Vec<u8>], out: &Path) -> Result<()> {
  if blobs.is_empty() {
    return Err(anyhow::anyhow!("No image blobs provided"));
  }

  // Create a new PDF document using printpdf 0.8.2
  let mut pdf_doc = PdfDocument::new("Generated PDF");
  let mut warnings = Vec::<PdfWarnMsg>::new();

  for (i, blob) in blobs.iter().enumerate() {
    if blob.len() > 50 * 1024 * 1024 {
      return Err(anyhow::anyhow!(
        "Image {} is too large: {} bytes (max 50MB)",
        i,
        blob.len()
      ));
    }

    let dynamic_image = image::load_from_memory(blob)
      .map_err(|e| anyhow::anyhow!("Failed to decode image {} with image crate: {}", i, e))?;

    let rgba_image = dynamic_image.to_rgba8();
    let width = rgba_image.width() as usize;
    let height = rgba_image.height() as usize;
    let raw_data = rgba_image.into_raw();

    let raw_image = RawImage {
      width: width,
      height: height,
      pixels: RawImageData::U8(raw_data),
      data_format: RawImageFormat::RGBA8,
      tag: Vec::new(),
    };

    let image_id = pdf_doc.add_image(&raw_image);

    let a4_width = Mm(210.0);
    let a4_height = Mm(297.0);
    let image_width_mm = (width as f32) * 0.352778;
    let image_height_mm = (height as f32) * 0.352778;

    let mut ops = Vec::new();
    let scale_x = a4_width.0 / image_width_mm;
    let scale_y = a4_height.0 / image_height_mm;
    let scale = scale_x.min(scale_y) * 0.9;

    let scaled_width = image_width_mm * scale;
    let scaled_height = image_height_mm * scale;
    let translate_x = (a4_width.0 - scaled_width) / 2.0;
    let translate_y = (a4_height.0 - scaled_height) / 2.0;

    let transform = XObjectTransform {
      translate_x: Some(Mm(translate_x).into()),
      translate_y: Some(Mm(translate_y).into()),
      rotate: None,
      scale_x: Some(scale),
      scale_y: Some(scale),
      dpi: Some(72.0),
    };

    ops.push(Op::UseXobject {
      id: image_id,
      transform,
    });

    let page = PdfPage::new(a4_width, a4_height, ops);
    pdf_doc.pages.push(page);
  }

  let save_options = PdfSaveOptions::default();
  let pdf_bytes = pdf_doc.save(&save_options, &mut warnings);

  fs::write(out, pdf_bytes)
    .map_err(|e| anyhow::anyhow!("Failed to write PDF to {}: {}", out.display(), e))?;

  Ok(())
}

pub async fn merge_pdfs_via_sase_api(
  base_pdf_bytes: Vec<u8>,
  additional_pdf_bytes: Vec<Vec<u8>>,
  jwt_token: &str,
) -> Result<Vec<u8>> {
  let api_endpoint = "https://drakoindustries.com/api/sase/pdf/merge";

  let client = reqwest::Client::new();
  let mut form = reqwest::multipart::Form::new();

  let base_part = reqwest::multipart::Part::bytes(base_pdf_bytes)
    .file_name("base-document.pdf")
    .mime_str("application/pdf")
    .map_err(|e| anyhow::anyhow!("Failed to create base PDF part: {}", e))?;
  form = form.part("basePdf", base_part);

  for (i, pdf_bytes) in additional_pdf_bytes.iter().enumerate() {
    let filename = format!("additional-{}.pdf", i + 1);
    let part = reqwest::multipart::Part::bytes(pdf_bytes.clone())
      .file_name(filename)
      .mime_str("application/pdf")
      .map_err(|e| anyhow::anyhow!("Failed to create additional PDF part {}: {}", i, e))?;
    form = form.part("additionalPdfs", part);
  }
  let response = client
    .post(api_endpoint)
    .header("Authorization", format!("Bearer {}", jwt_token))
    .multipart(form)
    .send()
    .await
    .map_err(|e| anyhow::anyhow!("Failed to send merge request: {}", e))?;

  if !response.status().is_success() {
    let status = response.status();
    let error_text = response
      .text()
      .await
      .unwrap_or_else(|_| "Unknown error".to_string());

    match status.as_u16() {
      401 => {
        return Err(anyhow::anyhow!(
          "Authentication failed: Invalid or expired JWT token"
        ))
      }
      403 => return Err(anyhow::anyhow!("Access denied: Insufficient permissions")),
      413 => {
        return Err(anyhow::anyhow!(
          "Request too large: PDF files exceed size limit"
        ))
      }
      _ => {
        return Err(anyhow::anyhow!(
          "SASE API returned error {}: {}",
          status,
          error_text
        ))
      }
    }
  }

  let merged_pdf_bytes = response
    .bytes()
    .await
    .map_err(|e| anyhow::anyhow!("Failed to read response bytes: {}", e))?;

  Ok(merged_pdf_bytes.to_vec())
}

pub async fn merge_mixed_to_pdf_via_sase_api(
  first_pdf: Vec<u8>,
  additional_blobs: Vec<Vec<u8>>,
  jwt_token: &str,
) -> Result<Vec<u8>> {
  use std::env;

  if additional_blobs.is_empty() {
    return Ok(first_pdf);
  }

  let temp_dir = env::temp_dir();
  let temp_blob_pdf = temp_dir.join("temp_sase_api_blobs.pdf");

  blobs_to_pdf(&additional_blobs, &temp_blob_pdf)?;

  let image_pdf_bytes = fs::read(&temp_blob_pdf)
    .map_err(|e| anyhow::anyhow!("Failed to read generated image PDF: {}", e))?;

  let merged_bytes = merge_pdfs_via_sase_api(first_pdf, vec![image_pdf_bytes], jwt_token).await?;

  let _ = fs::remove_file(&temp_blob_pdf);

  Ok(merged_bytes)
}

pub fn create_test_pdf(out: &Path) -> Result<()> {
  let mut pdf_doc = PdfDocument::new("Test PDF");
  let mut warnings = Vec::<PdfWarnMsg>::new();

  let page_width = Mm(210.0);
  let page_height = Mm(297.0);
  let ops = Vec::new();

  let page = PdfPage::new(page_width, page_height, ops);
  pdf_doc.pages.push(page);

  let save_options = PdfSaveOptions::default();
  let pdf_bytes = pdf_doc.save(&save_options, &mut warnings);

  fs::write(out, pdf_bytes)
    .map_err(|e| anyhow::anyhow!("Failed to write test PDF to {}: {}", out.display(), e))?;

  Ok(())
}
