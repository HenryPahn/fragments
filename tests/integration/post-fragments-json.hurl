# tests/integration/post-fragments-json.hurl

# request to POST /v1/fragments with authenticated user and JSON content-type
POST http://localhost:8080/v1/fragments

# Include a Content-Type header using text/plain
Content-Type: application/json
# Include authenticated user 
[BasicAuth]
user1@email.com:password1 
# Body of the request goes in ```...``` when it's a string
{
  "name": "Henry"
}

# We should get back an HTTP 1.1 201 response
HTTP/1.1 201

# We have various assertions about the response that we want to check
[Asserts]
# The Location header should look like what we expect (including the fragment id)
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
# Our fragment ids use UUIDs, see https://ihateregex.io/expr/uuid/
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
# You could also write a regex for this and use matches
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
# 21 is the length of our fragment data: {name:Henry}
jsonpath "$.fragment.size" == 21
# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# 2. Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json
Content-Length: 21
[Asserts]
jsonpath "$.name" == "Henry"
