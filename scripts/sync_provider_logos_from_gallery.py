import argparse
import json
import os
import re
import sys
import urllib.request
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
SHEET = ROOT / "UK_Apprenticeship_Competitors_Extract_Corrected_Websites.xlsx"
GALLERY_API = "https://image-uploader.kentbusinesscollege.net/api/images/"
LATEST_BATCH_DATE = "2026-09-23"
MISSING_SHEET_IMAGE_NUMBERS = {38, 39}
GALLERY_NUMBER_BY_SLUG = {
    # These two adjacent images are reversed in the uploaded gallery batch.
    "university-of-derby": 187,
    "university-of-suffolk": 186,
    # The NCG group logo precedes the West Lancashire College logo in the gallery.
    "west-lancashire-college": 195,
}
LOGO_URL_BY_SLUG = {
    # These rows do not have matching images in the uploaded gallery batch.
    "als-training": "https://www.alstraining.org.uk/wp-content/uploads/favicon/favicon.svg",
    "anglia-ruskin-university-aru": "https://www.aru.ac.uk/Assets/img/icons/favicons/android-chrome-512x512.png",
    # Visual checks against official provider websites found uploaded logos from neighbouring rows.
    "activate-learning": "https://www.activatelearning.ac.uk/favicon.svg",
    "aicura": "https://www.accipio.com/wp-content/uploads/2024/05/Accipio_Logo_Indigo_Mobile_NEW.png",
    "heart-of-yorkshire-education-group": "https://www.heartofyorkshire.ac.uk/_images/_logos/lgo-hoy-002.png",
    "lift-schools": "https://cdn.prod.website-files.com/668f964276953a8d446956f4/66d1b773f3c61b3747b91000_L1.png",
    "wirral-metropolitan-college": "https://www.wmc.ac.uk/templates/wmc/images/favicons/favicon.ico",
    # The uploaded gallery batch does not include the West London College logo image.
    "west-london-college": "https://www.wlc.ac.uk/wp-content/themes/C4/assets/images/global/logo.svg",
}
NS = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def normalize_name(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", (value or "").lower().replace("&", "and"))


def column_number(cell_ref: str) -> int:
    match = re.match(r"([A-Z]+)", cell_ref)
    if not match:
        return 0
    number = 0
    for char in match.group(1):
        number = number * 26 + ord(char) - 64
    return number


def read_sheet_rows() -> list[tuple[int, str]]:
    with zipfile.ZipFile(SHEET) as workbook:
        shared_strings = []
        try:
            root = ET.fromstring(workbook.read("xl/sharedStrings.xml"))
            shared_strings = [
                "".join(text.text or "" for text in item.iter(f"{{{NS['a']}}}t"))
                for item in root
            ]
        except KeyError:
            pass

        def cell_value(cell: ET.Element) -> str:
            cell_type = cell.attrib.get("t")
            value = cell.find("a:v", NS)
            if cell_type == "s" and value is not None:
                return shared_strings[int(value.text or "0")]
            if cell_type == "inlineStr":
                return "".join(text.text or "" for text in cell.iter(f"{{{NS['a']}}}t"))
            return value.text if value is not None and value.text is not None else ""

        sheet_root = ET.fromstring(workbook.read("xl/worksheets/sheet1.xml"))
        rows: list[tuple[int, str]] = []
        for row in sheet_root.findall(".//a:sheetData/a:row", NS):
            row_number = int(row.attrib.get("r", "0"))
            if row_number < 5:
                continue
            cells = {
                column_number(cell.attrib["r"]): cell_value(cell).strip()
                for cell in row.findall("a:c", NS)
            }
            provider_name = cells.get(1, "")
            if provider_name:
                rows.append((row_number - 4, provider_name))
        return rows


def read_latest_gallery_images() -> dict[int, str]:
    with urllib.request.urlopen(GALLERY_API, timeout=30) as response:
        payload = json.load(response)

    images = payload.get("images", payload if isinstance(payload, list) else [])
    numbered_images: dict[int, str] = {}
    for image in images:
        title = str(image.get("title", "")).strip()
        created_at = str(image.get("created_at", ""))
        if not created_at.startswith(LATEST_BATCH_DATE) or not re.fullmatch(r"\d+", title):
            continue
        numbered_images[int(title)] = image["image_url"]
    return numbered_images


def setup_django() -> None:
    sys.path.insert(0, str(BACKEND))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    import django

    django.setup()


def gallery_number_for_sheet_number(sheet_number: int) -> int | None:
    if sheet_number in MISSING_SHEET_IMAGE_NUMBERS:
        return None
    skipped_before = sum(1 for missing in MISSING_SHEET_IMAGE_NUMBERS if missing < sheet_number)
    return sheet_number - skipped_before


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Update Company.logo_url in the database.")
    args = parser.parse_args()

    sheet_rows = read_sheet_rows()
    gallery_images = read_latest_gallery_images()

    setup_django()
    from catalog.models import Company

    companies = {normalize_name(company.trading_name): company for company in Company.objects.all()}

    updates = []
    clears = []
    missing_images = []
    missing_companies = []

    for number, provider_name in sheet_rows:
        company = companies.get(normalize_name(provider_name))
        if company is None:
            missing_companies.append((number, provider_name))
            continue

        gallery_number = GALLERY_NUMBER_BY_SLUG.get(company.slug, gallery_number_for_sheet_number(number))
        image_url = LOGO_URL_BY_SLUG.get(company.slug)
        if image_url is None:
            image_url = gallery_images.get(gallery_number) if gallery_number is not None else None
        if not image_url:
            missing_images.append((number, provider_name, company.slug))
            if company.logo_url:
                clears.append(company)
            continue

        if company.logo_url != image_url:
            updates.append((company, image_url, number, provider_name))

    print(f"Sheet providers: {len(sheet_rows)}")
    print(f"Latest numbered gallery images: {len(gallery_images)}")
    print(f"Logo URLs to update: {len(updates)}")
    print(f"Logo URLs to clear: {len(clears)}")
    print(f"Missing images: {len(missing_images)}")
    print(f"Missing companies: {len(missing_companies)}")

    if missing_images:
        print("Missing image numbers:")
        for number, provider_name, slug in missing_images:
            print(f"  {number}: {provider_name} ({slug})")

    if missing_companies:
        print("Missing companies:")
        for number, provider_name in missing_companies:
            print(f"  {number}: {provider_name}")

    if not args.apply:
        print("Dry run only. Re-run with --apply to update the database.")
        return 0

    for company, image_url, _, _ in updates:
        company.logo_url = image_url
        company.save(update_fields=["logo_url", "updated_at"])

    for company in clears:
        company.logo_url = ""
        company.save(update_fields=["logo_url", "updated_at"])

    print(f"Updated {len(updates)} companies.")
    print(f"Cleared {len(clears)} companies.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
