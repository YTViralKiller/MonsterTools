Place your app icon PNGs in this repository so the site can display them in the app cards.

Expected files (relative to repo root):
  assets/icons/crown-quest.png       <-- Crown Quest icon
  assets/icons/grocery-star.png     <-- Grocery Star icon
  assets/icons/medremindr.png       <-- MedRemindr icon

If your images are currently in your Downloads folder, you can copy them with PowerShell (example):

  # Adjust username and file names if necessary
  $src = "C:\\Users\\tmmyb\\Downloads\\Crown Quest Icon.png"
  $dst = "assets\\icons\\crown-quest.png"
  New-Item -ItemType Directory -Force -Path (Split-Path $dst) | Out-Null
  Copy-Item -Path $src -Destination $dst -Force

Repeat for Grocery Star and MedRemindr (use the filenames shown in your Downloads).

Notes:
- Filenames are lowercase and use dashes; you can keep different names but update index.html paths accordingly.
- After copying, the images will be included in the site on next deploy.
