#!/bin/bash
set -e

APP_ID="83df1c1d-6e07-47fa-845b-a147c33850c6"
ADMIN_TOKEN="eb523163-447b-4fac-bb0f-c262b7df2765"

echo "📊 Adding schema directly to InstantDB..."
echo ""

# Add teachers entity
echo "Adding teachers..."
curl -s -X POST "https://api.instantdb.com/v1/app/$APP_ID/admin/schema/attrs" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "attrs": [
      {"forward-identity": [null, "teachers"], "value-type": "ref", "cardinality": "one", "unique?": false, "index?": false},
      {"forward-identity": [null, "username"], "value-type": "blob", "cardinality": "one", "unique?": true, "index?": true},
      {"forward-identity": [null, "password"], "value-type": "blob", "cardinality": "one", "unique?": false, "index?": false},
      {"forward-identity": [null, "displayName"], "value-type": "blob", "cardinality": "one", "unique?": false, "index?": false},
      {"forward-identity": [null, "createdAt"], "value-type": "blob", "cardinality": "one", "unique?": false, "index?": false}
    ]
  }' || echo "Teachers may already exist"

echo ""
echo "Adding classes..."
curl -s -X POST "https://api.instantdb.com/v1/app/$APP_ID/admin/schema/attrs" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "attrs": [
      {"forward-identity": [null, "classes"], "value-type": "ref", "cardinality": "one", "unique?": false, "index?": false},
      {"forward-identity": [null, "className"], "value-type": "blob", "cardinality": "one", "unique?": false, "index?": false},
      {"forward-identity": [null, "description"], "value-type": "blob", "cardinality": "one", "unique?": false, "index?": false},
      {"forward-identity": [null, "teacherUsername"], "value-type": "blob", "cardinality": "one", "unique?": false, "index?": true}
    ]
  }' || echo "Classes may already exist"

echo ""
echo "Adding students..."
curl -s -X POST "https://api.instantdb.com/v1/app/$APP_ID/admin/schema/attrs" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "attrs": [
      {"forward-identity": [null, "students"], "value-type": "ref", "cardinality": "one", "unique?": false, "index?": false},
      {"forward-identity": [null, "name"], "value-type": "blob", "cardinality": "one", "unique?": false, "index?": false},
      {"forward-identity": [null, "classId"], "value-type": "blob", "cardinality": "one", "unique?": false, "index?": true}
    ]
  }' || echo "Students may already exist"

echo ""
echo ""
echo "✅ Schema added!"
echo ""
echo "Now test login at: https://stss15.github.io/ibcs-app/"
echo "Username: MrStewart"
echo "Password: SGSD2024!"

