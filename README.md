# Unify Intent JS Client

## Build

Run `pnpm build`.

## Deploy

_Complete all steps after merge to main_

- After merging a PR into `main`, checkout `main` locally, pull latest
- Run `pnpm test`, ensure all tests pass

### Staging

- Update `constants.ts` with the correct `UNIFY_INTENT_V1_URL` for staging.
  ```typescript
  export const UNIFY_INTENT_V1_URL =
    'https://staging.unifyintent.com/analytics/api/v1';
  ```
- Run build command
  ```bash
  pnpm build:s3:staging
  ```

### Production

- Update `constants.ts` with the correct `UNIFY_INTENT_V1_URL` for production.
  ```typescript
  export const UNIFY_INTENT_V1_URL = 'https://unifyintent.com/analytics/api/v1';
  ```
- Run build command
  ```bash
  pnpm build:s3:prod
  ```

### Check S3 bucket

- Verify files were updated by checking `Last modified` column in [S3 bucket](https://s3.console.aws.amazon.com/s3/buckets/unifygtm-public?region=us-west-2&prefix=tag/v1/&showversions=false).
