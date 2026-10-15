# Aurevale Clinic — GitHub web setup

## Upload files (no VS Code)
1. Download and extract `Aurevale-clinic-site-upload.zip` on your computer.
2. Open https://github.com/zahaaabdulmatheen-jpg/Aurevale-clinic
3. Select **Add file → Upload files**.
4. From the extracted folder, select all seven files and drag them into the upload area. Keep each file at the repository root (do not put them in a new folder).
5. Commit directly to `main` with the message `Add Aurevale public website and staff portal`.
6. Open **Settings → Pages → Deploy from a branch**, select `main` and `/(root)`, then Save.

## Supabase
Create a **separate project for Aurevale**. Use only the Project URL and publishable key (or legacy anon public key) in `config.js`. Never paste a `service_role`/secret key into a browser file or GitHub.

The staff sign-in starter expects a `public.profiles` table containing `id` (matching the Supabase Auth user UUID), `full_name`, `role`, and `is_active`. Allowed roles in the current scaffold are exactly `Administrator`, `Reception`, and `Doctor`. Configure database tables and Row Level Security before enabling any real workflows.

## Safety and brand status
This is an initial website and auth scaffold, not production clinical software. Appointments, patient records, notes, prescriptions, billing, and admin provisioning are not yet implemented. Use fictional test data only until security controls and workflows are tested. The displayed specialty list and contact email are placeholders.

“Aurevale Clinic” is a working draft only. Legal/business name clearance, trademark checks, and domain availability must be confirmed before final branding.
