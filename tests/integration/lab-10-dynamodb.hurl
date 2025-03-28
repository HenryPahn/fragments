# tests/integration/lab-10-dynamodb.hurl

#**************************************************************************
# 1. request to POST /v1/fragments with authenticated user 
POST http://localhost:8080/v1/fragments

# Include a Content-Type header using application/json 
Content-Type: application/json 
# Include authenticated user 
[BasicAuth]
user1@email.com:password1 
# JSON value 
{ 
  "service": 
  "DynamoDB" 
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
# 32 is the length of our fragment data: '{ "service": "DynamoDB" }'
jsonpath "$.fragment.size" == 32
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

#**************************************************************************
# 2. Try to GET the fragment info we just posted by its URL 
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

# We should get back an HTTP 1.1 201 response
HTTP/1.1 200

# We have various assertions about the response that we want to check
[Asserts]
jsonpath "$.status" == "ok"
# Our fragment ids use UUIDs, see https://ihateregex.io/expr/uuid/
jsonpath "$.fragment.id" == {{fragment1_id}}
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
# You could also write a regex for this and use matches
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
# 32 is the length of our fragment data: '{ "service": "DynamoDB" }'
jsonpath "$.fragment.size" == 32

#**************************************************************************
# 3. request to POST /v1/fragments with authenticated user and markdown data
POST http://localhost:8080/v1/fragments

# Include a Content-Type header using application/json 
Content-Type: text/markdown
# Include authenticated user 
[BasicAuth]
user1@email.com:password1 

`DynamoDB is **great**.`

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
jsonpath "$.fragment.type" == "text/markdown"
# 22 is the length of our fragment data: 'DynamoDB is **great**.'
jsonpath "$.fragment.size" == 22
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

#**************************************************************************
# 4. Try to GET the fragment info we just posted by its URL 
GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1

# We should get back an HTTP 1.1 201 response
HTTP/1.1 200

# We have various assertions about the response that we want to check
[Asserts]
jsonpath "$.status" == "ok"
# Our fragment ids use UUIDs, see https://ihateregex.io/expr/uuid/
jsonpath "$.fragment.id" == {{fragment2_id}}
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
# You could also write a regex for this and use matches
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/markdown"
# 22 is the length of our fragment data: 'DynamoDB is **great**.'
jsonpath "$.fragment.size" == 22

#**************************************************************************
# 5. GET all of the fragments for the same authorized user without expanding them
GET http://localhost:8080/v1/fragments

[BasicAuth]
user1@email.com:password1 

# We should get back an HTTP 1.1 201 response
HTTP/1.1 200

# We have various assertions about the response that we want to check
[Asserts]
# The Location header should look like what we expect (including the fragment id)
jsonpath "$.status" == "ok"
# Our fragment1_id and fragment2_id must be found in the user's fragment list 
jsonpath "$.fragments" includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}

#**************************************************************************
# 6. Try to DELETE the fragment1 
DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

#**************************************************************************
# 7. Try to GET the fragment1 again 
GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404

# Extra checks to perform against the response
[Asserts]
# We expect to get back a JSON response with { "status": "error", ... }
jsonpath "$.status" == "error"
# We expect to get back a JSON response with an error as JSON inside { ..., "error": { "code": "404", ... } }
jsonpath "$.error.code" == 404
# We expect to get back a JSON response with an error as JSON inside { ..., "error": { ..., "message": "..." } }
jsonpath "$.error.message" isString

#**************************************************************************
# 8. GET all of the fragments for the same authorized user without expanding them
GET http://localhost:8080/v1/fragments

[BasicAuth]
user1@email.com:password1 

# We should get back an HTTP 1.1 201 response
HTTP/1.1 200

# We have various assertions about the response that we want to check
[Asserts]
# The Location header should look like what we expect (including the fragment id)
jsonpath "$.status" == "ok"
# Our fragment1_id and fragment2_id must be found in the user's fragment list 
jsonpath "$.fragments" not includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}
