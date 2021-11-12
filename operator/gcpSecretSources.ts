export default function (gcp): any[] {
  return !gcp ? [] : [
    {
      "secret": {
        "name": gcp.secret,
        "items": [
          {
            "key": gcp.serviceAccountKey,
            "path": "gcp_service_account.json"
          }
        ]
      }
    }
  ]
}
