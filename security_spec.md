# Security Specification: Chorus.vn Firestore Security

This security specification defines the access control, validation invariants, and hardening strategies for the Firestore database of **Chorus.vn**.

## 1. Data Invariants
- **Global Configuration Invariant**: Only the `/app_data/main` document is permitted in the `/app_data` collection. No other documents or arbitrary collections are allowed.
- **Strict Size Bounds**: All string fields have explicit length constraints to prevent resource exhaustion and denial-of-service attacks.
- **Strict Key Validation**: Shadow properties or arbitrary field injections are blocked using key validation.
- **Type Safety**: All defined fields must strictly match their expected Firestore data types (e.g., list, string, boolean).

## 2. The "Dirty Dozen" Payloads
These 12 payloads represent potential attacks that the security rules will block:
1. **Malicious AppData Injection**: Arbitrary doc creation (`/app_data/attacker_doc`) -> Blocked.
2. **Shadow Field Injection**: Adding custom administrative fields (e.g., `isVerifiedAdmin: true`) -> Blocked.
3. **Huge Title Attack**: Injecting a 1MB string into `artistName` -> Blocked.
4. **Invalid Type for Playlists**: Setting `playlists` field as a `string` instead of a `list` -> Blocked.
5. **Malicious HTML/Script in Bio**: Injecting `<script>` into `artistBio` exceeding size limits -> Blocked.
6. **Negative Size Bounds**: Passing empty or null structures where string types are expected -> Blocked.
7. **Bypassing AppData Catch-All**: Attempting to write to `/some_malicious_collection` -> Blocked.
8. **Malicious Password Field Type**: Setting `adminPassword` to `true` (boolean) -> Blocked.
9. **No-Name/No-Bio AppData**: Creating/updating `app_data/main` without `artistName` or `artistBio` -> Blocked.
10. **Global URL Buffer Overflow**: Setting `globalBaseUrl` to a 50KB string -> Blocked.
11. **Spoofed Slideshow Payload**: Forcing `slideshowImages` to be a boolean/string -> Blocked.
12. **Foreign Field Pollution**: Sending unmapped keys (e.g., `attackerControl: 1`) -> Blocked.

## 3. The Test Runner Structure
The firestore rules will be tested to ensure all "Dirty Dozen" payloads return `PERMISSION_DENIED`. All structural schemas are strictly validated.
