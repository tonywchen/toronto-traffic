# Description
The Toronto Traffic project attempts to visualize Toronto traffic based on real-time TTC next vehicle data. By comparing real-time TTC next vehicle data over regular intervals, it is possible to deduce whether a vehile is on-time or delayed, which can potentially indicate whether the road traffic is smooth or busy. This by all means does not reflect the actual traffic data because there are many factors that can contribute to why a TTC vehicle is on-time or not, but it would be interesting to compare this to actual traffic data.

# Approach
In order to visualize the traffic, we will first need the following data:
- List of TTC routes
- List of stops along TTC routes
- List of next-vehicle data for every stop on a regular-interval (eg. every minute?)
- Traffic route between each stop

Based on these data, we will also need to compute the following:
- Busy-ness of the traffic between each stop

The busy-ness of the traffic between each stop, along with traffic route between each stop, will be the key to visualize the data on a map.


# TODOs
Server
- [X] Fetch Route data feed
- [X] Fetch Subroute data feed
- [X] Fetch Stop data feed
- Periodically fetch Prediction data feed
- Generate Path data based on Stop data
- Figure out algorithm to transform Prediction data into PathStatus
- Generate PathStatus data

Client
- Visualize Stop data (Marker.js)
- Visualize Path data (Line.js)
- Visualize Traffic data (Line.js with additional attributes?)
- Optimize map elements (base element class of some sort?)
- Periodically refresh traffic data
- Look up historical traffic data
- Additional look up filter based on route, time of day, day of week, or selected area
- Additional visualization showing busiest roads
