# Mocking georepo API

This folder is used for mocking API from georepo API on the frontend.
This is needed for E2E tests.

Please make sure the test fixture data for
geosight is coming from the same georepo data.

```
copy create_responses_template.py
paste to create_responses.py

In the file, fill 
GEOREPO_API_URL, 
GEOREPO_TOKEN,
GEOREPO_TOKEN_EMAIL, 
GEOREPO_DATASET_UUID, 
GEOREPO_VIEW_UUID

Run by `python3 create_responses.py`
```