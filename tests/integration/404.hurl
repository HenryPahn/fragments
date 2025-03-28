# tests/integration/404.hurl

# Request non-exist route
GET http://localhost:8080/unknown

# We should get back an HTTP 1.1 401 response
HTTP/1.1 404 

# Extra checks to perform against the response
[Asserts]
# We expect to get back a JSON response with { "status": "error", ... }
jsonpath "$.status" == "error"
# We expect to get back a JSON response with an error as JSON inside { ..., "error": { "code": "404", ... } }
jsonpath "$.error.code" == 404
# We expect to get back a JSON response with an error as JSON inside { ..., "error": { ..., "message": "..." } }
jsonpath "$.error.message" isString
