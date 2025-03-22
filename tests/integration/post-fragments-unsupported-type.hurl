# tests/integration/post-fragments-unsupported-type.hurl

# request to POST /v1/fragments with authenticated user and invalid content-type
POST http://localhost:8080/v1/fragments

# Include a Content-Type header using text/plain
Content-Type: text/unknown
# Include authenticated user 
[BasicAuth]
user1@email.com:password1 
# Body of the request goes in ```...``` when it's a string
`This is a fragment!`

# We should get back an HTTP 1.1 500 response
HTTP/1.1 415

# Extra checks to perform against the response
[Asserts]
# We expect to get back a JSON response with { "status": "error", ... }
jsonpath "$.status" == "error"
# We expect to get back a JSON response with an error as JSON inside { ..., "error": { "code": "404", ... } }
jsonpath "$.error.code" == 415
# We expect to get back a JSON response with an error as JSON inside { ..., "error": { ..., "message": "..." } }
jsonpath "$.error.message" isString


