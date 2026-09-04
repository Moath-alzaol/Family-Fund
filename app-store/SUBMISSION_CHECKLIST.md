# Submission Readiness Checklist

## Ready

- [x] App Store icon exists at `assets/images/family-fund-app-icon.png` (`1024 × 1024`, RGB, no alpha)
- [x] Expo display name changed to `Family Fund`
- [x] Expo iOS Bundle ID changed to `com.family.fund` to match App Store Connect
- [x] Version set to `1.0.0`
- [x] iOS build number set to `1`
- [x] Non-exempt encryption declared false for standard HTTPS/TLS use
- [x] Arabic and English metadata drafted
- [x] Privacy label answers drafted
- [x] Privacy policy copy drafted
- [x] Support page copy drafted
- [x] App Review notes drafted

## Must finish before submission

- [ ] Replace every `YOUR ...` placeholder in the submission kit
- [x] Publish public Privacy Policy and Support URLs
- [x] Add an in-app account deletion flow, or remove in-app member account creation before review
- [x] Create a stable production Admin review account that does not expire
- [x] Capture six native Arabic screenshots and export them at `1320 × 2868` with no alpha channel
- [x] Prepare five English fallback screenshots at `1320 × 2868` with no alpha channel
- [ ] Add an English localization in App Store Connect
- [ ] Set the Arabic App Store name to `صندوق العائلة`
- [ ] Select Finance as primary category and Productivity as secondary category
- [ ] Complete Content Rights and Age Rating questionnaires
- [ ] Complete App Privacy and publish the answers
- [ ] Set price to Free and choose availability
- [ ] Choose manual release for version 1.0
- [ ] Upload a production build with Bundle ID `com.family.fund`
- [ ] Attach the build to version 1.0 and complete export-compliance questions
- [ ] Enter the review contact and both demo accounts
- [ ] Mention intended Unlisted App distribution in Review Notes
- [ ] Submit the app to App Review, then submit Apple's Unlisted App request

## Current review risks

1. **Backend deployment:** apply `20260902000001_account_deletion_requests.sql` to production before building; otherwise the new deletion screen cannot submit requests.
2. **Review access:** the app requires authentication, so Apple needs the working, non-expiring production demo account included in App Review Information.
3. **Private audience:** a publicly searchable listing is a poor fit for a single invited family. Unlisted distribution is the recommended path.
4. **English screenshot source:** the Arabic set uses native iPhone Simulator captures. The English set is still based on the responsive Expo web preview and should ideally be replaced with native English captures before submitting the English localization.
