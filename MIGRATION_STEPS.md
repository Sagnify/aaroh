# Database Migration Steps

## Add SEO Fields to Course Table

Run these commands in your terminal:

```bash
# 1. Generate migration
npx prisma migrate dev --name add_seo_fields

# 2. Generate Prisma Client
npx prisma generate
```

This will add three new optional fields to your Course table:
- `seoTitle` (String, optional)
- `seoDescription` (String, optional)
- `seoKeywords` (String, optional)

## That's it!

Your existing courses will continue to work (these fields are optional).
New courses can use these fields for custom SEO.
