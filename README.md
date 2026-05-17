# Issue Duplication Detector

Identifies potential duplicate issues based on their title and description, suggesting merging them.

## Free
```yaml
- uses: walshd1/issue-duplication-detector@v1
  with:
    gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
```

## Paid (cost + 4.75%)
```yaml
- uses: walshd1/issue-duplication-detector@v1
  with:
    service_token: ${{ secrets.ACTION_FACTORY_TOKEN }}
```
