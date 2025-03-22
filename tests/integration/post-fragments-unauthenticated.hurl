# tests/integration/post-fragments-unauthenticated.hurl

# request to POST /v1/fragments with unauthenticated user
POST http://localhost:8080/v1/fragments

# Include a Content-Type header using text/plain
Content-Type: text/unknown
# Body of the request goes in ```...``` when it's a string
`This is a fragment!`

# We should get back an HTTP 1.1 500 response
HTTP/1.1 401

# Extra checks to perform against the response
[Asserts]
# We expect to get back a JSON response with { "status": "error", ... }
jsonpath "$.status" == "error"
# We expect to get back a JSON response with an error as JSON inside { ..., "error": { "code": "404", ... } }
jsonpath "$.error.code" == 401
# We expect to get back a JSON response with an error as JSON inside { ..., "error": { ..., "message": "..." } }
jsonpath "$.error.message" isString
