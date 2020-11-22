# List of stops along 501 Queen Streetcar route
Request:
http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=ttc&r=501

# Get Driving Traffic Data from Queen/Augusta to Queen/Sumach along 501 Queen Streetcar route (straight line)
Request:
curl "https://api.mapbox.com/matching/v5/mapbox/driving-traffic/-79.39987,43.6479499;-79.3618699,43.6561?access_token=pk.eyJ1IjoidG9ueXdjaGVuIiwiYSI6ImNraHBlODYwZDBjcTMyem54YWw5bm8yajAifQ.3j0gYt0zWIa_5rXk63grLQ

Response:
```
{
  "matchings": [
    {
      "confidence": 0.9802448429356402,
      "geometry": "e_liGjxrcN}q@olF",
      "legs": [
        {
          "summary": "",
          "weight": 1096.4,
          "duration": 865.9,
          "steps": [],
          "distance": 3189.5
        }
      ],
      "weight_name": "routability",
      "weight": 1096.4,
      "duration": 865.9,
      "distance": 3189.5
    }
  ],
  "tracepoints": [
    {
      "alternatives_count": 0,
      "waypoint_index": 0,
      "matchings_index": 0,
      "distance": 9.233754141855012,
      "name": "Queen Street West",
      "location": [
        -79.399901,
        43.64803
      ]
    },
    {
      "alternatives_count": 1,
      "waypoint_index": 1,
      "matchings_index": 0,
      "distance": 8.853410990544678,
      "name": "Queen Street East",
      "location": [
        -79.361903,
        43.656176
      ]
    }
  ],
  "code": "Ok"
}
```

# Get Driving Traffic Data from King/Sherbourne to Queen/Carroll along 504 King Streetcar route (non-straight line)
Request:
curl "https://api.mapbox.com/matching/v5/mapbox/driving-traffic/-79.36813,43.6513499;-79.3521,43.6584199?access_token=pk.eyJ1IjoidG9ueXdjaGVuIiwiYSI6ImNraHBlODYwZDBjcTMyem54YWw5bm8yajAifQ.3j0gYt0zWIa_5rXk63grLQ&geometries=geojson&overview=full"
```
{
  "matchings": [
    {
      "confidence": 0.9703786290536791,
      "geometry": {
        "coordinates": [
          [
            -79.368112,
            43.651308
          ],
          [
            -79.367035,
            43.651547
          ],
          [
            -79.366058,
            43.651765
          ],
          [
            -79.365993,
            43.651779
          ],
          [
            -79.36448,
            43.652117
          ],
          [
            -79.364392,
            43.652139
          ],
          [
            -79.364284,
            43.652169
          ],
          [
            -79.364176,
            43.652212
          ],
          [
            -79.364083,
            43.652257
          ],
          [
            -79.363719,
            43.652453
          ],
          [
            -79.363328,
            43.652674
          ],
          [
            -79.363265,
            43.65271
          ],
          [
            -79.363221,
            43.652736
          ],
          [
            -79.363114,
            43.652797
          ],
          [
            -79.362606,
            43.653093
          ],
          [
            -79.362485,
            43.653163
          ],
          [
            -79.362355,
            43.653241
          ],
          [
            -79.361874,
            43.653522
          ],
          [
            -79.361531,
            43.653723
          ],
          [
            -79.361203,
            43.653916
          ],
          [
            -79.361009,
            43.654027
          ],
          [
            -79.36079,
            43.654157
          ],
          [
            -79.360332,
            43.654425
          ],
          [
            -79.360261,
            43.654467
          ],
          [
            -79.359817,
            43.654726
          ],
          [
            -79.359646,
            43.654828
          ],
          [
            -79.35907,
            43.655166
          ],
          [
            -79.358936,
            43.655244
          ],
          [
            -79.358657,
            43.655408
          ],
          [
            -79.358539,
            43.655476
          ],
          [
            -79.358426,
            43.655543
          ],
          [
            -79.358359,
            43.655583
          ],
          [
            -79.358311,
            43.655612
          ],
          [
            -79.358037,
            43.655772
          ],
          [
            -79.357784,
            43.65592
          ],
          [
            -79.35764,
            43.656008
          ],
          [
            -79.357467,
            43.656108
          ],
          [
            -79.357399,
            43.656149
          ],
          [
            -79.356979,
            43.656397
          ],
          [
            -79.356282,
            43.656809
          ],
          [
            -79.356169,
            43.656876
          ],
          [
            -79.356102,
            43.65692
          ],
          [
            -79.356049,
            43.656957
          ],
          [
            -79.355835,
            43.657108
          ],
          [
            -79.355291,
            43.657515
          ],
          [
            -79.355259,
            43.657543
          ],
          [
            -79.355032,
            43.657695
          ],
          [
            -79.354997,
            43.657718
          ],
          [
            -79.354509,
            43.657826
          ],
          [
            -79.353458,
            43.658065
          ],
          [
            -79.353345,
            43.658089
          ],
          [
            -79.352314,
            43.65832
          ],
          [
            -79.352226,
            43.658341
          ],
          [
            -79.35208,
            43.658373
          ]
        ],
        "type": "LineString"
      },
      "legs": [
        {
          "summary": "",
          "weight": 350.1,
          "duration": 300.3,
          "steps": [],
          "distance": 1538.6
        }
      ],
      "weight_name": "routability",
      "weight": 350.1,
      "duration": 300.3,
      "distance": 1538.6
    }
  ],
  "tracepoints": [
    {
      "alternatives_count": 0,
      "waypoint_index": 0,
      "matchings_index": 0,
      "distance": 4.886967053092219,
      "name": "King Street East",
      "location": [
        -79.368112,
        43.651308
      ]
    },
    {
      "alternatives_count": 5,
      "waypoint_index": 1,
      "matchings_index": 0,
      "distance": 5.46533783599928,
      "name": "Queen Street East",
      "location": [
        -79.35208,
        43.658373
      ]
    }
  ],
  "code": "Ok"
}
```
