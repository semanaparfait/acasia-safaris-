-- The company domain is now acaciasafarisrwanda.com (acaciasafaris.com belongs to someone else).
-- Admin logins are made from the first name + the company domain: "jean@acaciasafaris.com"
-- becomes "jean@acaciasafarisrwanda.com". Passwords, sessions and access do not change.
UPDATE "Worker"
SET "email" = regexp_replace("email", '@acaciasafaris\.com$', '@acaciasafarisrwanda.com')
WHERE "email" LIKE '%@acaciasafaris.com';
