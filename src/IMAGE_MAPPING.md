# Image Asset Mapping for Xcode/iOS Export

This document maps the original Figma asset hashes to semantic filenames for local storage.

## How to Use This Document

1. **Export images from Figma Make** - Use the export/download feature to get all PNG files
2. **Find each image** - Match the hash filename to the "Original Hash" column below
3. **Rename the file** - Use the "New Semantic Name" from the table
4. **Place in folder** - Put all renamed files in `/public/assets/images/`

## Complete Image Mapping

| # | Original Hash Filename | New Semantic Name | Description | Used In |
|---|------------------------|-------------------|-------------|---------|
| 1 | `557e4ca658e2ff37cf2dda18e4534c106ec861c0.png` | `stylist-photo-1.png` | Stylist profile photo | LissyLanding, StylistsPage |
| 2 | `e4b87ad125820c87df00cd6e705bde4e8af3e67e.png` | `stylist-photo-2.png` | Stylist profile photo | LissyLanding, StylistsPage, RorySelectsDetail |
| 3 | `4b4531903296dd337e2503bb17f59748fdc6c9ee.png` | `val-drozg-1.png` | Val Drozg profile photo 1 | LissyLanding, HomePage, StylistsPage, ChrisLanding |
| 4 | `7ba87817f8223271b091058d7d6c574cf1ba0452.png` | `stylist-photo-3.png` | Stylist profile photo | LissyLanding, ChrisLanding |
| 5 | `e848b14a74d352089a614d152282f09191ed8fc0.png` | `edit-021.png` | Featured edit image 021 | LissyLanding, StylistsPage, ChrisLanding |
| 6 | `acdcb062503544d45e9ec42f141e5eaf2bc04359.png` | `share-icon.png` | Share icon button | LissyLanding, ChrisLanding, LewisLanding |
| 7 | `e72a0bbadee5488647fef8721e8949abb9815c1d.png` | `lissy-featured-edit.png` | Lissy's featured edit for waitlist | WaitlistPage |
| 8 | `9f1f3c2c66a18611ca3dc256be40c92f256300b5.png` | `edit-22.png` | Edit image 22 | WaitlistPage, StylistsPage |
| 9 | `dee233baf3a56cb7abc1b3ff6012d7e6797aeecf.png` | `edit-23-waitlist.png` | Edit image 23 (waitlist version) | WaitlistPage |
| 10 | `21ead93bac0da68ed5f33efdfb07c0bf632228cc.png` | `lissy-roddy-profile.png` | Lissy Roddy profile photo | HomePage, MessageDetailPage |
| 11 | `20128333cc3dc0dc5a9ed76f88c9c981a3185bd7.png` | `val-drozg-2.png` | Val Drozg profile photo 2 | HomePage, StylistsPage |
| 12 | `e0a9d1b58aed482da9011bb5f685dc39e3501d17.png` | `val-drozg-3.png` | Val Drozg profile photo 3 | HomePage, StylistsPage |
| 13 | `083df4dc1c94d586d53c3644182d81e287c70454.png` | `chris-whyle-profile.png` | Chris Whyle profile photo | HomePage, MessageDetailPage, ChrisLanding |
| 14 | `9cffcde461e169a56491d6b656c1a87f1cc6898f.png` | `lewis-bloyce-profile.png` | Lewis Bloyce profile photo | HomePage, LewisLanding |
| 15 | `9593603f59b50c4fa125ac1b72a028ee00773a1c.png` | `dorian-who-profile.png` | Dorian Who profile photo | HomePage |
| 16 | `4ec03ff54a95119f5d32d5425296f54905e0e776.png` | `v22-logo.png` | V22 (SEVN) brand logo | HomePage, ProfilePage, SignIn |
| 17 | `d6d0374d1209d254e69a363bf2bd48de2a8fd831.png` | `chris-edit-featured.png` | Chris featured edit | HomePage, ChrisLanding, ChrisWaitlistPage |
| 18 | `5301c6e1e005f08fe75d30911849e67eca98064e.png` | `lissy-edit-featured.png` | Lissy featured edit | HomePage |
| 19 | `fecf94a9418e54b88d39fd7f742c93a62efe3681.png` | `stylist-photo-4.png` | Stylist profile photo | StylistsPage |
| 20 | `f2ca5ebc3cc3b3b3cd76d741dc18b557f3c97742.png` | `ellipse-2.png` | Decorative ellipse 2 | StylistsPage |
| 21 | `439705f87c1f1b1a7f7248d6ab68088bed32a71d.png` | `ellipse-3.png` | Decorative ellipse 3 | StylistsPage |
| 22 | `60d881796e3fd37544a1e0ed86bd42f2b8e270f7.png` | `stylist-photo-5.png` | Stylist profile photo | StylistsPage |
| 23 | `48e1568ab63aa8a6aab7981b5404c32eb926571e.png` | `ellipse-1.png` | Decorative ellipse 1 | StylistsPage |
| 24 | `2100215bdb3f74706b3cf7fa51529271f7ee431e.png` | `edit-23-stylists.png` | Edit image 23 (stylists version) | StylistsPage |
| 25 | `ffd0a0d7d582101431a5f08c43e5cca5e4dedd59.png` | `edit-24.png` | Edit image 24 | StylistsPage |
| 26 | `2f209977b7bac06e4fe00539ef0b7db92574c8b3.png` | `example-edit.png` | Example edit image for create page | CreateEditPage |
| 27 | `9769fa222dfe175f60b28e6da725e764d0e83fa6.png` | `lewis-outfit-photo.png` | Lewis outfit photo | LewisLanding, LewisWaitlistPage |

## Folder Structure

After renaming and placing files, your folder should look like:

```
/public/
  /assets/
    /images/
      chris-edit-featured.png
      chris-whyle-profile.png
      dorian-who-profile.png
      edit-021.png
      edit-22.png
      edit-23-stylists.png
      edit-23-waitlist.png
      edit-24.png
      ellipse-1.png
      ellipse-2.png
      ellipse-3.png
      example-edit.png
      lewis-bloyce-profile.png
      lewis-outfit-photo.png
      lissy-edit-featured.png
      lissy-featured-edit.png
      lissy-roddy-profile.png
      share-icon.png
      stylist-photo-1.png
      stylist-photo-2.png
      stylist-photo-3.png
      stylist-photo-4.png
      stylist-photo-5.png
      v22-logo.png
      val-drozg-1.png
      val-drozg-2.png
      val-drozg-3.png
```

## Verification Checklist

- [ ] All 27 PNG files exported from Figma Make
- [ ] All files renamed according to "New Semantic Name" column
- [ ] All files placed in `/public/assets/images/` folder
- [ ] File extensions are `.png` (lowercase)
- [ ] No spaces in filenames (use hyphens)

## Notes

- The code has been updated to reference these new paths
- Images will continue to work in Figma Make
- Once you place these files, images will work in Xcode/iOS builds
- All imports now use `/assets/images/semantic-name.png` format
